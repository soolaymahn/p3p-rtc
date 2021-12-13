import React from "react";
import { useEffect } from "react";
import "./App.css";
import { Password } from "./components/Password";
import { PeerConnection } from "./components/PeerConnection";
import { EncryptionProvider } from "./context/EncryptionProvider";
import { initEncryption } from "./utils/encryption";

export const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <EncryptionProvider>
          <Password />
          <PeerConnection />
        </EncryptionProvider>
      </header>
    </div>
  );
};

export default App;
