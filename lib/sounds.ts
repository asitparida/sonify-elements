export type OscType = 'sine' | 'triangle' | 'square' | 'sawtooth';

export interface SoundDef {
  type: 'tick' | 'focus-ascend' | 'focus-descend' | 'two-note-up' | 'two-note-down' | 'double-tap' | 'three-note-up' | 'three-note-down' | 'sweep' | 'dtmf';
  freqs: number[];
  oscType: OscType;
  attack: number;
  duration: number;
  gain: number;
  timbre?: string;
}

/**
 * Default sound profile — balanced, used as the base for all platform variants.
 */
export const SOUNDS = {
  textFocus:    { type: 'tick',           freqs: [440],       oscType: 'sine', attack: 0.010, duration: 0.04, gain: 0.14 },
  textBlur:     { type: 'tick',           freqs: [380],       oscType: 'sine', attack: 0.010, duration: 0.035, gain: 0.10 },
  textType:     { type: 'tick',          freqs: [700],       oscType: 'sine', attack: 0.003, duration: 0.03, gain: 0.15 },
  textDelete:   { type: 'tick',          freqs: [500],       oscType: 'sine', attack: 0.003, duration: 0.03, gain: 0.12 },
  textPaste:    { type: 'two-note-down', freqs: [680, 560], oscType: 'sine', attack: 0.004, duration: 0.08, gain: 0.18 },
  textAutofill: { type: 'three-note-up', freqs: [400, 480, 560], oscType: 'sine', attack: 0.008, duration: 0.15, gain: 0.22 },
  textareaFocus: { type: 'tick',           freqs: [400],       oscType: 'sine', attack: 0.012, duration: 0.04, gain: 0.12 },
  textareaBlur:  { type: 'tick',           freqs: [340],       oscType: 'sine', attack: 0.010, duration: 0.035, gain: 0.08 },
  textareaType:  { type: 'tick',          freqs: [600],       oscType: 'sine', attack: 0.008, duration: 0.02, gain: 0.06 },
  focusNav:      { type: 'tick',          freqs: [480],       oscType: 'sine', attack: 0.008, duration: 0.025, gain: 0.08 },
  checkboxCheck:   { type: 'tick', freqs: [880], oscType: 'sine', attack: 0.003, duration: 0.06, gain: 0.40 },
  checkboxUncheck: { type: 'tick', freqs: [660], oscType: 'sine', attack: 0.003, duration: 0.05, gain: 0.30 },
  radioSelect: { type: 'tick', freqs: [720], oscType: 'sine', attack: 0.004, duration: 0.04, gain: 0.28 },
  toggleOn:  { type: 'two-note-up',   freqs: [500, 660], oscType: 'sine', attack: 0.004, duration: 0.14, gain: 0.35 },
  toggleOff: { type: 'two-note-down', freqs: [660, 500], oscType: 'sine', attack: 0.004, duration: 0.13, gain: 0.28 },
  buttonPrimary:     { type: 'two-note-up', freqs: [400, 560], oscType: 'sine', attack: 0.004, duration: 0.12, gain: 0.32 },
  buttonDestructive: { type: 'two-note-up', freqs: [260, 400], oscType: 'sine', attack: 0.004, duration: 0.12, gain: 0.30 },
  buttonSecondary:   { type: 'tick', freqs: [420], oscType: 'sine',     attack: 0.006, duration: 0.04, gain: 0.18 },
  buttonIcon:        { type: 'tick', freqs: [600], oscType: 'sine',     attack: 0.003, duration: 0.07, gain: 0.45 },
  selectOpen:    { type: 'tick',             freqs: [420],            oscType: 'sine', attack: 0.003, duration: 0.035, gain: 0.14 },
  selectClose:   { type: 'tick',             freqs: [380],            oscType: 'sine', attack: 0.003, duration: 0.03,  gain: 0.13 },
  selectHover:   { type: 'tick',             freqs: [440],            oscType: 'sine', attack: 0.015, duration: 0.025, gain: 0.04 },
  sliderGrab:    { type: 'tick', freqs: [400], oscType: 'sine', attack: 0.005, duration: 0.04, gain: 0.25 },
  sliderTick:    { type: 'tick', freqs: [400], oscType: 'sine', attack: 0.003, duration: 0.035, gain: 0.22 },
  sliderRelease: { type: 'tick', freqs: [500], oscType: 'sine', attack: 0.005, duration: 0.06, gain: 0.30 },
  fileBrowse:   { type: 'tick',          freqs: [550],       oscType: 'sine', attack: 0.003, duration: 0.07, gain: 0.35 },
  fileSelected: { type: 'two-note-up',   freqs: [480, 640], oscType: 'sine', attack: 0.005, duration: 0.13, gain: 0.28 },
  detailsExpand:   { type: 'tick', freqs: [380], oscType: 'sine', attack: 0.012, duration: 0.04, gain: 0.10 },
  detailsCollapse: { type: 'tick', freqs: [340], oscType: 'sine', attack: 0.012, duration: 0.035, gain: 0.08 },
  numberType: { type: 'dtmf', freqs: [697, 1209], oscType: 'sine', attack: 0.005, duration: 0.10, gain: 0.20 },
  error:   { type: 'double-tap',    freqs: [260, 240], oscType: 'triangle', attack: 0.005, duration: 0.18, gain: 0.35 },
  success: { type: 'two-note-up',   freqs: [520, 700], oscType: 'sine',     attack: 0.005, duration: 0.14, gain: 0.30 },

  // ── Toasts & Alerts ──
  // All toasts: same type (two-note), same waveform (sine), same attack/duration.
  // Only frequency range and gain vary to convey severity.
  toastSuccess: { type: 'two-note-up',   freqs: [480, 600], oscType: 'sine', attack: 0.006, duration: 0.12, gain: 0.22 },
  toastWarning: { type: 'two-note-up',   freqs: [400, 480], oscType: 'sine', attack: 0.006, duration: 0.12, gain: 0.20 },
  toastError:   { type: 'two-note-down', freqs: [400, 300], oscType: 'sine', attack: 0.006, duration: 0.12, gain: 0.26 },
  toastInfo:    { type: 'two-note-up',   freqs: [440, 520], oscType: 'sine', attack: 0.006, duration: 0.12, gain: 0.16 },

  // ── Elevation & Layers ──
  modalOpen:    { type: 'two-note-up',   freqs: [300, 440], oscType: 'sine', attack: 0.010, duration: 0.18, gain: 0.22 },
  modalClose:   { type: 'two-note-down', freqs: [440, 300], oscType: 'sine', attack: 0.008, duration: 0.15, gain: 0.18 },
  drawerOpen:   { type: 'tick',          freqs: [360],       oscType: 'sine', attack: 0.010, duration: 0.06, gain: 0.14 },
  drawerClose:  { type: 'tick',          freqs: [320],       oscType: 'sine', attack: 0.010, duration: 0.05, gain: 0.12 },
  popoverShow:  { type: 'tick',          freqs: [580],       oscType: 'sine', attack: 0.006, duration: 0.035, gain: 0.12 },
  popoverHide:  { type: 'tick',          freqs: [500],       oscType: 'sine', attack: 0.006, duration: 0.03, gain: 0.10 },
  tooltipShow:  { type: 'tick',          freqs: [520],       oscType: 'sine', attack: 0.012, duration: 0.02, gain: 0.05 },

  // ── Navigation ──
  pageForward:  { type: 'two-note-up',   freqs: [380, 480], oscType: 'sine', attack: 0.008, duration: 0.12, gain: 0.16 },
  pageBack:     { type: 'two-note-down', freqs: [480, 380], oscType: 'sine', attack: 0.008, duration: 0.11, gain: 0.14 },
  tabSwitch:    { type: 'tick',           freqs: [500],       oscType: 'sine', attack: 0.004, duration: 0.035, gain: 0.14 },
  breadcrumb:   { type: 'tick',           freqs: [460],       oscType: 'sine', attack: 0.006, duration: 0.03, gain: 0.10 },

  // ── Data & State ──
  loadingStart: { type: 'tick',           freqs: [360],       oscType: 'sine', attack: 0.012, duration: 0.06, gain: 0.10 },
  loadingDone:  { type: 'two-note-up',   freqs: [480, 640], oscType: 'sine', attack: 0.005, duration: 0.13, gain: 0.25 },
  refresh:      { type: 'three-note-up', freqs: [340, 420, 520], oscType: 'sine', attack: 0.008, duration: 0.18, gain: 0.20 },
  undo:         { type: 'two-note-down', freqs: [500, 380], oscType: 'sine', attack: 0.004, duration: 0.10, gain: 0.18 },
  redo:         { type: 'two-note-up',   freqs: [380, 500], oscType: 'sine', attack: 0.004, duration: 0.10, gain: 0.18 },
  dragStart:    { type: 'tick',           freqs: [400],       oscType: 'sine', attack: 0.005, duration: 0.04, gain: 0.20 },
  drop:         { type: 'tick',           freqs: [520],       oscType: 'sine', attack: 0.005, duration: 0.06, gain: 0.28 },
  copy:         { type: 'tick',           freqs: [550],       oscType: 'sine', attack: 0.004, duration: 0.04, gain: 0.16 },
} as const satisfies Record<string, SoundDef>;

