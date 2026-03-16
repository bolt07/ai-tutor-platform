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
    <main
      className="flex h-screen overflow-hidden transition-colors duration-300
                     bg-slate-50 text-slate-900 
                     dark:bg-slate-950 dark:text-slate-100"
    >
      {/* side bar - left */}
      <aside
        className="w-80 border-r p-6 flex flex-col gap-6
                        bg-white border-slate-200 
                        dark:bg-slate-900/50 dark:border-slate-800"
      >
        <div className="flex items-center gap-3 px-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <GraduationCap className="text-white" size={24} />
          </div>
          <h1 className="font-bold text-xl tracking-tight">AI Tutor</h1>
        </div>

        <div className="flex-1">
          <StatusPanel />
        </div>

        <div>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear all messages?"))
                clearHistory();
            }}
            className="flex items-center gap-2 w-full p-3 rounded-xl transition-colors text-sm font-medium
                       hover:bg-red-500/10 text-red-500 dark:text-red-400"
          >
            <Trash2 size={18} />
            Clear Conversation
          </button>
        </div>
      </aside>

      {/* Main Chat */}
      <section className="flex-1 flex flex-col relative bg-white dark:bg-slate-950">
        <header
          className="h-16 border-b flex items-center px-8 backdrop-blur-md z-10
                           bg-white/50 border-slate-200 
                           dark:bg-slate-950/50 dark:border-slate-800"
        >
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Current Chat:{" "}
            <span className="text-slate-900 dark:text-slate-100">
              Dynamic Programing
            </span>
          </h2>
        </header>

        <MessageLists />

        {/* Input */}
        <div className="p-6 border-t border-slate-100 dark:border-transparent">
          <ChatInput />
          <p className="text-[10px] text-center mt-4 text-slate-400 dark:text-slate-600">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </section>
    </main>
  );
}
