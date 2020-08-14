import React from "react";

import { Menu } from "antd";

import { withFirebase } from "../Firebase";

import "./Auth/Mobile.css";

const NavigationAuthMobile = ({ location }) => (
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
  </Menu>
);

export default withFirebase(NavigationAuthMobile);
