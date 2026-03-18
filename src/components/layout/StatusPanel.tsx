"use client";

import { useChatStore } from "@/src/store/useChatStore";
import { useVoiceState } from "@/src/store/useVoiceStore";
import {
  ActivityIcon,
  Headphones,
  MessageSquare,
  Mic,
  Moon,
  Sun,
  Volume2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { connection } from "next/server";
import { use, useEffect, useState } from "react";

export const StatusPanel = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  const isVoiceMode = pathname === "/voice";

  const chatConnection = useChatStore((state) => state.connectionStatus);
  const chatVoiceState = useChatStore((state) => state.voiceState);
  const chatLatency = useChatStore((state) => state.latency);

  const voiceConnection = useVoiceState((state) => state.connectionStatus);
  const voiceModeState = useVoiceState((state) => state.voiceState);
  const voiceLatency = useVoiceState((state) => state.latency);

  const currentConnection = isVoiceMode ? voiceConnection : chatConnection;
  const currentVoiceState = isVoiceMode ? voiceModeState : chatVoiceState;
  const currentLatency = isVoiceMode ? voiceLatency : chatLatency;

  const isConnected = currentConnection === "connected";
  const isSpeaking = currentVoiceState === "speaking";
  const isListening = currentVoiceState === "listening";

  if (!mounted) return null;

  return (
    <div
      className="mt-6 p-5 w-full rounded-xl border flex flex-col transition-all duration-300
                    bg-white border-slate-200 text-slate-900 
                    dark:bg-slate-900 dark:border-slate-800 dark:text-white"
    >
      <Link
        href={isVoiceMode ? "/" : "/voice"}
        className={`mb-6 w-full flex items-center justify-center gap-2 rounded-xl text-sm font-bold transtion-all shadow-sm hover:shadow-md ${
          isVoiceMode
            ? "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
            : "bg-purple-600 text-white hover:bg-purple-500"
        }`}
      >
        {isVoiceMode ? <MessageSquare size={18} /> : <Headphones size={18} />}
        <span>Switch to {isVoiceMode ? "Text Chat" : "Voice Chat"}</span>
      </Link>
      <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        System Status
      </h3>

      {/*connection section */}
      <div className="space-y-5 flext-1">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi size={18} className="text-green-400" />
            ) : (
              <WifiOff size={18} className="text-red-400" />
            )}
            <span className="text-sm font-medium">
              {isConnected ? "Connected" : "Reconnecting..."}
            </span>
          </div>
          <span className="text-xs text-slate-500">{currentLatency}ms</span>
        </div>
      </div>

      {/* Hardware section */}
      <div className="mt-4 space-y-3">
        <div
          className={`flex items-center gap-2 text-sm transition-colors ${isListening ? "text-blue-400" : "text-slate-500"}`}
        >
          <Mic size={18} className={isListening ? "animate-pulse" : ""} />
          <span>Microphone: {isListening ? "Active" : "Idle"}</span>
        </div>

        <div
          className={`flex items-center gap-2 text-sm transition-colors ${isSpeaking ? "text-purple-400" : "text-slate-500"}`}
        >
          <Volume2 size={18} className={isSpeaking ? "animate-bounce" : ""} />
          <span>Speaker: {isSpeaking ? "Playing" : "Idle"}</span>
        </div>
      </div>

      {/* Theme */}
      <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center justify-between p-2.5 rounded-lg text-sm font-medium transtion-colors
          bg-slate-100 hover:bg-slate-200 text-slate-900
          dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white"
        >
          <div>
            {theme === "dark" ? (
              <Sun size={16} className="text-yellow-500" />
            ) : (
              <Moon size={16} className="text-blue-600" />
            )}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </div>
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        </button>
      </div>
    </div>
  );
};
