import { useCallback, useEffect, useState } from "react";
import Signaling from "../contracts/Signaling";
import web3 from "../utils/web3";

interface SignalingProps {
  onAnswer: (message: string) => void;
  onOffer: (message: string) => void;
  onIceCandidate: (message: string) => void;
  peerId: string;
}

export const useSignaling = ({ peerId }: SignalingProps) => {
  const [account, setAccount] = useState<string | null>(null);

  const sendOffer = useCallback((message: string) => {
    Signaling.methods.sendMessage(peerId, "offer", message);
  }, []);

  const sendAnswer = useCallback((message: string) => {
    Signaling.methods.sendMessage(peerId, "answer", message);
  }, []);

  const sendIceCandidate = useCallback((message: string) => {
    Signaling.methods.sendMessage(peerId, "ice", message);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      Signaling.events
        .Message()
        .on("connected", function (subscriptionId: any) {
          console.log(subscriptionId);
        })
        .on("data", function (event: any) {
          console.log(event);
          // TODO: check and call appropiate function
        });
    };

    fetch();
  }, []);

  return { sendOffer, sendAnswer, sendIceCandidate };
};
