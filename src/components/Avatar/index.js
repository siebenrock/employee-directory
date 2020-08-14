import React from "react";
import Img from "react-image";

export const defaultAvatarUrl = "/static/AvatarDefault.png";

const AvatarImage = ({ src, alt, ...otherProps }) => (
  <Img
    // If image is not specified or fails to load, the default will be shown
    src={[src, defaultAvatarUrl]}
    // While the real image is loaded the default is shown
    loader={<Img src={defaultAvatarUrl} />}
    alt={alt || "Avatar"}
    {...otherProps}
  />
);

export default AvatarImage;
