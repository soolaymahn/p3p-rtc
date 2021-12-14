import Web3 from "web3";

window.ethereum.request({ method: "eth_requestAccounts" });

export const web3 = new Web3(window.ethereum);

export const web3Websocket = new Web3(
  new Web3.providers.WebsocketProvider(
    "wss://matic-mainnet-archive-ws.bwarelabs.com"
  )
);
