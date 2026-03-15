import { Message, useChatStore } from "@/src/store/useChatStore";
import { Bot, Copy, Play, RotateCcw, User } from "lucide-react";

interface Props {
  message: Message;
}
export const MessageBubble = ({ message }: Props) => {
  const { setVoiceState } = useChatStore();

  const isAI = message.role === "ai";
  const deleteAfter = useChatStore((state) => state.deleteMessageAfter);

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
    utterance.onstart = () => {
      setVoiceState("speaking");
    };

    utterance.onend = () => {
      setVoiceState("idle");
    };

    utterance.onerror = () => {
      setVoiceState("idle");
    };

    // future -> have to make voice more soothing to ears(read more about)
    // or make it custom, so that user can decide which voice to hear
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex gap-4 ${isAI ? "justify-start" : "justify-end"}`}>
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Bot size={18} className="text-white" />
        </div>
      )}

      <div className={`max-w-[80%] space-y-2`}>
        <div
          className={`p-4 rounded-2xl ${
            isAI
              ? "bg-slate-800 text-slate-100 rounded-tl-none border-slate-700"
              : "bg-blue-600 text-white rounded-tr-none"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-blue-400 animate-pulse" />
            )}
          </p>
        </div>

        {isAI && !message.isStreaming && (
          <div className="flex items-cener gap-3 ml-1 text-slate-500">
            <button
              onClick={handleCopy}
              className="hover:text-white transition-colors"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={handlePlay}
              className="hover:text-white transition-colors"
            >
              <Play size={14} />
            </button>

            {/* this button right now doesn't handle retries properly
            it just deletes the messages send after a certain message.
            PENDING!!!! */}
            <button
              onClick={() => deleteAfter(message.id)}
              className="hover:text-white transtion-colors"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        )}
      </div>

      {!isAI && (
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
          <User size={18} className="text-white" />
        </div>
      )}
    </div>
  );
};
