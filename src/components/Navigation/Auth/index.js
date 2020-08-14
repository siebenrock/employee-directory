import React from "react";
import { NavLink } from "react-router-dom";

import { Menu, Icon, Row, Col } from "antd";
import AvatarImage from "../../Avatar";

import { withFirebase } from "../../Firebase";

import * as ROUTES from "../../../constants/routes";
import * as ROLES from "../../../constants/roles";

const NavigationAuth = ({ authUser, location, firebase }) => (
  <div
    style={{
      position: "fixed",
      zIndex: 100,
      width: "100%",
    }}
  >
    <Menu
      mode="horizontal"
      defaultSelectedKeys={["/"]}
      selectedKeys={[location.pathname]}
    >
      <Menu.Item key="/logo" style={{ pointerEvents: "none" }}>
        <img
          style={{ height: "32px" }}
          src="../static/logo.png"
          alt="CDTM Logo"
        />
      </Menu.Item>

      <Menu.Item key={ROUTES.DIRECTORY}>
        <NavLink to={ROUTES.DIRECTORY}>
          <Icon type="appstore" />
          Directory
        </NavLink>
      </Menu.Item>

      <Menu.Item key={ROUTES.RESOURCES}>
        <NavLink to={ROUTES.RESOURCES}>
          <Icon type="container" />
          Resources
        </NavLink>
      </Menu.Item>

      {authUser.roles.includes(ROLES.ADMIN) && (
        <Menu.Item key={ROUTES.ADMIN}>
          <NavLink to={ROUTES.ADMIN}>
            <Icon type="bar-chart" />
            Admin
          </NavLink>
        </Menu.Item>
      )}

      <Menu.SubMenu
        title={
          <React.Fragment>
            <Row type="flex" justify="space-around" align="middle">
              <Col
                style={{
                  marginRight: "12px",
                }}
              >
                <AvatarImage
                  src={authUser.avatar}
                  style={{
                    height: "35px",
                    width: "35px",
                    borderRadius: "5px",
                    border: "1px solid #e8e8e8",
                  }}
                  alt="profile icon"
                />
              </Col>
              <Col>
                {authUser.firstName} {authUser.lastName}
              </Col>
            </Row>
          </React.Fragment>
        }
        style={{ float: "right" }}
      >
        <Menu.Item key={ROUTES.ACCOUNT}>
          <NavLink to={ROUTES.ACCOUNT}>
            <Icon type="edit" />
            Account
          </NavLink>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="Feedback">
          <a
            href={`https://airtable.com/shrAlI9uEEpuGxRCL?prefill_Name=${authUser.firstName} ${authUser.lastName}, ${authUser.email}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon type="bell" />
            Feedback
          </a>
        </Menu.Item>
        <Menu.Item key="Roadmap">
          <a
            href="https://airtable.com/shrVCJAqYhsRyTwA6"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon type="compass" />
            Roadmap
          </a>
        </Menu.Item>
        <Menu.Item key="Repository">
          <a
            href="https://gitlab.com/CDTM/community"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon type="book" />
            Repository
          </a>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="/logout" onClick={firebase.doSignOut}>
          <Icon type="logout" />
          Logout
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  </div>
);

export default withFirebase(NavigationAuth);
