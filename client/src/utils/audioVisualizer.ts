export class AudioAnalyserHelper {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphoneStream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private isAnalyzing = false;

  public async startMicrophone(onVolumeChange: (vol: number) => void) {
    try {
      this.microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;

      this.source = this.audioCtx.createMediaStreamSource(this.microphoneStream);
      this.source.connect(this.analyser);
      this.isAnalyzing = true;

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!this.isAnalyzing || !this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalizedVol = Math.min(100, Math.round((average / 128) * 100));
        onVolumeChange(normalizedVol);

        requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn('Could not initialize microphone analyser:', err);
    }
  }

  public stopMicrophone() {
    this.isAnalyzing = false;
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach((t) => t.stop());
      this.microphoneStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
