import { aiService } from "@/src/services/aiService";
import { useChatStore } from "@/src/store/useChatStore";
import { Loader2, Mic, MicOff, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react"


export const ChatInput = () => {
    const [text, setText] = useState('');
    const {addMessage, voiceState, setVoiceState, connectionStatus} = useChatStore();

    const recognitionRef = useRef<any>(null);

    const isDisconnected = connectionStatus === 'disconnected';
    const isProcessing = voiceState === 'processing';
    const isListening = voiceState === 'listening';

    useEffect(() => {
        const winSpeech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if(winSpeech && !recognitionRef.current) {
            const recognition = new winSpeech();
            
            // mic stays open until manually call stop.
            recognition.continuous = true;
            // gives text in real-time not after i have don't speaking
            recognition.interimResults = true;
            
            // onresult event is a nested object
            // for each sentence API gives multiple gusses ordered by confidence ([0] -> most likey guess)
            // as the event.results is not an array first convert this into an array and then apply array operation on it
            recognition.onresult = (event: any) => {
                //console.log([...event.results]);
                const transcript = Array.from(event.results).map((result: any) => result[0].transcript).join('');
                setText(transcript);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech error", event.error);
                setVoiceState('idle');
            }
            
            recognitionRef.current = recognition;
            //console.log(recognitionRef)
        }
    }, [voiceState])

    const handleSend = async () => {
        if(!text.trim() || isProcessing || isDisconnected) return ;

        // Add user message to store
        addMessage(text, 'user');
        const currInput = text;
        setText('');

        await aiService.generateResponse(currInput);
    };

    const toggleMic = () => {
        if(isListening) {
            recognitionRef.current?.stop();
            setVoiceState('idle');

            if(text.trim()) handleSend();
        } else {
            setText('');
            recognitionRef.current?.start();
            setVoiceState('listening');
        }
    };


    return (
        <div className="rounded-xl border-slate-800 bg-slate-900 p-4">
            <div className="max-w-3xl mx-auto flex gap-2 items-center">
                <button onClick={toggleMic} disabled={isDisconnected} className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover: bg-slate-700'} disabled: opacity-50`}>
                {isListening ? <MicOff size={20}/> : <Mic size={20}/>}
                </button>

                <div className="relative flex-1">
                    <input type="text" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={isDisconnected ? "Waiting for connection..." : "Ask you tutor anything..."} disabled={isDisconnected} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
                </div>

                <button
                    onClick={handleSend}
                    disabled={!text.trim() || isProcessing || isDisconnected}
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disable:bg-slate-800 disabled:text-slate-600 transition-all"
                >
                    {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20}/>}
                </button>
            </div>

            {isListening && (
                <p className="text-center text-xs text-blue-400 mt-2 animate-pulse">
                    Listening to your voice...
                </p>
            )}
        </div>
    );
};