import React from "react";

import { Menu } from "antd";

const NavigationSetup = ({ location }) => (
  <div style={{ position: "fixed", zIndex: 100, width: "100%" }}>
    <Menu
      mode="horizontal"
      defaultSelectedKeys={["/"]}
      selectedKeys={[location.pathname]}
      style={{ position: "fixed", zIndex: 100, width: "100%" }}
    >
      <Menu.Item key="/logo" style={{ pointerEvents: "none" }}>
        <img
          style={{ height: "32px" }}
          src="../static/logo.png"
          alt="CDTM Logo"
        />
      </Menu.Item>
    </Menu>
  </div>
);
export default NavigationSetup;
