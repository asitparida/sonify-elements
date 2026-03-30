export interface SimStep {
  stateIdx: number;
  target: string;
  clicking?: boolean;
  playSound?: boolean;
  duration: number;
  vis: string;
  meta?: Record<string, unknown>;
  soundOverride?: { freqs: number[] };
}

// ── Text Input ──
// States: 0=rest 1=hover 2=focus 3=typing 4=delete 5=paste 6=select-text 7=autofill 8=blur 9=error 10=success 11=disabled
const textInputSeq: SimStep[] = [
  { stateIdx: 0, target: 'away', duration: 600, vis: 'rest' },
  { stateIdx: 1, target: 'input', duration: 500, vis: 'hover' },
  { stateIdx: 2, target: 'input', clicking: true, playSound: true, duration: 700, vis: 'focus' },
  // Type "Hello"
  { stateIdx: 3, target: 'input', playSound: true, duration: 220, vis: 'typing', meta: { text: 'H' } },
  { stateIdx: 3, target: 'input', playSound: true, duration: 180, vis: 'typing', meta: { text: 'He' } },
  { stateIdx: 3, target: 'input', playSound: true, duration: 200, vis: 'typing', meta: { text: 'Hel' } },
  { stateIdx: 3, target: 'input', playSound: true, duration: 170, vis: 'typing', meta: { text: 'Hell' } },
  { stateIdx: 3, target: 'input', playSound: true, duration: 240, vis: 'typing', meta: { text: 'Hello' } },
  // Delete back to "Hel" — lower-pitched ticks
  { stateIdx: 4, target: 'input', playSound: true, duration: 200, vis: 'typing', meta: { text: 'Hell' } },
  { stateIdx: 4, target: 'input', playSound: true, duration: 220, vis: 'typing', meta: { text: 'Hel' } },
  { stateIdx: 4, target: 'input', duration: 300, vis: 'typing', meta: { text: 'Hel' } },
  // Paste "lo World"
  { stateIdx: 5, target: 'input', playSound: true, duration: 600, vis: 'typing', meta: { text: 'Hello World' } },
  { stateIdx: 5, target: 'input', duration: 350, vis: 'typing', meta: { text: 'Hello World' } },
  // Blur
  { stateIdx: 8, target: 'away', playSound: true, duration: 800, vis: 'filled', meta: { text: 'Hello World' } },
  // Error
  { stateIdx: 9, target: 'away', playSound: true, duration: 1000, vis: 'error', meta: { text: 'Hello World' } },
  // Success
  { stateIdx: 10, target: 'away', playSound: true, duration: 1000, vis: 'success', meta: { text: 'Hello World' } },
];

// ── Checkbox ──
const checkboxSeq: SimStep[] = [
  { stateIdx: 0, target: 'away', duration: 500, vis: 'unchecked' },
  { stateIdx: 1, target: 'checkbox', duration: 450, vis: 'hover' },
  { stateIdx: 2, target: 'checkbox', clicking: true, playSound: true, duration: 850, vis: 'checked' },
  { stateIdx: 2, target: 'checkbox', duration: 500, vis: 'checked' },
  { stateIdx: 3, target: 'checkbox', clicking: true, playSound: true, duration: 850, vis: 'unchecked' },
];

// ── Radio ──
const radioSeq: SimStep[] = [
  { stateIdx: 0, target: 'away', duration: 500, vis: 'none' },
  { stateIdx: 1, target: 'radio-0', clicking: true, playSound: true, duration: 800, vis: 'first' },
  { stateIdx: 1, target: 'radio-0', duration: 400, vis: 'first' },
  { stateIdx: 1, target: 'radio-1', duration: 400, vis: 'first' },
  { stateIdx: 1, target: 'radio-1', clicking: true, playSound: true, duration: 450, vis: 'second' },
  { stateIdx: 2, target: 'radio-1', duration: 800, vis: 'second' },
];

// ── Toggle ──
const toggleSeq: SimStep[] = [
  { stateIdx: 0, target: 'away', duration: 500, vis: 'off' },
  { stateIdx: 0, target: 'toggle', duration: 400, vis: 'off' },
  { stateIdx: 1, target: 'toggle', clicking: true, playSound: true, duration: 900, vis: 'on' },
  { stateIdx: 1, target: 'toggle', duration: 500, vis: 'on' },
  { stateIdx: 2, target: 'toggle', clicking: true, playSound: true, duration: 900, vis: 'off' },
];

