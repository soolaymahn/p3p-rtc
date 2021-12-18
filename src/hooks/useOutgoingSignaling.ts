import { useCallback, useEffect, useState } from "react";
import { useEncryption } from "../context/EncryptionProvider";
import { useWeb3 } from "../context/Web3Provider";

interface SignalingProps {
  peerId: string;
}

export const useOutgoingSignaling = ({ peerId }: SignalingProps) => {
  const [account, setAccount] = useState<string | null>(null);

  const { encrypt } = useEncryption();

  const { web3, signaling } = useWeb3();

  const sendOffer = useCallback(
    (message: string) => {
      signaling?.methods
        .sendMessage(peerId, "offer", encrypt(message))
        .send({ from: account, value: 0 });
    },
    [account, encrypt, peerId, signaling?.methods]
  );

  const sendAnswer = useCallback(
    (message: string, peerId: string) => {
      signaling?.methods
        .sendMessage(peerId, "answer", encrypt(message))
        .send({ from: account, value: 0 });
    },
    [account, encrypt, signaling?.methods]
  );

  const sendIceCandidate = useCallback(
    (message: string) => {
      signaling?.methods
        .sendMessage(peerId, "ice", encrypt(message))
        .send({ from: account, value: 0 });
    },
    [account, encrypt, peerId, signaling?.methods]
  );

  useEffect(() => {
    const fetch = async () => {
      if (web3) {
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
      }
    };
    fetch();
  }, [web3]);

  return { sendOffer, sendAnswer, sendIceCandidate };
};
