import React from "react";
import {
  Form,
  Input,
  Cascader,
  Checkbox,
  Select,
  Switch,
  Icon,
  Radio,
  Tooltip,
} from "antd";

import * as OPTIONS from "../../constants/options";
import FIELDS from "../../constants/userFormFields";

const generateOptionsBasedOnPreset = optionPreset => {
  const { Option } = Select;
  let options = [];

  switch (optionPreset) {
    case "languages":
      options = OPTIONS.languages;
      break;
    default:
      return null;
  }

  return options.map(option => (
    <Option key={option} value={option}>
      {option}
    </Option>
  ));
};

const UserFormExtended = ({ authUser, getFieldDecorator, formItemLayout }) => (
  <React.Fragment>
    {FIELDS.map(section => (
      <React.Fragment key={section.heading}>
        <h2 style={{ marginTop: "2rem" }}>{section.heading}</h2>
        {section.description && <p>{section.description}</p>}
        {section.fields &&
          section.fields.map(field => {
            switch (field.type) {
              case "text": {
                return (
                  <Form.Item
                    {...formItemLayout}
                    label={field.label}
                    key={field.value}
                    help={field.help}
                  >
                    {getFieldDecorator(field.value, {
                      initialValue: authUser[field.value],
                    })(
                      <Input
                        prefix={
                          field.icon && (
                            <Icon
                              type={field.icon}
                              style={{ color: "rgba(0,0,0,.25)" }}
                            />
                          )
                        }
                        disabled={!!field.disabled}
                      />,
                    )}
                  </Form.Item>
                );
              }

              case "paragraph": {
                return (
                  <Form.Item
                    {...formItemLayout}
                    label={field.label}
                    key={field.value}
                    help={field.help}
                  >
                    {getFieldDecorator(field.value, {
                      initialValue: authUser[field.value],
                    })(
                      <Input.TextArea
                        prefix={
                          field.icon && (
                            <Icon
                              type={field.icon}
                              style={{ color: "rgba(0,0,0,.25)" }}
                            />
                          )
                        }
                        autoSize={(true, { minRows: 2, maxRows: 5 })}
                        disabled={!!field.disabled}
                      />,
                    )}
                  </Form.Item>
                );
              }

              case "phone": {
                return (
                  <Form.Item
                    {...formItemLayout}
                    label={field.label}
                    key={field.value}
                  >
                    <Tooltip
                      trigger={["focus"]}
                      title={field.tooltip}
                      placement="topLeft"
                    >
                      {getFieldDecorator(field.value, {
                        initialValue: authUser[field.value],
                        rules: [
                          {
                            pattern: /^[+][0-9]+$/,
                            message:
                              "Please enter a valid phone number with a country code and without any other characters.",
                          },
                        ],
                      })(
                        <Input
                          prefix={
                            field.icon ? (
                              <Icon
                                type={field.icon}
                                style={{ color: "rgba(0,0,0,.25)" }}
                              />
                            ) : (
                              <Icon
                                type="phone"
                                style={{ color: "rgba(0,0,0,.25)" }}
                              />
                            )
                          }
                          inputMode="tel"
                        />,
                      )}
                    </Tooltip>
                  </Form.Item>
                );
              }

              case "cascader": {
                let { options } = field;
                if (!options) options = [];
                if (field.optionPreset) {
                  switch (field.optionPreset) {
                    case "affiliation":
                      options = OPTIONS.affiliation;
                      break;
                    default:
                      break;
                  }
                }

                return (
                  <Form.Item
                    {...formItemLayout}
                    label={field.label}
                    key={field.value}
                  >
                    {getFieldDecorator(field.value, {
                      initialValue: authUser[field.value],
                      rules: [
                        {
                          type: "array",
                        },
                      ],
                    })(
                      <Cascader
                        options={options}
                        allowClear
                        expandTrigger="hover"
                      />,
                    )}
                  </Form.Item>
                );
              }

              case "tags": {
                return (
                  <Form.Item
                    {...formItemLayout}
                    label={field.label}
                    key={field.value}
                    help={field.help}
                  >
                    {getFieldDecorator(field.value, {
                      initialValue: authUser[field.value],
                    })(
                      <Select
                        mode={field.otherOptions ? "tags" : "multiple"}
                        tokenSeparators={[","]}
                      >
                        {field.optionPreset
                          ? generateOptionsBasedOnPreset(field.optionPreset)
                          : field.options &&
                            field.options.map(option => (
                              <Option key={option} value={option}>
                                {option}
                              </Option>
                            ))}
                      </Select>,
                    )}
                  </Form.Item>
                );
              }

              case "dropdown": {
                const { Option } = Select;
                return (
                  <Form.Item
                    {...formItemLayout}
                    label={field.label}
                    key={field.value}
                  >
                    {getFieldDecorator(field.value, {
                      initialValue: authUser[field.value],
                    })(
                      <Select allowClear>
                        {field.optionPreset
                          ? generateOptionsBasedOnPreset(field.optionPreset)
                          : field.options &&
                            field.options.map(option => (
                              <Option key={option} value={option}>
                                {option}
                              </Option>
                            ))}
                      </Select>,
                    )}
                  </Form.Item>
                );
              }

              case "switch": {
                return (
                  <Form.Item
                    {...formItemLayout}
                    label={field.label}
                    key={field.value}
                  >
                    {getFieldDecorator(field.value, {
                      initialValue: authUser[field.value],
                    })(<Switch defaultChecked={authUser[field.value]} />)}
                  </Form.Item>
                );
              }

              case "radio": {
                return (
                  <Form.Item
                    {...formItemLayout}
                    label={field.label}
                    key={field.value}
                    help={field.help}
                  >
                    {getFieldDecorator(field.value, {
                      initialValue: authUser[field.value],
                    })(
                      <Radio.Group
                        buttonStyle="solid"
                        disabled={!!field.disabled}
                      >
                        {field.options &&
                          field.options.map(option => (
                            <Radio.Button value={option} key={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </Radio.Button>
                          ))}
                      </Radio.Group>,
                    )}
                  </Form.Item>
                );
              }

              case "checkbox": {
                return (
                  <Form.Item
                    {...formItemLayout}
                    label={field.label}
                    key={field.value}
                    help={field.help}
                  >
                    {getFieldDecorator(field.value, {
                      initialValue: authUser[field.value],
                    })(
                      <Checkbox.Group
                        options={field.options}
                        disabled={!!field.disabled}
                      />,
                    )}
                  </Form.Item>
                );
              }

              case "link": {
                return (
                  <Form.Item
                    {...formItemLayout}
                    label={field.label}
                    key={field.value}
                    help={field.help}
                  >
                    <Tooltip
                      trigger={["focus"]}
                      title={field.tooltip}
                      placement="topLeft"
                    >
                      {getFieldDecorator(field.value, {
                        initialValue: authUser[field.value],
                        rules: [
                          {
                            type: "url",
                            message:
                              "Please enter a valid url starting with 'http://' or 'https://'.",
                          },
                        ],
                      })(<Input inputMode="url" />)}
                    </Tooltip>
                  </Form.Item>
                );
              }

              case "slack": {
                return (
                  <Form.Item
                    {...formItemLayout}
                    label={field.label}
                    key={field.value}
                    help={field.help}
                  >
                    {getFieldDecorator(field.value, {
                      initialValue: authUser[field.value],
                      rules: [
                        {
                          pattern: /^[A-Z0-9]+$/,
                          message:
                            "Please enter your Slack Member ID and not your username, unfortunately Slack does not allow deep linking with usernames.",
                        },
                      ],
                    })(
                      <Input
                        addonBefore={
                          field.community ? `${field.community}.slack.com/` : ""
                        }
                      />,
                    )}
                  </Form.Item>
                );
              }

              case "google": {
                return (
                  <Form.Item
                    {...formItemLayout}
                    label={field.label}
                    key={field.value}
                    help={field.help}
                  >
                    <Tooltip
                      trigger={["focus"]}
                      title={field.tooltip}
                      placement="topLeft"
                    >
                      {getFieldDecorator(field.value, {
                        initialValue: authUser[field.value],
                        rules: [
                          {
                            type: "email",
                            message: "Please enter a valid e-mail address",
                          },
                        ],
                      })(
                        <Input
                          prefix={
                            <Icon
                              type="google"
                              style={{ color: "rgba(0,0,0,.25)" }}
                            />
                          }
                          inputMode="email"
                        />,
                      )}
                    </Tooltip>
                  </Form.Item>
                );
              }

              case "email": {
                return (
                  <Form.Item
                    {...formItemLayout}
                    label={field.label}
                    key={field.value}
                    help={field.help}
                  >
                    <Tooltip
                      trigger={["focus"]}
                      title={field.tooltip}
                      placement="topLeft"
                    >
                      {getFieldDecorator(field.value, {
                        initialValue: authUser[field.value],
                        rules: [
                          {
                            type: "email",
                            message: "Please enter a valid e-mail address",
                          },
                        ],
                      })(
                        <Input
                          prefix={
                            field.icon && (
                              <Icon
                                type={field.icon}
                                style={{ color: "rgba(0,0,0,.25)" }}
                              />
                            )
                          }
                          disabled={!!field.disabled}
                          inputMode="email"
                        />,
                      )}
                    </Tooltip>
                  </Form.Item>
                );
              }

              case "github": {
                return (
                  <Form.Item
                    {...formItemLayout}
                    label={field.label}
                    key={field.value}
                  >
                    <Tooltip
                      trigger={["focus"]}
                      title={field.tooltip}
                      placement="topLeft"
                    >
                      {getFieldDecorator(field.value, {
                        initialValue: authUser[field.value],
                        rules: [
                          {
                            pattern: /^([A-Za-z\d]+-)*[A-Za-z\d]+$/,
                            message: "Please only enter your username.",
                          },
                        ],
                      })(
                        <Input
                          prefix={
                            <Icon
                              type="github"
                              style={{ color: "rgba(0,0,0,.25)" }}
                            />
                          }
                        />,
                      )}
                    </Tooltip>
                  </Form.Item>
                );
              }

              case "gitlab": {
                return (
                  <Form.Item
                    {...formItemLayout}
                    label={field.label}
                    key={field.value}
                  >
                    <Tooltip
                      trigger={["focus"]}
                      title={field.tooltip}
                      placement="topLeft"
                    >
                      {getFieldDecorator(field.value, {
                        initialValue: authUser[field.value],
                        rules: [
                          {
                            pattern: /^([A-Za-z\d]+-)*[A-Za-z\d]+$/,
                            message: "Please only enter your username.",
                          },
                        ],
                      })(
                        <Input
                          prefix={
                            <Icon
                              type="gitlab"
                              style={{ color: "rgba(0,0,0,.25)" }}
                            />
                          }
                        />,
                      )}
                    </Tooltip>
                  </Form.Item>
                );
              }

              default: {
                return "";
              }
            }
          })}
      </React.Fragment>
    ))}
  </React.Fragment>
);

export default UserFormExtended;
