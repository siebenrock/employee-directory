# Contributing

## Git Rules

- **master** (state: **production-ready**)  
  This branch is our production branch.
- **develop** (state: **to-be-released**)  
  This is our development branch. As soon as it reaches a stable version it will be merged into the master branch.
- **Supporting branches**  
  These are used to aid parallel development between team members, ease tracking of features, prepare for production releases and to assist in quickly fixing live production problems. Remove them as soon as they are not longer needed. <br> <br>
  - **Feature branches**:  
    Used for developing new features. Merge into development branch or delete them after development is finished.<br> <br>
    May branch off from: _develop_  
    Must merge back into: _develop_  
    Branch naming convention: _ft-_\*, except _master_, _develop_, _release-_\*, or _hotfix-_\* <br> <br>
    Creating a feature branch:<br>
    When starting work on a new feature, branch off from the develop branch.
    ```
    $ git checkout -b myfeature develop
    Switched to a new branch "myfeature"
    ```
    Incorporating a finished feature on develop:<br>
    Finished features may be merged into the develop branch to definitely add them to the upcoming release. **Please create a merge request of your branch into develop**. This request will then be reviewed by the maintainers of the project.

[Adapted source](https://nvie.com/posts/a-successful-git-branching-model/)

## Add a New Module

The project is implemented with a modularized setup in mind. Core functionality including authentication, database access and data storage is centralized in the Firebase module which wraps the Firebase SDK. Thus, to add a new module, it needs to be embedded in the UI and the React router, and needs to access the Firebase functionality.

### Firebase

Firebase is used throughout the whole project for Authentication, Firestore (No-SQL Database), Cloud Storage and even based Analytics. Implemented using a single Firebase instance which is intialized in index.js. The functionality of the Firebase is wrapped in Firebase.js and can be accessed in other modules using the FirebaseContext.js which passes a reference to the Firebase object as a property.

Generally, the [documentation](https://firebase.google.com/docs) of the Firebase Web SDK is very good and has a few get started guides.

```js
import { withFirebase } from "../Firebase";
class myComponent extends Component {
  doSomething = () => {
    const { firebase } = this.props;
    firebase.doSomething();
  };
}
export default withFirebase(myComponent);
```

#### Authentication, Authorization and User Data Access

Authentication is centrally implemented in the AuthUserContext and based on Firebase Auth. New modules do not need to modify this implementation. If the module is only accessible for logged in users, withAuthorization shall be wrapped around the export. If a user does not fulfil the rule provide to withAuthorization, the user is redirected to the sign in page. This also makes the authUser information accessible as a property of the component. All available information can be found by having a look at the Firestore Database or by inspecting the React properties with the React Chrome plugin.

Example:

```js
import { withAuthorization } from "../Session";
class myComponent extends Component {
  doSomething = () => {
    const { authUser } = this.props;
    Console.log(authUser.firstName);
  };
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(myComponent);
```

#### Firestore Database

We decided to use the Firestore Database to store the data of the different modules. Each has a top level node and currently the directory and resources tabs are implemented.

```
project
 - resources
    - [random resource id] doc with all resource data
 - users
    - [email as user id for simplified matching]
```

#### Firebase Storage

Images related to Database entries (e.g. profile pictures and resource pictures) are stored in Firebase Storage as users and backend cloud functions can read and write to it. Write access to Firebase Storage by users is also controlled by a rules file in the rules project and is managed by wrapped functions in the Firebase component. 

#### Cloud Functions

A new module might require some form of backend functionality, e.g. for the following use cases:

- enforcing integrity in the no-SQL data base structure, e.g. to update the name of the author of a resource if the name of a user changes to not need to have another query to get the name every time a resource is fetched.
- downloading the image of a resource and saving it to cloud storage
