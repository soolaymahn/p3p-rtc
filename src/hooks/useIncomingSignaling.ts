import { useEffect } from "react";
import Signaling from "../contracts/Signaling";

interface SignalingProps {
  onAnswer: (message: string) => void;
  onOffer: (message: string) => void;
  onIceCandidate: (message: string) => void;
}

export const useIncomingSignaling = ({
  onOffer,
  onAnswer,
  onIceCandidate,
}: SignalingProps) => {
  useEffect(() => {
    const fetch = async () => {
      Signaling.events
        .Message()
        .on("connected", function (subscriptionId: any) {
          console.log(subscriptionId);
        })
        .on("data", function (event: any) {
          console.log(event);
          const type = event[2] as string;
          const message = event[3] as string;
          switch (type) {
            case "offer":
              onOffer(message);
              break;
            case "answer":
              onAnswer(message);
              break;
            case "ice":
              onIceCandidate(message);
              break;
          }
        });
    };

    fetch();
  }, [onAnswer, onIceCandidate, onOffer]);
};
