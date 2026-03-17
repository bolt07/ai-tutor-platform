import { Message, useChatStore } from "@/src/store/useChatStore";
import {
  Bot,
  Check,
  Copy,
  Pencil,
  Play,
  RotateCcw,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

interface Props {
  message: Message;
}

export const MessageBubble = ({ message }: Props) => {
  const { setVoiceState, editMessage, sendMessage, deleteMessageAfter } =
    useChatStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  const isAI = message.role === "ai";

  const handleEdit = () => {
    if (editText.trim() === "") return;

    editMessage(message.id, editText);
    deleteMessageAfter(message.id);

    sendMessage(editText, true);
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  // text-to-speech(handlePlay)
  // speech sysnthesis webAPi
  const handlePlay = () => {
    // already speaking
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      // update the state of speaker in statusPanel
      setVoiceState("idle");
      return;
    }
    // get the message to read
    const utterance = new SpeechSynthesisUtterance(message.content);

    // event listeners to handle the speaker status
    utterance.onstart = () => setVoiceState("speaking");

    utterance.onend = () => setVoiceState("idle");

    utterance.onerror = () => setVoiceState("idle");

    // future -> have to make voice more soothing to ears(read more about)
    // or make it custom, so that user can decide which voice to hear
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  const handleRetry = () => {
    const allMessages = useChatStore.getState().chatData?.data ?? [];
    const currentIndex = allMessages.findIndex((m) => m.id === message.id);

    if (currentIndex > 0) {
      const prevMessage = allMessages[currentIndex - 1];

      if (prevMessage.role === "user") {
        deleteMessageAfter(prevMessage.id);
        sendMessage(prevMessage.content, true);
      }
    }
  };

  return (
    <div
      className={`group mb-6 flex gap-4 will-change-transform ${isAI ? "justify-start" : "justify-end"}`}
    >
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <Bot size={18} className="text-white" />
        </div>
      )}

      <div className={`max-w-[80%] space-y-2`}>
        <div
          className={`p-4 rounded-2xl transition-colors duration-300 border ${
            isAI
              ? "rounded-tl-none bg-slate-100 border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              : "rounded-tr-none bg-blue-600 border-blue-600 text-white shadow-md"
          }`}
        >
          {/* Editing mode-ON */}
          {!isAI && isEditing ? (
            <div>
              <textarea
                autoFocus
                className="w-full bg-blue-700 text-white rounded-lg p-2 text-sm outline-none border border-blue-400 focus:ring-1 focus:ring-white min-h-20 resize-none"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(message.content);
                  }}
                >
                  <X size={16} />
                </button>
                <button
                  onClick={handleEdit}
                  className="p-1 bg-white text-blue-600 hover:bg-slate-100 rounded transition-colors"
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-blue-400 animate-pulse" />
              )}
            </p>
          )}
        </div>

        {isAI && !message.isStreaming && (
          <div className="flex items-center gap-3 ml-1 text-slate-400 dark:text-slate-500">
            <button
              onClick={handleCopy}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={handlePlay}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Play size={14} />
            </button>

            {/* this button right now doesn't handle retries properly
            it just deletes the messages send after a certain message.
            PENDING!!!! -> DONE */}
            <button
              onClick={handleRetry}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        )}
        {/* Edit pencil icon */}
        {!isAI && !isEditing && (
          <div className="flex justify-end pr-1">
            <button
              onClick={() => setIsEditing(true)}
              className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            >
              <Pencil size={14} />
            </button>
          </div>
        )}
      </div>

      {!isAI && (
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
          <User size={18} className="text-slate-600 dark:text-white" />
        </div>
      )}
    </div>
  );
};
