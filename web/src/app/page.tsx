"use client";
import axios from "axios";
import Link from "next/link";
import { useRef, useState } from "react";

const mimeType = "audio/webm";

export enum RecordingStatus {
  Recording,
  Inactive,
  Paused,
}

export type OrderResponse = {
  text: string;
};
const API_URL = "http://localhost:8000";

export default function Home() {
  const [permission, setPermission] = useState<boolean>(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>(
    RecordingStatus.Inactive
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audio, setAudio] = useState<string | null>(null);

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
      setRecordingStatus(RecordingStatus.Recording);
      const media = new MediaRecorder(stream, { mimeType });
      mediaRecorder.current = media;
      mediaRecorder.current.start();
      let localAudioChunks: Blob[] = [];
      mediaRecorder.current.ondataavailable = (event) => {
        if (typeof event === "undefined") return;
        if (event.data.size === 0) return;
        localAudioChunks.push(event.data);
      };
      setAudioChunks(localAudioChunks);
    } else {
      alert("stream is null");
    }
  };
  const stopRecording = () => {
    if (mediaRecorder.current) {
      setRecordingStatus(RecordingStatus.Inactive);
      mediaRecorder.current.stop();
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudio(audioUrl);
        setAudioChunks([]);
      };
    } else {
      alert("mediaRecorder is null");
    }
  };

  const submitOrder = () => {
    if (audio) {
      let fd = new FormData();
      fd.append("audio", audio);

      // TODO: Send POST Request
      alert("Send POST Request (not implemented yet)");
      return axios.post<OrderResponse>(API_URL + "/order", fd).then((res) => {
        return res;
      });
    }
  };

  // TODO: Rule based order interpretation
  const interpretOrder = () => {};

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="mt-20 font-bold text-5xl">Noodle Shop</div>
      <div className="m-5 text-2xl">Order using Your Voice!</div>
      {!permission && (
        <button
          className="flex select-none p-3 w-96 h-20 items-center justify-center text-center border-2 border-gray-500 hover:bg-gray-700 active:bg-gray-500 text-2xl"
          onClick={getMicrophonePermission}
        >
          Allow Microphone Permission
        </button>
      )}
      {permission && (
        <div id="audio-controls">
          {recordingStatus == RecordingStatus.Inactive && (
            <button
              className="flex select-none p-3 w-96 h-20 items-center justify-center text-center border-2 border-gray-500 hover:bg-gray-700 active:bg-gray-500 text-2xl"
              onClick={startRecording}
            >
              Start Recording
            </button>
          )}
          {recordingStatus == RecordingStatus.Recording && (
            <button
              className="flex select-none p-3 w-96 h-20 items-center justify-center text-center border-2 border-gray-500 hover:bg-gray-700 active:bg-gray-500 text-2xl text-red-500"
              onClick={stopRecording}
            >
              Stop Recording
            </button>
          )}
        </div>
      )}
      {audio && (
        <div className="flex flex-col m-20">
          <div className="text-2xl">Your Order</div>
          <button
            className="flex select-none p-3 w-96 h-20 items-center justify-center text-center border-2 border-gray-500 hover:bg-gray-700 active:bg-gray-500 text-2xl"
            onClick={submitOrder}
          >
            Submit Order
          </button>

          {/* TODO: Transcription Return from API */}
          <div>Place Holder: Order Return From API</div>
        </div>
      )}
      {audio && (
        <div className="flex flex-col m-20 items-center justify-center">
          <div className="text-2xl">Recording</div>
          <audio className="mt-5" src={audio} controls></audio>
          <Link
            href={audio}
            className="flex mt-5 select-none p-3 w-64 h-10 items-center justify-center text-center border-2 border-gray-500 hover:bg-gray-700 active:bg-gray-500 text-lg"
          >
            Download
          </Link>
        </div>
      )}
    </main>
  );
}
