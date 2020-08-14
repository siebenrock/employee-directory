import React, { Component } from "react";
import {
  Typography,
  Tag,
  Modal,
  List,
  Comment,
  Form,
  Input,
  Button,
  message,
  Icon,
  Popconfirm,
  Tooltip,
} from "antd";
import { withFirebase } from "../Firebase";
import { defaultAvatarUrl } from "../Avatar";

const { Text } = Typography;
const { TextArea } = Input;

class ResourcePopup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      comments: [],
      commentsLoading: props.resource.commentsCount > 0,
      currentCommentsCount: props.resource.commentsCount || 0,
      submittingComment: false,
      commentValue: "",
      pushingDelete: null,
    };
  }

  async componentDidMount() {
    const { firebase, resource } = this.props;
    const { id: resourceId } = resource;

    if (!resource.commentsCount || resource.commentsCount === 0) return;

    let commentsSnapshot;
    try {
      commentsSnapshot = await firebase
        .resourceComments(resourceId)
        .orderBy("createdAt", "asc")
        .get();
    } catch (e) {
      console.error(`Could not fetch comments: ${e}`);
      this.setState({ commentsLoading: false });
      return;
    }

    const comments = [];
    commentsSnapshot.forEach(doc => {
      // parse date here to be able to print 'now' for newly created comments
      const data = doc.data();
      data.createdAt = data.createdAt.toDate().toLocaleDateString("en-EN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      });

      const comment = {
        id: doc.id,
        ref: doc.ref,
        ...data,
      };
      comments.push(comment);
    });

    this.setState({
      comments,
      currentCommentsCount: commentsSnapshot.size,
      commentsLoading: false,
    });
  }

  handleSubmit = async () => {
    const { commentValue } = this.state;
    const { firebase, resource, authUser } = this.props;
    const { id: resourceId } = resource;

    if (!commentValue || commentValue === "") {
      return;
    }

    this.setState({
      submittingComment: true,
    });

    let docRef;
    try {
      docRef = await firebase.doAddResourceComment(
        resourceId,
        authUser,
        commentValue,
      );
    } catch (e) {
      console.error(e);
      message.error(`Error while posting comment: ${e}`);
      this.setState({ submittingComment: false });
      return;
    }

    this.setState(state => ({
      submittingComment: false,
      commentValue: "",
      currentCommentsCount: state.currentCommentsCount + 1,
      comments: [
        ...state.comments,
        {
          authorName:
            authUser.firstName &&
            authUser.lastName &&
            `${authUser.firstName} ${authUser.lastName}`,
          author: authUser.email,
          avatar: authUser.avatar,
          content: state.commentValue,
          id: docRef.id,
          ref: docRef,
          createdAt: "just now",
        },
      ],
    }));

    firebase.logEvent("resources_add_comment", {
      resourceId,
      resourceType: resource.type,
      resourceTitle: resource.title,
    });
  };

  handleChange = e => {
    this.setState({
      commentValue: e.target.value,
    });
  };

  deleteComment = async commentId => {
    const { firebase, resource } = this.props;
    const { id: resourceId } = resource;

    this.setState({ pushingDelete: commentId });

    try {
      await firebase
        .resourceComments(resourceId)
        .doc(commentId)
        .delete();
    } catch (e) {
      message.error(`Encountered error while deleting comment: ${e}`);
      this.setState({ pushingDelete: null });
      return;
    }

    this.setState(state => ({
      pushingDelete: null,
      currentCommentsCount: state.currentCommentsCount - 1,
      comments: state.comments.filter(item => item.id !== commentId),
    }));

    firebase.logEvent("resources_delete_comment", {
      resourceId,
      resourceType: resource.type,
      resourceTitle: resource.title,
    });
  };

  render() {
    const { resource, close, authUser } = this.props;
    const {
      comments,
      commentsLoading,
      currentCommentsCount,
      submittingComment,
      commentValue,
      pushingDelete,
    } = this.state;

    return (
      <Modal
        title={resource.title}
        visible
        onCancel={() => close()}
        footer={false}
      >
        <div style={{ marginBottom: "4px" }}>
          {resource.tagline && resource.tagline}
        </div>
        <div>{resource.description && resource.description}</div>
        <div style={{ margin: "18px 0px" }}>
          {resource.tags &&
            resource.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
        </div>
        <div
          className="resources-details-wrapper"
          style={{ marginTop: "20px", marginBottom: "40px" }}
        >
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
        <List
          header={`${currentCommentsCount} ${
            currentCommentsCount === 1 ? "comment" : "comments"
          }`}
          itemLayout="horizontal"
          dataSource={comments}
          loading={commentsLoading}
          locale={{ emptyText: "Be the first one to comment" }}
          renderItem={item => (
            <List.Item key={item.id}>
              <Comment
                author={item.authorName}
                avatar={item.avatar || defaultAvatarUrl}
                content={item.content}
                datetime={item.createdAt}
                key={item.id}
                actions={
                  item.author === authUser.email && [
                    <Popconfirm
                      title={
                        <p>
                          Do you want to delete this comment?
                          <br />
                          This action cannot be undone.
                        </p>
                      }
                      okText="Delete"
                      okType="danger"
                      onConfirm={() => this.deleteComment(item.id)}
                      disabled={pushingDelete}
                    >
                      <Tooltip title="Delete comment">
                        <Icon
                          type={
                            pushingDelete === item.id ? "loading" : "delete"
                          }
                        />
                      </Tooltip>
                    </Popconfirm>,
                  ]
                }
              />
            </List.Item>
          )}
        />
        {!commentsLoading && (
          <Comment
            avatar={authUser.avatar}
            content={
              <React.Fragment>
                <Form.Item>
                  <TextArea
                    rows={4}
                    onChange={this.handleChange}
                    value={commentValue}
                    disabled={submittingComment}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    htmlType="submit"
                    loading={submittingComment}
                    onClick={this.handleSubmit}
                    type="primary"
                  >
                    Add Comment
                  </Button>
                </Form.Item>
              </React.Fragment>
            }
          />
        )}
      </Modal>
    );
  }
}

export default withFirebase(ResourcePopup);
