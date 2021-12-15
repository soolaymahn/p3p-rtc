import { useCallback, useEffect, useRef } from "react";
import { useEncryption } from "../context/EncryptionProvider";
import { useWeb3 } from "../context/Web3Provider";

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
  const scannedMessages = useRef<Set<string>>(new Set());
  const account = useRef<string | undefined>(undefined);

  const { decrypt } = useEncryption();

  const decryptRef = useRef<Decrypter>(decrypt);

  onOfferRef.current = onOffer;
  onAnswerRef.current = onAnswer;
  onIceRef.current = onIceCandidate;
  decryptRef.current = decrypt;

  const { web3, signalingSocket, signaling } = useWeb3();

  const handleMessage = useCallback((event: any) => {
    const from = event.returnValues[0] as string;
    const to = event.returnValues[1] as string;
    const type = event.returnValues[2] as string;
    const message = decryptRef.current(event.returnValues[3]) as string;
    if (
      to === account.current &&
      !scannedMessages.current.has(event.returnValues[3])
    ) {
      scannedMessages.current.add(event.returnValues[3]);

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
  }, []);

  const pollForMessages = useCallback(async () => {
    if (web3 && signaling) {
      const bn = await web3.eth.getBlockNumber();

      const events = await signaling.getPastEvents("Message", {
        // filter: { _to: account.current ?? "" },
        fromBlock: bn - 20,
        toBlock: "latest",
      });
      console.log({ polled: events });
      events.forEach((ev: any) => {
        handleMessage(ev);
      });
      setTimeout(pollForMessages, 20000);
    }
  }, [handleMessage, signaling, web3]);

  useEffect(() => {
    if (web3 && signalingSocket) {
      setTimeout(pollForMessages, 20000);

      signalingSocket.events
        .Message()
        .on("connected", function (subscriptionId: any) {
          console.log(subscriptionId);
        })
        .on("data", async function (event: any) {
          console.log("event", event);
          handleMessage(event);
        });

      const fetchAccount = async () => {
        const accounts = await web3.eth.getAccounts();
        account.current = accounts[0];
      };
      fetchAccount();
    }
  }, [handleMessage, pollForMessages, signalingSocket, web3]);
};
