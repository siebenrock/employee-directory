import React, { Component } from "react";
import { isMobileOnly } from "react-device-detect";

import { Layout, PageHeader, Button } from "antd";

// Enable Alumni to connect with each other (mailing list, WhatsApp groups, etc.)

// Alternative maps:
// * Google Maps (already using Firebase)
// * Simple Maps: https://www.react-simple-maps.io
// * Map from Syncfusion Components: https://ej2.syncfusion.com/home/react.html

import {
  Map,
  TileLayer,
  Marker,
  Popup,
  type Viewport,
  Tooltip,
  ZoomControl,
} from "react-leaflet";

import { withAuthorization } from "../Session";
import { withFirebase } from "../Firebase";

const defaultViewport = {
  center: [48.13743, 11.57549],
  zoom: 3,
};

class Resources extends Component<{}, { viewport: Viewport }> {
  constructor(props) {
    super(props);
    this.state = {
      viewport: defaultViewport,
    };
  }

  resetViewport = () => {
    this.setState({ viewport: defaultViewport });
  };

  onViewportChanged = (viewport: Viewport) => {
    this.setState({ viewport });
  };

  render() {
    const { viewport } = this.state;
    return (
      <Layout className="module">
        <PageHeader
          title="Regionals"
          subTitle="This is a subtitle"
          className="page-header"
          extra={[
            <Button
              icon="undo"
              onClick={this.resetViewport}
              key="reset"
              {...(isMobileOnly ? { shape: "circle" } : {})}
            >
              {isMobileOnly ? "" : "Reset View"}
            </Button>,
          ]}
        />
        <Layout>
          <Map
            onViewportChanged={this.onViewportChanged}
            viewport={viewport}
            maxZoom={10}
            attributionControl
            zoomControl
            doubleClickZoom
            scrollWheelZoom
            dragging
            animate
            easeLinearity={0.35}
            style={{ height: "600px", maxHeight: "80%" }}
          >
            <TileLayer
              url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <ZoomControl position="topright" />
            <Marker position={[50, 10]}>
              <Popup>Popup for any custom information.</Popup>
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                permanent Tooltip for Rectangle
              </Tooltip>
            </Marker>
          </Map>
        </Layout>
      </Layout>
    );
  }
}

const condition = authUser => authUser != null;

export default withFirebase(withAuthorization(condition)(Resources));
