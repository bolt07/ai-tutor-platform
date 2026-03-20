"use client";

import { GraduationCap, Menu, Trash2, X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { StatusPanel } from "../components/layout/StatusPanel";
import { MessageLists } from "../components/chat/MessageList";
import { ChatInput } from "../components/chat/ChatInput";
import { useEffect, useState } from "react";

export default function Home() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const clearHistory = useChatStore((state) => state.clearHistory);

  const togglesideBar = () => setIsSideBarOpen(!isSideBarOpen);
  return (
    <main
      className="flex flex-col md:flex-row h-[100dvh] overflow-hidden transition-colors duration-300
                     bg-slate-50 text-slate-900 
                     dark:bg-slate-950 dark:text-slate-100"
    >
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

      {/* side bar - left */}
      <aside
        className={`${isSideBarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static fixed inset-y-0 left-0 z-40 w-72 md:w-80 border-r p-6 flex flex-col gap-6 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 transition-transform duration-300 ease-in-out`}
      >
        <div className="hidden md:flex items-center gap-3 px-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <GraduationCap className="text-white" size={24} />
          </div>
          <h1 className="font-bold text-xl tracking-tight">AI Tutor</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <StatusPanel />
        </div>

        <div className="pt-4 border-t dark:border-slate-800">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear all messages?"))
                clearHistory();
              setIsSideBarOpen(false);
            }}
            className="flex items-center gap-2 w-full p-3 rounded-xl transition-colors text-sm font-medium
                       hover:bg-red-500/10 text-red-500 dark:text-red-400"
          >
            <Trash2 size={18} />
            Clear Conversation
          </button>
        </div>
      </aside>

      {/* mobile side bar */}
      {isSideBarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSideBarOpen(false)}
        ></div>
      )}
      {/* Main Chat */}
      <section className="flex-1 flex flex-col min-h-0 relative bg-white dark:bg-slate-950 overflow-hidden">
        <header
          className="hidden md:flex h-16 shrink-0 border-b items-center px-4 md:px-8 backdrop-blur-md z-10
                           bg-white/50 border-slate-200 
                           dark:bg-slate-950/50 dark:border-slate-800"
        >
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
            Current Chat:{" "}
            <span className="text-slate-900 dark:text-slate-100">
              Dynamic Programing
            </span>
          </h2>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <MessageLists />
        </div>

        {/* Input */}
        <div className="shrink-0 p-4 md:p-6 border-t border-slate-100 dark:border-transparent">
          <ChatInput />
          <p className="text-[10px] text-center mt-4 text-slate-400 dark:text-slate-600">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </section>
    </main>
  );
}
