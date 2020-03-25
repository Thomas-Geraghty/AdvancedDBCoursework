import React from "react";
import ReactDOM from "react-dom";
import Main from "./components/Main.js";
import WebFont from 'webfontloader';

WebFont.load({
  google: {
    families: ['Noto Serif:400,400i,700', 'Noto Sans KR', 'VT323']
  }
});

ReactDOM.render(
  <Main/>, 
  document.getElementById("root")
);