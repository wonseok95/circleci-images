import React from "react";
import ReactDOM from "react-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import { subscribe, actions, selectors } from "./data";

import App from "./App";

function render(data) {
  window.dev = { data, actions, selectors };
  ReactDOM.render(
    <App data={data} actions={actions} />,
    document.getElementById("root")
  );
}

subscribe(render);

if (module.hot) {
  module.hot.addStatusHandler(status => {
    if (status === "check") {
      console.log("hot reload started");
      console.time("hot reload");
    } else if (status === "idle") {
      console.timeEnd("hot reload");
    }
  });
  module.hot.accept(["./data", "./App"], () => {
    subscribe(render);
  });
}
