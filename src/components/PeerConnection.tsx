import React, { useCallback, useEffect, useRef, useState } from "react";
import "webrtc-adapter";
import { useIncomingSignaling } from "../hooks/useIncomingSignaling";
import { useOutgoingSignaling } from "../hooks/useOutgoingSignaling";

interface PeerConnectionProps {
  peerId: string;
}

export const PeerConnection: React.FC<PeerConnectionProps> = ({ peerId }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(
    null
  );

  const { sendOffer, sendAnswer, sendIceCandidate } = useOutgoingSignaling({
    peerId,
  });

  const onRemoteStream = useCallback((e: RTCTrackEvent) => {
    const remoteVideo = remoteVideoRef.current!;
    if (remoteVideo.srcObject !== e.streams[0]) {
      remoteVideo.srcObject = e.streams[0];
    }
  }, []);

  const onGotIceCandidate = useCallback(
    (e: RTCPeerConnectionIceEvent) => {
      sendIceCandidate(JSON.stringify(e.candidate?.toJSON()));
    },
    [sendIceCandidate]
  );

  const startCall = useCallback(async () => {
    const pc1 = new RTCPeerConnection();
    setPeerConnection(pc1);

    localMediaStream!
      .getTracks()
      .forEach((track) => pc1.addTrack(track, localMediaStream!));

    const offer = await pc1.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    await peerConnection?.setLocalDescription(offer);
    sendOffer(offer.sdp ?? "");

    pc1.ontrack = onRemoteStream;
    pc1.onicecandidate = onGotIceCandidate;
  }, [
    localMediaStream,
    onGotIceCandidate,
    onRemoteStream,
    peerConnection,
    sendOffer,
  ]);

  const endCall = useCallback(() => {
    peerConnection?.close();
  }, [peerConnection]);

  useEffect(() => {
    const getMedia = async () => {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      localVideoRef.current!.srcObject = media;
      setLocalMediaStream(media);
    };
    getMedia();
  }, []);

  const onOffer = useCallback(
    async (message: string) => {
      await peerConnection?.setRemoteDescription({
        sdp: message,
        type: "offer",
      });
      const answer = await peerConnection?.createAnswer();
      sendAnswer(answer?.sdp ?? "");
      peerConnection?.setLocalDescription(answer);
    },
    [peerConnection, sendAnswer]
  );

  const onAnswer = useCallback(
    async (message: string) => {
      await peerConnection?.setRemoteDescription({
        sdp: message,
        type: "answer",
      });
    },
    [peerConnection]
  );

  const onIceCandidate = useCallback(
    async (message: string) => {
      const candidate: RTCIceCandidateInit = JSON.parse(message);
      await peerConnection?.addIceCandidate(candidate);
    },
    [peerConnection]
  );

  useIncomingSignaling({
    onAnswer,
    onOffer,
    onIceCandidate,
  });

  return (
    <div>
      <video
        ref={localVideoRef}
        autoPlay
        muted
        style={{
          width: "240px",
          height: "180px",
        }}
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        style={{
          width: "240px",
          height: "180px",
        }}
      />
      <button onClick={startCall}>Call </button>{" "}
      <button onClick={endCall}>Hang Up </button>{" "}
    </div>
  );
};
