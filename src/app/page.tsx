"use client";

import { GraduationCap, Trash2 } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { StatusPanel } from "../components/layout/StatusPanel";
import { MessageLists } from "../components/chat/MessageList";
import { ChatInput } from "../components/chat/ChatInput";
import { useEffect } from "react";

export default function Home() {
  const clearHistory = useChatStore((state) => state.clearHistory);

  return (
    <main className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* side bar - left */}
      <aside className="w-80 border-r border-slate-800 bg-slate-900/50 p-6 flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <GraduationCap className="text-white" size={24} />
          </div>
          <h1 className="font-bold text-xl tracking-tight">AI Tutor</h1>
        </div>

        <StatusPanel />

        <div>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear all messages?"))
                clearHistory();
            }}
            className="flex items-center gap-2 w-full p-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors text-sm font-medium"
          >
            <Trash2 size={18} />
            Clear Conversation
          </button>
        </div>
      </aside>

      {/* Main Chat */}
      <section className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-slate-800 flex items-center px-8 bg-slate-950/50 backdrop-blur-md z-10">
          <h2 className="text-sm font-medium text-slate-400">
            Current Chat: Dynamic Programming
          </h2>
        </header>

        <MessageLists />

        {/* Input */}
        <div className="p-6">
          <ChatInput />
          <p className="text-[10px] text-center text-slate-600 mt-4">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </section>
    </main>
  );
}
