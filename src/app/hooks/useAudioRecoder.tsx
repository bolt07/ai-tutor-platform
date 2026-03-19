import { voiceSocket } from "@/src/services/voiceSocketService";
import { useVoiceState } from "@/src/store/useVoiceStore";
import { useCallback, useRef } from "react";

function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);

  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return window.btoa(binary);
}

export const useAudioRecorder = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const { setVoiceState } = useVoiceState();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      await audioContext.audioWorklet.addModule("/audio-processor.js");

      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNodeRef.current = sourceNode;

      const workletNode = new AudioWorkletNode(audioContext, "pcm-processor");
      workletNodeRef.current = workletNode;

      sourceNode.connect(workletNode);
      workletNode.connect(audioContext.destination);

      workletNode.port.onmessage = (event) => {
        const base64Data = bufferToBase64(event.data);
        voiceSocket.sendBase64Audio(base64Data);
      };

      setVoiceState("listening");
    } catch (error) {
      console.log("Failed to start audio pipline:", error);
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
  }, [setVoiceState]);

  return { startRecording, stopRecording };
};
