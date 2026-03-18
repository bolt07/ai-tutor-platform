import { voiceSocket } from "@/src/services/voiceSocketService";
import { useVoiceState } from "@/src/store/useVoiceStore";
import { useCallback, useRef } from "react";

export const useAudioRecorder = () => {
  // make reference of media webapi object
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // mediaDeive interface to check mic permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      // event of mediarecoder (pass audio into blob)
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          voiceSocket.sendAudioChunk(event.data);
        }
      };

      // chop audio every 250ms
      mediaRecorder.start(250);
      useVoiceState.getState().setVoiceState("listening");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Allow microphone access.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();

      // stop all audio track given by getTrack()
      // getTrack return array of MediaStreamTrack(it contains info about each track) objects
      mediaRecorderRef.current.stream.getTracks().forEach((track) => {
        track.stop();
      });

      mediaRecorderRef.current = null;
      useVoiceState.getState().setVoiceState("idle");
    }
  }, []);

  return { startRecording, stopRecording };
};
