import React, { Component } from "react";
import { isMobileOnly } from "react-device-detect";

import {
  Layout,
  PageHeader,
  Tabs,
  Button,
  Row,
  Col,
  Empty,
  Drawer,
  Dropdown,
  Menu,
  Icon,
  Spin,
  Tooltip,
  Modal,
} from "antd";
import { Swipeable } from "react-swipeable";

import { withAuthorization } from "../Session";
import { withFirebase } from "../Firebase";
import ResourcesItem from "./Item";
import ResourcesSubmit from "./Submit";

import "./index.css";

import { resourceTypes, sortOptions } from "../../constants/resources";
import { weekNumber, weekYear } from "./dateFunctions";

class Resources extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: null,
      sortBy: "upvotes",
      loading: true,
      resources: null,
      resourcesSubmitDrawerOpen: false,
    };
  }

  componentDidMount = () => {
    this.onTabChange("Feed");
  };

  onTabChange = newActiveTab => {
    const { activeTab } = this.state;
    const { firebase } = this.props;
    if (newActiveTab === activeTab) return;

    this.setState({ activeTab: newActiveTab }, () => {
      this.loadResources();
      firebase.logEvent("resource_change_tab", { tab: newActiveTab });
    });
  };

  sortBy = by => {
    // console.log("Sort by", by);
    this.setState({ sortBy: by.key }, () => {
      this.loadResources();
    });
  };

  loadResources = async () => {
    const { activeTab, sortBy } = this.state;
    const { firebase } = this.props;

    this.setState({ loading: true });

    let query = firebase.resources();
    if (activeTab === "Feed") {
      query = query.orderBy("createdAt", "desc");
    } else {
      query = query
        .where("type", "==", activeTab)
        .orderBy(sortBy, sortOptions[sortBy].order);
    }

    const querySnapshot = await query.get();

    const resources = [];
    querySnapshot.forEach(doc => {
      const resource = {
        id: doc.id,
        ref: doc.ref,
        ...doc.data(),
      };
      resources.push(resource);
    });

    this.setState({
      resources,
      loading: false,
    });
  };

  openResourcesSubmitDrawer = () => {
    this.setState({
      resourcesSubmitDrawerOpen: true,
    });
  };

  closeResourcesSubmitDrawer = () => {
    this.setState({
      resourcesSubmitDrawerOpen: false,
    });
  };

  showInfoModal = () => {
    this.setState({
      infoModalVisible: true,
    });
  };

  closeInfoModal = () => {
    this.setState({
      infoModalVisible: false,
    });
  };

  swipe = (event, isMobile) => {
    if (
      (isMobile &&
        event.dir === "Down" &&
        event.absY >= 140 &&
        event.velocity >= 1.5) ||
      (!isMobile &&
        event.dir === "Right" &&
        event.absX >= 160 &&
        event.velocity >= 1.5)
    ) {
      this.setState({
        resourcesSubmitDrawerOpen: false,
      });
    }
  };

  render() {
    const {
      activeTab,
      sortBy,
      resources,
      resourcesSubmitDrawerOpen,
      loading,
      infoModalVisible,
    } = this.state;
    const { windowWidth, authUser } = this.props;
    return (
      <Layout className="module">
        <PageHeader
          title="Resources"
          id="resources-header"
          subTitle={[
            isMobileOnly ? "Discover" : "Discover and share",
            <Icon
              type="info-circle"
              onClick={this.showInfoModal}
              style={{ paddingLeft: "8px" }}
              key="resource-info-icon"
            />,
            <Modal
              title="Resources"
              visible={infoModalVisible}
              onCancel={() => this.closeInfoModal()}
              key="resource-info-modal"
              footer={[
                <Button
                  key="close"
                  type="primary"
                  onClick={() => this.closeInfoModal()}
                >
                  Close
                </Button>,
              ]}
            >
              <p>
                A collection of our favorite resources: Discover content
                submitted by others, explore new tools to increase your
                productivity, find a new book to read or podcast to listen to,
                learn something new with recommended online courses, or find a
                conference to attend.
              </p>
              <p>
                Submit your own resources und upvote your favorite resources
                shared by others. Founders can promote their own product and
                offer student discounts.
              </p>
            </Modal>,
          ]}
          className={`page-header ${isMobileOnly ? "mobile-page-header" : ""}`}
          extra={[
            <Tooltip
              key="submitTooltip"
              placement="left"
              title="Submit new resource"
            >
              <Button
                key="Submit"
                icon="plus"
                onClick={this.openResourcesSubmitDrawer}
                {...(isMobileOnly ? { shape: "circle" } : {})}
              >
                {isMobileOnly ? "" : "Submit"}
              </Button>
            </Tooltip>,
            activeTab !== "Feed" && (
              <Dropdown
                key="sort"
                overlay={
                  <Menu onClick={this.sortBy}>
                    {Object.keys(sortOptions).map(key => (
                      <Menu.Item key={key}>
                        <Icon type={sortOptions[key].icon} />
                        {sortOptions[key].label}
                      </Menu.Item>
                    ))}
                  </Menu>
                }
              >
                {isMobileOnly ? (
                  <Button key="Sort" icon="sort-ascending" shape="circle" />
                ) : (
                  <Button.Group key="SortGroup" style={{ marginLeft: "8px" }}>
                    <Button>Sort By</Button>
                    <Button>
                      <Icon type={sortOptions[sortBy].icon} />
                    </Button>
                  </Button.Group>
                )}
              </Dropdown>
            ),
          ]}
        />
        <Tabs
          onChange={this.onTabChange}
          activeKey={activeTab}
          size="default"
          style={{
            marginTop: isMobileOnly ? "80px" : "0px",
            backgroundColor: "white",
          }}
          className={isMobileOnly ? "resources-tabs" : null}
        >
          <Tabs.TabPane
            key="Feed"
            tab={
              <span>
                <Icon type="menu" />
                Feed
              </span>
            }
          />
          {Object.keys(resourceTypes).map(type => (
            <Tabs.TabPane
              tab={
                resourceTypes[type].tooltip ? (
                  <Tooltip
                    placement="right"
                    title={resourceTypes[type].tooltip}
                  >
                    {type}
                    <Icon type="info-circle" style={{ paddingLeft: "8px" }} />
                  </Tooltip>
                ) : (
                  type
                )
              }
              key={type}
            />
          ))}
        </Tabs>
        <Layout
          className="module-thin"
          style={{ marginTop: isMobileOnly ? "125px" : "0px" }}
        >
          {!loading && resources ? (
            <ResourceItemsWrapper
              resources={resources}
              authUser={authUser}
              activeTab={activeTab}
              loadResources={() => this.loadResources()}
            />
          ) : (
            <Spin
              indicator={<Icon type="loading-3-quarters" spin />}
              style={{ marginTop: "30px" }}
            />
          )}
        </Layout>
        <Drawer
          placement={isMobileOnly ? "bottom" : "right"}
          visible={resourcesSubmitDrawerOpen}
          onClose={this.closeResourcesSubmitDrawer}
          closable
          destroyOnClose
          width={Math.min(windowWidth * 0.85, 750)}
          height="85%"
        >
          <Swipeable onSwiped={event => this.swipe(event, isMobileOnly)}>
            <ResourcesSubmit
              authUser={authUser}
              closeResourcesSubmitDrawer={() =>
                this.closeResourcesSubmitDrawer()
              }
              refreshResources={() => this.loadResources()}
            />
          </Swipeable>
        </Drawer>
      </Layout>
    );
  }
}

