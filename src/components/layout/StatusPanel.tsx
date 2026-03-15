import { useChatStore } from "@/src/store/useChatStore";
import {
  ActivityIcon,
  Mic,
  Moon,
  Sun,
  Volume2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { connection } from "next/server";

export const StatusPanel = () => {
  const { connectionStatus, voiceState, latency } = useChatStore();

  const isConnected = connectionStatus === "connected";
  const isSpeaking = voiceState === "speaking";
  const isListening = voiceState === "listening";

  return (
    <div className="mt-6 p-4 bg-slate-900 text-white rounded-lg border border-slate-700 space-y-4 w-64">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
        System Status
      </h3>

      {/*connection section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi size={18} className="text-green-400" />
          ) : (
            <WifiOff size={18} className="text-red-400" />
          )}
          <span className="text-sm">
            {isConnected ? "Connected" : "Reconnecting..."}
          </span>
        </div>
        <span className="text-xs text-slate-500">{latency}ms</span>
      </div>

      {/* Hardware section */}
      <div className="space-y-2">
        <div
          className={`flex items-center gap-2 text-sm ${isListening ? "text-blue-400" : "text-slate-500"}`}
        >
          <Mic size={18} className={isListening ? "animate-pulse" : ""} />
          <span>Microphone: {isListening ? "Active" : "Idle"}</span>
        </div>

        <div
          className={`flex items-center gap-2 text-sm ${isSpeaking ? "text-purple-400" : "text-slate-500"}`}
        >
          <Volume2 size={18} className={isSpeaking ? "animate-bounce" : ""} />
          <span>Speaker: {isSpeaking ? "Playing" : "Idle"}</span>
        </div>
      </div>
    </div>
  );
};
