import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { PeerConnection } from "./components/PeerConnection";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <PeerConnection />
      </header>
    </div>
  );
}

export default App;
