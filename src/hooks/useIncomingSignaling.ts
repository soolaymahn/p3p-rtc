import { useEffect } from "react";
import { SignalingSocket } from "../contracts/Signaling";
import { web3 } from "../utils/web3";

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
      const accounts = await web3.eth.getAccounts();

      SignalingSocket.events
        .Message()
        .on("connected", function (subscriptionId: any) {
          console.log(subscriptionId);
        })
        .on("data", function (event: any) {
          console.log(event);
          const to = event[1] as string;
          const type = event[2] as string;
          const message = event[3] as string;
          if (to === accounts[0]) {
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
          }
        });
    };

    fetch();
  }, [onAnswer, onIceCandidate, onOffer]);
};
