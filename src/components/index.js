import React, { Component } from "react";
import s from "./index.styl";
import CanvasView from "components/CanvasView/";
import Speech from "components/Speech/";
import Background from "./Background/Background";

class App extends Component {
  render() {
    return (
      <div className={s.app}>
          <Background />
          <CanvasView />
          {/*<Speech />*/}
      </div>
    );
  }
}

export default App;
