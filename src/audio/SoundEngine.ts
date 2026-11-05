import { World } from '../engine/World';
import { GameSettings } from '../types/physics';

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private lastBoomAt = 0;
  private lastZapAt = 0;
  private lastSizzleAt = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      const len = this.ctx.sampleRate * 0.6;
      this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const out = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) {
        out[i] = Math.random() * 2 - 1;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public tick(world: World, settings: GameSettings): void {
    if (!settings.soundEnabled || settings.soundVolume <= 0.01) return;
    const ev = world.events;
    if (
      ev.explosionEnergy <= 0 &&
      ev.electricArcCount <= 0 &&
      ev.sizzleCount <= 2 &&
      ev.fractureCount <= 2
    ) {
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx || !this.noiseBuffer) return;

    const now = ctx.currentTime;
    const vol = settings.soundVolume;

    if (ev.explosionEnergy > 2 && now - this.lastBoomAt > 0.09) {
      this.lastBoomAt = now;
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, now);
      filter.frequency.exponentialRampToValueAtTime(38, now + 0.45);

      const gain = ctx.createGain();
      const amp = Math.min(0.65, 0.14 + ev.explosionEnergy * 0.012) * vol;
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start(now);
      src.stop(now + 0.5);
    }

    if (ev.electricArcCount > 0 && now - this.lastZapAt > 0.07) {
      this.lastZapAt = now;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420 + Math.random() * 580, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.07);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    }

    if ((ev.sizzleCount > 3 || ev.fractureCount > 3) && now - this.lastSizzleAt > 0.08) {
      this.lastSizzleAt = now;
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(ev.fractureCount > 3 ? 950 : 3400, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start(now);
      src.stop(now + 0.11);
    }
  }
}
