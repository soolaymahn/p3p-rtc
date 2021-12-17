import React, { useCallback, useState, useEffect } from "react";
import styled from "styled-components";

interface ConnectWalletProps {}

export const ConnectWallet: React.FC<ConnectWalletProps> = ({}) => {
  const [connected, setConnected] = useState(false);
  const connectWallet = useCallback(async () => {
    try {
      const promise = (window as any).ethereum.request({
        method: "eth_requestAccounts",
      }) as Promise<void>;
      await promise;
      setConnected(true);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    setConnected((window as any).ethereum.isConnected());
  }, []);

  return (
    <Container>
      <Button onClick={connectWallet} disabled={connected}>
        {connected ? "Connected" : "Connect Wallet"}
      </Button>
    </Container>
  );
};

const Container = styled.div`
  width: 90%;
  margin-right: auto;
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;
const Button = styled.button`
  margin: 10px;
`;
