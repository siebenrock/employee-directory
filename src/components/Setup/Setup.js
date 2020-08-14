import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import { Layout, Steps, Icon, Row, Col } from "antd";

import { withAuthorization } from "../Session";
import Basic from "./Basic";
import Avatar from "./Avatar";
import Extended from "./Extended";

import * as ROUTES from "../../constants/routes";

const steps = [
  {
    title: "Welcome",
    description: "Introduction and basic information",
    icon: "info-circle",
  },
  {
    title: "Profile picture",
    description: "Upload your profile picture",
    icon: "smile",
  },
  {
    title: "Personal profile",
    description: "Fill out your personal profile",
    icon: "plus-circle",
  },
];

class Setup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentStep: 0,
      completedStep: -1,
    };

    props.firebase.logEvent("setup_start");
  }

  nextStep = () => {
    const { history, firebase } = this.props;
    const { currentStep, completedStep } = this.state;

    if (currentStep < 2) {
      firebase.logEvent("setup_step", { step: currentStep });
      if (currentStep > completedStep)
        this.setState({
          currentStep: currentStep + 1,
          completedStep: currentStep,
        });
      else
        this.setState({
          currentStep: currentStep + 1,
        });
    } else {
      firebase.logEvent("setup_complete");
      firebase
        .currentUser()
        .set({ completedSetup: true }, { merge: true })
        .then(history.push(ROUTES.DIRECTORY));
    }
  };

  previousStep = () => {
    const { currentStep, completedStep } = this.state;

    if (currentStep > 0) {
      if (currentStep > completedStep)
        this.setState({
          currentStep: currentStep - 1,
          completedStep: currentStep,
        });
      else
        this.setState({
          currentStep: currentStep - 1,
        });
    }
  };

  completed = step => {
    const { completedStep } = this.state;
    return step <= completedStep;
  };

  render() {
    const { currentStep } = this.state;
    const { authUser, windowWidth } = this.props;
    const setupProps = {
      authUser,
      nextStep: this.nextStep,
      previousStep: this.previousStep,
    };

    return (
      <Layout className="module">
        <Layout className="module-thin">
          <Row type="flex" justify="space-around">
            <Col xs={24} sm={20}>
              <Steps current={currentStep} style={{ margin: "15px 0px 50px" }}>
                {steps.map((step, index) => (
                  <Steps.Step
                    key={step.title}
                    title={step.title}
                    description={step.description}
                    icon={
                      this.completed(index) ? (
                        <Icon type="check-circle" />
                      ) : (
                        <Icon type={step.icon} />
                      )
                    }
                  />
                ))}
              </Steps>
            </Col>
            <Col xs={24} sm={20} md={16} lg={12}>
              {currentStep === 0 && (
                <Basic {...setupProps} authUser={authUser} />
              )}
              {currentStep === 1 && (
                <Avatar
                  {...setupProps}
                  authUser={authUser}
                  windowWidth={windowWidth}
                />
              )}
              {currentStep === 2 && (
                <Extended
                  {...setupProps}
                  authUser={authUser}
                  windowWidth={windowWidth}
                />
              )}
            </Col>
          </Row>
        </Layout>
      </Layout>
    );
  }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(withRouter(Setup));
