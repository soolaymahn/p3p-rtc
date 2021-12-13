import { useEffect, useRef } from "react";
import { useEncryption } from "../context/EncryptionProvider";
import { SignalingSocket } from "../contracts/Signaling";
import { web3 } from "../utils/web3";

type MessageHandler = (message: string, peerId: string) => Promise<void>;
type Decrypter = (ciphertext: string) => string;
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
  const onOfferRef = useRef<MessageHandler>(onOffer);
  const onAnswerRef = useRef<MessageHandler>(onAnswer);
  const onIceRef = useRef<MessageHandler>(onIceCandidate);

  const { decrypt } = useEncryption();

  const decryptRef = useRef<Decrypter>(decrypt);

  onOfferRef.current = onOffer;
  onAnswerRef.current = onAnswer;
  onIceRef.current = onIceCandidate;
  decryptRef.current = decrypt;

  useEffect(() => {
    const fetch = async () => {
      const accounts = await web3.eth.getAccounts();

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
          const message = decryptRef.current(event.returnValues[3]) as string;
          if (to === accounts[0]) {
            switch (type) {
              case "offer":
                onOfferRef.current(message, from);
                break;
              case "answer":
                onAnswerRef.current(message, from);
                break;
              case "ice":
                onIceRef.current(message, from);
                break;
            }
          }
        });
    };

    fetch();
  }, []);
};
