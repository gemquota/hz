export type Waveform = "sine" | "triangle" | "sawtooth" | "square";

export const WAVES: Waveform[] = ["sine", "triangle", "sawtooth", "square"];

export const WAVE_LABEL: Record<Waveform, string> = {
  sine: "Sine",
  triangle: "Tri",
  sawtooth: "Saw",
  square: "Sqr",
};

/** C3 → C6, three octaves. Semitones land on equal X steps. */
export const MIN_MIDI = 48;
export const MAX_MIDI = 84;
export const SEMITONES = MAX_MIDI - MIN_MIDI;

const NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"] as const;

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function midiToFreq(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function xToFreq(x: number) {
  const t = clamp(x);
  const min = midiToFreq(MIN_MIDI);
  const max = midiToFreq(MAX_MIDI);
  return min * (max / min) ** t;
}

/** 1 at the top of the field, silence parked on the bottom edge. */
export function yToExpression(y: number) {
  const height = clamp(1 - y);
  if (height <= 0.02) return 0;
  return ((height - 0.02) / 0.98) ** 1.15;
}

/** Low notes run warm red → high notes cool magenta. Ends don't meet. */
export function hueForX(x: number) {
  return (clamp(x) * 292 + 8) % 360;
}

export type PitchReadout = {
  name: string;
  cents: number;
  freq: number;
};

export function describeFreq(freq: number): PitchReadout {
  const exact = 69 + 12 * Math.log2(freq / 440);
  const midi = Math.round(exact);
  const cents = Math.max(-50, Math.min(50, Math.round((exact - midi) * 100)));
  const name = NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return { name: `${name}${octave}`, cents, freq };
}

export function formatCents(cents: number) {
  const sign = cents > 0 ? "+" : cents < 0 ? "−" : "±";
  return `${sign}${Math.abs(cents).toString().padStart(2, "0")}`;
}

export function isBlackKey(semitoneIndex: number) {
  const pc = ((MIN_MIDI + semitoneIndex) % 12 + 12) % 12;
  return pc === 1 || pc === 3 || pc === 6 || pc === 8 || pc === 10;
}

export function noteLabel(semitoneIndex: number) {
  const midi = MIN_MIDI + semitoneIndex;
  const name = NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}
