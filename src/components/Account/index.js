import React from "react";
import { Layout, Row, Col, Button, Popover, Typography } from "antd";

import UserForm from "../UserForm";
import Upload from "../Avatar/Upload";
import { withAuthorization } from "../Session";
import { withFirebase } from "../Firebase";

const AccountPage = ({ authUser, windowWidth }) => {
  return (
    <Layout className="module">
      <Layout
        className="module-thin"
        style={{
          margin: "0 auto",
        }}
      >
        <Row
          gutter={40}
          style={{
            maxWidth: "1100px",
          }}
        >
          <Col xs={24} sm={7}>
            <Upload authUser={authUser} windowWidth={windowWidth} />
          </Col>
          <Col xs={24} sm={17}>
            <h2>Your Profile</h2>
            <p>Your basic information</p>
            <UserForm
              authUser={authUser}
              formItems={{ basic: true, extended: true }}
            />

            <Popover
              content={
                <Typography.Paragraph copyable>
                  {authUser.uid}
                </Typography.Paragraph>
              }
              title="Debug UID"
              trigger="click"
            >
              <Button style={{ marginTop: "24px" }}>Debug UID</Button>
            </Popover>
          </Col>
        </Row>
      </Layout>
    </Layout>
  );
};

const condition = authUser => !!authUser;

export default withAuthorization(condition)(withFirebase(AccountPage));
