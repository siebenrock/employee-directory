class ImageResize {
  resizeImageBlob = (
    blob,
    maxWidth,
    maxHeight,
    quality,
    resizedDataUrlHandler,
  ) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;

      this.resizeImageDataUrl(
        dataUrl,
        maxWidth,
        maxHeight,
        quality,
        resizedDataUrlHandler,
      );
    };
    reader.readAsDataURL(blob);
  };

  resizeImageFile = (
    file,
    maxWidth,
    maxHeight,
    quality,
    resizedDataUrlHandler,
  ) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const dataUrl = event.target.result;

      this.resizeImageDataUrl(
        dataUrl,
        maxWidth,
        maxHeight,
        quality,
        resizedDataUrlHandler,
      );
    };
  };

  resizeImageDataUrl = (
    dataUrl,
    maxWidth,
    maxHeight,
    quality,
    resizedDataUrlHandler,
  ) => {
    // eslint-disable-next-line no-undef
    const image = new Image();
    image.src = dataUrl;
    image.onload = () => {
      const resizedDataUrl = this.resizeImageAndGetDataUrl(
        image,
        maxWidth,
        maxHeight,
        quality,
      );
      resizedDataUrlHandler(resizedDataUrl);
    };
  };

  resizeImageAndGetDataUrl = (image, maxWidth, maxHeight, quality) => {
    const canvas = document.createElement("canvas");

    let { width } = image;
    let { height } = image;

    if (width > height) {
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
    } else if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", quality);
  };
}

export default ImageResize;
