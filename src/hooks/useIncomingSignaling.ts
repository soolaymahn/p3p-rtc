import { useEffect, useRef } from "react";
import { SignalingSocket } from "../contracts/Signaling";
import { web3 } from "../utils/web3";

type MessageHandler = (message: string, peerId: string) => Promise<void>;

interface SignalingProps {
  onAnswer: MessageHandler;
  onOffer: (message: string, peerId: string) => Promise<void>;
  onIceCandidate: (message: string) => Promise<void>;
}

export const useIncomingSignaling = ({
  onOffer,
  onAnswer,
  onIceCandidate,
}: SignalingProps) => {
  const onOfferRef = useRef<MessageHandler | null>(null);
  const onAnswerRef = useRef<MessageHandler | null>(null);
  const onIceRef = useRef<MessageHandler | null>(null);

  useEffect(() => {
    onOfferRef.current = onOffer;
    onAnswerRef.current = onAnswer;
    onIceRef.current = onIceCandidate;
  }, [onAnswer, onIceCandidate, onOffer]);

  useEffect(() => {
    const fetch = async () => {
      const accounts = await web3.eth.getAccounts();
      console.log("account", accounts[0]);

      SignalingSocket.events
        .Message()
        .on("connected", function (subscriptionId: any) {
          console.log(subscriptionId);
        })
        .on("data", async function (event: any) {
          console.log("event", event);
          const from = event.returnValues[0] as string;
          const to = event.returnValues[1] as string;
          const type = event.returnValues[2] as string;
          const message = event.returnValues[3] as string;
          if (to === accounts[0]) {
            switch (type) {
              case "offer":
                onOfferRef.current?.(message, from);
                break;
              case "answer":
                onAnswerRef.current?.(message, from);
                break;
              case "ice":
                onIceRef.current?.(message, from);
                break;
            }
          }
        });
    };

    fetch();
  }, []);
};
