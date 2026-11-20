// University-entrance (DTM / SAT / IELTS) Arcade Game Engines & Web Audio SoundFx

export type GameId = "math" | "logic" | "vocab";
export type GameDifficulty = "medium" | "dtm" | "sat";

export interface ArcadeQuestion {
  prompt: string;
  subprompt?: string;
  topic: string;
  sequence?: (number | string)[];
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export const DIFFICULTY_META: Record<
  GameDifficulty,
  { label: string; short: string; coinMultiplier: number; desc: string }
> = {
  medium: {
    label: "O'rta",
    short: "O'rta",
    coinMultiplier: 1,
    desc: "Bazaviy abituriyent darajasi (1x tanga)",
  },
  dtm: {
    label: "DTM Abituriyent",
    short: "DTM",
    coinMultiplier: 1.5,
    desc: "Oliy ta'lim kirish imtihoni (1.5x tanga)",
  },
  sat: {
    label: "SAT / Pro",
    short: "SAT Pro",
    coinMultiplier: 2,
    desc: "Murakkab olimpiada va SAT (2x tanga)",
  },
};

// Lightweight Web Audio API Synthesizer (No external sound files required)
class SoundFx {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private getContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playCorrect() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  playWrong() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(170, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }

  playCombo() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.05;
        gain.gain.setValueAtTime(0.11, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.11);
      });
    } catch {}
  }

  playGameOver() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.08;
        gain.gain.setValueAtTime(0.13, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.22);
      });
    } catch {}
  }
}

export const gameSfx = new SoundFx();

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeNumericOptions(answer: number, offsets?: number[]): string[] {
  const set = new Set<number>([answer]);
  const pool = offsets || [-10, -6, -4, -3, -2, -1, 1, 2, 3, 4, 6, 10];
  let guard = 0;
  while (set.size < 4 && guard < 40) {
    guard++;
    const delta = pick(pool);
    const candidate = answer + delta;
    if (candidate !== answer && (answer < 0 || candidate >= 0)) {
      set.add(candidate);
    }
  }
  let fallback = 1;
  while (set.size < 4) {
    set.add(answer + fallback);
    fallback++;
  }
  return shuffle(Array.from(set)).map(String);
}

// ─── 1. MATEMATIKA PRO (DTM & SAT) ──────────────────────────────────────────

