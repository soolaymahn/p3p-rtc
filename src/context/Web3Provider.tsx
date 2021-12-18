import React, {
  createContext,
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useContext } from "react";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { SignalingABI, SignalingAddress } from "../contracts/Signaling";

interface Web3ContextInterface {
  web3?: Web3;
  web3Websocket?: Web3;
  signaling?: Contract;
  signalingSocket?: Contract;
  connectWallet: () => void;
  isConnected: boolean;
  getEnsName: (name: string) => Promise<string>;
}

const Web3Context = createContext<Web3ContextInterface>({
  connectWallet: () => {},
  isConnected: false,
  getEnsName: () => new Promise<string>((resolve, reject) => {}),
});

// eslint-disable-next-line react/display-name
export const Web3Provider = memo(
  ({ children }: { children: React.ReactNode }) => {
    const [isConnected, setConnected] = useState(false);
    const [web3, setWeb3] = useState<Web3 | undefined>(undefined);
    const [web3Websocket, setWeb3Websocket] = useState<Web3 | undefined>(
      undefined
    );
    const [web3Ens, setWeb3Ens] = useState<Web3 | undefined>(undefined);
    const [signaling, setSignaling] = useState<Contract | undefined>(undefined);
    const [signalingSocket, setSignalingSocket] = useState<
      Contract | undefined
    >(undefined);

    const initWeb3 = useCallback(async () => {
      const web3Var = new Web3((window as any).ethereum);
      const web3WebsockterVar = new Web3(
        new Web3.providers.WebsocketProvider(
          "wss://matic-mainnet-archive-ws.bwarelabs.com"
        )
      );

      setWeb3(web3Var);
      setWeb3Websocket(web3WebsockterVar);
      setSignaling(new web3Var.eth.Contract(SignalingABI, SignalingAddress));
      setSignalingSocket(
        new web3WebsockterVar.eth.Contract(SignalingABI, SignalingAddress)
      );

      setWeb3Ens(new Web3("https://cloudflare-eth.com"));
    }, []);

    const getEnsName = useCallback(
      (name: string) => {
        return new Promise<string>((resolve, reject) => {
          if (!web3Ens) {
            reject();
            return;
          }
          web3Ens.eth.ens.getAddress(name, (error: Error, address: string) => {
            if (address) {
              resolve(address);
            } else {
              reject();
            }
          });
        });
      },
      [web3Ens]
    );

    useEffect(() => {
      const isConnected = (window as any).ethereum.isConnected();
      console.log({ isConnected });
      setConnected(isConnected);
      if (isConnected) {
        initWeb3();
      }
    }, [initWeb3]);

    const connectWallet = useCallback(async () => {
      try {
        const promise = (window as any).ethereum.request({
          method: "eth_requestAccounts",
        }) as Promise<void>;
        await promise;

        setConnected(true);
        initWeb3();
      } catch (error) {
        console.log(error);
      }
    }, [initWeb3]);

    return (
      <Web3Context.Provider
        value={{
          isConnected,
          connectWallet,
          web3,
          web3Websocket,
          signaling,
          signalingSocket,
          getEnsName,
        }}
      >
        {children}
      </Web3Context.Provider>
    );
  }
);

export function useWeb3() {
  return useContext(Web3Context);
}