/**
 * DTMF frequency pairs per digit — the classic phone keypad tones.
 * Each digit is a combination of a row frequency and a column frequency.
 */
export const DTMF: Record<string, [number, number]> = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '0': [941, 1336], '*': [941, 1209], '#': [941, 1477],
};

export type SoundProfile = { -readonly [K in keyof typeof SOUNDS]: SoundDef };
export type SoundKey = keyof typeof SOUNDS;

/* ═══════════════════════════════════
   Sound Profiles
   ═══════════════════════════════════ */

function derive(
  transform: { freq: number; attack: number; dur: number; gain: number; osc?: OscType },
  overrides?: Partial<SoundProfile>,
): SoundProfile {
  const out = {} as Record<string, SoundDef>;
  for (const [k, s] of Object.entries(SOUNDS)) {
    out[k] = {
      type: s.type,
      freqs: s.freqs.map(f => Math.round(f * transform.freq)),
      oscType: transform.osc ?? s.oscType,
      attack: +(s.attack * transform.attack).toFixed(4),
      duration: +(s.duration * transform.dur).toFixed(4),
      gain: +Math.min(s.gain * transform.gain, 0.50).toFixed(3),
    };
  }
  if (overrides) Object.assign(out, overrides);
  return out as SoundProfile;
}