export function generateMathQuestion(difficulty: GameDifficulty): ArcadeQuestion {
  if (difficulty === "medium") {
    const kind = randInt(1, 5);
    if (kind === 1) {
      // Square roots sum/diff
      const a = randInt(4, 15);
      const b = randInt(3, 12);
      const isAdd = Math.random() > 0.4;
      const ans = isAdd ? a + b : Math.abs(a - b);
      const [big, small] = a >= b ? [a, b] : [b, a];
      return {
        topic: "Ildizlar",
        prompt: isAdd ? `√${a * a} + √${b * b} = ?` : `√${big * big} − √${small * small} = ?`,
        options: makeNumericOptions(ans, [-4, -3, -2, -1, 1, 2, 3, 4, 5]),
        correctAnswer: String(ans),
        explanation: isAdd ? `√${a * a} = ${a}, √${b * b} = ${b} → ${a} + ${b} = ${ans}` : `${big} − ${small} = ${ans}`,
      };
    }
    if (kind === 2) {
      // Percentages
      const pct = pick([10, 15, 20, 25, 30, 40, 50, 75]);
      const base = pick([40, 60, 80, 120, 160, 200, 240, 300, 400]);
      const ans = (base * pct) / 100;
      if (Number.isInteger(ans)) {
        return {
          topic: "Foizlar",
          prompt: `${base} sonining ${pct}% i nechaga teng?`,
          options: makeNumericOptions(ans, [-20, -10, -5, 5, 10, 15, 20]),
          correctAnswer: String(ans),
          explanation: `${base} × ${pct} / 100 = ${ans}`,
        };
      }
    }
    if (kind === 3) {
      // Powers
      const pairs: [string, number, string][] = [
        ["2⁵ + 3²", 41, "32 + 9 = 41"],
        ["2⁶ − 4²", 48, "64 − 16 = 48"],
        ["3³ + 2⁴", 43, "27 + 16 = 43"],
        ["5² + 4²", 41, "25 + 16 = 41"],
        ["6² − 3³", 9, "36 − 27 = 9"],
        ["2⁴ × 3", 48, "16 × 3 = 48"],
        ["7² − 2⁵", 17, "49 − 32 = 17"],
        ["3⁴ − 5²", 56, "81 − 25 = 56"],
      ];
      const [expr, ans, exp] = pick(pairs);
      return {
        topic: "Darajalar",
        prompt: `${expr} = ?`,
        options: makeNumericOptions(ans, [-8, -5, -3, -2, 2, 3, 5, 8]),
        correctAnswer: String(ans),
        explanation: exp,
      };
    }
    if (kind === 4) {
      // Linear equation
      const a = randInt(2, 7);
      const x = randInt(2, 12);
      const b = randInt(3, 18);
      const isAdd = Math.random() > 0.5;
      const rhs = isAdd ? a * x + b : a * x - b;
      return {
        topic: "Tenglama",
        prompt: `${a}x ${isAdd ? "+" : "−"} ${b} = ${rhs}`,
        subprompt: "x ning qiymatini toping",
        options: makeNumericOptions(x, [-3, -2, -1, 1, 2, 3, 4]),
        correctAnswer: String(x),
        explanation: `${a}x = ${a * x} → x = ${x}`,
      };
    }
    // Order of operations
    const a = randInt(4, 12);
    const b = randInt(3, 9);
    const c = randInt(5, 20);
    const ans = a * b - c;
    return {
      topic: "Hisoblash",
      prompt: `${a} × ${b} − ${c} = ?`,
      options: makeNumericOptions(ans, [-10, -5, -2, -1, 1, 2, 5, 10]),
      correctAnswer: String(ans),
      explanation: `${a * b} − ${c} = ${ans}`,
    };
  }

  if (difficulty === "dtm") {
    const kind = randInt(1, 6);
    if (kind === 1) {
      // Logarithms
      const logBank: [string, number, string][] = [
        ["log₂ 32", 5, "2⁵ = 32"],
        ["log₂ 64", 6, "2⁶ = 64"],
        ["log₃ 81", 4, "3⁴ = 81"],
        ["log₃ 27 + log₂ 8", 6, "3 + 3 = 6"],
        ["log₅ 125", 3, "5³ = 125"],
        ["log₂ 16 + log₃ 9", 6, "4 + 2 = 6"],
        ["log₄ 64", 3, "4³ = 64"],
        ["log₂ 128 − log₅ 25", 5, "7 − 2 = 5"],
        ["lg 1000 + log₂ 4", 5, "3 + 2 = 5"],
        ["log₆ 36 + log₂ 32", 7, "2 + 5 = 7"],
      ];
      const [expr, ans, exp] = pick(logBank);
      return {
        topic: "Logarifm",
        prompt: `${expr} = ?`,
        options: makeNumericOptions(ans, [-3, -2, -1, 1, 2, 3, 4]),
        correctAnswer: String(ans),
        explanation: exp,
      };
    }
    if (kind === 2) {
      // Vieta's formulas
      const r1 = randInt(2, 9);
      const r2 = randInt(1, 8);
      const sum = r1 + r2;
      const prod = r1 * r2;
      const askSum = Math.random() > 0.5;
      const ans = askSum ? sum : prod;
      return {
        topic: "Viyet teoremasi",
        prompt: `x² − ${sum}x + ${prod} = 0`,
        subprompt: askSum ? "Ildizlar yig'indisi (x₁ + x₂) = ?" : "Ildizlar ko'paytmasi (x₁ · x₂) = ?",
        options: makeNumericOptions(ans, [-4, -2, -1, 1, 2, 4, 6]),
        correctAnswer: String(ans),
        explanation: `Viyetga ko'ra: x₁ + x₂ = ${sum}, x₁ · x₂ = ${prod}`,
      };
    }
    if (kind === 3) {
      // Trigonometry standard values
      const trigBank: [string, string, string[], string][] = [
        ["2·sin 30° + cos 0°", "2", ["1", "2", "3", "0"], "2·(1/2) + 1 = 2"],
        ["sin 30° + cos 60°", "1", ["0", "0.5", "1", "2"], "0.5 + 0.5 = 1"],
        ["tg 45° + ctg 45°", "2", ["0", "1", "2", "√2"], "1 + 1 = 2"],
        ["4·cos 60° + tg 45°", "3", ["1", "2", "3", "4"], "4·(1/2) + 1 = 3"],
        ["sin 90° + 2·cos 60°", "2", ["1", "2", "3", "0"], "1 + 2·(1/2) = 2"],
        ["sin²30° + cos²30°", "1", ["0.5", "1", "1.5", "2"], "Asosiy trigonometrik ayniyat = 1"],
        ["2·sin 90° − tg 45°", "1", ["0", "1", "2", "-1"], "2·1 − 1 = 1"],
      ];
      const [expr, ans, opts, exp] = pick(trigBank);
      return {
        topic: "Trigonometriya",
        prompt: `${expr} = ?`,
        options: shuffle(opts),
        correctAnswer: ans,
        explanation: exp,
      };
    }
    if (kind === 4) {
      // Arithmetic progression nth term
      const a1 = randInt(2, 10);
      const d = randInt(2, 7);
      const n = randInt(5, 9);
      const ans = a1 + (n - 1) * d;
      return {
        topic: "Progressiya",
        prompt: `a₁ = ${a1},  d = ${d}`,
        subprompt: `Arifmetik progressiyaning a${n} hadini toping`,
        options: makeNumericOptions(ans, [-d, -2, -1, 1, 2, d, d * 2]),
        correctAnswer: String(ans),
        explanation: `a${n} = ${a1} + ${n - 1}·${d} = ${ans}`,
      };
    }
    if (kind === 5) {
      // Exponential equation
      const base = pick([2, 3, 5]);
      const expVal = base === 2 ? randInt(3, 7) : base === 3 ? randInt(2, 4) : randInt(2, 3);
      const shift = randInt(1, 3);
      const rhs = Math.pow(base, expVal);
      const ans = expVal + shift;
      return {
        topic: "Ko'rsatkichli tenglama",
        prompt: `${base}^(x − ${shift}) = ${rhs}`,
        subprompt: "x ning qiymatini toping",
        options: makeNumericOptions(ans, [-3, -2, -1, 1, 2, 3]),
        correctAnswer: String(ans),
        explanation: `x − ${shift} = ${expVal} → x = ${ans}`,
      };
    }
    // Quadratic discriminant
    const a = randInt(1, 3);
    const b = randInt(4, 9);
    const c = randInt(1, 5);
    const D = b * b - 4 * a * c;
    return {
      topic: "Diskriminant",
      prompt: `${a === 1 ? "" : a}x² − ${b}x + ${c} = 0`,
      subprompt: "Diskriminant (D = b² − 4ac) ni hisoblang",
      options: makeNumericOptions(D, [-8, -4, -2, 2, 4, 8, 12]),
      correctAnswer: String(D),
      explanation: `D = ${b}² − 4·${a}·${c} = ${b * b} − ${4 * a * c} = ${D}`,
    };
  }

  // SAT / PRO level
  const kind = randInt(1, 6);
  if (kind === 1) {
    // Function evaluation
    const a = randInt(2, 4);
    const b = randInt(1, 5);
    const c = randInt(1, 7);
    const x = randInt(2, 5);
    const ans = a * x * x - b * x + c;
    return {
      topic: "Funksiya",
      prompt: `f(x) = ${a}x² − ${b}x + ${c}`,
      subprompt: `f(${x}) ning qiymatini toping`,
      options: makeNumericOptions(ans, [-6, -4, -2, 2, 4, 6, 8]),
      correctAnswer: String(ans),
      explanation: `f(${x}) = ${a}·${x * x} − ${b}·${x} + ${c} = ${ans}`,
    };
  }
  if (kind === 2) {
    // Derivative at a point: f(x) = a*x^3 - b*x -> f'(x0) = 3a*x0^2 - b
    const a = randInt(1, 3);
    const b = randInt(2, 8);
    const x0 = randInt(2, 3);
    const ans = 3 * a * x0 * x0 - b;
    return {
      topic: "Hosila",
      prompt: `f(x) = ${a === 1 ? "" : a}x³ − ${b}x`,
      subprompt: `f'(${x0}) hosila qiymatini toping`,
      options: makeNumericOptions(ans, [-6, -4, -2, 2, 4, 6, 9]),
      correctAnswer: String(ans),
      explanation: `f'(x) = ${3 * a}x² − ${b} → f'(${x0}) = ${3 * a * x0 * x0} − ${b} = ${ans}`,
    };
  }
  if (kind === 3) {
    // Geometric progression
    const b1 = randInt(2, 5);
    const q = pick([2, 3]);
    const n = q === 2 ? randInt(4, 6) : 4;
    const ans = b1 * Math.pow(q, n - 1);
    return {
      topic: "Geom. progressiya",
      prompt: `b₁ = ${b1},  q = ${q}`,
      subprompt: `Geometrik progressiyaning b${n} hadini toping`,
      options: makeNumericOptions(ans, [-16, -8, -4, 4, 8, 16, 24]),
      correctAnswer: String(ans),
      explanation: `b${n} = ${b1} · ${q}^${n - 1} = ${ans}`,
    };
  }
  if (kind === 4) {
    // Absolute value equation sum of roots: |x - k| = m => roots k+m, k-m => sum = 2k
    const k = randInt(3, 12);
    const m = randInt(2, 9);
    const ans = 2 * k;
    return {
      topic: "Modul tenglama",
      prompt: `|x − ${k}| = ${m}`,
      subprompt: "Tenglama ildizlari yig'indisini toping",
      options: makeNumericOptions(ans, [-4, -2, -1, 1, 2, 4, m]),
      correctAnswer: String(ans),
      explanation: `Ildizlar: ${k + m} va ${k - m}, yig'indisi = ${ans}`,
    };
  }
  if (kind === 5) {
    // Combinatorics & Factorials
    const combBank: [string, number, string][] = [
      ["C(5, 2)", 10, "5! / (2!·3!) = 10"],
      ["C(6, 2)", 15, "6·5 / 2 = 15"],
      ["C(7, 2)", 21, "7·6 / 2 = 21"],
      ["C(6, 3)", 20, "6·5·4 / 6 = 20"],
      ["5! − 4!", 96, "120 − 24 = 96"],
      ["4! + 3!", 30, "24 + 6 = 30"],
      ["6! / 4!", 30, "6 × 5 = 30"],
      ["7! / 5!", 42, "7 × 6 = 42"],
    ];
    const [expr, ans, exp] = pick(combBank);
    return {
      topic: "Kombinatorika",
      prompt: `${expr} = ?`,
      options: makeNumericOptions(ans, [-6, -4, -2, 2, 4, 6, 10]),
      correctAnswer: String(ans),
      explanation: exp,
    };
  }
  // Logarithmic equation: log_b(x - c) = p
  const base = pick([2, 3]);
  const p = base === 2 ? randInt(3, 5) : randInt(2, 3);
  const c = randInt(2, 9);
  const ans = Math.pow(base, p) + c;
  return {
    topic: "Logarifmik tenglama",
    prompt: `log${base === 2 ? "₂" : "₃"}(x − ${c}) = ${p}`,
    subprompt: "x ning qiymatini toping",
    options: makeNumericOptions(ans, [-4, -2, -1, 1, 2, 4, 6]),
    correctAnswer: String(ans),
    explanation: `x − ${c} = ${base}^${p} = ${Math.pow(base, p)} → x = ${ans}`,
  };
}

