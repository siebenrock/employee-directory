import React, { Component } from "react";

import { Col, Card, Skeleton, Icon, Tooltip } from "antd";
import AvatarImage from "../Avatar";

import "./Card.css";

class DirectoryCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      data: null,
    };
  }

  componentDidMount() {
    const { userSnapshot } = this.props;
    this.setState({ loading: true });

    const data = userSnapshot.data();

    this.setState({
      data,
      loading: false,
    });
  }

  favoriteOnClick = e => {
    e.stopPropagation();
    const { changeFavorite } = this.props;
    changeFavorite();
  };

  render() {
    const { loading, data } = this.state;
    const { onCardClick, isFavorite, favoriteLoading } = this.props;
    return (
      <React.Fragment>
        <Col
          xs={8}
          sm={8}
          md={8}
          lg={6}
          xl={4}
          xxl={3}
          style={{ marginBottom: "6px" }}
        >
          {loading ? (
            <Card hoverable className="directory-card" loading>
              <Skeleton active />
            </Card>
          ) : (
            <Card
              className="directory-card"
              key={data.email}
              onClick={() => onCardClick(data)}
              cover={<AvatarImage className="avatar" src={data.avatar} />}
              style={{ cursor: "pointer" }}
            >
              <Card.Meta
                title={
                  data.firstName &&
                  data.lastName && (
                    <span className="directory-card-title">
                      {data.firstName} {data.lastName}
                    </span>
                  )
                }
                description={
                  <React.Fragment>
                    <span className="directory-card-label">
                      {data.cohort ? (
                        data.cohort
                      ) : (
                        <span style={{ opacity: "0" }}>-</span>
                      )}
                    </span>

                    {favoriteLoading === data.email ? (
                      <Icon
                        type="loading"
                        style={{
                          float: "right",
                        }}
                      />
                    ) : (
                      <Tooltip
                        title={
                          isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        <Icon
                          type="star"
                          theme={isFavorite ? "filled" : "outlined"}
                          onClick={
                            !favoriteLoading ? this.favoriteOnClick : null
                          }
                          style={{
                            float: "right",
                            color: isFavorite ? "#f9d71c" : null,
                          }}
                        />
                      </Tooltip>
                    )}
                  </React.Fragment>
                }
              />
            </Card>
          )}
        </Col>
      </React.Fragment>
    );
  }
}

export default DirectoryCard;
