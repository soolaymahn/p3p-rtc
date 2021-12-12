import { useEffect } from "react";
import "./App.css";
import { PeerConnection } from "./components/PeerConnection";
import { initEncryption } from "./utils/encryption";

function App() {
  useEffect(() => {
    initEncryption();
  }, []);
  return (
    <div className="App">
      <header className="App-header">{/* <PeerConnection /> */}</header>
    </div>
  );
}

export default App;
