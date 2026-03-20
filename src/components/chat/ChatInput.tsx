import { aiService } from "@/src/services/aiService";
import { useChatStore } from "@/src/store/useChatStore";
import { Loader2, Mic, MicOff, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const ChatInput = () => {
  const [text, setText] = useState("");
  const { setVoiceState, sendMessage, connectionStatus, voiceState } =
    useChatStore();

  // reference of chatInput box for vioce(SpeechRecognition instance)
  const recognitionRef = useRef<any>(null);

  // refernce to textarea for manula typing(DOM ref)
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const isDisconnected = connectionStatus === "disconnected";
  const isProcessing = voiceState === "processing";
  const isListening = voiceState === "listening";

  useEffect(() => {
    const winSpeech =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    // check browser support and if box is empty? if yes, it creates an instance and listener for future(intially off)
    if (winSpeech && !recognitionRef.current) {
      const recognition = new winSpeech();

      // mic stays open until manually call stop.
      recognition.continuous = true;
      // gives text in real-time not after i have don't speaking
      recognition.interimResults = true;

      // this is the ear(event listener)
      // onresult event is a nested object
      // for each sentence API gives multiple gusses ordered by confidence ([0] -> most likey guess)
      // as the event.results is not an array first convert this into an array and then apply array operation on it
      recognition.onresult = (event: any) => {
        //console.log([...event.results]);
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");

        if (!isProcessing) {
          setText(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech error", event.error);
        setVoiceState("idle");
      };

      recognitionRef.current = recognition;
      //console.log(recognitionRef)
    }
  }, [voiceState]);

  useEffect(() => {
    if (textAreaRef.current) {
      // reset default height to help it shrink whne text deleted or send
      textAreaRef.current.style.height = "auto";
      // maximum height can be 500px
      const newHeight = Math.min(textAreaRef.current.scrollHeight, 500);
      textAreaRef.current.style.height = `${newHeight}px`;
    }
  }, [text]);
  const handleSend = async () => {
    if (!text.trim() || isProcessing || isDisconnected) return;

    // Add user message to store
    const currInput = text;
    setText("");

    await sendMessage(currInput);
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setVoiceState("idle");

      if (text.trim()) handleSend();
    } else {
      setText("");
      recognitionRef.current?.start();
      setVoiceState("listening");
    }
  };

  return (
    <div
      className="rounded-xl p-4 transition-colors duration-300
                    border border-slate-200 bg-white
                    dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="max-w-3xl mx-auto flex gap-2 items-center">
        <button
          onClick={toggleMic}
          disabled={isDisconnected}
          className={`p-3 rounded-full transition-colors ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          } disabled:opacity-50`}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <div className="relative flex-1">
          <textarea
            ref={textAreaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // enter and shitf+enter difference
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              isDisconnected
                ? "Waiting for connection..."
                : "Ask you tutor anything..."
            }
            disabled={isDisconnected}
            className="w-full py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all resize-none scrollbar-hide
                               bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400
                               dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() || isProcessing || isDisconnected}
          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all
                           disabled:bg-slate-100 disabled:text-slate-400
                           dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
        >
          {isProcessing ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>

      {isListening && (
        <p className="text-center text-xs text-blue-500 dark:text-blue-400 mt-2 animate-pulse">
          Listening to your voice...
        </p>
      )}
    </div>
  );
};
