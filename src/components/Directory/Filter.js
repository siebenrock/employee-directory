import React, { Component } from "react";

import { Layout, Menu, Icon, Input, Radio, Cascader, Tooltip } from "antd";

import COHORTS from "../../constants/cohorts";

import "./Filter.css";

class DirectoryFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchField: "firstName",
    };
  }

  onChangeSearchField = e => {
    this.setState({
      searchField: e.target.value,
    });
  };

  render() {
    const {
      collapsed,
      filterOptions,
      getByFirstName,
      getByCohort,
      getFilteredResults,
      getUpdated,
      search,
      searchFieldOptions,
      getFavorites,
    } = this.props;
    const { searchField } = this.state;
    return (
      <Layout.Sider
        collapsible
        collapsedWidth={0}
        trigger={null}
        collapsed={collapsed}
        width={220}
        style={{
          height: "100vh",
          background: "#fff",
          overflow: "auto",
          position: "fixed",
          left: 0,
        }}
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={["getByCohort"]}
          style={{
            height: "100%",
            borderRight: "1px solid #e8e8e8",
            paddingTop: "66px",
          }}
        >
          <Menu.Item key="getByFirstName" onClick={() => getByFirstName()}>
            <Icon type="appstore" />
            <span>By Name</span>
          </Menu.Item>

          <Menu.Item key="getByCohort" onClick={() => getByCohort()}>
            <Icon type="table" />
            <span>By Class</span>
          </Menu.Item>

          <Menu.Item key="favorites" onClick={() => getFavorites()}>
            <Tooltip
              placement="bottomLeft"
              title="Add Centerlings to your favorites"
            >
              <Icon type="star" />
              <span>Favorites</span>
            </Tooltip>
          </Menu.Item>

          <Menu.SubMenu
            key="findClass"
            title={
              <span>
                <Icon type="filter" />
                <span>Find Class</span>
              </span>
            }
          >
            <Menu.Item
              disabled
              style={{ cursor: "pointer" }}
              id="find-class-menu-item"
            >
              <Cascader
                options={COHORTS}
                onChange={selected =>
                  getFilteredResults(
                    "cohort",
                    `${selected[1]} ${selected[0]}`,
                    false,
                  )
                }
                placeholder="Class"
                style={{ marginLeft: "-24px" }}
              />
            </Menu.Item>
          </Menu.SubMenu>

          {filterOptions &&
            filterOptions.map(filter => (
              <Menu.SubMenu
                key={filter.value}
                title={
                  <span>
                    <Icon type="filter" />
                    <span>{filter.label}</span>
                  </span>
                }
              >
                {filter.options.map(option => (
                  <Menu.Item
                    key={option}
                    onClick={() =>
                      getFilteredResults(
                        filter.value,
                        option,
                        filter.isArraySearch,
                      )
                    }
                  >
                    {option}
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
            ))}

          <Menu.SubMenu
            key="search"
            title={
              <span>
                <Icon type="search" />
                <span>Search</span>
              </span>
            }
          >
            <Menu.Item
              disabled
              style={{ cursor: "pointer" }}
              id="search-menu-item"
            >
              <Tooltip placement="topLeft" title="Beta: exact spelling">
                <Input.Search
                  enterButton
                  placeholder="Term"
                  onSearch={(searchField, value => search(searchField, value))}
                  style={{
                    marginTop: "2px",
                    marginLeft: "-24px",
                    minWidth: "178px",
                    display: "block",
                  }}
                  inputMode="search"
                />
              </Tooltip>
              <Radio.Group
                options={searchFieldOptions}
                onChange={this.onChangeSearchField}
                value={searchField}
                style={{
                  display: "block",
                  marginTop: "16px",
                  marginLeft: "-24px",
                }}
              />
            </Menu.Item>
          </Menu.SubMenu>

          <Menu.Item key="getUpdated" onClick={() => getUpdated()}>
            <Tooltip placement="bottomLeft" title="Recently updated profiles">
              <Icon type="history" />
              <span>Updated</span>
            </Tooltip>
          </Menu.Item>
        </Menu>
      </Layout.Sider>
    );
  }
}

export default DirectoryFilter;
