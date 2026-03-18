// this service handles:
//1. connecting to WebSocket(if it doesn't exists)
// ws.websocket(), onopen, onmessage, onerror mainly use
// onopen -> this checks when a websocket connection start/opens
// so onopen will update our connectionStatus
// onmessage -> when message starting
// so onmessage will handle our transcrption state(partial or full)?? i think(whne user is speaking)
// when ai is speaking onmessage updates our voiceState
// onerror -> whenever a error occurs during the streaming
// i think we can start our expontianl backoff here (3 attemps)
// HOW TO HANDLE EXPONTIONAL BACKOFF? it is simple i think
// int count = 0
// function() starts
// if(count < MAX)
// delay = pow(2, cnt) seconds
// count++;
// else
// maxium attempts reached -> disconnect
// kal subha karte hai ab ye

import { use } from "react";
import { useVoiceState } from "../store/useVoiceStore";
import { useChatStore } from "../store/useChatStore";
import { useSessionStore } from "../store/useSessionStore";

// we have to make class and wrap
class voiceSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  constructor() {}
  // whole connections logic inside this
  connect() {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const {
      setConnectionStatus,
      setVoiceState,
      setPartialTranscript,
      setFinalTranscript,
    } = useVoiceState.getState();

    const { userId, sessionId } = useSessionStore.getState();
    setConnectionStatus(
      this.reconnectAttempts > 0 ? "reconnecting" : "connected",
    );

    try {
      const socketURL = process.env.NEXT_PUBLIC_VOICE_API;
      this.ws = new WebSocket(
        `${socketURL}?user_id=${userId}&session_id=${sessionId}`,
      );

      this.ws.onopen = () => {
        console.log("Websocket Connected");
        this.reconnectAttempts = 0;
        setConnectionStatus("connected");
      };

      this.ws.onmessage = (event) => {
        console.log("new chunk:");
        console.log("data.type:", typeof event.data);
        console.log("raw data", event.data);

        if (event.data instanceof Blob) {
          console.log("This is binary blob");
          return;
        }

        if (event.data instanceof ArrayBuffer) {
          console.log("This is an array buffer");
          return;
        }
        try {
          const data = JSON.parse(event.data);
          if (data.type === "transcript_partial") {
            setPartialTranscript(data.text);
            setFinalTranscript("");
          } else if (data.type === "transcript_final") {
            setFinalTranscript(data.text);
            setPartialTranscript("");
          } else if (data.type == "ai_speaking_start") {
            setVoiceState("speaking");
          } else if (data.type === "ai_speaking_stop") {
            setVoiceState("idle");
          }
        } catch (error) {
          console.warn("Message is plain text", error);
        }
      };

      this.ws.onclose = (event) => {
        console.error(`SOCKET CLOESED!`);
        console.error(`Codde: ${event.code}`);
        console.error(`Reason: ${event.reason || "No reason provided"}`);
        console.error(`Was clean: ${event.wasClean}`);

        setConnectionStatus("disconnected");
        setVoiceState("idle");

        if (!event.wasClean) {
          this.handleExponentialBackoff();
        }
      };

      this.ws.onerror = (error) => {
        console.log("Websocket error:", error);
      };
    } catch (error) {
      console.error("Failed to connect to socket:", error);
      this.handleExponentialBackoff();
    }
  }

  private handleExponentialBackoff() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      useVoiceState.getState().setConnectionStatus("reconnecting");

      const delay = Math.pow(2, this.reconnectAttempts) * 1000;

      console.log(
        `Reconnecting in ${delay}ms...(Attemp ${this.reconnectAttempts + 1})`,
      );

      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    } else {
      console.error("Maximum attempts reached");
      useVoiceState.getState().setConnectionStatus("disconnected");
    }
  }

  sendAudioChunk(chunk: Blob | ArrayBuffer) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(chunk);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, "User manually disconnted");
      this.ws = null;
    }
  }
}

export const voiceSocket = new voiceSocketService();
