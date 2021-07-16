import { useCallback, useEffect, useState } from "react";
import web3 from "../utils/web3";
import Signaling from "../contracts/Signaling";

interface SignalingProps {
  peerId: string;
}

export const useOutgoingSignaling = ({ peerId }: SignalingProps) => {
  const [account, setAccount] = useState<string | null>(null);

  const sendOffer = useCallback(
    (message: string) => {
      Signaling.methods
        .sendMessage(peerId, "offer", message)
        .send({ from: account, value: 0 });
    },
    [account, peerId]
  );

  const sendAnswer = useCallback(
    (message: string) => {
      Signaling.methods
        .sendMessage(peerId, "answer", message)
        .send({ from: account, value: 0 });
    },
    [account, peerId]
  );

  const sendIceCandidate = useCallback(
    (message: string) => {
      Signaling.methods
        .sendMessage(peerId, "ice", message)
        .send({ from: account, value: 0 });
    },
    [account, peerId]
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