/**
 * Minimal — Barely-there whispers. For people who want a hint, not a statement.
 */
const MINIMAL: SoundProfile = derive(
  { freq: 1.0, attack: 2.5, dur: 0.6, gain: 0.28 },
);

/**
 * Bubbly — Playful pops and bloops. High-pitched, round, toy-like.
 */
const BUBBLY: SoundProfile = derive(
  { freq: 1.55, attack: 3.0, dur: 1.4, gain: 0.75 },
  {
    textType:   { type: 'tick', freqs: [1050], oscType: 'sine', attack: 0.012, duration: 0.05, gain: 0.12 },
    textDelete: { type: 'tick', freqs: [780],  oscType: 'sine', attack: 0.012, duration: 0.04, gain: 0.09 },
    checkboxCheck:   { type: 'tick', freqs: [1300], oscType: 'sine', attack: 0.010, duration: 0.08, gain: 0.30 },
    checkboxUncheck: { type: 'tick', freqs: [980],  oscType: 'sine', attack: 0.010, duration: 0.07, gain: 0.22 },
    toggleOn:  { type: 'two-note-up',   freqs: [800, 1100], oscType: 'sine', attack: 0.010, duration: 0.18, gain: 0.28 },
    toggleOff: { type: 'two-note-down', freqs: [1100, 800], oscType: 'sine', attack: 0.010, duration: 0.16, gain: 0.22 },
    success: { type: 'three-note-up', freqs: [800, 1000, 1250], oscType: 'sine', attack: 0.010, duration: 0.20, gain: 0.24 },
  },
);

/**
 * Typewriter — Each keystroke is multiple simultaneous tones (via dtmf type)
 * creating a complex percussive "clack": a high click + low thunk played together.
 * Real typewriters produce layered mechanical noise, not a single pitch.
 */
