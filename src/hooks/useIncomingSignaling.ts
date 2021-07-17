import { useCallback, useEffect, useRef, useState } from "react";
import { SignalingSocket } from "../contracts/Signaling";
import { web3 } from "../utils/web3";

type MessageHandler = (message: string) => Promise<void>;

interface SignalingProps {
  onAnswer: MessageHandler;
  onOffer: (message: string) => Promise<void>;
  onIceCandidate: (message: string) => Promise<void>;
}

export const useIncomingSignaling = ({
  onOffer,
  onAnswer,
  onIceCandidate,
}: SignalingProps) => {
  const [hash] = useState(new Set<string>());

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
          if (!hash.has(event.transactionHash)) {
            hash.add(event.transactionHash);
            const to = event.returnValues[1] as string;
            const type = event.returnValues[2] as string;
            const message = event.returnValues[3] as string;
            if (to === accounts[0]) {
              switch (type) {
                case "offer":
                  const offer = onOfferRef.current;
                  if (offer) {
                    offer(message);
                  }
                  break;
                case "answer":
                  const answer = onAnswerRef.current;
                  if (answer) {
                    answer(message);
                  }
                  break;
                case "ice":
                  const ice = onIceRef.current;
                  if (ice) {
                    ice(message);
                  }
                  break;
              }
            }
          }
        });
    };

    fetch();
  }, [hash]);
};
