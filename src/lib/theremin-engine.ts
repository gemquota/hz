import {
  clamp,
  xToFreq,
  yToExpression,
  type Waveform,
} from "@/lib/pitch";

const WAVE_GAIN: Record<Waveform, number> = {
  sine: 0.84,
  triangle: 0.8,
  sawtooth: 0.5,
  square: 0.36,
};

const DETUNE_MIX: Record<Waveform, number> = {
  sine: 0,
  triangle: 0.2,
  sawtooth: 0.32,
  square: 0.24,
};

type Graph = {
  osc1: OscillatorNode;
  osc2: OscillatorNode;
  osc2Gain: GainNode;
  mix: GainNode;
  filter: BiquadFilterNode;
  vca: GainNode;
  hp: BiquadFilterNode;
  dry: GainNode;
  wet: GainNode;
  delay: DelayNode;
  revFilter: BiquadFilterNode;
  convolver: ConvolverNode;
  master: GainNode;
  compressor: DynamicsCompressorNode;
  analyser: AnalyserNode;
  lfo: OscillatorNode;
  vibrato: GainNode;
};

function makeImpulse(ctx: AudioContext) {
  const seconds = 2.2;
  const decay = 3.15;
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      const env = (1 - t) ** decay;
      const early = i < ctx.sampleRate * 0.03 ? 0.65 : 1;
      data[i] = (Math.random() * 2 - 1) * env * early;
    }
  }
  return buffer;
}

export class ThereminEngine {
  nx = 0.5;
  ny = 0.62;
  present = false;
  unlocked = false;
  muted = false;
  failed = false;
  wave: Waveform = "sine";
  reverb = 0.36;

  private ctx: AudioContext | null = null;
  private graph: Graph | null = null;
  private prevY = 0.62;
  private onVis = () => {
    if (document.visibilityState === "visible" && this.ctx?.state === "suspended") {
      void this.ctx.resume();
    }
  };

  unlock() {
    if (this.failed) return;
    try {
      if (!this.ctx) this.mount();
      if (this.ctx?.state === "suspended") void this.ctx.resume();
      this.unlocked = true;
      this.apply();
    } catch {
      this.failed = true;
    }
  }

  setHand(nx: number, ny: number, present: boolean) {
    this.nx = clamp(nx);
    this.ny = clamp(ny);
    this.present = present;
    this.apply();
  }

  setWave(wave: Waveform) {
    this.wave = wave;
    if (!this.graph) return;
    this.graph.osc1.type = wave;
    this.graph.osc2.type = wave;
    this.apply();
  }

  setReverb(mix: number) {
    this.reverb = clamp(mix);
    this.applyReverb();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.apply();
  }

  readTimeDomain(into: Uint8Array) {
    if (!this.graph) return false;
    this.graph.analyser.getByteTimeDomainData(into as Uint8Array<ArrayBuffer>);
    return true;
  }

  dispose() {
    document.removeEventListener("visibilitychange", this.onVis);
    if (!this.ctx) return;
    try {
      this.graph?.osc1.stop();
      this.graph?.osc2.stop();
      this.graph?.lfo.stop();
      void this.ctx.close();
    } catch {
      /* already stopped */
    }
    this.ctx = null;
    this.graph = null;
    this.unlocked = false;
  }

  private mount() {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) throw new Error("Web Audio is unavailable");
    const ctx = new Ctx({ latencyHint: "interactive" });
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc2Gain = ctx.createGain();
    const mix = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const vca = ctx.createGain();
    const hp = ctx.createBiquadFilter();
    const dry = ctx.createGain();
    const wet = ctx.createGain();
    const delay = ctx.createDelay(0.1);
    const revFilter = ctx.createBiquadFilter();
    const convolver = ctx.createConvolver();
    const master = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    const analyser = ctx.createAnalyser();
    const lfo = ctx.createOscillator();
    const vibrato = ctx.createGain();
    const pan1 = ctx.createStereoPanner();
    const pan2 = ctx.createStereoPanner();

