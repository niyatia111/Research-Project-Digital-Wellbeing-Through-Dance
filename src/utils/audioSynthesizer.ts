/**
 * Pure Web Audio API Ambient Ocean Synthesizer
 * Generates peaceful procedural sea surf, 432Hz ambient harmonic drones,
 * and singing bowl completion chimes with zero external audio assets.
 */

class OceanAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private isMuted = false;
  private masterGain: GainNode | null = null;
  private surfGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private droneOscillators: OscillatorNode[] = [];
  private lfoOsc: OscillatorNode | null = null;

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.surfGain = this.ctx.createGain();
    this.surfGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.surfGain.connect(this.masterGain);

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    this.droneGain.connect(this.masterGain);
  }

  public async start(): Promise<void> {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;

    this.startOceanSurf();
    this.startWarmDrone();
  }

  public stop(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    try {
      this.noiseNode?.stop();
      this.lfoOsc?.stop();
      this.droneOscillators.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          // ignore already stopped
        }
      });
      this.droneOscillators = [];
    } catch {
      // ignore
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.5, this.ctx.currentTime, 0.1);
    }
    return this.isMuted;
  }

  public setVolume(val: number): void {
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Generates procedural ocean waves using filtered pink noise swept with an LFO.
   */
  private startOceanSurf() {
    if (!this.ctx || !this.surfGain) return;

    const bufferSize = this.ctx.sampleRate * 6; // 6-second looping pink noise buffer
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Pink noise generation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    this.noiseNode = noise;

    // Resonant bandpass filter simulating water swell
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.2, this.ctx.currentTime);

    // LFO to sweep wave crests and troughs (~7-second natural wave cycle)
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.14, this.ctx.currentTime); // ~7.1s wave cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(240, this.ctx.currentTime); // sweep filter between 80Hz and 560Hz

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    // Dynamic wave swell volume
    const swellGain = this.ctx.createGain();
    const lfoVol = this.ctx.createGain();
    lfoVol.gain.setValueAtTime(0.25, this.ctx.currentTime);
    lfo.connect(lfoVol);
    lfoVol.connect(swellGain.gain);

    noise.connect(filter);
    filter.connect(swellGain);
    swellGain.connect(this.surfGain);

    noise.start();
    lfo.start();
    this.lfoOsc = lfo;
  }

  /**
   * Warm 432Hz ambient pentatonic sound bed (F - C - G - Eb)
   */
  private startWarmDrone() {
    if (!this.ctx || !this.droneGain) return;

    // Peaceful meditative frequencies (based on 432Hz natural pitch tuning)
    const freqs = [108, 162, 216, 288]; // Sub, Quint, Octave, Second octave

    this.droneOscillators = [];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (pan) {
        pan.pan.setValueAtTime((idx - 1.5) * 0.4, this.ctx.currentTime);
      }

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.04 / (idx + 1), this.ctx.currentTime);

      osc.connect(gain);
      if (pan) {
        gain.connect(pan);
        pan.connect(this.droneGain!);
      } else {
        gain.connect(this.droneGain!);
      }

      osc.start();
      this.droneOscillators.push(osc);
    });
  }

  /**
   * Plays a singing bowl chime when accuracy matches or completes.
   */
  public playSingingBowl(pitch: 'match' | 'complete' | 'chime' = 'match') {
    if (!this.ctx || this.isMuted) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const baseFreq = pitch === 'complete' ? 528 : pitch === 'chime' ? 432 : 396;
    const now = this.ctx.currentTime;

    // Fundamental + resonant overtones (mimics Tibetan singing bowl)
    const harmonics = [1, 2.76, 5.4, 8.9];
    const decays = [3.2, 2.4, 1.6, 0.9];
    const gains = [0.22, 0.12, 0.05, 0.02];

    harmonics.forEach((h, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * h, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(gains[i], now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decays[i]);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + decays[i] + 0.1);
    });
  }

  /**
   * Gentle water droplet note for subtle feedback
   */
  public playWaterDrop() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.13);
  }
}

export const oceanAudio = new OceanAudioSynthesizer();
