export class AudioQueue {
  private audioContext: AudioContext | null = null;
  private queue: ArrayBuffer[] = [];
  private isPlaying: boolean = false;

  constructor() {}

  public unlockAudio() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext({ sampleRate: 16000 });
    }
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
  }
  private initContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext({ sampleRate: 16000 });
    }
  }

  public addChunk(base64Audio: string) {
    this.initContext();
    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    this.queue.push(bytes.buffer);

    if (!this.isPlaying) {
      this.playNext();
    }
  }

  private playNext() {
    if (this.queue.length === 0 || !this.audioContext) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift();

    if (!audioData) return;

    try {
      const int16Array = new Int16Array(audioData);
      const fload32Array = new Float32Array(int16Array);

      for (let i = 0; i < int16Array.length; i++) {
        fload32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = this.audioContext.createBuffer(
        1,
        fload32Array.length,
        16000,
      );

      audioBuffer.getChannelData(0).set(fload32Array);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      source.onended = () => {
        this.playNext();
      };
    } catch (error) {
      console.error("Error decoding audio chunk from AI:", error);
      this.playNext();
    }
  }

  public stopAndClear() {
    this.queue = [];
    this.isPlaying = false;
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const aiAudioQueue = new AudioQueue();
