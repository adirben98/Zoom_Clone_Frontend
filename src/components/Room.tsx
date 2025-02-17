import { useEffect, useState, useRef, useCallback } from "react";
import useSocket from "../Hooks/useSocket";
import "./style.css";
type video={
    stream:MediaStream;
    peerId:string;
}

export default function Room() {


  const [videos, setVideos] = useState<video[]>([]);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const initialized = useRef(false);
  useSocket(videos[0]?.stream,addVideo,removeVideo);


  useEffect(() => {
    if (!initialized.current) {
      addMyVideo(false);
      initialized.current = true;
    }
  }, []);

  function addMyVideo(audio: boolean) {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: audio,
      })
      .then((stream) => {
        setVideos([ {stream,peerId:''}]);
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });
  }
  function addVideo(stream:MediaStream,peerId:string) {
    const newVideo:video={stream,peerId}
    setVideos(prev=>[...prev,newVideo])
  }
  function removeVideo(peerId:string){
    setVideos(prev=>{return prev.filter(v=>v.peerId!==peerId)})
  }

  const setVideoRef = useCallback(
    (node: HTMLVideoElement | null, index: number) => {
      if (node) {
        videoRefs.current.set(index, node);
        node.srcObject = videos[index].stream;
      }
    },
    [videos]
  );

  return (
    <div className="container">
      <div className="video-grid">
        {videos.map((_, index) => (
          <video
            key={index}
            ref={(node) => setVideoRef(node, index)}
            autoPlay
            playsInline
            muted
          />
        ))}
      </div>
    </div>
  );
}
