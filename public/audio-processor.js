//https://medium.com/@tmelder/discover-the-power-of-web-audio-api-create-analyze-and-manipulate-audio-67359fe37acb
// it mentions audioWorklet for custom audio processing
class PCMProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const currentInput = inputs[0];

    if (currentInput && currentInput.length > 0) {
      const chanelData = currentInput[0];
      const pcm16 = new Int16Array(chanelData.length);

      for (let i = 0; i < chanelData.length; i++) {
        let s = Math.max(-1, Math.min(1, chanelData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      this.port.postMessage(pcm16.buffer);
    }

    return true;
  }
}

registerProcessor("pcm-processor", PCMProcessor);
