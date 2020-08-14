import React from "react";
import UserForm from "../UserForm";

const Extended = ({ nextStep, previousStep, authUser }) => (
  <React.Fragment>
    <UserForm
      authUser={authUser}
      onSubmitAdd={() => nextStep()}
      onBack={() => previousStep()}
      formItems={{ basic: false, extended: true }}
    />
  </React.Fragment>
);

export default Extended;
