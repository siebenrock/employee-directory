import React, { Component } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Icon,
  Divider,
  Popconfirm,
  Tooltip,
  Tag,
  Badge,
} from "antd";
import { withFirebase } from "../Firebase";
import "./Item.css";
import ResourcePopup from "./ResourcePopup";

const { Text } = Typography;

class ResourcesCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      upvoted: null,
      processUpvote: true,
      resourcePopupOpen: false,
    };
  }

  componentDidMount() {
    const { resource, authUser } = this.props;
    const upvoted =
      resource.upvoters && resource.upvoters.includes(authUser.email);
    this.setState({
      upvotes: resource.upvotes,
      upvoted,
      processUpvote: false,
    });
  }

  upvote = async () => {
    const { resource, authUser, firebase } = this.props;
    const { upvoted, upvotes } = this.state;
    this.setState({ processUpvote: true });
    const upvoteRef = resource.ref.collection("upvotes").doc(authUser.email);

    if (upvoted) {
      await upvoteRef.delete();
      this.setState({
        processUpvote: false,
        upvotes: upvotes - 1,
        upvoted: false,
      });
      firebase.logEvent("resources_downvoted", {
        resourceType: resource.type,
        resourceId: resource.id,
      });
    } else {
      await upvoteRef.set({});
      this.setState({
        processUpvote: false,
        upvotes: upvotes + 1,
        upvoted: true,
      });
      firebase.logEvent("resources_upvoted", {
        resourceType: resource.type,
        resourceId: resource.id,
      });
    }
  };

  deleteResource = async () => {
    const { resource, refreshResources, firebase } = this.props;

    try {
      await resource.ref.delete();
    } catch {
      console.error("Failed to delete resource");
      return;
    }

    firebase.logEvent("resources_delete_resource", {
      title: resource.title,
      type: resource.type,
    });

    refreshResources();
  };

  openDescriptionModal = () => {
    const { firebase, resource } = this.props;
    this.setState({
      resourcePopupOpen: true,
    });
    firebase.logEvent("resources_open_description_modal", {
      resourceType: resource.type,
      resourceId: resource.id,
    });
  };

  closeDescriptionModal = () => {
    this.setState({
      resourcePopupOpen: false,
    });
  };

  render() {
    const { authUser, isFeed, resource, isMobileOnly } = this.props;
    const { upvoted, upvotes, processUpvote, resourcePopupOpen } = this.state;

    const resourceImage = (
      <div
        className="resources-logo-wrapper"
        onClick={() => this.openDescriptionModal()}
        role="presentation"
      >
        <img
          src={resource.image}
          alt="Resource Logo"
          className="resources-logo"
        />
      </div>
    );

    const upvoteCommentButtons = (
      <Button.Group>
        <Tooltip
          title={
            upvoted
              ? "Withdraw vote"
              : `Vote for ${resource.title && resource.title}`
          }
          placement="topLeft"
        >
          <Button
            icon={upvoted ? "check" : "like-o"}
            type={upvoted ? "primary" : "default"}
            loading={processUpvote}
            onClick={() => this.upvote()}
          >
            <span>
              {!isFeed && (upvoted ? "Upvoted" : "Upvote")}
              <span style={{ opacity: "0.5", marginLeft: isFeed ? "" : "8px" }}>
                {upvotes}
              </span>
            </span>
          </Button>
        </Tooltip>

        <Tooltip title="Comments">
          <Button onClick={() => this.openDescriptionModal()} type="default">
            <Badge count={resource.commentsCount || 0} dot>
              <Icon type="message" style={{ color: "#333" }} />
            </Badge>
          </Button>
        </Tooltip>
      </Button.Group>
    );

    const getButton = (
      <Tooltip
        title={`Open ${resource.url &&
          resource.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}`}
        placement="topRight"
      >
        <Button onClick={() => window.open(resource.url.replace(/\/$/, ""))}>
          <span>Get</span>
        </Button>
      </Tooltip>
    );

    const deleteIcon = (
      <Popconfirm
        title={
          <p>
            Do you want to delete this resource?
            <br />
            This action cannot be undone.
          </p>
        }
        cancelText="Cancel"
        okText="Delete"
        okType="danger"
        onConfirm={() => this.deleteResource()}
      >
        <Tooltip title="Delete resource">
          <Icon
            type="delete"
            className="resources-action-icon"
            style={{ marginRight: "8px" }}
          />
        </Tooltip>
      </Popconfirm>
    );

    const studentDiscountIcon = (
      <Tooltip title="Student discount available">
        <Icon
          type="percentage"
          className="action-icon"
          style={{ marginRight: "8px" }}
        />
      </Tooltip>
    );

    const card = (
      <Card
        className="resources-card"
        id={isFeed && !isMobileOnly ? "feed-card" : ""}
        key={resource.title}
      >
        <Row className="resources-card-meta">
          {isFeed && !isMobileOnly && (
            <div style={{ marginRight: "10px", minWidth: "7.5rem" }}>
              {upvoteCommentButtons}
            </div>
          )}
          {resource.image && (
            <div
              style={{
                height: isFeed && !isMobileOnly ? "6rem" : "3.5rem",
                width: isFeed && !isMobileOnly ? "6rem" : "3.5rem",
                marginLeft: isFeed && !isMobileOnly ? "12px" : "0",
              }}
            >
              {resourceImage}
            </div>
          )}
          <div
            style={{
              paddingLeft: "16px",
              paddingRight: isFeed && !isMobileOnly ? "20px" : "0",
              minWidth: "0",
            }}
          >
            <Typography.Title
              level={4}
              className="resources-card-title resource-card-clickable"
              style={{ fontSize: "1rem", marginBottom: "0em" }}
              onClick={() => this.openDescriptionModal()}
            >
              {resource.title && resource.title}
            </Typography.Title>

            <p className="resources-card-tagline">
              {resource.tagline && resource.tagline}
            </p>

            {isFeed && !isMobileOnly && (
              <React.Fragment>
                <div
                  style={{
                    marginTop: "7px",
                    marginBottom: "13px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {resource.tags &&
                    resource.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
                </div>

                <div className="resources-details-wrapper">
                  <Text type="secondary">
                    {resource.authorName ? resource.authorName : "Anonymous"}
                    {resource.affiliation &&
                      resource.affiliation !== "None" &&
                      `, ${resource.affiliation}`}
                  </Text>
                </div>
              </React.Fragment>
            )}
          </div>
          {isFeed && !isMobileOnly && (
            <span
              style={{ flexShrink: "0", flex: "0 0 auto", marginLeft: "auto" }}
            >
              {resource.studentDiscount && studentDiscountIcon}
              {resource.author &&
                authUser.email &&
                resource.author === authUser.email &&
                deleteIcon}
              {getButton}
            </span>
          )}
        </Row>

        {(!isFeed || (isFeed && isMobileOnly)) && (
          <React.Fragment>
            <div
              style={{
                marginTop: "1.3rem",
              }}
            >
              <Typography.Paragraph
                ellipsis={{ rows: 3 }}
                className="resource-card-clickable"
                onClick={() => this.openDescriptionModal()}
              >
                {resource.description && resource.description}
              </Typography.Paragraph>
            </div>

            <div style={{ marginBottom: "12px", whiteSpace: "nowrap" }}>
              {resource.tags &&
                resource.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
            </div>

            <div className="resources-details-wrapper">
              <Text type="secondary">
                {resource.authorName ? resource.authorName : "Anonymous"}
                {resource.affiliation &&
                  resource.affiliation !== "None" &&
                  `, ${resource.affiliation}`}
              </Text>
              <Text type="secondary">
                {resource.createdAt.toDate().toLocaleDateString("en-EN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </div>

            <Divider style={{ margin: "10px 0 14px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {upvoteCommentButtons}
              <span>
                {resource.studentDiscount && studentDiscountIcon}
                {resource.author &&
                  authUser.email &&
                  resource.author === authUser.email &&
                  deleteIcon}
                {getButton}
              </span>
            </div>
          </React.Fragment>
        )}
      </Card>
    );

    return (
      <React.Fragment>
        {isFeed && !isMobileOnly ? (
          <div style={{ marginBottom: "14px" }}>{card}</div>
        ) : (
          <Col
            xs={24}
            sm={12}
            md={8}
            lg={8}
            xl={6}
            xxl={4}
            style={{ marginBottom: "14px" }}
          >
            {card}
          </Col>
        )}
        {resourcePopupOpen && (
          <ResourcePopup
            resource={resource}
            authUser={authUser}
            close={() => this.closeDescriptionModal()}
          />
        )}
      </React.Fragment>
    );
  }
}

export default withFirebase(ResourcesCard);
