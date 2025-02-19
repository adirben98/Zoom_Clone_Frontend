import React, { useEffect, useState, useRef, useCallback } from "react";
import useSocket from "../Hooks/useSocket";
import "./style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
} from "@fortawesome/free-solid-svg-icons";
import VideoComponent from "./VideoComponent";

type Video = {
  stream: MediaStream;
  peerId: string;
};

export type Message = {
  writer: string;
  content: string;
};

export default function Room() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [mute, setMute] = useState(false);
  const [video, setVideo] = useState(true);
  const [myVideo, setMyVideo] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [myName, setMyName] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [myMessage, setMyMessage] = useState<string>("");
  const initialized = useRef(false);

  const addVideo = useCallback((stream: MediaStream, peerId: string) => {
    setVideos((prev) => {
      if (prev.some((v) => v.peerId === peerId)) return prev;
      return [...prev, { stream, peerId }];
    });
  }, []);

  const removeVideo = useCallback((peerId: string) => {
    setVideos((prev) => prev.filter((v) => v.peerId !== peerId));
  }, []);

  const addMessage = useCallback((writer: string, content: string) => {
    const newMessage = { writer, content };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const { emitMessage } = useSocket(myVideo, addVideo, removeVideo, addMessage);

  useEffect(() => {
    if (!initialized.current) {
      addMyVideo();
      initialized.current = true;
    }
  }, []);

  const addMyVideo = useCallback(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        setMyVideo(stream);
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });
  }, []);

  const sendMyMessage = useCallback(() => {
    if (myMessage === "") return;
    const message = {
      writer: name,
      content: myMessage,
    };
    emitMessage(message);
    setMessages((prev) => [...prev, message]);
    setMyMessage("");
  }, [myMessage, name, emitMessage]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.code === "Enter") sendMyMessage();
    },
    [sendMyMessage]
  );

  if (myName === "") {
    return (
      <div className="name-input">
        <span>What's your name?</span>
        <input type="text" onChange={(e) => setName(e.target.value)} />
        <button disabled={name === ""} onClick={() => setMyName(name)}>
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="left_section">
        {video ? (
          <div className="video-grid">
            <VideoComponent stream={myVideo} muted={true} />
            {videos.map((video, index) => (
              <VideoComponent key={index} stream={video.stream} muted={mute} />
            ))}
          </div>
        ) : (
          <div className="video-grid"></div>
        )}

        <div className="footer">
          <div className="icons" onClick={() => setMute((prev) => !prev)}>
            <FontAwesomeIcon icon={mute ? faMicrophoneSlash : faMicrophone} />
            <span>{mute ? "Unmute" : "Mute"}</span>
          </div>

          <div className="icons" onClick={() => setVideo((prev) => !prev)}>
            <FontAwesomeIcon icon={video ? faVideoSlash : faVideo} />
            <span>{video ? "Stop Video" : "Start Video"}</span>
          </div>
        </div>
      </div>
      <div className="chat">
        <div className="title">Chat</div>
        <div className="body-chat">
          {messages.map((message, index) => (
            <div key={index}>
              <span style={{ color: "orange" }}>{message.writer}</span>
              {": " + message.content}
            </div>
          ))}
        </div>
        <div className="chat_input">
          <input
            type="text"
            value={myMessage}
            placeholder="Write Here"
            onChange={(e) => setMyMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="send" onClick={sendMyMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}