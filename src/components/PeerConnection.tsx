import { ENETDOWN } from "constants";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "webrtc-adapter";

interface PeerConnectionProps {
  peerId: string;
}

export const PeerConnection: React.FC<PeerConnectionProps> = ({}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(
    null
  );

  const onRemoteStream = useCallback((e: RTCTrackEvent) => {
    const remoteVideo = remoteVideoRef.current!;
    if (remoteVideo.srcObject !== e.streams[0]) {
      remoteVideo.srcObject = e.streams[0];
    }
  }, []);

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

    // TODO: send offer
    // TODO: send ice candidate
    pc1.ontrack = onRemoteStream;
  }, []);

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

  // TODO: on remote offer
  // TODO: on remote answer
  // TOOD: on remote ice candidate

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
    </div>
  );
};