// ─── 2. MANTIQ & IQ QATORLAR (LOGIC PATTERN) ────────────────────────────────

export function generateLogicQuestion(difficulty: GameDifficulty): ArcadeQuestion {
  if (difficulty === "medium") {
    const kind = randInt(1, 3);
    if (kind === 1) {
      // Arithmetic
      const start = randInt(3, 20);
      const step = randInt(4, 13);
      const seq = [0, 1, 2, 3].map((i) => start + i * step);
      const ans = start + 4 * step;
      return {
        topic: "Arifmetik qator",
        prompt: "Ketma-ketlikning keyingi hadini toping",
        sequence: [...seq, "?"],
        options: makeNumericOptions(ans, [-step, -3, -2, -1, 1, 2, 3, step]),
        correctAnswer: String(ans),
        explanation: `Har safar +${step} qo'shiladi → ${seq[3]} + ${step} = ${ans}`,
      };
    }
    if (kind === 2) {
      // Geometric ×2 or ×3
      const q = pick([2, 3]);
      const start = q === 2 ? randInt(2, 6) : randInt(1, 3);
      const seq = [0, 1, 2, 3].map((i) => start * Math.pow(q, i));
      const ans = start * Math.pow(q, 4);
      return {
        topic: "Geometrik qator",
        prompt: "Keyingi son qaysi?",
        sequence: [...seq, "?"],
        options: makeNumericOptions(ans, [-12, -6, -4, 4, 6, 12, 18]),
        correctAnswer: String(ans),
        explanation: `Har bir had ${q} ga ko'paytiriladi → ${seq[3]} × ${q} = ${ans}`,
      };
    }
    // Increasing differences: +2, +4, +6, +8...
    const start = randInt(2, 12);
    const baseStep = randInt(2, 5);
    const seq = [start];
    for (let i = 1; i <= 4; i++) {
      seq.push(seq[i - 1] + baseStep * i);
    }
    const ans = seq.pop()!;
    return {
      topic: "O'suvchi farq",
      prompt: "Qonuniyatni toping va keyingi sonni belgilang",
      sequence: [...seq, "?"],
      options: makeNumericOptions(ans, [-6, -4, -2, 2, 4, 6, 8]),
      correctAnswer: String(ans),
      explanation: `Farqlar +${baseStep}, +${baseStep * 2}, +${baseStep * 3}, +${baseStep * 4} → ${ans}`,
    };
  }

  if (difficulty === "dtm") {
    const kind = randInt(1, 4);
    if (kind === 1) {
      // Multiply & Add: a[n] = 2*a[n-1] + k
      const start = randInt(2, 5);
      const k = pick([-1, 1, 2, 3]);
      const seq = [start];
      for (let i = 1; i <= 4; i++) {
        seq.push(seq[i - 1] * 2 + k);
      }
      const ans = seq.pop()!;
      return {
        topic: "Aralash qonuniyat",
        prompt: "Yashirin qonuniyat bo'yicha keyingi hadni toping",
        sequence: [...seq, "?"],
        options: makeNumericOptions(ans, [-8, -4, -2, -1, 1, 2, 4, 8]),
        correctAnswer: String(ans),
        explanation: `Qoida: ×2 ${k >= 0 ? `+ ${k}` : `− ${Math.abs(k)}`} → ${seq[3]}×2 ${k >= 0 ? `+ ${k}` : `− ${Math.abs(k)}`} = ${ans}`,
      };
    }
    if (kind === 2) {
      // Squares + offset: n^2 + c
      const c = randInt(-2, 5);
      const startN = randInt(2, 4);
      const seq = [0, 1, 2, 3].map((i) => Math.pow(startN + i, 2) + c);
      const ans = Math.pow(startN + 4, 2) + c;
      return {
        topic: "Kvadratlar qatori",
        prompt: "Keyingi had nechaga teng?",
        sequence: [...seq, "?"],
        options: makeNumericOptions(ans, [-7, -4, -2, -1, 1, 2, 4, 7]),
        correctAnswer: String(ans),
        explanation: `n² ${c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`} qonuniyati → ${startN + 4}² ${c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`} = ${ans}`,
      };
    }
    if (kind === 3) {
      // Fibonacci-like
      const a = randInt(2, 6);
      const b = randInt(3, 8);
      const seq = [a, b, a + b, a + 2 * b, 2 * a + 3 * b];
      const ans = seq.pop()!;
      return {
        topic: "Fibonachchi",
        prompt: "Ketma-ketlikni davom ettiring",
        sequence: [...seq, "?"],
        options: makeNumericOptions(ans, [-6, -3, -2, -1, 1, 2, 3, 6]),
        correctAnswer: String(ans),
        explanation: `Oldingi ikki had yig'indisi: ${seq[2]} + ${seq[3]} = ${ans}`,
      };
    }
    // Second-order differences: +3, +5, +7, +9
    const start = randInt(1, 10);
    const d0 = randInt(2, 5);
    const dd = randInt(2, 4);
    const seq = [start];
    for (let i = 0; i < 4; i++) {
      seq.push(seq[i] + d0 + i * dd);
    }
    const ans = seq.pop()!;
    return {
      topic: "Ikkilamchi farq",
      prompt: "Keyingi sonni aniqlang",
      sequence: [...seq, "?"],
      options: makeNumericOptions(ans, [-5, -3, -2, -1, 1, 2, 3, 5]),
      correctAnswer: String(ans),
      explanation: `Farq har safar +${dd} ga ortadi → ${seq[3]} + ${d0 + 3 * dd} = ${ans}`,
    };
  }

  // SAT / PRO Logic
  const kind = randInt(1, 3);
  if (kind === 1) {
    // Alternating dual sequence
    const a1 = randInt(2, 8);
    const da = randInt(3, 7);
    const b1 = randInt(15, 35);
    const db = randInt(4, 9);
    const seq = [a1, b1, a1 + da, b1 - db, a1 + 2 * da, b1 - 2 * db];
    const ans = a1 + 3 * da;
    return {
      topic: "Juft-toq parallel qator",
      prompt: "Ikki parallel qator qonuniyatini toping",
      sequence: [...seq, "?"],
      options: makeNumericOptions(ans, [-da, -3, -2, -1, 1, 2, 3, da]),
      correctAnswer: String(ans),
      explanation: `Toq o'rinlar +${da} ga ortadi → ${a1 + 2 * da} + ${da} = ${ans}`,
    };
  }
  if (kind === 2) {
    // Cubes ± n or Cubes + c
    const c = pick([-1, 0, 1, 2]);
    const seq = [1, 2, 3, 4].map((n) => n * n * n + c);
    const ans = 125 + c;
    return {
      topic: "Kublar qatori",
      prompt: "Keyingi had qaysi?",
      sequence: [...seq, "?"],
      options: makeNumericOptions(ans, [-15, -10, -5, -1, 1, 5, 10, 15]),
      correctAnswer: String(ans),
      explanation: `n³ ${c === 0 ? "" : c > 0 ? `+ ${c}` : `− ${Math.abs(c)}`} → 5³ ${c === 0 ? "" : c > 0 ? `+ ${c}` : `− ${Math.abs(c)}`} = ${ans}`,
    };
  }
  // ×3 - k
  const start = randInt(2, 4);
  const k = randInt(1, 3);
  const seq = [start];
  for (let i = 1; i <= 4; i++) {
    seq.push(seq[i - 1] * 3 - k);
  }
  const ans = seq.pop()!;
  return {
    topic: "Eksponensial mantiq",
    prompt: "Keyingi sonni toping",
    sequence: [...seq, "?"],
    options: makeNumericOptions(ans, [-12, -6, -3, -1, 1, 3, 6, 12]),
    correctAnswer: String(ans),
    explanation: `Har safar ×3 − ${k} → ${seq[3]}×3 − ${k} = ${ans}`,
  };
}

