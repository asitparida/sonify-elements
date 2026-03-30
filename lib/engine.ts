import type { SoundDef } from './sounds';

/**
 * Self-contained Web Audio synthesis engine.
 * All sounds are generated live — no audio files.
 */
export class SoundEngine {
  private ctx: AudioContext | null = null;
  private output: AudioNode | null = null;
  private _volume = 1;

  get volume() { return this._volume; }
  set volume(v: number) { this._volume = Math.max(0, Math.min(1, v)); }

  private init(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -24;
      comp.knee.value = 12;
      comp.ratio.value = 4;
      comp.attack.value = 0.003;
      comp.release.value = 0.15;
      comp.connect(this.ctx.destination);
      this.output = comp;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  private get dest(): AudioNode {
    return this.output || this.ctx!.destination;
  }

  play(s: SoundDef): void {
    const ctx = this.init();
    const now = ctx.currentTime;
    const vol = this._volume;

    switch (s.type) {
      case 'tick':              this.tick(ctx, now, s, vol); break;
      case 'focus-ascend':
      case 'focus-descend':     this.twoOverlapping(ctx, now, s, vol); break;
      case 'two-note-up':
      case 'two-note-down':     this.twoNote(ctx, now, s, vol); break;
      case 'double-tap':        this.doubleTap(ctx, now, s, vol); break;
      case 'three-note-up':
      case 'three-note-down':   this.threeNote(ctx, now, s, vol); break;
      case 'dtmf':              this.dtmf(ctx, now, s, vol); break;
    }
  }

  private osc(ctx: AudioContext, freq: number, type: OscillatorType, t0: number, t1: number, gain: number, vol: number, attack = 0.003) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(gain * vol, 0.002), t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.001, t1);
    o.connect(g).connect(this.dest);
    o.start(t0);
    o.stop(t1 + 0.01);
  }

  private tick(ctx: AudioContext, now: number, s: SoundDef, vol: number) {
    const freq = s.freqs[0] * (1 + (Math.random() - 0.5) * 0.06);
    this.osc(ctx, freq, s.oscType, now, now + s.duration, s.gain, vol, s.attack);
  }

  private twoOverlapping(ctx: AudioContext, now: number, s: SoundDef, vol: number) {
    this.osc(ctx, s.freqs[0], s.oscType, now, now + s.duration * 0.7, s.gain * 0.7, vol);
    this.osc(ctx, s.freqs[1], s.oscType, now + 0.025, now + s.duration, s.gain, vol);
  }

  private twoNote(ctx: AudioContext, now: number, s: SoundDef, vol: number) {
    const gap = 0.07;
    const nd = s.duration / 2.5;
    this.osc(ctx, s.freqs[0], s.oscType, now, now + nd, s.gain, vol);
    this.osc(ctx, s.freqs[1], s.oscType, now + gap, now + gap + nd, s.gain, vol);
  }

  private doubleTap(ctx: AudioContext, now: number, s: SoundDef, vol: number) {
    this.osc(ctx, s.freqs[0], s.oscType, now, now + 0.06, s.gain, vol);
    this.osc(ctx, s.freqs[1], s.oscType, now + 0.1, now + 0.16, s.gain, vol);
  }

  private threeNote(ctx: AudioContext, now: number, s: SoundDef, vol: number) {
    const gap = s.duration / 3.5;
    const nd = gap * 0.8;
    for (let i = 0; i < 3; i++) {
      const t = now + i * gap;
      this.osc(ctx, s.freqs[i], s.oscType, t, t + nd, s.gain * (i === 2 ? 1 : 0.75), vol);
    }
  }

  private dtmf(ctx: AudioContext, now: number, s: SoundDef, vol: number) {
    for (const freq of s.freqs) {
      this.osc(ctx, freq, 'sine', now, now + s.duration, s.gain * 0.5, vol);
    }
  }
}
