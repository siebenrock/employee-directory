import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import "firebase/performance";
import "firebase/analytics";
import { firebaseConfig } from "../../constants/firebaseAPI";
import * as ROUTES from "../../constants/routes";

const verifyURL = window.location.origin + ROUTES.VERIFY;
const actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be whitelisted in the Firebase Console.
  url: verifyURL,
  // This must be true.
  handleCodeInApp: true,
};

// cache download links of images
const urlCache = {};

class Firebase {
  constructor() {
    firebase.initializeApp(firebaseConfig);
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.auth.languageCode = "en";
    this.storage = firebase.storage();
    this.performanceMonitoring = firebase.performance();
    this.analytics = firebase.analytics();
    this.countPageViews = 0;
  }

  // Auth API
  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignInWithEmailLink = email =>
    this.auth.sendSignInLinkToEmail(email, actionCodeSettings);

  doCompleteSignInEmailLink = async () => {
    if (this.auth.isSignInWithEmailLink(window.location.href)) {
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        email = window.prompt("Please provide your email for confirmation");
      }

      try {
        await this.auth.signInWithEmailLink(email, window.location.href);
      } catch {
        console.error("Could not verify the Link");
      }

      window.localStorage.removeItem("emailForSignIn");
      this.logEvent("login", { method: "Email Link" });
    }
  };

  doSignOut = () => {
    this.logEvent("logout");
    this.auth.signOut();
  };

  doSignOutCallback = (success, failure) =>
    this.auth
      .signOut()
      .then(() => success())
      .catch(error => failure(error));

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = password => this.auth.currentUser.updatePassword(password);

  doDeleteUser = (success, requiresReauth) => {
    this.auth.currentUser
      .delete()
      .then(success)
      .catch(error => {
        if (error.code === "auth/requires-recent-login") requiresReauth();
        else console.error(error);
      });
  };

  // *** Merge Auth and DB User API *** //
  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        next(authUser);
      } else {
        fallback();
      }
    });

  // Storage APIs
  uploadImageAndGetUrl = (
    onError,
    onProgress,
    onSuccessUrlHandler,
    fullPath,
    imgDataUrl,
  ) => {
    const metadata = {
      contentType: "image/jpeg",
      cacheControl: "public,max-age=2628000", // 1 month
    };

    const uploadRef = this.storage.ref().child(fullPath);
    const uploadTask = uploadRef.putString(imgDataUrl, "data_url", metadata);

    uploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      snapshot => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      error => {
        // https://firebase.google.com/docs/storage/web/handle-errors
        onError(error);
      },
      () => {
        // Upload completed successfully, now we add the fullPath to the firestore
        uploadRef
          .getDownloadURL()
          .then(url => onSuccessUrlHandler(url))
          .catch(e => onError(e));
      },
    );
  };

  updateUserAvatar = (
    onError,
    onProgress,
    onSuccess,
    avatarDataUrl,
    authUser,
  ) => {
    const path = `avatars/${authUser.email}/avatar.jpg`;

    this.uploadImageAndGetUrl(
      onError,
      onProgress,
      url => {
        this.currentUser()
          .set({ avatar: url }, { merge: true })
          .then(() => onSuccess())
          .catch(e => onError(e));
      },
      path,
      avatarDataUrl,
    );
  };

  getDownloadUrl = fileRef => {
    if (!(fileRef in Object.keys(urlCache)))
      urlCache[fileRef] = this.storage
        .ref(fileRef)
        .getDownloadURL()
        .then(downloadURL => {
          return downloadURL;
        })
        .catch(err => {
          console.error(err);
          return null;
        });

    return urlCache[fileRef];
  };

  // Firestore Resources

  resources = () => this.db.collection("resources");

  resource = id => this.resources().doc(id);

  resourceComments = id => this.resource(id).collection("comments");

  doCreateResource = (resource, authUser) => {
    const data = resource;
    data.author = authUser.email;
    if (authUser.firstName && authUser.lastName)
      data.authorName = `${authUser.firstName} ${authUser.lastName}`;
    data.upvotes = 0;
    data.upvoters = [];
    data.commentsCount = 0;
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();

    return this.db.collection("resources").add(data);
  };

  doAddResourceComment = (id, authUser, content) => {
    const data = { content };
    data.author = authUser.email;
    if (authUser.firstName && authUser.lastName)
      data.authorName = `${authUser.firstName} ${authUser.lastName}`;
    if (authUser.avatar) data.avatar = authUser.avatar;

    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();

    return this.resourceComments(id).add(data);
  };

  // Firestore User API
  user = email => this.db.collection("users").doc(email);

  currentUser = () =>
    this.db.collection("users").doc(this.auth.currentUser.email);

  users = () => this.db.collection("users");

  // Update User API (both Auth and Firestore)
  doUpdateUserProfile = (email, data, success) => {
    const cleanProfile = data;
    // remove undefined
    Object.keys(cleanProfile).forEach(
      key => cleanProfile[key] === undefined && delete cleanProfile[key],
    );

    cleanProfile.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

    // update doc
    const docUpdate = this.user(email).set(
      { ...cleanProfile },
      { merge: true },
    );

    // if displayName needs to be updated in auth
    if (
      cleanProfile &&
      cleanProfile.firstName &&
      cleanProfile.lastName &&
      `${cleanProfile.firstName} ${cleanProfile.lastName}` !==
        this.auth.currentUser.displayName
    ) {
      const authUpdate = this.auth.currentUser.updateProfile({
        displayName: `${cleanProfile.firstName} ${cleanProfile.lastName}`,
      });
      // wait for both Promises to resolve
      Promise.all([docUpdate, authUpdate])
        .then(() => success())
        .catch(error => console.error(error));
    } else {
      // only wait for docUpdate to resolve
      docUpdate.then(() => success()).catch(error => console.error(error));
    }
  };

  // Firebase Analytics

  // Log standard events, need to match the events mentioned in the documentation of GA
  // https://support.google.com/firebase/answer/6317498?hl=en&ref_topic=6317484

  logEvent = (eventName, eventParams) => {
    this.analytics.logEvent(eventName, {
      ...eventParams,
      debug_mode: process.env.NODE_ENV !== "production",
    });
  };

  setAnalyticsUID = uid => {
    this.analytics.setUserId(uid);
  };

  setAnalyticsUserProperties = props => {
    this.analytics.setUserProperties(props);
  };

  /*
   * It is default behavior of GA to track page_views only works for first loading; disabling this is complicated.
   * As this automatically tracked page_view does not include the debug_mode flag, page_view_initial is added
   * to inspect in the GA debug view. Reports should just use page_view events.
   */
  trackPageView = () => {
    this.analytics.logEvent(
      this.countPageViews > 0 ? "page_view" : "page_view_initial",
      { debug_mode: process.env.NODE_ENV !== "production" },
    );
    this.countPageViews += 1;
  };
}

export default Firebase;
