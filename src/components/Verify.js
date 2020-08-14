import React, { Component } from "react";
import { Row, Col, Card, Spin, Icon } from "antd";
import { withRouter, Redirect } from "react-router-dom";
import { compose } from "recompose";
import { withFirebase } from "./Firebase";
import { AuthUserContext } from "./Session";
import * as ROUTES from "../constants/routes";

class SignInLinkVerifyBase extends Component {
  componentDidMount() {
    const { firebase } = this.props;
    firebase.doCompleteSignInEmailLink();
  }

  render() {
    return (
      <Row type="flex" justify="space-around">
        <Col
          xs={22}
          sm={14}
          md={12}
          lg={10}
          xl={8}
          xxl={6}
          style={{
            position: "fixed",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <Card title="Loading Account" style={{ borderRadius: "8px" }}>
            <Spin indicator={<Icon type="loading-3-quarters" spin />} />
            <AuthUserContext.Consumer>
              {authUser => {
                if (authUser) {
                  if (authUser.isRegistered === true) {
                    if (authUser.completedSetup)
                      return <Redirect to={ROUTES.DIRECTORY} />;
                    return <Redirect to={ROUTES.SETUP} />;
                  }
                }
                return null;
              }}
            </AuthUserContext.Consumer>
          </Card>
        </Col>
      </Row>
    );
  }
}

const SignInLinkVerify = compose(
  withFirebase,
  withRouter,
)(SignInLinkVerifyBase);

export default SignInLinkVerify;
