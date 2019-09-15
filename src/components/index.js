import React, { Component } from "react";
import s from "./index.styl";
import CanvasView from "components/CanvasView/";

class App extends Component {
  render() {
    return (
      <div className={s.app}>
          <CanvasView />
      </div>
    );
  }
}

export default App;
