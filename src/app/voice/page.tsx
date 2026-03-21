"use client";

import { useVoiceState } from "@/src/store/useVoiceStore";
import { useAudioRecorder } from "./hooks/useAudioRecoder";
import { useEffect, useState } from "react";
import { voiceSocket } from "@/src/services/voiceSocketService";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  Loader,
  Menu,
  Mic,
  Square,
  Volume2,
  X,
} from "lucide-react";
import { StatusPanel } from "@/src/app/Common/StatusPanel";
import { aiAudioQueue } from "@/src/services/audioQueueService";

export default function VoiceChat() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const { voiceState, setVoiceState } = useVoiceState();
  const { startRecording, stopRecording } = useAudioRecorder();

  useEffect(() => {
    voiceSocket.connect();
    // clean up
    return () => {
      stopRecording();
      voiceSocket.disconnect();
      //useVoiceState.getState().resetTranscript();
    };
  }, [stopRecording]);

  // whenever voice-state changes this effect runs to change the ui and stops the recording is required
  useEffect(() => {
    if (voiceState === "speaking" || voiceState === "idle") {
      stopRecording();
    }
  }, [voiceState, stopRecording]);

  const togglesideBar = () => setIsSideBarOpen(!isSideBarOpen);

  const handleMicToggle = () => {
    if (voiceState === "idle") {
      aiAudioQueue.unlockAudio();
      startRecording();
    } else if (voiceState === "speaking") {
      aiAudioQueue.stopAndClear();
      setVoiceState("idle");
    }
  };

  // styles for different voiceState
  const getVoiceCircleStyle = () => {
    switch (voiceState) {
      case "listening":
        return "bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.6)] animate-pulse scale-110";
      case "processing":
        return "bg-yellow-500 border-4 border-dashed border-yellow-200 animate-[spin_3s_linear_infinite]";
      case "speaking":
        return "bg-purple-600 shadow-[0_0_80px_rgba(147,51,234,0.8)] animate-bounce";
      default: // idle
        return "bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:scale-105 transition-transform";
    }
  };

  return (
    <main className="flex flex-col md:flex-row h-[100dvh] overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* for small screens */}
      <div className="md:hidden flex shrink-0 items-center justify-between p-4 border-b dark:border-slate-800 bg-white dark:bg-slate-900 z-50">
        <div className="flex items-center gap-2">
          <GraduationCap size={24} className="text-blue-600" />
          <h1 className="font-bold text-lg">AI Tutor</h1>
        </div>
        <button onClick={togglesideBar}>
          {isSideBarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <aside
        className={`${
          isSideBarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        } md:translate-x-0 md:static fixed inset-y-0 left-0 z-40 w-72 md:w-80 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6 bg-white dark:bg-slate-900 transition-transform duration-300 ease-in-out`}
      >
        <div className="hidden md:flex items-center gap-3 px-2">
          <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
            <GraduationCap size={24} className="text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-light">AI Tutor</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <StatusPanel />
        </div>
      </aside>
      {/* mobile side bar */}
      {isSideBarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSideBarOpen(false)}
        ></div>
      )}
      {/* Voice */}
      <section className="flex-1 flex flex-col relative items-center p-8">
        {/* center voice glowing */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_60%)] pointer-events-none" />

        <div className="shrink-0 pt-4 z-10">
          <div className="px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm uppercase tracking-[0.2em] text-xs font-bold text-slate-500 dark:text-slate-400 shadow-sm">
            {voiceState === "idle" && "Ready to Talk"}
            {voiceState === "listening" && (
              <span className="text-red-500">"Listening..."</span>
            )}
            {voiceState === "processing" && (
              <span className="text-blue-500">"Thinking..."</span>
            )}
            {voiceState === "speaking" && (
              <span className="text-purple-500">"AI Speaking"</span>
            )}
          </div>
        </div>

        {/* animation voice circle */}
        <div className="flex-1 flex items-center justify-center w-full max-w-md">
          <button
            onClick={handleMicToggle}
            className={`cursor-pointer hover:opacity-90 active:scale-95 w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out ${getVoiceCircleStyle()}`}
          >
            {voiceState === "idle" && (
              <Mic size={48} className="text-white opacity-90" />
            )}
            {voiceState === "listening" && (
              <Mic size={48} className="text-white" />
            )}
            {voiceState === "processing" && (
              <Loader size={48} className="text-blue-400" />
            )}
            {voiceState === "speaking" && (
              <Volume2 size={48} className="text-white" />
            )}
          </button>
        </div>
      </section>
    </main>
  );
}
