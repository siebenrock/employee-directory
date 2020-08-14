import React from "react";
import { Typography, Row, Col, Divider, Button, Tag, Icon, Empty } from "antd";
import { withRouter } from "react-router-dom";
import * as ROUTES from "../../constants/routes";

import AvatarImage from "../Avatar";

import FIELDS from "../../constants/userFormFields";

import "./Profile.css";

const { Text } = Typography;

// buttons: [{icon: ___, onClick: ___}, ...]
// children: children to display as value, standard: just the value text
const ProfileField = ({ label, buttons, children }) => (
  <Col className="entry-wrapper">
    <div>
      <Text type="secondary" className="label">
        {label}
      </Text>
      <h3 className="entry-heading">{children}</h3>
    </div>
    {buttons && (
      <div className="entry-action">
        {buttons.map(button => (
          <Button
            key={button.icon}
            type="primary"
            shape="circle"
            icon={button.icon}
            onClick={() => button.onClick()}
            className="entry-action-button"
          />
        ))}
      </div>
    )}
  </Col>
);

const DirectoryProfile = ({ userData, authUserEmail, history }) => {
  if (userData == null) return <Empty />;

  // Unfortunately these helper functions are necessary to make links work on all devices
  const mail = mailAddress => {
    window.location.href = `mailto:${mailAddress}`;
  };

  const call = phoneNumber => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const whatsapp = phoneNumber => {
    window.location.href = `https://wa.me/${phoneNumber.replace(/^,/, "")}`;
  };

  const slack = (team, user) => {
    window.location.href = `slack://user?team=${team}&id=${user}`;
  };

  const github = username => {
    window.open(`https://github.com/${username}`);
  };

  const gitlab = username => {
    window.open(`https://gitlab.com/${username}`);
  };

  const openUrl = url => {
    window.open(url);
  };

  const fieldsExist = fields => {
    let exist = false;
    fields.forEach(field => {
      if (userData[field.value]) exist = true;
    });
    return exist;
  };

  return (
    <React.Fragment>
      <Row style={{ marginBottom: "4vh" }}>
        <Col
          xs={9}
          sm={9}
          md={9}
          lg={9}
          xl={8}
          xxl={8}
          style={{ paddingRight: "4%" }}
        >
          <AvatarImage
            src={userData.avatar}
            className="directory-card"
            style={{ border: "1px solid #e8e8e8" }}
          />
        </Col>
        <Col xs={15} sm={15} md={15} lg={15} xl={16} xxl={16}>
          <h1 className="name">{userData.firstName}</h1>
          <h1 className="name">{userData.lastName}</h1>
          <div>
            <Text type="secondary" className="header-label">
              {userData.status}
            </Text>
          </div>
          {authUserEmail && userData.email && authUserEmail === userData.email && (
            <Button
              icon="edit"
              onClick={() => history.push(ROUTES.ACCOUNT)}
              className="edit-button"
            >
              Edit Profile
            </Button>
          )}
        </Col>
      </Row>

      {FIELDS.map((section, index) => (
        <Row key={section.heading}>
          {index !== 0 && fieldsExist(section.fields) && (
            <Divider style={{ marginTop: "1.5rem", marginBottom: "2rem" }} />
          )}
          {section.fields.map(field => {
            // Everyone has a CDTM login email, is not a profile attribute
            if (field.type === "cdtm-email")
              return (
                <ProfileField
                  key={field.label}
                  label={field.label}
                  buttons={[
                    { icon: "mail", onClick: () => mail(userData.email) },
                  ]}
                >
                  <Text className="entry-text" copyable>
                    {userData.email}
                  </Text>
                </ProfileField>
              );

            // Skip unused fields
            if (!userData[field.value]) return "";

            // Specify behavior based on type
            switch (field.type) {
              case "checkbox":
              case "tags":
                return (
                  <ProfileField key={field.label} label={field.label}>
                    {userData[field.value].map(tag => (
                      <Tag key={tag} className="tag">
                        {tag}
                      </Tag>
                    ))}
                  </ProfileField>
                );

              // custom as it does not have a heading styled like the others
              case "switch":
                return (
                  <Col key={field.label} className="entry-wrapper">
                    <div>
                      <Text style={{ marginRight: "5px" }}>{field.label}</Text>
                      {userData[field.value] ? (
                        <Icon
                          type="check-circle"
                          theme="twoTone"
                          twoToneColor="#bfbfbf"
                        />
                      ) : (
                        <Icon
                          type="close-circle"
                          theme="twoTone"
                          twoToneColor="#bfbfbf"
                        />
                      )}
                    </div>
                  </Col>
                );

              case "link":
                return (
                  <ProfileField
                    key={field.label}
                    label={field.label}
                    buttons={
                      field.icon && [
                        {
                          icon: field.icon,
                          onClick: () => openUrl(userData[field.value]),
                        },
                      ]
                    }
                  >
                    <a
                      href={userData[field.value]}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="link"
                    >
                      {userData[field.value].replace(
                        /^(?:https?:\/\/)?(?:www\.)?/i,
                        "",
                      )}
                    </a>
                  </ProfileField>
                );

              case "phone":
                return (
                  <ProfileField
                    key={field.label}
                    label={field.label}
                    buttons={[
                      {
                        icon: "message",
                        onClick: () => whatsapp(userData[field.value]),
                      },
                      {
                        icon: "phone",
                        onClick: () => call(userData[field.value]),
                      },
                    ]}
                  >
                    {userData[field.value]}
                  </ProfileField>
                );

              case "slack":
                return (
                  <ProfileField
                    key={field.label}
                    label={field.label}
                    buttons={
                      field.team_id && [
                        {
                          icon: "slack",
                          onClick: () =>
                            slack(field.team_id, userData[field.value]),
                        },
                      ]
                    }
                  >
                    {userData[field.value]}
                  </ProfileField>
                );

              case "google":
                return (
                  <ProfileField
                    key={field.label}
                    label={field.label}
                    buttons={[
                      {
                        icon: "mail",
                        onClick: () => mail(userData[field.value]),
                      },
                    ]}
                  >
                    {userData[field.value]}
                  </ProfileField>
                );

              case "github":
                return (
                  <ProfileField
                    key={field.label}
                    label={field.label}
                    buttons={[
                      {
                        icon: "github",
                        onClick: () => github(userData[field.value]),
                      },
                    ]}
                  >
                    {userData[field.value]}
                  </ProfileField>
                );

              case "gitlab":
                return (
                  <ProfileField
                    key={field.label}
                    label={field.label}
                    buttons={[
                      {
                        icon: "gitlab",
                        onClick: () => gitlab(userData[field.value]),
                      },
                    ]}
                  >
                    {userData[field.value]}
                  </ProfileField>
                );

              default: {
                return (
                  <ProfileField key={field.label} label={field.label}>
                    {userData[field.value].charAt(0).toUpperCase() +
                      userData[field.value].slice(1)}
                  </ProfileField>
                );
              }
            }
          })}
        </Row>
      ))}

      <Row>
        <Divider style={{ marginTop: "1.5rem", marginBottom: "2rem" }} />
        {userData.updatedAt && (
          <div>
            <Text type="secondary">
              Updated on{" "}
              {userData.updatedAt.toDate().toLocaleDateString("en-EN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </div>
        )}
        {userData.registeredAt && (
          <div>
            <Text type="secondary">
              Joined on{" "}
              {userData.registeredAt.toDate().toLocaleDateString("en-EN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </div>
        )}
      </Row>
    </React.Fragment>
  );
};

export default withRouter(DirectoryProfile);
