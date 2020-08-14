import React, { Component } from "react";
import { compose } from "recompose";

import { Layout } from "antd";

import { withFirebase } from "./Firebase";
import { withAuthorization } from "./Session";

import * as ROLES from "../constants/roles";

class AdminPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      users: [],
    };
  }

  componentDidMount() {
    const { firebase } = this.props;
    this.setState({ loading: true });

    firebase.users().onSnapshot(snapshot => {
      const users = [];
      snapshot.forEach(doc => {
        users.push(doc.data());
      });
      this.setState({
        users,
        loading: false,
      });
    });
  }

  componentWillUnmount() {
    const { firebase } = this.props;
    firebase.users().onSnapshot(() => {});
  }

  render() {
    const { users, loading } = this.state;
    return (
      <div>
        <h1>Admin</h1>
        <p>The Admin Page is accessible by every signed in admin user.</p>
        {loading && <div>Loading ...</div>}
        <UserList users={users} />
      </div>
    );
  }
}

const UserList = ({ users }) => (
  <Layout className="module">
    <ul>
      {users.map(user => (
        <li key={user.uid}>
          <span>
            <strong>ID:</strong> {user.uid}
          </span>
          <span>
            <strong>E-Mail:</strong> {user.email}
          </span>
          <span>
            <strong>Name:</strong> {user.firstName} {user.lastName}
          </span>
        </li>
      ))}
    </ul>
  </Layout>
);

const condition = authUser =>
  authUser && authUser.roles && authUser.roles.includes(ROLES.ADMIN);

export default compose(
  withAuthorization(condition),
  withFirebase,
)(AdminPage);