const ResourceItemsWrapper = ({
  resources,
  authUser,
  activeTab,
  loadResources,
}) => {
  if (resources.length === 0)
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Be the first one to submit a resource in this category!"
      />
    );

  const rowStyle = { xs: 4, sm: 14, md: 14, lg: 14 };
  const items = resource => (
    <ResourcesItem
      resource={resource}
      authUser={authUser}
      key={resource.id}
      refreshResources={loadResources}
      isFeed={activeTab === "Feed"}
      isMobileOnly={isMobileOnly}
    />
  );

  // Group resources by date for Feed tab
  if (activeTab === "Feed") {
    const groupedResources = {};
    resources.forEach(resource => {
      const date = resource.createdAt.toDate();
      const dateStr = `${weekYear(date)}-${weekNumber(date)}`;

      if (!Object.keys(groupedResources).includes(dateStr))
        groupedResources[dateStr] = [];

      groupedResources[dateStr].push(resource);
    });

    return (
      <Row
        gutter={rowStyle}
        style={{
          display: "flex",
          justifyContent: "center",
        }}
        type="flex"
      >
        <Col xs={24} sm={22} md={20} lg={18} xl={14} xxl={12}>
          {Object.keys(groupedResources).map(dateStr => {
            const splitDateStr = dateStr.split("-");
            return (
              <React.Fragment key={dateStr}>
                <h1 className="resources-feed-heading">
                  {`Week ${splitDateStr[1]} of ${splitDateStr[0]}`}
                </h1>
                {groupedResources[dateStr].map(items)}
              </React.Fragment>
            );
          })}
        </Col>
      </Row>
    );
  }

  // For all other tabs
  return (
    <Row gutter={rowStyle} type="flex">
      {resources.map(items)}
    </Row>
  );
};

const condition = authUser => authUser != null;

export default withFirebase(withAuthorization(condition)(Resources));
