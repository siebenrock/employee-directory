import React from "react";

import { List, Collapse } from "antd";

import UserForm from "../UserForm";

import ABOUT from "../../constants/about";

const Basic = ({ nextStep, authUser }) => (
  <React.Fragment>
    <h2>Welcome to our Community Platform!</h2>
    <p>
      The platform aims to connect Centerlings, have a central point for contact
      information, and to develop the Alumni network. Click on learn more for a
      full feature overview and follow the steps below to configure your
      account.
    </p>
    <p>
      The application is currently in beta and we appreciate every reported bug!
    </p>
    <p style={{ marginBottom: "2rem" }}>
      Marc and Kai, <i>Fall 2018</i>
    </p>
    <Collapse style={{ backgroundColor: "rgba(255, 0, 0, 0.0)" }}>
      <Collapse.Panel header="Learn more" key="1">
        <List
          itemLayout="vertical"
          dataSource={ABOUT}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <img
                    alt="icon"
                    src={`../static/icons/${item.image}`}
                    style={{
                      maxWidth: "36px",
                      opacity: "0.6",
                      marginLeft: "12px",
                    }}
                  />
                }
                title={item.title}
                description={
                  <ul
                    style={{
                      listStyleType: "none",
                      paddingLeft: "0px",
                    }}
                  >
                    {item.bullets.map(line => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                }
                style={{ marginTop: "16px" }}
              />
            </List.Item>
          )}
        />
      </Collapse.Panel>
    </Collapse>

    <h2 style={{ marginTop: "4rem" }}>Personal Information</h2>
    <p>Please enter your basic information</p>
    <UserForm
      authUser={authUser}
      onSubmitAdd={() => nextStep()}
      formItems={{ basic: true, extended: false }}
    />
  </React.Fragment>
);

export default Basic;