// ─── 3. ACADEMIC VOCAB BLITZ (IELTS & SAT ENGLISH) ───────────────────────────

interface VocabEntry {
  word: string;
  uz: string;
  synonym: string;
  level: GameDifficulty;
}

const VOCAB_BANK: VocabEntry[] = [
  // Medium (B1-B2 Abituriyent / IELTS 6.0)
  { word: "Abundant", uz: "Mo'l-ko'l, serob", synonym: "Plentiful", level: "medium" },
  { word: "Accurate", uz: "Aniq, to'g'ri", synonym: "Precise", level: "medium" },
  { word: "Achieve", uz: "Erishmoq", synonym: "Accomplish", level: "medium" },
  { word: "Adequate", uz: "Yetarli, munosib", synonym: "Sufficient", level: "medium" },
  { word: "Analyze", uz: "Tahlil qilmoq", synonym: "Examine", level: "medium" },
  { word: "Beneficial", uz: "Foydali, manfaatli", synonym: "Advantageous", level: "medium" },
  { word: "Crucial", uz: "Hal qiluvchi, o'ta muhim", synonym: "Vital", level: "medium" },
  { word: "Decline", uz: "Pasaymoq, rad etmoq", synonym: "Decrease", level: "medium" },
  { word: "Diverse", uz: "Turli-tuman", synonym: "Varied", level: "medium" },
  { word: "Efficient", uz: "Samarali, unumli", synonym: "Effective", level: "medium" },
  { word: "Enhance", uz: "Yaxshilamoq, kuchaytirmoq", synonym: "Improve", level: "medium" },
  { word: "Essential", uz: "Zarur, muhim", synonym: "Indispensable", level: "medium" },
  { word: "Fluctuate", uz: "O'zgarib turmoq", synonym: "Vary", level: "medium" },
  { word: "Inevitable", uz: "Muqarrar, qochib bo'lmas", synonym: "Unavoidable", level: "medium" },
  { word: "Maintain", uz: "Saqlab turmoq", synonym: "Preserve", level: "medium" },
  { word: "Obstacle", uz: "To'siq, g'ov", synonym: "Barrier", level: "medium" },
  { word: "Persistent", uz: "Qat'iyatli, davomiy", synonym: "Determined", level: "medium" },
  { word: "Reluctant", uz: "Istamagan, ikkilangan", synonym: "Unwilling", level: "medium" },

  // DTM / IELTS 7.0-7.5
  { word: "Ambiguous", uz: "Noaniq, ikki ma'noli", synonym: "Unclear", level: "dtm" },
  { word: "Coherent", uz: "Mantiqiy bog'langan", synonym: "Logical", level: "dtm" },
  { word: "Compelling", uz: "Ishonarli, o'ziga tortuvchi", synonym: "Persuasive", level: "dtm" },
  { word: "Contradict", uz: "Zid kelmoq, inkor etmoq", synonym: "Oppose", level: "dtm" },
  { word: "Deteriorate", uz: "Yomonlashmoq", synonym: "Worsen", level: "dtm" },
  { word: "Elaborate", uz: "Batafsil tushuntirmoq", synonym: "Detailed", level: "dtm" },
  { word: "Empirical", uz: "Tajribaga asoslangan", synonym: "Experimental", level: "dtm" },
  { word: "Feasible", uz: "Amalga oshirsa bo'ladigan", synonym: "Viable", level: "dtm" },
  { word: "Imminent", uz: "Yaqinlashib kelayotgan", synonym: "Impending", level: "dtm" },
  { word: "Incentive", uz: "Rag'bat, turtki", synonym: "Motivation", level: "dtm" },
  { word: "Mitigate", uz: "Yumshatmoq, kamaytirmoq", synonym: "Alleviate", level: "dtm" },
  { word: "Negligible", uz: "Arzimagan, ahamiyatsiz", synonym: "Trivial", level: "dtm" },
  { word: "Plausible", uz: "Haqiqatga yaqin", synonym: "Credible", level: "dtm" },
  { word: "Pragmatic", uz: "Amaliy, realistik", synonym: "Practical", level: "dtm" },
  { word: "Prevalent", uz: "Keng tarqalgan", synonym: "Widespread", level: "dtm" },
  { word: "Resilient", uz: "Chidamli, tez tiklanuvchi", synonym: "Tough", level: "dtm" },
  { word: "Scrutinize", uz: "Sinchkovlik bilan tekshirmoq", synonym: "Inspect", level: "dtm" },
  { word: "Substantial", uz: "Salmoqli, katta", synonym: "Considerable", level: "dtm" },

  // SAT / IELTS 8.0+
  { word: "Alacrity", uz: "G'ayrat, jon-dildan tayyorlik", synonym: "Eagerness", level: "sat" },
  { word: "Anomalous", uz: "G'ayritabiiy, qoidadan chet", synonym: "Irregular", level: "sat" },
  { word: "Benevolent", uz: "Xayrixoh, mehribon", synonym: "Kindhearted", level: "sat" },
  { word: "Capricious", uz: "Injiq, tez o'zgaruvchan", synonym: "Unpredictable", level: "sat" },
  { word: "Corroborate", uz: "Dalil bilan tasdiqlamoq", synonym: "Confirm", level: "sat" },
  { word: "Disparate", uz: "Tubdan farq qiluvchi", synonym: "Distinct", level: "sat" },
  { word: "Ephemeral", uz: "O'tkinchi, qisqa muddatli", synonym: "Short-lived", level: "sat" },
  { word: "Equivocal", uz: "Mavhum, ikki xil talqinli", synonym: "Ambiguous", level: "sat" },
  { word: "Fastidious", uz: "O'ta talabchan, nozikta'b", synonym: "Meticulous", level: "sat" },
  { word: "Laconic", uz: "Qisqa va lo'nda", synonym: "Concise", level: "sat" },
  { word: "Lucid", uz: "Ravshan, tushunarli", synonym: "Clear", level: "sat" },
  { word: "Magnanimous", uz: "Olijanob, keng fe'lli", synonym: "Generous", level: "sat" },
  { word: "Obfuscate", uz: "Chalkashtirmoq, mavhumlashtirmoq", synonym: "Confuse", level: "sat" },
  { word: "Ostentatious", uz: "Dabdabali, ko'z-ko'z qiluvchi", synonym: "Showy", level: "sat" },
  { word: "Perfidious", uz: "Xoin, bevafo", synonym: "Treacherous", level: "sat" },
  { word: "Sycophant", uz: "Xushomadgo'y, laganbardor", synonym: "Flatterer", level: "sat" },
  { word: "Ubiquitous", uz: "Hamma joyda uchraydigan", synonym: "Omnipresent", level: "sat" },
  { word: "Venerable", uz: "Hurmatga sazovor, muhtaram", synonym: "Respected", level: "sat" },
];

