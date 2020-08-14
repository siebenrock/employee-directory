import React from "react";
import { withRouter } from "react-router-dom";
import { isMobileOnly } from "react-device-detect";

import NavigationSetup from "./Setup";
import NavigationAuth from "./Auth";
import NavigationSetupMobile from "./SetupMobile";
import NavigationAuthMobile from "./Auth/Mobile";

import { AuthUserContext } from "../Session";

const Navigation = ({ location }) => (
  <AuthUserContext.Consumer>
    {authUser => {
      if (authUser && location.pathname === "/setup") {
        if (!isMobileOnly) {
          return <NavigationSetup authUser={authUser} location={location} />;
        }
        if (isMobileOnly) {
          return (
            <NavigationSetupMobile authUser={authUser} location={location} />
          );
        }
      } else if (authUser && authUser.completedSetup) {
        if (!isMobileOnly) {
          return <NavigationAuth authUser={authUser} location={location} />;
        }

        if (isMobileOnly) {
          return (
            <NavigationAuthMobile authUser={authUser} location={location} />
          );
        }
      }

      return null;
    }}
  </AuthUserContext.Consumer>
);

export default withRouter(Navigation);
