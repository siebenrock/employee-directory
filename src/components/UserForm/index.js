import React, { Component } from "react";
import { Form, Button, message } from "antd";

import { compose } from "recompose";
import UserFormExtended from "./Extended";
import UserFormBasic from "./Basic";

import { withFirebase } from "../Firebase";

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

class UserForm extends Component {
  handleSubmit = e => {
    const { authUser, form, firebase, onSubmitAdd } = this.props;

    e.preventDefault();
    message.loading("Profile is updating");
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { email } = authUser;
        firebase.doUpdateUserProfile(email, values, () => {
          message.destroy();
          message.success("Your profile was saved");
          firebase.logEvent("profile_update_profile");
          if (onSubmitAdd) onSubmitAdd();
        });
      } else {
        message.destroy();
        message.error("Please fill in all fields");
      }
    });
  };

  render() {
    const { form, authUser, formItems, onSubmitAdd, onBack } = this.props;
    const { getFieldDecorator } = form;
    const formProps = {
      authUser,
      getFieldDecorator,
      formItemLayout,
    };

    return (
      <Form onSubmit={this.handleSubmit}>
        {formItems.basic && <UserFormBasic {...formProps} />}
        {formItems.extended && <UserFormExtended {...formProps} />}
        <Button.Group style={{ marginTop: "2.2rem" }}>
          {onBack && (
            <Button icon="caret-left" onClick={() => onBack()}>
              Back
            </Button>
          )}
          <Button type="primary" icon="save" htmlType="submit">
            {onSubmitAdd ? "Continue" : "Save"}
          </Button>
        </Button.Group>
      </Form>
    );
  }
}

const WrappedForm = compose(withFirebase)(
  Form.create({ name: "account" })(UserForm),
);

export default WrappedForm;