// ── Button ──
const buttonSeq: SimStep[] = [
  { stateIdx: 0, target: 'away', duration: 450, vis: 'rest' },
  { stateIdx: 1, target: 'btn-primary', duration: 400, vis: 'hover-primary' },
  { stateIdx: 2, target: 'btn-primary', clicking: true, playSound: true, duration: 700, vis: 'press-primary' },
  { stateIdx: 2, target: 'btn-primary', duration: 250, vis: 'rest' },
  { stateIdx: 1, target: 'btn-destructive', duration: 400, vis: 'hover-destructive' },
  { stateIdx: 3, target: 'btn-destructive', clicking: true, playSound: true, duration: 700, vis: 'press-destructive' },
  { stateIdx: 3, target: 'btn-destructive', duration: 250, vis: 'rest' },
  { stateIdx: 1, target: 'btn-secondary', duration: 400, vis: 'hover-secondary' },
  { stateIdx: 4, target: 'btn-secondary', clicking: true, playSound: true, duration: 700, vis: 'press-secondary' },
];

// ── Select (20 options, slow → fast → slow) ──
const SELECT_OPTIONS = [
  'Argentina', 'Australia', 'Brazil', 'Canada', 'Chile',
  'Denmark', 'Egypt', 'Finland', 'Germany', 'Hungary',
  'India', 'Japan', 'Kenya', 'Mexico', 'Norway',
  'Peru', 'Romania', 'Singapore', 'Thailand', 'Vietnam',
];
export { SELECT_OPTIONS };

const selectSeq: SimStep[] = [
  { stateIdx: 0, target: 'away', duration: 500, vis: 'closed' },
  { stateIdx: 0, target: 'trigger', duration: 400, vis: 'closed' },
  { stateIdx: 1, target: 'trigger', clicking: true, playSound: true, duration: 600, vis: 'open', meta: { hoverIdx: -1 } },
  // Slow start
  { stateIdx: 2, target: 'option-0', playSound: true, duration: 400, vis: 'open', meta: { hoverIdx: 0 } },
  { stateIdx: 2, target: 'option-1', playSound: true, duration: 380, vis: 'open', meta: { hoverIdx: 1 } },
  { stateIdx: 2, target: 'option-2', playSound: true, duration: 320, vis: 'open', meta: { hoverIdx: 2 } },
  // Accelerating
  { stateIdx: 2, target: 'option-3', playSound: true, duration: 260, vis: 'open', meta: { hoverIdx: 3 } },
  { stateIdx: 2, target: 'option-4', playSound: true, duration: 200, vis: 'open', meta: { hoverIdx: 4 } },
  { stateIdx: 2, target: 'option-5', playSound: true, duration: 160, vis: 'open', meta: { hoverIdx: 5 } },
  { stateIdx: 2, target: 'option-6', playSound: true, duration: 130, vis: 'open', meta: { hoverIdx: 6 } },
  // Fast
  { stateIdx: 2, target: 'option-7', playSound: true, duration: 100, vis: 'open', meta: { hoverIdx: 7 } },
  { stateIdx: 2, target: 'option-8', playSound: true, duration: 90, vis: 'open', meta: { hoverIdx: 8 } },
  { stateIdx: 2, target: 'option-9', playSound: true, duration: 80, vis: 'open', meta: { hoverIdx: 9 } },
  { stateIdx: 2, target: 'option-10', playSound: true, duration: 80, vis: 'open', meta: { hoverIdx: 10 } },
  { stateIdx: 2, target: 'option-11', playSound: true, duration: 80, vis: 'open', meta: { hoverIdx: 11 } },
  // Decelerating
  { stateIdx: 2, target: 'option-12', playSound: true, duration: 100, vis: 'open', meta: { hoverIdx: 12 } },
  { stateIdx: 2, target: 'option-13', playSound: true, duration: 140, vis: 'open', meta: { hoverIdx: 13 } },
  { stateIdx: 2, target: 'option-14', playSound: true, duration: 200, vis: 'open', meta: { hoverIdx: 14 } },
  { stateIdx: 2, target: 'option-15', playSound: true, duration: 300, vis: 'open', meta: { hoverIdx: 15 } },
  // Pause and select
  { stateIdx: 2, target: 'option-15', duration: 450, vis: 'open', meta: { hoverIdx: 15 } },
  { stateIdx: 3, target: 'option-15', clicking: true, playSound: true, duration: 900, vis: 'selected', meta: { selectedIdx: 15 } },
];

