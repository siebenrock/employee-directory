import React, { Component } from "react";
import { isMobileOnly } from "react-device-detect";
import { Redirect } from "react-router-dom";

import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Icon,
  Tooltip,
  Alert,
  Modal,
  List,
} from "antd";

import { AuthUserContext } from "./Session";
import { withFirebase } from "./Firebase";

import * as ROUTES from "../constants/routes";
import ABOUT from "../constants/about";

class SignInLink extends Component {
  constructor(props) {
    super(props);

    this.state = {
      infoModalVisible: false,
    };
  }

  showInfoModal = () => {
    const { firebase } = this.props;
    this.setState({
      infoModalVisible: true,
    });
    firebase.logEvent("login_showInfoModal");
  };

  closeInfoModal = () => {
    this.setState({
      infoModalVisible: false,
    });
  };

  render() {
    const { firebase } = this.props;
    const { infoModalVisible } = this.state;
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
          <img
            style={{
              height: "55px",
              marginBottom: isMobileOnly ? "40px" : "60px",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
              filter: "grayscale(100%)",
              opacity: "0.12",
            }}
            src="../static/logo.png"
            alt="CDTM Logo"
          />
          <SignInLinkForm firebase={firebase} />
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: "24px",
            }}
          >
            <Button shape="round" onClick={this.showInfoModal}>
              About
            </Button>
            <Button
              shape="round"
              href="https://www.cdtm.de/legal/"
              target="_blank"
              style={{ marginLeft: "10px" }}
              type="dashed"
            >
              Legal
            </Button>
          </div>
          <Modal
            title="About"
            visible={infoModalVisible}
            onCancel={() => this.closeInfoModal()}
            footer={[
              <Button
                key="close"
                type="primary"
                onClick={() => this.closeInfoModal()}
              >
                Close
              </Button>,
            ]}
          >
            <List
              itemLayout="vertical"
              dataSource={ABOUT}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <img
                        alt="icon"
                        src={`../static/icons/${item.image}`}
                        style={{ maxWidth: "36px", opacity: "0.6" }}
                      />
                    }
                    title={item.title}
                    description={
                      <ul style={{ listStyleType: "none", paddingLeft: "0px" }}>
                        {item.bullets.map(line => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    }
                    style={{ marginTop: "16px" }}
                  />
                </List.Item>
              )}
            />
          </Modal>
        </Col>
      </Row>
    );
  }
}

const INITIAL_STATE = {
  email: "",
  error: null,
  success: false,
  loading: false,
};

const mailFormat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const cdtmMailFormat = /^(\w|-)+\.(\w|-)+@cdtm.de$/;

class SignInLinkForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...INITIAL_STATE,
    };
  }

  onSubmit = async event => {
    event.preventDefault();

    const { email } = this.state;

    // Handle URLs here to use App as PWA
    if (email.startsWith("https://")) {
      window.location = email;
    } else if (!mailFormat.test(email)) {
      this.setState({
        error: { message: "Please enter a valid e-mail address" },
      });
    } else if (!cdtmMailFormat.test(email)) {
      this.setState({
        error: {
          message:
            "Please enter your firstname.lastname@cdtm.de e-mail address",
        },
      });
    } else {
      this.setState({ loading: true });
      const { firebase } = this.props;

      try {
        await firebase.doSignInWithEmailLink(email);
      } catch (error) {
        this.setState({ error });
        return;
      }

      window.localStorage.setItem("emailForSignIn", email);
      this.setState({ success: true, loading: false });
      firebase.logEvent("login_loginEmailSent");
    }
  };

  onChange = event => {
    this.setState({
      [event.target.name]: event.target.value,
      error: null,
    });
  };

  clear = () => {
    this.setState({ email: "", success: false, error: null });
  };

  render() {
    const { email, error, success, loading } = this.state;

    return (
      <Card
        title="Sign in"
        extra={
          success && (
            <Tooltip placement="top" title="Reset">
              <Icon type="undo" onClick={this.clear} />
            </Tooltip>
          )
        }
        style={{ borderRadius: "8px" }}
      >
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

        <Form onSubmit={this.onSubmit} className="login-form">
          <p>
            Please enter your e-mail address to login, and we will send a magic
            link to your inbox.
          </p>
          <Form.Item>
            <Input
              autoFocus
              name="email"
              value={email.toLowerCase()}
              onChange={this.onChange}
              onPressEnter={this.onSubmit}
              type={email.startsWith("https://") ? "text" : "email"}
              placeholder="E-Mail Address"
              prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
              disabled={success}
              style={{
                marginTop: "1rem",
                fontSize: isMobileOnly ? "16px" : "",
              }}
              inputMode="email"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: "10px" }}>
            {error && <Alert message={error.message} type="error" showIcon />}
            {success && (
              <Alert
                message="You received an e-mail with a magic link. Please also check your spam folder."
                type="success"
                showIcon
              />
            )}
            {!success && (
              <Button
                type="primary"
                htmlType="submit"
                disabled={
                  mailFormat.test(email) ? false : !email.startsWith("https://")
                }
                loading={loading}
                block
                style={{ marginTop: "10px" }}
              >
                {email.startsWith("https://") ? "Open" : "Sign in"}
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>
    );
  }
}

export default withFirebase(SignInLink);
