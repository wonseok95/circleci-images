import React from "react";
import ReactDOM from "react-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import { get, actions } from "./data";

import App from "./App";

function render() {
  ReactDOM.render(
    <App data={get()} actions={actions} />,
    document.getElementById("root")
  );
}

render();

if (module.hot) {
  module.hot.accept(["./data", "./App"], () => {
    render();
  });
}
