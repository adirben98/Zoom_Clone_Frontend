import Peer from "peerjs";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import {Message} from '../components/Room'
const socket = io("ws://localhost:3000");

export default function useSocket(
  myVideo: MediaStream|null,
  addVideo: (stream:MediaStream,peerId:string) => void,
  removeVideo: (peerId:string) => void,
  addMessage:(writer:string,content:string)=>void

) {
  const { roomId } = useParams();
  useEffect(() => {
    if (!myVideo) return;

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
      removeVideo(peerId);
    });
    socket.on("recieve-message",(writer,content)=>{
        addMessage(writer,content)
    })
    

    return () => {
      peer.disconnect();
    };
  }, [roomId, myVideo]);

  function emitMessage(message:Message){
    socket.emit("new-message",message.writer,message.content)
  }
return {emitMessage}
}
