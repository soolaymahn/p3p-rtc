import React, { useCallback, useEffect, useRef, useState } from "react";
import "webrtc-adapter";
import { useEncryption } from "../context/EncryptionProvider";
import { useWeb3 } from "../context/Web3Provider";
import { useIncomingSignaling } from "../hooks/useIncomingSignaling";
import { useOutgoingSignaling } from "../hooks/useOutgoingSignaling";
import { CancelFc, cancellablePromise } from "../utils/cancellable";

export const PeerConnection: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  const [media, setMedia] = useState<MediaStream | null>(null);

  const [peerId, setPeerId] = useState("");

  const [inputPeerId, setInputPeerId] = useState("");

  const [ensResolvedId, setEnsResolvedId] = useState<string | undefined>(
    undefined
  );

  const [isLoadingEns, setIsLoadingEns] = useState(false);

  const ensCancelRef = useRef<CancelFc | undefined>();

  const { sendOffer, sendAnswer, sendIceCandidate } = useOutgoingSignaling({
    peerId,
  });

  const [status, setStatus] = useState("");

  const onRemoteStream = useCallback((e: RTCTrackEvent) => {
    console.log("got remote stream");
    const remoteVideo = remoteVideoRef.current!;
    if (remoteVideo.srcObject !== e.streams[0]) {
      remoteVideo.srcObject = e.streams[0];
    }
  }, []);

  const onIceStateChange = useCallback(
    (e) => {
      console.log("ICE state:", peerConnection!.iceConnectionState);
      setStatus(peerConnection!.iceConnectionState);
    },
    [peerConnection]
  );

  const onGotIceCandidate = useCallback(
    (e: RTCPeerConnectionIceEvent) => {
      console.log("sending ice", e);
      if (e.candidate) {
        sendIceCandidate(JSON.stringify(e.candidate?.toJSON()));
      }
    },
    [sendIceCandidate]
  );

  const startCall = useCallback(async () => {
    console.log("starting call");

    const offer = await peerConnection!.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    await peerConnection?.setLocalDescription(offer);
    sendOffer(offer.sdp ?? "");

    console.log("sent offer", offer.sdp);
  }, [peerConnection, sendOffer]);

  const endCall = useCallback(() => {
    peerConnection?.close();
    media!.getTracks().forEach(function (track) {
      track.stop();
    });
    setMedia(null);
    setPeerConnection(null);
  }, [media, peerConnection]);

  useEffect(() => {
    const getMedia = async () => {
      console.log("getting media");
      const media = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      console.log("got media", media);
      localVideoRef.current!.srcObject = media;
      setStatus("Not connected");

      const pc = new RTCPeerConnection();
      setPeerConnection(pc);
      media.getTracks().forEach((track) => pc!.addTrack(track, media!));
      setMedia(media);
    };
    getMedia();
  }, []);

  useEffect(() => {
    if (peerConnection) {
      peerConnection.ontrack = onRemoteStream;
      peerConnection.onicecandidate = onGotIceCandidate;
      peerConnection.oniceconnectionstatechange = onIceStateChange;
    }
  }, [onGotIceCandidate, onIceStateChange, onRemoteStream, peerConnection]);

  const onOffer = useCallback(
    async (message: string, peerId: string) => {
      console.log("got offer", message);
      await peerConnection?.setRemoteDescription({
        sdp: message,
        type: "offer",
      });
      const answer = await peerConnection?.createAnswer();
      console.log("answer", peerId, answer);
      peerConnection?.setLocalDescription(answer);
      setPeerId(peerId);
      sendAnswer(answer?.sdp ?? "", peerId);
      console.log("sent answer", answer?.sdp);
    },
    [peerConnection, sendAnswer]
  );

  const onAnswer = useCallback(
    async (message: string) => {
      console.log("got answer", message);
      await peerConnection?.setRemoteDescription({
        sdp: message,
        type: "answer",
      });
    },
    [peerConnection]
  );

  const onIceCandidate = useCallback(
    async (message: string) => {
      console.log("got ice", peerConnection);
      const candidate: RTCIceCandidateInit = JSON.parse(message);
      await peerConnection?.addIceCandidate(candidate).then(
        () => console.log("addIceCandidate success"),
        (error) =>
          console.error("failed to add ICE Candidate", error.toString())
      );
    },
    [peerConnection]
  );

  useIncomingSignaling({
    onAnswer,
    onOffer,
    onIceCandidate,
  });

  const { getEnsName } = useWeb3();

  const resolveEns = useCallback(
    (name: string) => {
      return new Promise<string>((resolve, reject) => {
        setTimeout(async () => {
          try {
            const address = await getEnsName(name);
            resolve(address);
          } catch {
            reject();
          }
        }, 3000);
      });
    },
    [getEnsName]
  );

  const handleEnsUpdate = useCallback(
    async (name: string) => {
      ensCancelRef.current?.();

      if (name.endsWith(".eth")) {
        setIsLoadingEns(true);
        const ensPromise = resolveEns(name);

        const { promise, cancel } = cancellablePromise(ensPromise);
        ensCancelRef.current = cancel;
        try {
          const resolvedId = await promise;
          setEnsResolvedId(resolvedId);
          setPeerId(resolvedId);
          setIsLoadingEns(false);
        } catch {
          setIsLoadingEns(false);
        }
      }
    },
    [resolveEns]
  );

  const { password } = useEncryption();

  return (
    <div
      style={{
        position: "relative",
        width: "720px",
        height: "480px",
        maxWidth: "100%",
      }}
    >
      <input
        type="text"
        value={inputPeerId}
        id="peer"
        placeholder="Address/ENS"
        onChange={(e) => {
          console.log("set peerId", e.target.value);
          setInputPeerId(e.target.value);
          if (e.target.value.startsWith("0x")) {
            setPeerId(e.target.value);
          }
          handleEnsUpdate(e.target.value);
        }}
      />
      <br />
      <p>{isLoadingEns ? "Fetching ENS..." : ensResolvedId}</p>
      <br />
      <button
        disabled={
          isLoadingEns || !peerId || !password || status === "connected"
        }
        onClick={startCall}
      >
        Call{" "}
      </button>{" "}
      <button
        disabled={
          isLoadingEns || !peerId || !password || status !== "connected"
        }
        onClick={endCall}
      >
        Hang Up{" "}
      </button>{" "}
      <br />
      <div id="videos">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          id="local-video"
          // style={{
          //   width: "240px",
          //   height: "180px",
          // }}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          id="remote-video"
          // style={{
          //   width: "720px",
          //   height: "480px",
          // }}
        />
        <div className="status">
          <p>{status}</p>
        </div>
      </div>
    </div>
  );
};
