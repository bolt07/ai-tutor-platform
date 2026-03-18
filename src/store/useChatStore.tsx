import { timeStamp } from "console";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { aiService } from "../services/aiService";
import { VirtuosoMessageListProps } from "@virtuoso.dev/message-list";
import { useSessionStore } from "./useSessionStore";

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
  chatData: VirtuosoMessageListProps<Message, null>["data"];
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
      chatData: { data: [] },
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
        set((state) => {
          const messages = state.chatData?.data ?? [];
          // wait until intial exchange is complete before allowing auto-scroll
          const shouldScroll = messages.length > 1;
          return {
            chatData: {
              // ? -> optional chaining and ?? -> nullish coalescing(prevent app from crashing if the chat data hasn't loaded yet or missing)
              // ?? -> check if value at left is null/undefined -> if yes then give right value
              data: [...messages, newMessage],
              scrollModifier: !shouldScroll
                ? undefined
                : {
                    type: "auto-scroll-to-bottom",
                    autoScroll: ({ scrollInProgress, atBottom }) => {
                      return {
                        index: "LAST",
                        align: "end",
                        behavior:
                          atBottom || scrollInProgress ? "smooth" : "auto",
                      };
                    },
                  },
            },
          };
        });
        return id;
      },

      updateMessageContent: (id, newContent, isStreaming = false) =>
        set((state) => ({
          chatData: {
            data: (state.chatData?.data ?? []).map((msg) =>
              msg.id === id
                ? { ...msg, content: newContent, isStreaming }
                : msg,
            ),
            // scrolling smoothly when AI types
            scrollModifier: {
              type: "items-change",
              behavior: "smooth",
            },
          },
        })),

      deleteMessageAfter: (id) =>
        set((state) => {
          const data = state.chatData?.data ?? [];
          const index = data.findIndex((m) => m.id === id);
          if (index === -1) return state;
          return {
            chatData: {
              data: data.slice(0, index + 1),
            },
          };
        }),

      editMessage: (messageId, newContent) => {
        set((state) => ({
          chatData: {
            data: (state.chatData?.data ?? []).map((msg) =>
              msg.id === messageId ? { ...msg, content: newContent } : msg,
            ),
          },
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

        const { userId, sessionId } = useSessionStore.getState();

        const queryRequest = {
          text: content,
          user_id: userId,
          session_id: sessionId,
        };

        try {
          const startTime = Date.now();

          const apiUrl = process.env.NEXT_PUBLIC_API_URL;

          const response = await fetch(`${apiUrl}/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(queryRequest),
          });

          if (!response.ok) {
            throw new Error("API call failed");
          }

          if (!response.body) {
            throw new Error("No response Body");
          }
          const result = await response.json();
          const endTime = Date.now();

          get().setLatency(endTime - startTime);
          get().updateMessageContent(
            aiId,
            result.response || "No response received",
            false,
          );
        } catch (error) {
          console.log("Backend error:", error);
          get().updateMessageContent(
            aiId,
            "failed to connect to backend.",
            false,
          );
        } finally {
          get().setVoiceState("idle");
        }
      },
      setVoiceState: (voiceState) => set({ voiceState }),
      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
      setLatency: (latency) => set({ latency }),
      clearHistory: () =>
        set({
          chatData: {
            data: [],
          },
        }),
    }),
    {
      name: "ai-tutor-storage",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        chatData: {
          data: state.chatData?.data ?? [],
        },
      }),
    },
  ),
);