export function generateVocabQuestion(difficulty: GameDifficulty): ArcadeQuestion {
  const pool = VOCAB_BANK.filter((v) => v.level === difficulty);
  const target = pick(pool);
  const askSynonym = Math.random() > 0.55;

  const distractors = shuffle(
    VOCAB_BANK.filter((v) => v.word !== target.word)
  ).slice(0, 3);

  if (askSynonym) {
    return {
      topic: "Sinonim",
      prompt: target.word,
      subprompt: "To'g'ri inglizcha sinonimini toping",
      options: shuffle([target.synonym, ...distractors.map((d) => d.synonym)]),
      correctAnswer: target.synonym,
      explanation: `${target.word} = ${target.synonym} (${target.uz})`,
    };
  }

  return {
    topic: "Tarjima",
    prompt: target.word,
    subprompt: "So'zning o'zbekcha ma'nosini toping",
    options: shuffle([target.uz, ...distractors.map((d) => d.uz)]),
    correctAnswer: target.uz,
    explanation: `${target.word} — ${target.uz} (syn: ${target.synonym})`,
  };
}

export function generateArcadeQuestion(
  gameId: GameId,
  difficulty: GameDifficulty
): ArcadeQuestion {
  switch (gameId) {
    case "math":
      return generateMathQuestion(difficulty);
    case "logic":
      return generateLogicQuestion(difficulty);
    case "vocab":
      return generateVocabQuestion(difficulty);
  }
}

// Local high-score storage per game
export function getGameHighScore(gameId: GameId): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(`promax_game_best_${gameId}`);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function saveGameHighScore(gameId: GameId, score: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const prev = getGameHighScore(gameId);
    if (score > prev) {
      localStorage.setItem(`promax_game_best_${gameId}`, String(score));
      return true;
    }
  } catch {}
  return false;
}
