import { useCallback, useEffect, useState } from "react";
import { web3 } from "../utils/web3";
import { Signaling } from "../contracts/Signaling";
import { useEncryption } from "../context/EncryptionProvider";

interface SignalingProps {
  peerId: string;
}

export const useOutgoingSignaling = ({ peerId }: SignalingProps) => {
  const [account, setAccount] = useState<string | null>(null);

  const { encrypt } = useEncryption();

  const sendOffer = useCallback(
    (message: string) => {
      Signaling.methods
        .sendMessage(peerId, "offer", encrypt(message))
        .send({ from: account, value: 0 });
    },
    [account, encrypt, peerId]
  );

  const sendAnswer = useCallback(
    (message: string, peerId: string) => {
      Signaling.methods
        .sendMessage(peerId, "answer", encrypt(message))
        .send({ from: account, value: 0 });
    },
    [account, encrypt]
  );

  const sendIceCandidate = useCallback(
    (message: string) => {
      Signaling.methods
        .sendMessage(peerId, "ice", encrypt(message))
        .send({ from: account, value: 0 });
    },
    [account, encrypt, peerId]
  );

  useEffect(() => {
    const fetch = async () => {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
    };
    fetch();
  }, []);

  return { sendOffer, sendAnswer, sendIceCandidate };
};
