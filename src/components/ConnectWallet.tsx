import React, { useCallback, useState, useEffect } from "react";
import styled from "styled-components";
import { useWeb3 } from "../context/Web3Provider";

interface ConnectWalletProps {}

export const ConnectWallet: React.FC<ConnectWalletProps> = ({}) => {
  const { isConnected, connectWallet } = useWeb3();

  return (
    <Container>
      <Button onClick={connectWallet} disabled={isConnected}>
        {isConnected ? "Connected" : "Connect Polygon"}
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
  margin: 50px 20px 50px 50px;
  font-size: 14px;
`;