const POP: SoundProfile = derive(
  { freq: 0.9, attack: 0.3, dur: 0.35, gain: 1.0 },
  {
    // Keystrokes: two simultaneous tones = high click (800-1000Hz) + low thunk (300-400Hz)
    textType:   { type: 'dtmf', freqs: [350, 920],  oscType: 'sine', attack: 0.001, duration: 0.018, gain: 0.18 },
    textDelete: { type: 'dtmf', freqs: [280, 780],  oscType: 'sine', attack: 0.001, duration: 0.015, gain: 0.13 },
    textPaste:  { type: 'dtmf', freqs: [320, 860],  oscType: 'sine', attack: 0.001, duration: 0.025, gain: 0.20 },
    textareaFocus: { type: 'dtmf', freqs: [300, 700], oscType: 'sine', attack: 0.001, duration: 0.025, gain: 0.12 },
    textareaBlur:  { type: 'dtmf', freqs: [260, 640], oscType: 'sine', attack: 0.001, duration: 0.020, gain: 0.10 },
    // Focus: heavier clack, carriage engaging
    textFocus: { type: 'dtmf', freqs: [320, 760], oscType: 'sine', attack: 0.001, duration: 0.025, gain: 0.15 },
    textBlur:  { type: 'dtmf', freqs: [280, 680], oscType: 'sine', attack: 0.001, duration: 0.020, gain: 0.12 },
    // Checkbox: firm latch — three tones stacked for a chunkier hit
    checkboxCheck:   { type: 'dtmf', freqs: [400, 1050], oscType: 'sine', attack: 0.001, duration: 0.022, gain: 0.32 },
    checkboxUncheck: { type: 'dtmf', freqs: [340, 880],  oscType: 'sine', attack: 0.001, duration: 0.018, gain: 0.24 },
    // Button: heavy lever strike
    buttonPrimary:     { type: 'dtmf', freqs: [380, 980], oscType: 'sine', attack: 0.001, duration: 0.025, gain: 0.38 },
    buttonDestructive: { type: 'dtmf', freqs: [240, 680], oscType: 'sine', attack: 0.001, duration: 0.030, gain: 0.32 },
    buttonSecondary:   { type: 'dtmf', freqs: [320, 820], oscType: 'sine', attack: 0.001, duration: 0.018, gain: 0.20 },
    // Select: mechanical tab stop clicks
    selectOpen:  { type: 'dtmf', freqs: [340, 840], oscType: 'sine', attack: 0.001, duration: 0.015, gain: 0.12 },
    selectClose: { type: 'dtmf', freqs: [300, 760], oscType: 'sine', attack: 0.001, duration: 0.012, gain: 0.11 },
    selectHover: { type: 'dtmf', freqs: [300, 720], oscType: 'sine', attack: 0.008, duration: 0.010, gain: 0.04 },
    // Toggle: two compound clicks in sequence
    toggleOn:  { type: 'two-note-up',   freqs: [400, 560], oscType: 'sine', attack: 0.001, duration: 0.06, gain: 0.26 },
    toggleOff: { type: 'two-note-down', freqs: [560, 400], oscType: 'sine', attack: 0.001, duration: 0.05, gain: 0.20 },
    // Error: double mechanical jam clunk
    error:   { type: 'double-tap', freqs: [360, 320], oscType: 'sine', attack: 0.001, duration: 0.08, gain: 0.30 },
    // Success: carriage-return bell — the one sound that rings
    success: { type: 'dtmf', freqs: [1200, 1580], oscType: 'sine', attack: 0.002, duration: 0.15, gain: 0.18 },
    // Slider detents: light mechanical notch
    sliderTick:    { type: 'dtmf', freqs: [300, 760], oscType: 'sine', attack: 0.001, duration: 0.012, gain: 0.14 },
    sliderGrab:    { type: 'dtmf', freqs: [340, 820], oscType: 'sine', attack: 0.001, duration: 0.015, gain: 0.18 },
    sliderRelease: { type: 'dtmf', freqs: [360, 900], oscType: 'sine', attack: 0.001, duration: 0.018, gain: 0.22 },
  },
);

/**
 * Tron — Low triangle-wave sustained tones. Electronic, sci-fi, glowing.
 */
