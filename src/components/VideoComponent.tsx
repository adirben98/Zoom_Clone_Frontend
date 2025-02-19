import React from "react";

const VideoComponent = React.memo(({ stream, muted }: { stream: MediaStream | null; muted: boolean }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={videoRef} autoPlay playsInline muted={muted} />;
});

export default VideoComponent;