import React, { Component } from "react";
import { withRouter, Route, Switch } from "react-router-dom";

import { Layout } from "antd";

import "./App.css";

import { withAuthentication } from "./components/Session";
import { withFirebase } from "./components/Firebase";

import * as ROUTES from "./constants/routes";

import Navigation from "./components/Navigation";
import Landing from "./components/Landing";
import Login from "./components/Login";
import Account from "./components/Account";
import Admin from "./components/Admin";
import SignInLinkVerify from "./components/Verify";
import Setup from "./components/Setup";
import Directory from "./components/Directory";
import Resources from "./components/Resources";
import Regionals from "./components/Regionals";

class App extends Component {
  constructor(props) {
    super(props);
    window.addEventListener("resize", this.handleWindowSizeChange);
    this.state = {
      windowWidth: window.innerWidth,
    };
  }

  componentDidMount() {
    const { history, firebase } = this.props;
    // Track page views
    const track = pathname => {
      // Change the document title to leverage page_view events
      if (pathname !== "/") {
        let pageTitle = pathname.slice(1);
        pageTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);
        document.title = `${pageTitle} - CDTM Community`;
      } else {
        document.title = "CDTM Community";
      }

      firebase.trackPageView();
    };

    track(window.location.pathname);
    this.unlisten = history.listen(location => {
      track(location.pathname);
    });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowSizeChange);
    this.unlisten();
  }

  handleWindowSizeChange = () => {
    this.setState({ windowWidth: window.innerWidth });
  };

  render() {
    const { windowWidth } = this.state;
    return (
      <React.Fragment>
        <Navigation />
        <Layout
          style={{
            background: "#fcfcff",
            minHeight: "100vh",
          }}
        >
          <Layout.Content>
            <Switch>
              <Route exact path={ROUTES.LANDING} component={Landing} />
              <Route path={ROUTES.LOGIN} component={Login} />
              <Route path={ROUTES.VERIFY} component={SignInLinkVerify} />
              <Route
                path={ROUTES.ACCOUNT}
                render={props => (
                  <Account {...props} windowWidth={windowWidth} />
                )}
              />
              <Route path={ROUTES.ADMIN} component={Admin} />
              <Route
                path={ROUTES.SETUP}
                render={props => <Setup {...props} windowWidth={windowWidth} />}
              />
              <Route
                path={ROUTES.DIRECTORY}
                render={props => (
                  <Directory {...props} windowWidth={windowWidth} />
                )}
              />
              <Route
                path={ROUTES.RESOURCES}
                render={props => (
                  <Resources {...props} windowWidth={windowWidth} />
                )}
              />
              <Route path={ROUTES.REGIONALS} render={() => <Regionals />} />
              <Route component={Landing} />
            </Switch>
          </Layout.Content>
        </Layout>
      </React.Fragment>
    );
  }
}

export default withRouter(withAuthentication(withFirebase(App)));
