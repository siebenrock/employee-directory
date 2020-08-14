import React from "react";

import AuthUserContext from "./AuthUserContext";
import { withFirebase } from "../Firebase";

const withAuthentication = Component => {
  class WithAuthentication extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        authUser: JSON.parse(localStorage.getItem("authUser")),
      };
      this.userDocListener = () => {};
      this.authListener = () => {};
    }

    componentDidMount() {
      const { firebase } = this.props;
      this.authListener = firebase.onAuthUserListener(
        authUser => {
          // localStorage.setItem("authUser", JSON.stringify(authUser));
          firebase.setAnalyticsUID(authUser.uid);
          firebase.setAnalyticsUserProperties({ email: authUser.email });
          this.userDocListener = firebase
            .user(authUser.email)
            .onSnapshot(snapshot => {
              const dbUser = snapshot.data();
              // default empty roles
              if (!dbUser.roles) {
                dbUser.roles = [];
              }
              // merge auth and db user
              const mergedUser = {
                uid: authUser.uid,
                email: authUser.email,
                ...dbUser,
              };
              this.setState({ authUser: mergedUser });
              firebase.setAnalyticsUserProperties({
                cohort: mergedUser.cohort || null,
                status: mergedUser.status || null,
              });
              localStorage.setItem("authUser", JSON.stringify(mergedUser));
            });
        },
        () => {
          this.userDocListener();
          firebase.setAnalyticsUID(null);
          localStorage.removeItem("authUser");
          this.setState({ authUser: null });
        },
      );
    }

    componentWillUnmount() {
      this.authListener();
      this.userDocListener();
    }

    render() {
      const { authUser } = this.state;
      return (
        <AuthUserContext.Provider value={authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      );
    }
  }

  return withFirebase(WithAuthentication);
};

export default withAuthentication;
