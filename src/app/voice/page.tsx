"use client";

import { Mic, MicOff, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function VoicePage() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [transcript, setTranscript] = useState("");
  const router = useRouter();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // API KEY
    socketRef.current = new WebSocket("wss://api");
    socketRef.current.onopen = () =>
      console.log("Connected to websocket server");
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTranscript((prev) => prev + " " + data.text);
    };

    return () => {
      socketRef.current?.close();
    };
  }, []);

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
  };
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-white p-6">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold mb-2">Voice AI Tutor</h1>
        </div>
      </div>

      <div className="relative mb-20">
        <div
          className={`w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center z-10 relative ${isStreaming ? "animate-pulse" : ""}`}
        >
          <Mic size={48} />
        </div>
        {isStreaming && (
          <>
            <div className="absolute inset-0 w-32 h-32 rounded-full bg-blue-500 animate-ping opacity-25"></div>
            <div className="absolute inset-0 w-32 h-32 rounded-full bg-blue-400 animate-ping opacity-10 delay-300"></div>
          </>
        )}
      </div>

      {/* live transcript capture */}
      <div className="max-w-md w-full bg-slate-900/50 border-slate-800 rounded-2xl p-6 min-h-37.5 mb-8">
        <p className="text-slate-300 text-lg text-center italic">
          {transcript || (isStreaming ? "Listening..." : "Tap before Speaking")}
        </p>
      </div>

      <div className="flex gap-6">
        <button
          onClick={toggleStreaming}
          className={`p-6 rounded-full transition-all ${isStreaming ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {isStreaming ? <MicOff size={28} /> : <Mic size={28} />}
        </button>

        <button
          onClick={() => router.push("/")}
          className="p-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400"
        >
          <PhoneOff size={28} />
        </button>
      </div>
    </>
  );
}
