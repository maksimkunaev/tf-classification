import React, { Component } from "react";
import s from "./index.styl";
import CanvasView from "components/CanvasView/";
import Speech from "components/Speech/";

class App extends Component {
  render() {
    return (
      <div className={s.app}>
        <CanvasView />
        <Speech />
      </div>
    );
  }
}

export default App;
