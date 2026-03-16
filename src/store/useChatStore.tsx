import { timeStamp } from "console";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { aiService } from "../services/aiService";
// message structure
export interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

interface ChatState {
  // state
  messages: Message[];
  connectionStatus: "connected" | "reconnecting" | "disconnected";
  voiceState: "idle" | "listening" | "processing" | "speaking";
  latency: number;

  // actions
  addMessage: (content: string, role: "user" | "ai") => string;
  updateMessageContent: (
    id: string,
    newContent: string,
    isStreaming?: boolean,
  ) => void;
  deleteMessageAfter: (id: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  sendMessage: (content: string, exits?: boolean) => void;
  getAIResponse: (content: string) => void;
  setVoiceState: (state: ChatState["voiceState"]) => void;
  setConnectionStatus: (status: ChatState["connectionStatus"]) => void;
  setLatency: (ms: number) => void;
  clearHistory: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Intial / default state
      messages: [],
      connectionStatus: "connected",
      voiceState: "idle",
      latency: 0,

      // actions in action :)
      addMessage: (content, role) => {
        const id = Math.random().toString(36).substring(7);
        const newMessage: Message = {
          id,
          role,
          content,
          timestamp: Date.now(),
          isStreaming: role === "ai",
        };

        set((state) => ({ messages: [...state.messages, newMessage] }));
        return id;
      },

      updateMessageContent: (id, newContent, isStreaming = false) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, content: newContent, isStreaming } : msg,
          ),
        })),

      deleteMessageAfter: (id) =>
        set((state) => {
          const index = state.messages.findIndex((m) => m.id === id);
          if (index == -1) return state;
          return { messages: state.messages.slice(0, index + 1) };
        }),

      editMessage: (messageId, newContent) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, content: newContent } : m,
          ),
        }));
      },

      sendMessage: async (content, exits = false) => {
        if (!exits) {
          get().addMessage(content, "user");
        }

        try {
          await get().getAIResponse(content);
        } catch (error) {
          console.log(error);
        }
      },

      getAIResponse: async (content) => {
        const aiId = get().addMessage("", "ai");
        get().setVoiceState("processing");

        try {
          await aiService.generateResponse(content, aiId);
        } catch (error) {
          console.log(error);
        } finally {
          get().setVoiceState("idle");
        }
      },
      setVoiceState: (voiceState) => set({ voiceState }),
      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
      setLatency: (latency) => set({ latency }),
      clearHistory: () => set({ messages: [] }),
    }),
    {
      name: "ai-tutor-storage",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({ messages: state.messages }),
    },
  ),
);
