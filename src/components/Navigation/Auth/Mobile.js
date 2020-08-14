import React from "react";
import { NavLink } from "react-router-dom";

import { Menu, Icon, Dropdown } from "antd";
import AvatarImage from "../../Avatar";

import { withFirebase } from "../../Firebase";

import * as ROUTES from "../../../constants/routes";

import "./Mobile.css";

const NavigationAuthMobile = ({ authUser, location, firebase }) => (
  <Menu
    mode="horizontal"
    defaultSelectedKeys={["/"]}
    selectedKeys={[location.pathname]}
    className="mobile-menu"
  >
    <Menu.Item key="/logo" style={{ pointerEvents: "none" }}>
      <img
        style={{ maxHeight: "30px", maxWidth: "70px" }}
        src="../static/logo.png"
        alt="CDTM Logo"
      />
    </Menu.Item>

    <Menu.Item key={ROUTES.DIRECTORY} style={{ border: "none" }}>
      <NavLink to={ROUTES.DIRECTORY}>
        <Icon type="appstore" />
      </NavLink>
    </Menu.Item>

    <Menu.Item key={ROUTES.RESOURCES} style={{ border: "none" }}>
      <NavLink to={ROUTES.RESOURCES}>
        <Icon type="container" />
      </NavLink>
    </Menu.Item>

    <Menu.Item key="mobileSubMenu" style={{ border: "none" }}>
      <Dropdown
        overlay={
          <Menu size="large">
            <Menu.Item key={ROUTES.ACCOUNT} className="submenu-item">
              <NavLink to={ROUTES.ACCOUNT}>Profile</NavLink>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="Feedback" className="submenu-item">
              <a
                href="https://airtable.com/shrAlI9uEEpuGxRCL"
                rel="noopener noreferrer"
                target="_blank"
              >
                Feedback
              </a>
            </Menu.Item>
            <Menu.Item key="Roadmap" className="submenu-item">
              <a
                href="https://airtable.com/shrVCJAqYhsRyTwA6"
                rel="noopener noreferrer"
                target="_blank"
              >
                Roadmap
              </a>
            </Menu.Item>
            <Menu.Item key="Repository" className="submenu-item">
              <a
                href="https://gitlab.com/CDTM/community"
                rel="noopener noreferrer"
                target="_blank"
              >
                Repository
              </a>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              key="/logout"
              className="submenu-item"
              onClick={firebase.doSignOut}
            >
              Logout
            </Menu.Item>
          </Menu>
        }
        placement="topRight"
      >
        <AvatarImage
          src={authUser.avatar}
          alt="User icon in bottom navigation"
          style={{
            height: "30px",
            borderRadius: "5px",
            border: "1px solid #e8e8e8",
          }}
        />
      </Dropdown>
    </Menu.Item>
  </Menu>
);

export default withFirebase(NavigationAuthMobile);
