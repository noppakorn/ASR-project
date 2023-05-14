"use client";
import axios from "axios";
import Link from "next/link";
import { useRef, useState } from "react";

const API_URL = "http://localhost:8000";
const mimeType = "audio/webm";

export enum RecordingStatus {
  Recording,
  Inactive,
  Paused,
}

export type OrderResponse = {
  transcription: string;
};

export default function Home() {
  const [permission, setPermission] = useState<boolean>(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>(
    RecordingStatus.Inactive
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audio, setAudio] = useState<string | null>(null);

  const [receivedTranscription, setReceivedTranscription] =
    useState<boolean>(false);
  const [transcription, setTranscription] = useState<string>("");

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
      setReceivedTranscription(false);
      fetch(audio).then(async (res) => {
        let formData = new FormData();
        formData.append("file", await res.blob(), "order.webm");

        axios.post(API_URL + "/order", formData).then((res) => {
          const data: OrderResponse = res.data as OrderResponse;
          setReceivedTranscription(true);
          setTranscription(data.transcription);
        });
      });
    }
  };

  // TODO: Rule based order interpretation
  const interpretOrder = () => {};

  return (
    <main className="flex flex-col min-h-screen items-center space-y-10">
      <div className="mt-20 font-bold text-5xl">Noodle Shop</div>
      <div className="text-2xl">Order using Your Voice!</div>
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
        <div className="flex flex-col items-center justify-center text-center">
          <div className="m-5 text-3xl">Your Order</div>
          <button
            className="flex select-none p-3 w-96 h-20 items-center justify-center text-center border-2 border-gray-500 hover:bg-gray-700 active:bg-gray-500 text-2xl"
            onClick={submitOrder}
          >
            Submit Order
          </button>

          {receivedTranscription && (
            <div className="m-5 text-2xl">
              <span>Transcription:&nbsp;</span>
              <span className="text-2xl font-bold">{transcription}</span>
            </div>
          )}
        </div>
      )}
      {audio && (
        <div className="flex flex-col items-center justify-center">
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