    osc1.type = this.wave;
    osc2.type = this.wave;
    osc2.detune.value = 9;
    osc2Gain.gain.value = 0;
    filter.type = "lowpass";
    filter.frequency.value = 480;
    filter.Q.value = 0.55;
    vca.gain.value = 0;
    hp.type = "highpass";
    hp.frequency.value = 28;
    hp.Q.value = 0.7;
    delay.delayTime.value = 0.02;
    revFilter.type = "lowpass";
    revFilter.frequency.value = 6200;
    convolver.buffer = makeImpulse(ctx);
    master.gain.value = this.muted ? 0 : 0.82;
    compressor.threshold.value = -10;
    compressor.knee.value = 12;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.18;
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.75;
    lfo.type = "sine";
    lfo.frequency.value = 5.05;
    vibrato.gain.value = 0;
    pan1.pan.value = -0.28;
    pan2.pan.value = 0.28;

    osc1.connect(pan1).connect(mix);
    osc2.connect(osc2Gain).connect(pan2).connect(mix);
    mix.connect(filter).connect(vca).connect(hp);
    hp.connect(dry).connect(master);
    hp.connect(delay).connect(revFilter).connect(convolver).connect(wet).connect(master);
    master.connect(compressor).connect(analyser).connect(ctx.destination);
    lfo.connect(vibrato);
    vibrato.connect(osc1.frequency);
    vibrato.connect(osc2.frequency);

    osc1.start();
    osc2.start();
    lfo.start();

    this.ctx = ctx;
    this.graph = {
      osc1,
      osc2,
      osc2Gain,
      mix,
      filter,
      vca,
      hp,
      dry,
      wet,
      delay,
      revFilter,
      convolver,
      master,
      compressor,
      analyser,
      lfo,
      vibrato,
    };
    document.addEventListener("visibilitychange", this.onVis);
    this.applyReverb();
    if (ctx.state === "suspended") void ctx.resume();
  }

  private applyReverb() {
    if (!this.ctx || !this.graph) return;
    const now = this.ctx.currentTime;
    const wet = Math.sin(this.reverb * Math.PI * 0.5);
    const dry = Math.cos(this.reverb * Math.PI * 0.5);
    this.graph.dry.gain.setTargetAtTime(dry, now, 0.03);
    this.graph.wet.gain.setTargetAtTime(wet, now, 0.03);
  }

  private apply() {
    if (!this.ctx || !this.graph) return;
    const now = this.ctx.currentTime;
    const g = this.graph;
    const freq = xToFreq(this.nx);
    const expression = this.present ? yToExpression(this.ny) : 0;
    const upward = Math.max(0, this.prevY - this.ny);
    this.prevY = this.ny;
    const accent = Math.min(1, upward * 14);
    const level = expression * WAVE_GAIN[this.wave];
    const glide = this.present ? 0.042 : 0.07;

    g.osc1.frequency.setTargetAtTime(freq, now, glide);
    g.osc2.frequency.setTargetAtTime(freq, now, glide);
    g.vca.gain.setTargetAtTime(level, now, this.present ? 0.026 : 0.085);
    g.osc2Gain.gain.setTargetAtTime(this.present ? DETUNE_MIX[this.wave] : 0, now, 0.04);

    const cents = 5 + 11 * expression;
    const depth =
      this.present && !this.muted ? freq * (2 ** (cents / 1200) - 1) : 0;
    g.vibrato.gain.setTargetAtTime(depth, now, 0.1);

    const cutoff = 460 + expression ** 0.55 * 8600 + accent * 2800;
    g.filter.frequency.setTargetAtTime(Math.min(14000, cutoff), now, 0.05);
    g.master.gain.setTargetAtTime(this.muted ? 0 : 0.82, now, 0.018);
  }
}
