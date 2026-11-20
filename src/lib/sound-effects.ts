// Promax Premium Web Audio API Micro-Sound Engine (Zero external assets, 0ms latency)

const SOUND_STORAGE_KEY = "promax_sound_enabled";

class PromaxSoundEngine {
  private ctx: AudioContext | null = null;
  private lastTapTs = 0;

  public isEnabled(): boolean {
    if (typeof window === "undefined") return true;
    try {
      const saved = localStorage.getItem(SOUND_STORAGE_KEY);
      return saved === null ? true : saved === "true";
    } catch {
      return true;
    }
  }

  public setEnabled(enabled: boolean): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
      window.dispatchEvent(new CustomEvent("promax_sound_toggled", { detail: enabled }));
    } catch {}
  }

  public toggle(): boolean {
    const next = !this.isEnabled();
    this.setEnabled(next);
    if (next) {
      this.playTap(true);
    }
    return next;
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private tone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    gainPeak: number,
    type: OscillatorType = "sine",
    delay = 0
  ) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, now);
      if (freqEnd !== freqStart) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);
      }
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(gainPeak, now + Math.min(0.008, duration * 0.25));
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.01);
    } catch {}
  }

  /** Subtle tactile pop for buttons & controls */
  public playTap(force = false) {
    if (!force && !this.isEnabled()) return;
    const now = performance.now();
    if (now - this.lastTapTs < 45) return;
    this.lastTapTs = now;
    this.tone(680, 420, 0.028, 0.042, "sine");
  }

  /** Soft airy tick when navigating to another page/tab */
  public playNavigate() {
    if (!this.isEnabled()) return;
    const now = performance.now();
    if (now - this.lastTapTs < 60) return;
    this.lastTapTs = now;
    this.tone(440, 620, 0.055, 0.04, "sine");
  }

  /** Gentle rising chime when opening a sheet/modal */
  public playModalOpen() {
    if (!this.isEnabled()) return;
    this.tone(420, 560, 0.06, 0.045, "sine", 0);
    this.tone(560, 740, 0.07, 0.04, "sine", 0.035);
  }

  /** Bright Duolingo-style coin reward chime */
  public playCoin() {
    if (!this.isEnabled()) return;
    this.tone(987.77, 987.77, 0.09, 0.085, "sine", 0);      // B5
    this.tone(1318.51, 1318.51, 0.22, 0.09, "sine", 0.075); // E6
  }

  /** Warm major triad for lesson completion / shop purchase / save */
  public playSuccess() {
    if (!this.isEnabled()) return;
    this.tone(523.25, 523.25, 0.12, 0.075, "sine", 0);    // C5
    this.tone(659.25, 659.25, 0.14, 0.075, "sine", 0.06); // E5
    this.tone(783.99, 783.99, 0.22, 0.08, "sine", 0.12);  // G5
  }

  /** Celebratory chord for test finish / new high score */
  public playCelebrate() {
    if (!this.isEnabled()) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.tone(n, n, i === 3 ? 0.32 : 0.14, 0.085, "triangle", i * 0.075);
    });
  }

  /** Soft crystal bell ping for incoming notifications */
  public playNotification() {
    if (!this.isEnabled()) return;
    this.tone(880, 880, 0.18, 0.065, "sine", 0);
    this.tone(1318.51, 1318.51, 0.24, 0.045, "sine", 0.08);
  }

  /** Game / quiz correct answer */
  public playCorrect() {
    if (!this.isEnabled()) return;
    this.tone(587.33, 880, 0.12, 0.095, "sine", 0);
  }

  /** Game / quiz wrong answer */
  public playWrong() {
    if (!this.isEnabled()) return;
    this.tone(175, 115, 0.16, 0.11, "triangle", 0);
  }

  /** Game combo milestone */
  public playCombo() {
    if (!this.isEnabled()) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      this.tone(freq, freq, 0.1, 0.085, "sine", i * 0.048);
    });
  }
}

export const soundFx = new PromaxSoundEngine();
