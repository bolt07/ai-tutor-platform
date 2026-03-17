"use client";

import { useChatStore } from "@/src/store/useChatStore";
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
import { connection } from "next/server";
import { useEffect, useState } from "react";

export const StatusPanel = () => {
  const { connectionStatus, voiceState, latency } = useChatStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isConnected = connectionStatus === "connected";
  const isSpeaking = voiceState === "speaking";
  const isListening = voiceState === "listening";

  if (!mounted) return null;

  return (
    <div
      className="mt-6 p-5 w-64 rounded-xl border flex flex-col transition-all duration-300
                    bg-white border-slate-200 text-slate-900 
                    dark:bg-slate-900 dark:border-slate-800 dark:text-white"
    >
      <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        System Status
      </h3>

      {/*connection section */}
      <div className="space-y-5 flext-1">
        <div className="flex items-center justify-between">
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
          <span className="text-xs text-slate-500">{latency}ms</span>
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
