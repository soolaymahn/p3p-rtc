import React, { useCallback, useEffect, useRef, useState } from "react";
import "webrtc-adapter";
import { useIncomingSignaling } from "../hooks/useIncomingSignaling";
import { useOutgoingSignaling } from "../hooks/useOutgoingSignaling";

export const PeerConnection: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(
    null
  );

  const [peerId, setPeerId] = useState("");

  const { sendOffer, sendAnswer, sendIceCandidate } = useOutgoingSignaling({
    peerId,
  });

  const onRemoteStream = useCallback((e: RTCTrackEvent) => {
    console.log("got remote stream");
    const remoteVideo = remoteVideoRef.current!;
    if (remoteVideo.srcObject !== e.streams[0]) {
      remoteVideo.srcObject = e.streams[0];
    }
  }, []);

  const onGotIceCandidate = useCallback(
    (e: RTCPeerConnectionIceEvent) => {
      console.log("sending ice");
      sendIceCandidate(JSON.stringify(e.candidate?.toJSON()));
    },
    [sendIceCandidate]
  );

  const startCall = useCallback(async () => {
    console.log("starting call");
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
    console.log("sent offer");
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
      console.log("getting media");
      const media = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      console.log("got media");
      localVideoRef.current!.srcObject = media;
      setLocalMediaStream(media);
    };
    getMedia();
  }, []);

  const onOffer = useCallback(
    async (message: string) => {
      console.log("got offer");
      await peerConnection?.setRemoteDescription({
        sdp: message,
        type: "offer",
      });
      const answer = await peerConnection?.createAnswer();
      sendAnswer(answer?.sdp ?? "");
      peerConnection?.setLocalDescription(answer);
      console.log("sent answer");
    },
    [peerConnection, sendAnswer]
  );

  const onAnswer = useCallback(
    async (message: string) => {
      console.log("got answer");
      await peerConnection?.setRemoteDescription({
        sdp: message,
        type: "answer",
      });
    },
    [peerConnection]
  );

  const onIceCandidate = useCallback(
    async (message: string) => {
      console.log("got ice");
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
      <input
        type="text"
        value={peerId}
        onChange={(e) => {
          setPeerId(e.target.value);
        }}
      />
      <br />
      <br />
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
      <br />
      <button onClick={startCall}>Call </button>{" "}
      <button onClick={endCall}>Hang Up </button>{" "}
    </div>
  );
};
