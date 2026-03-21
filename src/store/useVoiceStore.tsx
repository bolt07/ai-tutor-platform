import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface VoiceState {
  // states
  connectionStatus: "connected" | "reconnecting" | "disconnected";
  voiceState: "idle" | "listening" | "processing" | "speaking";
  latency: number;

  // actions
  setConnectionStatus: (status: VoiceState["connectionStatus"]) => void;
  setVoiceState: (state: VoiceState["voiceState"]) => void;
  setLatency: (ms: number) => void;
  // setPartialTranscript: (text: string) => void;
  // setFinalTranscript: (text: string) => void;
  //resetTranscript: () => void;
}

export const useVoiceState = create<VoiceState>()(
  persist(
    (set) => ({
      // initial state
      connectionStatus: "disconnected",
      voiceState: "idle",
      latency: 0,

      setConnectionStatus: (status) => set({ connectionStatus: status }),

      setVoiceState: (voiceState) => set({ voiceState }),

      setLatency: (latency) => set({ latency }),
    }),
    {
      name: "voice-session-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