// ── Slider (detent clicks) ──
const sliderSeq: SimStep[] = [
  { stateIdx: 0, target: 'away', duration: 500, vis: 'rest', meta: { value: 20 } },
  { stateIdx: 0, target: 'thumb', duration: 400, vis: 'rest', meta: { value: 20 } },
  { stateIdx: 1, target: 'thumb', clicking: true, playSound: true, duration: 400, vis: 'grab', meta: { value: 20 } },
  // Dragging right — pitch rises with value
  { stateIdx: 2, target: 'thumb', playSound: true, duration: 200, vis: 'drag', meta: { value: 28 }, soundOverride: { freqs: [260] } },
  { stateIdx: 2, target: 'thumb', playSound: true, duration: 180, vis: 'drag', meta: { value: 36 }, soundOverride: { freqs: [310] } },
  { stateIdx: 2, target: 'thumb', playSound: true, duration: 160, vis: 'drag', meta: { value: 44 }, soundOverride: { freqs: [370] } },
  { stateIdx: 2, target: 'thumb', playSound: true, duration: 140, vis: 'drag', meta: { value: 52 }, soundOverride: { freqs: [430] } },
  { stateIdx: 2, target: 'thumb', playSound: true, duration: 130, vis: 'drag', meta: { value: 60 }, soundOverride: { freqs: [490] } },
  { stateIdx: 2, target: 'thumb', playSound: true, duration: 130, vis: 'drag', meta: { value: 68 }, soundOverride: { freqs: [550] } },
  { stateIdx: 2, target: 'thumb', playSound: true, duration: 140, vis: 'drag', meta: { value: 76 }, soundOverride: { freqs: [610] } },
  { stateIdx: 2, target: 'thumb', playSound: true, duration: 160, vis: 'drag', meta: { value: 82 }, soundOverride: { freqs: [660] } },
  // Dragging back left — pitch drops
  { stateIdx: 2, target: 'thumb', playSound: true, duration: 180, vis: 'drag', meta: { value: 74 }, soundOverride: { freqs: [590] } },
  { stateIdx: 2, target: 'thumb', playSound: true, duration: 200, vis: 'drag', meta: { value: 68 }, soundOverride: { freqs: [540] } },
  // Release
  { stateIdx: 3, target: 'thumb', playSound: true, duration: 800, vis: 'release', meta: { value: 68 } },
];

// ── Password ──
// ── Number Input (DTMF tones: each digit has unique dual-freq) ──
// States: 0=rest 1=focus 2=typing(dtmf) 3=blur 4=disabled
const numberSeq: SimStep[] = [
  { stateIdx: 0, target: 'away', duration: 500, vis: 'rest' },
  { stateIdx: 1, target: 'number', clicking: true, playSound: true, duration: 650, vis: 'focus' },
  // Dial "4" — 770 + 1209 Hz
  { stateIdx: 2, target: 'number', playSound: true, duration: 350, vis: 'typing', meta: { text: '4' }, soundOverride: { freqs: [770, 1209] } },
  // Dial "2" — 697 + 1336 Hz
  { stateIdx: 2, target: 'number', playSound: true, duration: 320, vis: 'typing', meta: { text: '42' }, soundOverride: { freqs: [697, 1336] } },
  // Dial "1" — 697 + 1209 Hz
  { stateIdx: 2, target: 'number', playSound: true, duration: 300, vis: 'typing', meta: { text: '421' }, soundOverride: { freqs: [697, 1209] } },
  // Dial "9" — 852 + 1477 Hz
  { stateIdx: 2, target: 'number', playSound: true, duration: 340, vis: 'typing', meta: { text: '4219' }, soundOverride: { freqs: [852, 1477] } },
  // Dial "5" — 770 + 1336 Hz
  { stateIdx: 2, target: 'number', playSound: true, duration: 360, vis: 'typing', meta: { text: '42195' }, soundOverride: { freqs: [770, 1336] } },
  { stateIdx: 2, target: 'number', duration: 400, vis: 'typing', meta: { text: '42195' } },
  // Blur
  { stateIdx: 3, target: 'away', playSound: true, duration: 800, vis: 'filled', meta: { text: '42195' } },
];

