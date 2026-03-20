// i have to implement a jitter buffer
// ai sends response in packets
// these packets arrive at different rate, hence can lead to jittering in voice
// we can add the ai response packets to a queue
// and will have to make the pop
// ai sends raw binary (use arrayBuffer)
// wait until a few packets arrive to start speaking
// ai sends raw 16-bit PCM audio, but browser or audioBuffer understand float32
// to have to convert this

export class AudioQueue {
  private audioContext: AudioContext | null = null;
  private queue: ArrayBuffer[] = [];
  private isPlaying: boolean = false;

  // how much time to play current chunk
  private nextStartTime: number = 0;

  constructor() {}

  // initate the audioContext, this is separte pipe(thread) from the
  // context used inside the useAudioRecorder for user audio.
  // it has a sample rate fo 24kHz
  private initContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext({ sampleRate: 24000 });
    }
  }

  public unlockAudio() {
    this.initContext();
    // is a context is paused before -> resume it
    if (this.audioContext?.state === "suspended") {
      this.audioContext.resume();
    }
  }

  // websocket.onmessage calls this function to add the raw-audio to queue
  public addChunk(rawBuffer: ArrayBuffer) {
    this.initContext();
    this.queue.push(rawBuffer);

    // start the scheduleQueue if it message is not playing
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.scheduleQueue();
    }
  }

  private scheduleQueue() {
    if (!this.audioContext) return;

    // traverse the queue until empty
    while (this.queue.length > 0) {
      // top-queue data
      const audioData = this.queue.shift();
      // if data empty continue;
      if (!audioData) continue;

      try {
        // convert int16 to float32 because browser understands float32
        const int16Array = new Int16Array(audioData);
        const float32Array = new Float32Array(int16Array.length);

        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] = int16Array[i] / 32768.0;
        }

        // crate a memory buffer on browser of store 24khz raw audio
        const audioBuffer = this.audioContext.createBuffer(
          1,
          float32Array.length,
          24000,
        );

        // store the raw audio to buffer
        audioBuffer.getChannelData(0).set(float32Array);

        // add the channel to source
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        // connect to speaker
        source.connect(this.audioContext.destination);

        // this helps in removing the jittering experienced
        // current time on audioContext clock
        const currentTime = this.audioContext.currentTime;

        // if starting new, since intialized audiocontext at the start
        // means there is this audio time is less then current clock time
        // or audio arrived late then re-set the audio schedule
        // then re-set this audio time to next schedule
        if (this.nextStartTime < currentTime) {
          this.nextStartTime = currentTime + 0.05;
        }

        // start playing audio
        source.start(this.nextStartTime);

        // advance the clock by the exact duration of this chunk
        this.nextStartTime += audioBuffer.duration;

        // last audio chunk, then end the playing audio
        if (this.queue.length === 0) {
          source.onended = () => {
            // double check if a new packet arrived in between
            if (this.queue.length === 0) {
              this.isPlaying = false;
            } else {
              this.scheduleQueue();
            }
          };
        }
      } catch (error) {
        console.error("Error decoding audio chunk from AI:", error);
      }
    }
  }

  public stopAndClear() {
    this.queue = [];
    this.isPlaying = false;
    this.nextStartTime = 0; // Reset the clock!
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const aiAudioQueue = new AudioQueue();
