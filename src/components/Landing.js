import React from "react";
import { Redirect } from "react-router-dom";

import * as ROUTES from "../constants/routes";

import { AuthUserContext } from "./Session";

const Landing = () => (
  <AuthUserContext.Consumer>
    {authUser => {
      if (authUser) {
        if (authUser.isCDTM === true) {
          if (authUser.completedSetup)
            return <Redirect to={ROUTES.DIRECTORY} />;
          return <Redirect to={ROUTES.SETUP} />;
        }
      }
      return <Redirect to={ROUTES.LOGIN} />;
    }}
  </AuthUserContext.Consumer>
);

export default Landing;
