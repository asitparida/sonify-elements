import type { SoundDef } from 'sonify-elements';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private output: AudioNode | null = null;

  private init(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      // Compressor keeps volume comfortable regardless of system level:
      // quiet sounds get lifted, loud sounds get tamed
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -24;  // start compressing at -24dB
      comp.knee.value = 12;        // soft knee for natural feel
      comp.ratio.value = 4;        // 4:1 compression
      comp.attack.value = 0.003;   // fast attack to catch transients
      comp.release.value = 0.15;   // smooth release
      comp.connect(this.ctx.destination);
      this.output = comp;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private get dest(): AudioNode {
    return this.output || this.ctx!.destination;
  }

  play(soundDef: SoundDef): void {
    const ctx = this.init();
    const now = ctx.currentTime;

    switch (soundDef.type) {
      case 'tick':
        this.playTick(ctx, now, soundDef);
        break;
      case 'focus-ascend':
      case 'focus-descend':
        this.playTwoOverlapping(ctx, now, soundDef);
        break;
      case 'two-note-up':
      case 'two-note-down':
        this.playTwoNote(ctx, now, soundDef);
        break;
      case 'double-tap':
        this.playDoubleTap(ctx, now, soundDef);
        break;
      case 'three-note-up':
      case 'three-note-down':
        this.playThreeNote(ctx, now, soundDef);
        break;
      case 'sweep':
        this.playSweep(ctx, now, soundDef);
        break;
      case 'dtmf':
        this.playDtmf(ctx, now, soundDef);
        break;
    }
  }

  private playTick(ctx: AudioContext, now: number, s: SoundDef): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = s.oscType;
    osc.frequency.value = s.freqs[0] * (1 + (Math.random() - 0.5) * 0.06);
    // Start from a tiny value (not 0) so exponentialRamp works for both attack and decay
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(s.gain, now + s.attack);
    gain.gain.exponentialRampToValueAtTime(0.001, now + s.duration);
    osc.connect(gain).connect(this.dest);
    osc.start(now);
    osc.stop(now + s.duration + 0.01);
  }

  private playTwoOverlapping(ctx: AudioContext, now: number, s: SoundDef): void {
    const [f1, f2] = s.freqs;
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = s.oscType;
      osc.frequency.value = i === 0 ? f1 : f2;
      const t = now + i * 0.025;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(s.gain * (i === 0 ? 0.7 : 1), t + s.attack);
      gain.gain.exponentialRampToValueAtTime(0.001, t + s.duration * 0.7);
      osc.connect(gain).connect(this.dest);
      osc.start(t);
      osc.stop(t + s.duration);
    }
  }

  private playTwoNote(ctx: AudioContext, now: number, s: SoundDef): void {
    const [f1, f2] = s.freqs;
    const gap = 0.07;
    const noteDur = s.duration / 2.5;
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = s.oscType;
      osc.frequency.value = i === 0 ? f1 : f2;
      const t = now + i * gap;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(s.gain, t + s.attack);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDur);
      osc.connect(gain).connect(this.dest);
      osc.start(t);
      osc.stop(t + noteDur + 0.01);
    }
  }

  private playDoubleTap(ctx: AudioContext, now: number, s: SoundDef): void {
    const [f1, f2] = s.freqs;
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = s.oscType;
      osc.frequency.value = i === 0 ? f1 : f2;
      const t = now + i * 0.1;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(s.gain, t + s.attack);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain).connect(this.dest);
      osc.start(t);
      osc.stop(t + 0.08);
    }
  }

  private playThreeNote(ctx: AudioContext, now: number, s: SoundDef): void {
    const freqs = s.freqs;
    const gap = s.duration / 3.5;
    const noteDur = gap * 0.8;
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = s.oscType;
      osc.frequency.value = freqs[i];
      const t = now + i * gap;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(s.gain * (i === 2 ? 1 : 0.75), t + s.attack);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDur);
      osc.connect(gain).connect(this.dest);
      osc.start(t);
      osc.stop(t + noteDur + 0.01);
    }
  }

  private playSweep(ctx: AudioContext, now: number, s: SoundDef): void {
    const [fStart, fEnd] = s.freqs;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = s.oscType;
    osc.frequency.setValueAtTime(fStart, now);
    osc.frequency.linearRampToValueAtTime(fEnd, now + s.duration * 0.5);
    osc.frequency.linearRampToValueAtTime(fStart, now + s.duration);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(s.gain, now + s.attack);
    gain.gain.setValueAtTime(s.gain, now + s.duration - 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + s.duration);
    osc.connect(gain).connect(this.dest);
    osc.start(now);
    osc.stop(now + s.duration + 0.01);
  }
  private playDtmf(ctx: AudioContext, now: number, s: SoundDef): void {
    for (const freq of s.freqs) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(s.gain * 0.5, now + s.attack);
      gain.gain.setValueAtTime(s.gain * 0.5, now + s.duration - 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + s.duration);
      osc.connect(gain).connect(this.dest);
      osc.start(now);
      osc.stop(now + s.duration + 0.01);
    }
  }
}

export const audioEngine = new AudioEngine();
