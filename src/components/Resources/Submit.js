import React, { Component } from "react";
import {
  Input,
  Icon,
  Alert,
  Form,
  Button,
  Select,
  Card,
  Row,
  Radio,
  Switch,
  Typography,
  Tag,
  message,
} from "antd";
import axios from "axios";
import { compose } from "recompose";
import { withFirebase } from "../Firebase";

import "./Submit.css";

import { resourceTypes } from "../../constants/resources";

class ResourcesSubmit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      enteredUrl: "",
      loading: false,
      step: 0,
      resource: {},
      error: false,
      availableTags: null,
    };
  }

  splitTagline = initial => {
    const dividers = [": ", "; ", " - ", " – ", " | "];
    let splitIndex;
    let splitIndexLength;

    for (let i = 0; i < dividers.length; i += 1) {
      const index = initial.indexOf(dividers[i]);
      if (index !== -1 && (splitIndex ? index < splitIndex : true)) {
        splitIndex = index;
        splitIndexLength = dividers[i].length;
      }
    }

    if (splitIndex) {
      const title = initial.substring(0, splitIndex);
      const tagline = initial.substring(splitIndex + splitIndexLength);
      return {
        title: title.trim(),
        tagline:
          tagline
            .trim()
            .charAt(0)
            .toUpperCase() + tagline.slice(1),
      };
    }

    return {
      title: initial,
      tagline: "",
    };
  };

  getLinkPreview = url => {
    this.setState({ loading: true, error: false });

    if (!url) {
      message.error("Please enter a valid URL");
    }

    axios
      .post("https://api.linkpreview.net", {
        q: encodeURI(url),
        key: "5cfd22c16fda2cb2dc70c84b332c8e5aef3045e20c16f",
      })
      .then(resp => {
        const titleAndTagline = this.splitTagline(resp.data.title);
        this.setState({
          loading: false,
          resource: {
            ...resp.data,
            title: titleAndTagline.title,
            tagline: titleAndTagline.tagline,
          },
          enteredUrl: url,
        });
        this.next();
      })
      .catch(e => {
        console.error(e.response);
        message.error(e.response);
        this.setState({
          loading: false,
          error: true,
          enteredUrl: url,
          resource: { url },
        });
        // go to next step even if there is an error, otherwise impossible to add website with restrictive robots.txt
        this.next();
      });
  };

  handleTypeChange = value => {
    this.setState({
      availableTags: resourceTypes[value].tags,
    });
  };

  next = () => {
    const { step } = this.state;
    if (step === 2) return;

    this.setState(prevState => ({
      step: prevState.step + 1,
      error: false,
      loading: false,
    }));
  };

  back = () => {
    this.setState(prevState => {
      switch (prevState.step) {
        case 2:
          return {
            step: prevState.step - 1,
            error: false,
            loading: false,
          };
        case 1:
          return {
            step: prevState.step - 1,
            error: false,
            loading: false,
            resource: {},
          };
        case 0:
        default:
      }
      return {};
    });
  };

  handleForm = e => {
    const { form } = this.props;
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ resource: values }, this.next);
      } else {
        this.setState({ error: true });
      }
    });
  };

  createResource = () => {
    const {
      firebase,
      authUser,
      closeResourcesSubmitDrawer,
      refreshResources,
    } = this.props;
    const { resource } = this.state;
    this.setState({ loading: true });

    // Remove undefined fields that are not filled out as they are not required
    Object.keys(resource).forEach(
      key => resource[key] === undefined && delete resource[key],
    );

    firebase
      .doCreateResource(resource, authUser)
      .then(() => {
        refreshResources();
        closeResourcesSubmitDrawer();

        firebase.logEvent("resources_submit_resource", {
          type: resource.type,
          title: resource.title,
        });
        message.success("Your resources was added");
      })
      .catch(e => {
        console.error(e);
        this.setState({ error: true, loading: false });
      });
  };

  render() {
    const { form } = this.props;
    const {
      loading,
      step,
      resource,
      error,
      enteredUrl,
      availableTags,
    } = this.state;
    const { getFieldDecorator } = form;

    return (
      <React.Fragment>
        <h1>Submit Resource</h1>
        <p style={{ marginBottom: "0.6em" }}>
          Enter the URL of the new resource:
        </p>
        <Input.Search
          placeholder="https://www.wikipedia.org/"
          enterButton={
            step === 0 && loading ? (
              <Icon type="loading-3-quarters" twoToneColor="#ffffff" spin />
            ) : (
              "Continue"
            )
          }
          disabled={loading || step >= 1}
          type="url"
          defaultValue={enteredUrl && enteredUrl}
          onSearch={url => this.getLinkPreview(url)}
          allowClear={step === 0}
          autoFocus
          inputMode="url"
        />

        <React.Fragment>
          <h3 className="resource-submit-heading">Details</h3>

          <Form onSubmit={this.handleForm} layout="vertical">
            <Form.Item label="Title:" extra="Exact name of the resource">
              {getFieldDecorator("title", {
                initialValue: resource.title,
                rules: [
                  {
                    required: true,
                    message: "Please set a title for the resource",
                  },
                ],
              })(<Input disabled={step !== 1} />)}
            </Form.Item>

            <Form.Item label="Tagline:" extra="Short catchphrase or subtitle">
              {getFieldDecorator("tagline", {
                initialValue: resource.tagline,
              })(<Input disabled={step !== 1} />)}
            </Form.Item>

            <Form.Item
              label="Description:"
              extra="Longer description, comment, and personal remarks"
            >
              {getFieldDecorator("description", {
                initialValue: resource.description,
                rules: [
                  {
                    required: true,
                    message:
                      "Please include a short description of the resource",
                  },
                ],
              })(
                <Input.TextArea
                  autosize={{ minRows: 4, maxRows: 8 }}
                  disabled={step !== 1}
                />,
              )}
            </Form.Item>

            <Form.Item label="URL:">
              {getFieldDecorator("url", {
                initialValue: resource.url,
                rules: [
                  {
                    required: true,
                    message: "Please insert an URL for the resource",
                  },
                ],
              })(<Input disabled={step !== 1} />)}
            </Form.Item>

            <div className="flex-wrapper">
              <span style={{ flexGrow: "1" }}>
                <Form.Item
                  label="Image:"
                  extra="Insert URL to select your own image or icon"
                >
                  {getFieldDecorator("image", {
                    initialValue: resource.image,
                  })(<Input disabled={step !== 1} />)}
                </Form.Item>

                <Form.Item label="Type:">
                  {getFieldDecorator("type", {
                    initialValue: resource.type,
                    rules: [
                      {
                        required: true,
                        message: "Please select a type for the resource",
                      },
                    ],
                  })(
                    <Select
                      disabled={step !== 1}
                      onChange={this.handleTypeChange}
                    >
                      {Object.keys(resourceTypes).map(type => (
                        <Select.Option value={type} key={type}>
                          {type.slice(0, -1)}
                        </Select.Option>
                      ))}
                    </Select>,
                  )}
                </Form.Item>

                <Form.Item label="Tags:">
                  {getFieldDecorator("tags", {
                    initialValue: resource.tags,
                  })(
                    <Select
                      disabled={step !== 1 || !availableTags}
                      mode="multiple"
                      allowClear
                    >
                      {availableTags &&
                        availableTags.map(tag => (
                          <Select.Option value={tag} key={tag}>
                            {tag}
                          </Select.Option>
                        ))}
                    </Select>,
                  )}
                </Form.Item>
              </span>
              <span
                style={{
                  maxWidth: "250px",
                }}
              >
                {resource.image && (
                  <img
                    src={resource.image}
                    alt="Resource"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "144px",
                      paddingTop: "22px ",
                      paddingLeft: "20px",
                    }}
                  />
                )}
              </span>
            </div>

            <Form.Item label="Affiliation:">
              {getFieldDecorator("affiliation", {
                initialValue: "None",
              })(
                <Radio.Group disabled={step !== 1}>
                  <Radio.Button value="User">User</Radio.Button>
                  <Radio.Button value="Employer">Employer</Radio.Button>
                  <Radio.Button value="Founder">Founder</Radio.Button>
                  <Radio.Button value="None">None</Radio.Button>
                </Radio.Group>,
              )}
            </Form.Item>

            <Form.Item label="Student discount available?">
              {getFieldDecorator("studentDiscount", {
                valuePropName: "checked",
              })(
                <Switch
                  disabled={step !== 1}
                  checkedChildren={<Icon type="percentage" />}
                />,
              )}
            </Form.Item>

            {step === 1 && (
              <Button.Group className="submit-button-group">
                <Button icon="caret-up" onClick={() => this.back()}>
                  Back
                </Button>
                <Button
                  type="primary"
                  icon="save"
                  htmlType="submit"
                  loading={loading}
                >
                  Continue
                </Button>
              </Button.Group>
            )}
          </Form>
        </React.Fragment>

        {step >= 2 && (
          <React.Fragment>
            <h3 className="resource-submit-heading">Preview</h3>
            <Card
              className="resources-card"
              key={resource.title}
              style={{ maxWidth: "420px" }}
            >
              <Row className="resources-card-meta">
                {resource.image && (
                  <div style={{ height: "3.5rem", width: "3.5rem" }}>
                    <div className="resources-logo-wrapper">
                      <img
                        src={resource.image}
                        alt="Resource Logo"
                        className="resources-logo"
                      />
                    </div>
                  </div>
                )}
                <div style={{ paddingLeft: "16px" }}>
                  <Typography.Title
                    level={4}
                    className="resources-card-title resource-card-clickable"
                    style={{ fontSize: "1rem", marginBottom: "0em" }}
                    onClick={() => this.openDescriptionModal(resource)}
                  >
                    {resource.title && resource.title}
                  </Typography.Title>

                  <p className="resources-card-tagline">
                    {resource.tagline && resource.tagline}
                  </p>
                </div>
              </Row>
              <div
                style={{
                  marginTop: "1.3rem",
                }}
              >
                <Typography.Paragraph
                  ellipsis={{ rows: 3 }}
                  className="resource-card-clickable"
                >
                  {resource.description && resource.description}
                </Typography.Paragraph>
              </div>
              <div style={{ whiteSpace: "nowrap" }}>
                {resource.tags &&
                  resource.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
              </div>
            </Card>
            <Button.Group className="submit-button-group">
              <Button icon="caret-up" onClick={() => this.back()}>
                Back
              </Button>
              <Button
                type="primary"
                icon="save"
                loading={loading}
                onClick={() => this.createResource()}
              >
                Publish
              </Button>
            </Button.Group>
            {error && <Alert message="Something went wrong" type="error" />}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

const WrappedResourcesSubmit = compose(withFirebase)(
  Form.create({ name: "resourcesSubmit" })(ResourcesSubmit),
);

export default WrappedResourcesSubmit;
