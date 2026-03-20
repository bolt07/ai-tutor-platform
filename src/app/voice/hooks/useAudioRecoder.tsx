import { voiceSocket } from "@/src/services/voiceSocketService";
import { useVoiceState } from "@/src/store/useVoiceStore";
import { useCallback, useRef } from "react";

export const useAudioRecorder = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const { setVoiceState } = useVoiceState();

  const startRecording = useCallback(async () => {
    setVoiceState("listening");
    try {
      // browswer permission for using mic(FUTURE UPDATE into a pop to ask persion)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // setup AudioContext (16kHz) , it also starts a separt thread then our react-main thread
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      // add audio-processor code to browser
      await audioContext.audioWorklet.addModule("/audio-processor.js");

      // adds the mic as sourceNode
      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNodeRef.current = sourceNode;

      // worklet handle the convertion of float32 into int16 by using pcm-processor
      const workletNode = new AudioWorkletNode(audioContext, "pcm-processor");
      workletNodeRef.current = workletNode;

      // simple connect the source to microphone
      sourceNode.connect(workletNode);

      // it is very interesting, context.destination is device speakers
      // but we have already connected worklet to audio-processor
      // audio processor convert to pcm16 send to socket
      // have to use audioContext.destination not directly connect to audio-prcoessor
      // speaker need to be connected otherwise browser stops the mic
      workletNode.connect(audioContext.destination);

      // now have to access the pcm16 data saved on Audio-thread or browser
      // and send it to server
      workletNode.port.onmessage = (event) => {
        voiceSocket.sendRawAudio(event.data);
      };
    } catch (error) {
      console.log("Failed to start audio pipline:", error);
      setVoiceState("idle");
    }
  }, [setVoiceState]);

  const stopRecording = useCallback(() => {
    if (workletNodeRef.current) workletNodeRef.current.disconnect();
    if (sourceNodeRef.current) sourceNodeRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    workletNodeRef.current = null;
    sourceNodeRef.current = null;
    audioContextRef.current = null;
    mediaStreamRef.current = null;

    setVoiceState("idle");
  }, []);

  return { startRecording, stopRecording };
};
