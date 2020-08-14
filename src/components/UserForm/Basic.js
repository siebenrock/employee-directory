import React from "react";
import { Form, Input, Icon } from "antd";

const UserFormBasic = ({ authUser, getFieldDecorator, formItemLayout }) => (
  <React.Fragment>
    <Form.Item {...formItemLayout} label="E-Mail">
      {getFieldDecorator("email", {
        initialValue: authUser.email,
      })(
        <Input
          disabled
          prefix={<Icon type="mail" style={{ color: "rgba(0,0,0,.25)" }} />}
          inputMode="email"
        />,
      )}
    </Form.Item>
    <Form.Item {...formItemLayout} label="First Name">
      {getFieldDecorator("firstName", {
        initialValue: authUser.firstName,
        rules: [
          {
            required: true,
            message: "Please enter your first name",
            whitespace: true,
          },
        ],
      })(<Input />)}
    </Form.Item>
    <Form.Item {...formItemLayout} label="Last Name">
      {getFieldDecorator("lastName", {
        initialValue: authUser.lastName,
        rules: [
          {
            required: true,
            message: "Please enter your last name",
            whitespace: true,
          },
        ],
      })(<Input />)}
    </Form.Item>
  </React.Fragment>
);

export default UserFormBasic;