const TRON: SoundProfile = derive(
  { freq: 0.7, attack: 0.4, dur: 0.7, gain: 0.9, osc: 'triangle' },
  {
    textType:   { type: 'tick', freqs: [280], oscType: 'triangle', attack: 0.002, duration: 0.04,  gain: 0.18 },
    textDelete: { type: 'tick', freqs: [200], oscType: 'triangle', attack: 0.002, duration: 0.035, gain: 0.14 },
    textFocus:  { type: 'focus-ascend',  freqs: [220, 300], oscType: 'triangle', attack: 0.006, duration: 0.10, gain: 0.16 },
    textBlur:   { type: 'focus-descend', freqs: [280, 200], oscType: 'triangle', attack: 0.005, duration: 0.08, gain: 0.14 },
    checkboxCheck:   { type: 'tick', freqs: [350], oscType: 'triangle', attack: 0.002, duration: 0.055, gain: 0.35 },
    checkboxUncheck: { type: 'tick', freqs: [250], oscType: 'triangle', attack: 0.002, duration: 0.045, gain: 0.25 },
    toggleOn:  { type: 'two-note-up',   freqs: [240, 340], oscType: 'triangle', attack: 0.003, duration: 0.12, gain: 0.28 },
    toggleOff: { type: 'two-note-down', freqs: [340, 240], oscType: 'triangle', attack: 0.003, duration: 0.11, gain: 0.22 },
    buttonPrimary:     { type: 'tick', freqs: [300], oscType: 'triangle', attack: 0.002, duration: 0.08, gain: 0.40 },
    buttonDestructive: { type: 'tick', freqs: [140], oscType: 'triangle', attack: 0.003, duration: 0.12, gain: 0.35 },
    selectHover: { type: 'tick', freqs: [220], oscType: 'triangle', attack: 0.008, duration: 0.025, gain: 0.05 },
    error:   { type: 'double-tap', freqs: [160, 140], oscType: 'triangle', attack: 0.002, duration: 0.16, gain: 0.32 },
    success: { type: 'two-note-up', freqs: [500, 680], oscType: 'sine', attack: 0.003, duration: 0.18, gain: 0.25 },
  },
);

export type ProfileName = 'default' | 'minimal' | 'bubbly' | 'pop' | 'tron';

export const PROFILES: Record<ProfileName, SoundProfile> = {
  default: SOUNDS as SoundProfile,
  minimal: MINIMAL,
  bubbly: BUBBLY,
  pop: POP,
  tron: TRON,
};

export const PROFILE_META: Record<ProfileName, { label: string; sub: string }> = {
  default:    { label: 'Default',    sub: 'Balanced sine tones' },
  minimal:    { label: 'Minimal',    sub: 'Barely-there whispers' },
  bubbly:     { label: 'Bubbly',     sub: 'Playful pops & bloops' },
  pop: { label: 'Pop',        sub: 'Dual-tone clicks' },
  tron:       { label: 'Tron',       sub: 'Electronic glow' },
};

/* ═══════════════════════════════════
   Sound Key Mapping (element+state → profile key)
   ═══════════════════════════════════ */

const SOUND_MAP: Record<string, Record<string, SoundKey>> = {
  'text-input': {
    focus: 'textFocus', typing: 'textType', delete: 'textDelete',
    paste: 'textPaste', autofill: 'textAutofill', blur: 'textBlur',
    error: 'error', success: 'success',
  },
  'password-input': {
    focus: 'textFocus', typing: 'textType', delete: 'textDelete',
    blur: 'textBlur', error: 'error',
  },
  'number-input': {
    focus: 'textFocus', typing: 'numberType', blur: 'textBlur', error: 'error',
  },
  textarea: {
    focus: 'textareaFocus', typing: 'textareaType', blur: 'textareaBlur',
  },
  checkbox: {
    check: 'checkboxCheck', uncheck: 'checkboxUncheck',
  },
  radio: {
    select: 'radioSelect',
  },
  toggle: {
    'switch-on': 'toggleOn', 'switch-off': 'toggleOff',
  },
  button: {
    'primary-press': 'buttonPrimary', 'destructive-press': 'buttonDestructive',
    'secondary-press': 'buttonSecondary',
  },
  select: {
    open: 'selectOpen', 'option-hover': 'selectHover', 'select-close': 'selectClose',
  },
  slider: {
    grab: 'sliderGrab', drag: 'sliderTick', release: 'sliderRelease',
  },
  'file-input': {
    click: 'fileBrowse', 'file-selected': 'fileSelected',
  },
  'details-summary': {
    expand: 'detailsExpand', collapse: 'detailsCollapse',
  },
};

/** Look up the profile sound key for a given element + state combination. */
export function getSoundKey(elementId: string, stateId: string): SoundKey | null {
  return SOUND_MAP[elementId]?.[stateId] ?? null;
}
