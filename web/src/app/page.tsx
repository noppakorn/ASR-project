"use client";
import { useRef, useState } from "react";

const mimeType = "audio/webm";

export enum RecordingStatus {
  Recording,
  Inactive,
  Paused,
}

export default function Home() {
  const [permission, setPermission] = useState<boolean>(false);

  const mediaRecorder = useRef(null);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>(
    RecordingStatus.Inactive
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioChunks, setAudioChunks] = useState<any[]>([]);
  const [audio, setAudio] = useState<any | null>(null);

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(streamData);
      } catch (err: any) {
        console.log(err.message);
        alert(err.message);
      }
    } else {
      console.log("Media API not supported in browser");
      alert("Media API not supported in browser");
    }
  };

  const startRecording = async () => {
    if (stream) {
      const media = new MediaRecorder(stream);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="mt-20 font-bold text-5xl">Noodle Shop</div>
      <div className="m-5 text-2xl">Order using Your Voice!</div>
      <div
        className={
          "flex select-none p-3 w-96 h-20 items-center justify-center text-center  border-2 border-gray-500 " +
          (permission ? "" : "hover:bg-gray-700 active:bg-gray-500")
        }
        onClick={getMicrophonePermission}
      >
        <span
          className={"m-auto text-2xl " + (permission ? "text-red-400" : "")}
        >
          {permission ? "Recording" : "Allow Microphone Permission"}
        </span>
      </div>
    </main>
  );
}
