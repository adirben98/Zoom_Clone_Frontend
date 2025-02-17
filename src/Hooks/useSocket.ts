import Peer from "peerjs";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
const socket = io("ws://localhost:3000");

export default function useSocket(
  myVideo: MediaStream,
  addVideo: (stream:MediaStream,peerId:string) => void,
  removeVideo: (peerId:string) => void
) {
  const { roomId } = useParams();
  useEffect(() => {
    if (!myVideo) return;

    console.log(myVideo);
    const peer = new Peer();

    peer.on("open", (id) => {
      socket.emit("join", id, roomId, myVideo);
    });
    socket.on("user-connected", (userId) => {
      const call = peer.call(userId, myVideo);
      call.on("stream", (remoteStream) => addVideo(remoteStream,userId));
    });
    peer.on("call", (call) => {
      call.answer(myVideo);
      
      call.on("stream", (remoteStream) => {
        addVideo(remoteStream,call.peer);
      });
    });
    socket.on("user-leave", (peerId) => {
        console.log(peerId)
      removeVideo(peerId);
    });
    peer.on("close", () => {
      socket.emit("user-leave", myVideo, roomId);
    });

    return () => {
      peer.disconnect();
    };
  }, [roomId, myVideo]);
}
