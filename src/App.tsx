import React from "react";
import { useEffect } from "react";
import "./App.css";
import { ConnectWallet } from "./components/ConnectWallet";
import { Password } from "./components/Password";
import { PeerConnection } from "./components/PeerConnection";
import { EncryptionProvider } from "./context/EncryptionProvider";
import { Web3Provider } from "./context/Web3Provider";
import { initEncryption } from "./utils/encryption";

export const App: React.FC = () => {
  return (
    <div className="App">
      <div className="App-content">
        <Web3Provider>
          <EncryptionProvider>
            <ConnectWallet />
            <Password />
            <PeerConnection />
          </EncryptionProvider>
        </Web3Provider>
      </div>
    </div>
  );
};

export default App;