const passwordSeq: SimStep[] = [
  { stateIdx: 0, target: 'away', duration: 500, vis: 'rest' },
  { stateIdx: 1, target: 'password', clicking: true, playSound: true, duration: 650, vis: 'focus' },
  { stateIdx: 2, target: 'password', playSound: true, duration: 200, vis: 'typing', meta: { len: 1 } },
  { stateIdx: 2, target: 'password', playSound: true, duration: 180, vis: 'typing', meta: { len: 2 } },
  { stateIdx: 2, target: 'password', playSound: true, duration: 190, vis: 'typing', meta: { len: 3 } },
  { stateIdx: 2, target: 'password', playSound: true, duration: 170, vis: 'typing', meta: { len: 4 } },
  { stateIdx: 2, target: 'password', playSound: true, duration: 200, vis: 'typing', meta: { len: 5 } },
  { stateIdx: 2, target: 'password', playSound: true, duration: 210, vis: 'typing', meta: { len: 6 } },
  { stateIdx: 2, target: 'password', playSound: true, duration: 180, vis: 'typing', meta: { len: 7 } },
  { stateIdx: 2, target: 'password', playSound: true, duration: 240, vis: 'typing', meta: { len: 8 } },
  { stateIdx: 2, target: 'password', duration: 350, vis: 'typing', meta: { len: 8 } },
  { stateIdx: 3, target: 'away', playSound: true, duration: 700, vis: 'filled', meta: { len: 8 } },
  { stateIdx: 4, target: 'away', playSound: true, duration: 1000, vis: 'error', meta: { len: 8 } },
];

// ── File Input ──
const fileSeq: SimStep[] = [
  { stateIdx: 0, target: 'away', duration: 500, vis: 'rest' },
  { stateIdx: 0, target: 'file-btn', duration: 400, vis: 'rest' },
  { stateIdx: 2, target: 'file-btn', clicking: true, playSound: true, duration: 1000, vis: 'browsing' },
  { stateIdx: 3, target: 'file-btn', playSound: true, duration: 1200, vis: 'selected', meta: { filename: 'document.pdf' } },
];

// ── Details / Summary ──
const detailsSeq: SimStep[] = [
  { stateIdx: 0, target: 'away', duration: 500, vis: 'collapsed' },
  { stateIdx: 0, target: 'summary', duration: 400, vis: 'collapsed' },
  { stateIdx: 1, target: 'summary', clicking: true, playSound: true, duration: 1000, vis: 'expanded' },
  { stateIdx: 1, target: 'summary', duration: 600, vis: 'expanded' },
  { stateIdx: 2, target: 'summary', clicking: true, playSound: true, duration: 900, vis: 'collapsed' },
];

// ── Textarea ──
const textareaSeq: SimStep[] = [
  { stateIdx: 0, target: 'away', duration: 500, vis: 'rest' },
  { stateIdx: 1, target: 'textarea', clicking: true, playSound: true, duration: 650, vis: 'focus' },
  { stateIdx: 2, target: 'textarea', playSound: true, duration: 200, vis: 'typing', meta: { text: 'T' } },
  { stateIdx: 2, target: 'textarea', playSound: true, duration: 170, vis: 'typing', meta: { text: 'Th' } },
  { stateIdx: 2, target: 'textarea', playSound: true, duration: 190, vis: 'typing', meta: { text: 'The' } },
  { stateIdx: 2, target: 'textarea', playSound: true, duration: 160, vis: 'typing', meta: { text: 'The ' } },
  { stateIdx: 2, target: 'textarea', playSound: true, duration: 180, vis: 'typing', meta: { text: 'The q' } },
  { stateIdx: 2, target: 'textarea', playSound: true, duration: 150, vis: 'typing', meta: { text: 'The qu' } },
  { stateIdx: 2, target: 'textarea', playSound: true, duration: 170, vis: 'typing', meta: { text: 'The qui' } },
  { stateIdx: 2, target: 'textarea', playSound: true, duration: 160, vis: 'typing', meta: { text: 'The quic' } },
  { stateIdx: 2, target: 'textarea', playSound: true, duration: 200, vis: 'typing', meta: { text: 'The quick' } },
  { stateIdx: 2, target: 'textarea', duration: 350, vis: 'typing', meta: { text: 'The quick' } },
  { stateIdx: 3, target: 'away', playSound: true, duration: 800, vis: 'filled', meta: { text: 'The quick' } },
];

const sequences: Record<string, SimStep[]> = {
  'text-input': textInputSeq,
  'checkbox': checkboxSeq,
  'radio': radioSeq,
  'toggle': toggleSeq,
  'button': buttonSeq,
  'select': selectSeq,
  'slider': sliderSeq,
  'number-input': numberSeq,
  'password-input': passwordSeq,
  'file-input': fileSeq,
  'details-summary': detailsSeq,
  'textarea': textareaSeq,
};

export function getSequence(elementId: string): SimStep[] {
  return sequences[elementId] || [];
}
