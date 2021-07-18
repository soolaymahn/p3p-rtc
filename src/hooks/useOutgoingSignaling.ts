import { useCallback, useEffect, useState } from "react";
import { web3 } from "../utils/web3";
import { Signaling } from "../contracts/Signaling";

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
    async (message: string, peerId: string) => {
      console.log("peerid", peerId, message);
      return new Promise((resolve, reject) => {
        Signaling.methods
          .sendMessage(peerId, "answer", message)
          .send({ from: account, value: 0 })
          .once("sending", function (payload: any) {
            resolve(payload);
          });
      });
    },
    [account]
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
