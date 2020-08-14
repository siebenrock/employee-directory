import React from "react";

import { Button } from "antd";

import AvatarImageUpload from "../Avatar/Upload";

const Avatar = ({ nextStep, previousStep, authUser, windowWidth }) => (
  <React.Fragment>
    <h2>Profile Photo</h2>
    <p style={{ marginBottom: "1.5rem" }}>
      Keep your old photo or upload a new one
    </p>
    <AvatarImageUpload authUser={authUser} windowWidth={windowWidth} />
    <Button.Group style={{ marginTop: "2rem" }}>
      <Button icon="caret-left" onClick={() => previousStep()}>
        Back
      </Button>
      <Button type="primary" icon="save" onClick={() => nextStep()}>
        Continue
      </Button>
    </Button.Group>
  </React.Fragment>
);

export default Avatar;
