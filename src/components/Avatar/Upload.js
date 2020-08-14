import React, { Component } from "react";
import { Upload, Icon, message } from "antd";
import ImgCrop from "antd-img-crop";
import AvatarImage from "./index";
import ImageResize from "./ImageResize";
import { withFirebase } from "../Firebase";

class AvatarImageUpload extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  handleChange = info => {
    if (info.file.status === "uploading") {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === "done") {
      this.setState({
        loading: false,
      });
    }
  };

  beforeUpload = file => {
    const isImage = file.type.indexOf("image/") === 0;
    if (!isImage) {
      message.error("You can only upload image file!");
    }
    return true;
  };

  customUpload = ({ onError, onProgress, onSuccess, file }) => {
    const { firebase, authUser } = this.props;

    const maxSize = 800;
    const imageResizer = new ImageResize();
    imageResizer.resizeImageFile(file, maxSize, maxSize, 0.7, resizedFile =>
      firebase.updateUserAvatar(
        onError,
        onProgress,
        () => {
          firebase.logEvent("account_upload_avatar");
          onSuccess();
        },
        resizedFile,
        authUser,
      ),
    );
  };

  render() {
    const { loading } = this.state;
    const { windowWidth, authUser } = this.props;
    const modalWidth = Math.min(windowWidth, 520);

    return (
      <div>
        <ImgCrop
          modalTitle="Crop Profile Picture"
          useRatio
          width={1}
          height={1}
          modalWidth={modalWidth}
        >
          <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            beforeUpload={this.beforeUpload}
            onChange={this.handleChange}
            customRequest={this.customUpload}
          >
            {authUser && authUser.avatar ? (
              <AvatarImage src={authUser.avatar} style={{ width: "100%" }} />
            ) : (
              <div>
                <Icon type={loading ? "loading" : "plus"} />
                <div className="ant-upload-text">Upload Profile Picture</div>
              </div>
            )}
          </Upload>
        </ImgCrop>
      </div>
    );
  }
}

const WrappedAvatarImageUpload = withFirebase(AvatarImageUpload);

export default WrappedAvatarImageUpload;
