import type { SoundDef } from 'sonify-elements';
export type { SoundDef } from 'sonify-elements';

export interface SoundParams {
  attack: number;
  duration: number;
  pitch: number;
  amplitude: number;
  decay: number;
}

export interface MappingEntry {
  visual: string;
  sound: string;
}

export interface ElementState {
  id: string;
  label: string;
  silent: boolean;
  activeParts: string[];
  description: string;
  mapping: MappingEntry[];
  sound: SoundDef | null;
  params?: SoundParams;
}

export interface FormElement {
  id: string;
  label: string;
  tag: string;
  parts: string[];
  states: ElementState[];
}

export const ELEMENTS: FormElement[] = [
  {
    id: 'text-input',
    label: 'Text Input',
    tag: '<input type="text">',
    parts: ['container', 'border', 'label (floating)', 'placeholder', 'caret', 'helper text'],
    states: [
      {
        id: 'rest',
        label: 'Rest',
        silent: true,
        activeParts: ['container', 'border', 'placeholder'],
        description:
          'Silent. Sound at rest creates auditory fatigue. The element is present but inert — it has not been acted upon. Per the causality principle (Apple HIG), feedback must be linked to a user action. No action, no sound.',
        mapping: [
          { visual: 'border: 1px solid gray', sound: 'No change → silence' },
          { visual: 'fill: transparent', sound: 'No change → silence' },
          { visual: 'opacity: 1.0', sound: 'Full opacity = full rest' },
        ],
        sound: null,
      },
      {
        id: 'hover',
        label: 'Hover',
        silent: true,
        activeParts: ['container', 'border'],
        description:
          'Silent. Hover is too frequent and fleeting — it triggers on every pass of the cursor, often unintentionally. The visual border change is sufficient feedback. Sound here would be indistinguishable from accidental noise and would quickly become irritating.',
        mapping: [
          { visual: 'border: darkens slightly', sound: 'No sound — too frequent' },
          { visual: 'cursor: text', sound: 'Visual-only affordance' },
        ],
        sound: null,
      },
      {
        id: 'focus',
        label: 'Focus',
        silent: false,
        activeParts: ['container', 'border', 'label (floating)', 'caret'],
        description:
          'A soft, airy "open" — like a space being prepared. The gentle ascending onset mirrors the label floating up from placeholder position. Short and breathy, not strongly tonal. The attack matches the CSS transition timing (~150ms). This sound signals that the element is ready to receive input. Material Design categorizes this as a "primary" tier sound.',
        mapping: [
          { visual: 'border: 2px accent color', sound: 'Amplitude: low-medium onset' },
          { visual: 'label: floats up + shrinks', sound: 'Pitch: ascending (380→440Hz)' },
          { visual: 'caret: appears, blinking', sound: 'Attack: gentle 15ms' },
          { visual: 'transition: 150ms ease', sound: 'Duration: 120ms total' },
        ],
        sound: {
          type: 'focus-ascend',
          freqs: [380, 440],
          oscType: 'sine',
          attack: 0.015,
          duration: 0.12,
          gain: 0.2,
          timbre: 'Soft ascending breath',
        },
        params: { attack: 15, duration: 120, pitch: 72, amplitude: 40, decay: 80 },
      },
      {
        id: 'typing',
        label: 'Typing',
        silent: false,
        activeParts: ['caret', 'placeholder'],
        description:
          'Optional and most often omitted. If present: extremely short staccato micro-taps (~30ms). Slight random pitch micro-variation (±5%) prevents monotony during rapid repetition. Volume is very low. Samsung One UI uses sine waves tuned for minimal auditory fatigue, with differentiated sounds for input vs delete/backspace (lower, duller).',
        mapping: [
          { visual: 'character appears at caret', sound: 'Micro-tap at 700Hz ±5%' },
          { visual: 'caret advances right', sound: 'Duration: 30ms staccato' },
          { visual: 'placeholder fades out', sound: 'Volume: very low (0.15)' },
        ],
        sound: {
          type: 'tick',
          freqs: [700],
          oscType: 'sine',
          attack: 0.003,
          duration: 0.03,
          gain: 0.15,
          timbre: 'Staccato micro-tap',
        },
        params: { attack: 3, duration: 30, pitch: 58, amplitude: 30, decay: 20 },
      },
      {
        id: 'delete',
        label: 'Delete',
        silent: false,
        activeParts: ['caret'],
        description:
          'Lower-pitched, duller tick than character input. Samsung One UI differentiates input from delete — the pitch drop signals removal/subtraction. Same duration as typing ticks but frequency drops to ~500Hz.',
        mapping: [
          { visual: 'character removed at caret', sound: 'Tick at 500Hz (lower than input)' },
          { visual: 'caret moves left', sound: 'Duller timbre = subtraction' },
        ],
        sound: { type: 'tick', freqs: [500], oscType: 'sine', attack: 0.003, duration: 0.03, gain: 0.12, timbre: 'Dull removal tap' },
        params: { attack: 3, duration: 30, pitch: 42, amplitude: 24, decay: 18 },
      },
      {
        id: 'paste',
        label: 'Paste',
        silent: false,
        activeParts: ['caret', 'placeholder'],
        description:
          'A quick descending two-note "drop" — text is being placed into the field. Slightly longer and more prominent than a single typing tick because paste is a deliberate action that inserts multiple characters at once.',
        mapping: [
          { visual: 'multiple characters appear at once', sound: 'Two-note descending (680→560Hz)' },
          { visual: 'caret jumps forward', sound: 'Slightly longer than typing tick' },
        ],
        sound: { type: 'two-note-down', freqs: [680, 560], oscType: 'sine', attack: 0.004, duration: 0.08, gain: 0.18, timbre: 'Quick paste drop' },
        params: { attack: 4, duration: 80, pitch: 60, amplitude: 36, decay: 35 },
      },
      {
        id: 'select-text',
        label: 'Select Text',
        silent: true,
        activeParts: ['caret'],
        description:
          'Silent. Text selection is a passive, preparatory action — the user is reading/choosing before acting. Sound here would be premature and frequent (selection changes with every mouse movement).',
        mapping: [
          { visual: 'highlight: selection background', sound: 'No sound — passive action' },
        ],
        sound: null,
      },
      {
        id: 'autofill',
        label: 'Autofill',
        silent: false,
        activeParts: ['container', 'border', 'placeholder'],
        description:
          'A distinctive three-note ascending chime distinguishing browser autofill from user typing. Autofill is system-initiated — the user triggered it by selecting from the autofill dropdown, but the field-fill itself is automatic. The sound should feel "placed" rather than "typed."',
        mapping: [
          { visual: 'field fills with saved value', sound: 'Three-note ascending (400→480→560Hz)' },
          { visual: 'background: browser autofill tint', sound: 'Distinct from typing ticks' },
        ],
        sound: { type: 'three-note-up', freqs: [400, 480, 560], oscType: 'sine', attack: 0.008, duration: 0.15, gain: 0.22, timbre: 'Autocomplete chime' },
        params: { attack: 8, duration: 150, pitch: 55, amplitude: 44, decay: 55 },
      },
      {
        id: 'blur',
        label: 'Filled + Blur',
        silent: false,
        activeParts: ['container', 'border', 'label (floating)'],
        description:
          'A gentle "close" — the inverse of the focus sound. Slightly lower pitch, shorter duration. The border returning to rest = the sound settling. This conveys completion without judgment — the field has been filled but not yet validated. The paired-sound principle: same timbre as focus, descending pitch direction.',
        mapping: [
          { visual: 'border: returns to 1px', sound: 'Pitch: descending (420→360Hz)' },
          { visual: 'label: stays floating', sound: 'Amplitude: slightly softer than focus' },
          { visual: 'value: visible in field', sound: 'Duration: shorter (80ms)' },
        ],
        sound: {
          type: 'focus-descend',
          freqs: [420, 360],
          oscType: 'sine',
          attack: 0.01,
          duration: 0.08,
          gain: 0.18,
          timbre: 'Soft descending settle',
        },
        params: { attack: 10, duration: 80, pitch: 55, amplitude: 36, decay: 50 },
      },
      {
        id: 'error',
        label: 'Error',
        silent: false,
        activeParts: ['container', 'border', 'helper text'],
        description:
          'Two short low-pitched taps in quick succession, matching the visual shake animation. Low frequency conveys "something is wrong" without being punishing. The double-tap pattern is distinct from all other form sounds — it cannot be confused with success or navigation. Triangle wave adds subtle roughness. Material Design classifies this as an "alert" tier sound.',
        mapping: [
          { visual: 'border: red / error color', sound: 'Pitch: low (260Hz, 240Hz)' },
          { visual: 'shake animation: 2 jolts', sound: 'Pattern: double-tap, 100ms apart' },
          { visual: 'helper text: error message', sound: 'Timbre: triangle wave (rougher)' },
          { visual: 'color temperature: warm red', sound: 'Low frequency register' },
        ],
        sound: {
          type: 'double-tap',
          freqs: [260, 240],
          oscType: 'triangle',
          attack: 0.005,
          duration: 0.18,
          gain: 0.35,
          timbre: 'Low double-tap',
        },
        params: { attack: 5, duration: 180, pitch: 22, amplitude: 70, decay: 40 },
      },
      {
        id: 'success',
        label: 'Success',
        silent: false,
        activeParts: ['container', 'border', 'helper text'],
        description:
          'A brief ascending two-note micro-chime. Highest pitch of any state sound for this element. The ascending interval mirrors positive visual feedback (green tint, checkmark icon). Duration is short because validation may trigger frequently. The rising pitch creates a cross-modal "lift" that reinforces the green/positive visual signal.',
        mapping: [
          { visual: 'border: success green', sound: 'Pitch: ascending (520→700Hz)' },
          { visual: 'checkmark icon appears', sound: 'Two notes, 70ms apart' },
          { visual: 'color temperature: cool green', sound: 'Higher frequency register' },
        ],
        sound: {
          type: 'two-note-up',
          freqs: [520, 700],
          oscType: 'sine',
          attack: 0.005,
          duration: 0.14,
          gain: 0.3,
          timbre: 'Ascending micro-chime',
        },
        params: { attack: 5, duration: 140, pitch: 82, amplitude: 60, decay: 60 },
      },
      {
        id: 'disabled',
        label: 'Disabled',
        silent: true,
        activeParts: [],
        description:
          'Silent. Disabled elements do not respond to interaction — producing sound would break the causality principle. Sound must be linked to a user action that produces a result. A disabled element absorbs the action without effect, so it must absorb the sound too. Visual opacity reduction (typically 0.4–0.5) already communicates inertness.',
        mapping: [
          { visual: 'opacity: 0.4–0.5', sound: 'No sound — no response' },
          { visual: 'cursor: not-allowed', sound: 'Causality: no action = no feedback' },
          { visual: 'pointer-events: none', sound: 'Element is inert' },
        ],
        sound: null,
      },
    ],
  },
  {
    id: 'checkbox',
    label: 'Checkbox',
    tag: '<input type="checkbox">',
    parts: ['box', 'checkmark', 'label', 'focus ring'],
    states: [
      {
        id: 'unchecked',
        label: 'Unchecked',
        silent: true,
        activeParts: ['box', 'label'],
        description:
          'Silent. The resting state of an unchecked checkbox is inert. No user action has occurred. The empty box is a visual affordance, not an event.',
        mapping: [
          { visual: 'box: empty, bordered', sound: 'No change → silence' },
          { visual: 'label: default color', sound: 'No action → no feedback' },
        ],
        sound: null,
      },
      {
        id: 'hover',
        label: 'Hover',
        silent: true,
        activeParts: ['box'],
        description:
          'Silent. Hover feedback is visual-only (subtle background fill or border darken). Too frequent for audio.',
        mapping: [{ visual: 'box: subtle bg fill', sound: 'No sound — too frequent' }],
        sound: null,
      },
      {
        id: 'check',
        label: 'Check',
        silent: false,
        activeParts: ['box', 'checkmark', 'focus ring'],
        description:
          "A crisp, definitive \"tick\" — like a mechanical latch clicking into place. Very fast attack (<5ms) mirrors the instantaneous visual fill. The checkmark drawing animation is ~100ms; the sound's decay tail aligns with it. Medium-high pitch conveys positive/additive action. Physical metaphor: a pen stroke completing a mark.",
        mapping: [
          { visual: 'box: fills with accent color', sound: 'Amplitude: full onset (0.40 gain)' },
          { visual: 'checkmark: draws in ~100ms', sound: 'Decay aligns with draw animation' },
          { visual: 'scale: micro-bounce', sound: 'Attack: <5ms (crisp)' },
          { visual: 'color: accent fill', sound: 'Pitch: 880Hz (medium-high)' },
        ],
        sound: {
          type: 'tick',
          freqs: [880],
          oscType: 'sine',
          attack: 0.003,
          duration: 0.06,
          gain: 0.4,
          timbre: 'Crisp mechanical tick',
        },
        params: { attack: 3, duration: 60, pitch: 88, amplitude: 80, decay: 45 },
      },
      {
        id: 'uncheck',
        label: 'Uncheck',
        silent: false,
        activeParts: ['box', 'checkmark', 'focus ring'],
        description:
          'Same timbre family as check but lower pitch and slightly softer. The pair must feel like two sides of the same switch — related but easily distinguishable. The pitch drop signals removal/subtraction. Marginally shorter duration since unchecking is a "lighter" action. The paired-sound principle in action.',
        mapping: [
          { visual: 'box: empties, returns to border', sound: 'Pitch: 660Hz (lower than check)' },
          { visual: 'checkmark: fades/shrinks', sound: 'Amplitude: softer (0.30 gain)' },
          { visual: 'color: returns to neutral', sound: 'Duration: shorter (50ms)' },
        ],
        sound: {
          type: 'tick',
          freqs: [660],
          oscType: 'sine',
          attack: 0.003,
          duration: 0.05,
          gain: 0.3,
          timbre: 'Softer tick, lower',
        },
        params: { attack: 3, duration: 50, pitch: 66, amplitude: 60, decay: 35 },
      },
      {
        id: 'disabled',
        label: 'Disabled',
        silent: true,
        activeParts: [],
        description: 'Silent. No interaction, no feedback.',
        mapping: [{ visual: 'opacity: reduced', sound: 'Causality: inert element' }],
        sound: null,
      },
    ],
  },
  {
    id: 'radio',
    label: 'Radio Button',
    tag: '<input type="radio">',
    parts: ['outer circle', 'inner dot', 'label', 'focus ring'],
    states: [
      {
        id: 'unselected',
        label: 'Unselected',
        silent: true,
        activeParts: ['outer circle', 'label'],
        description:
          'Silent. The resting, unselected state. The empty circle is a visual affordance indicating availability.',
        mapping: [{ visual: 'circle: empty, bordered', sound: 'No change → silence' }],
        sound: null,
      },
      {
        id: 'select',
        label: 'Select',
        silent: false,
        activeParts: ['outer circle', 'inner dot', 'focus ring'],
        description:
          'Softer and shorter than a checkbox tick. Radio is a single-choice-in-group action that happens alongside the deselection of the previous option, so it must not be too prominent or it will double up perceptually. The sound is rounder and more contained than the checkbox tick, matching the circular visual form. Think "pip" not "tick."',
        mapping: [
          { visual: 'inner dot: scales in', sound: 'Pitch: 720Hz (gentle pip)' },
          { visual: 'circle: accent color', sound: 'Amplitude: moderate (0.28)' },
          { visual: 'animation: dot grows from center', sound: 'Duration: very short (40ms)' },
        ],
        sound: {
          type: 'tick',
          freqs: [720],
          oscType: 'sine',
          attack: 0.004,
          duration: 0.04,
          gain: 0.28,
          timbre: 'Gentle pip',
        },
        params: { attack: 4, duration: 40, pitch: 72, amplitude: 56, decay: 28 },
      },
      {
        id: 'sibling-deselect',
        label: 'Sibling Deselects',
        silent: true,
        activeParts: ['inner dot'],
        description:
          'Silent. The deselection is a consequence of the selection, not a direct user action. Producing sound would create a confusing double event. Only the causative action (selecting the new option) gets audio feedback. This is a key application of the causality principle — one of the clearest examples in form design.',
        mapping: [
          { visual: 'inner dot: fades out', sound: 'No sound — consequential action' },
          { visual: 'circle: returns to neutral', sound: 'Causality: user did not act here' },
        ],
        sound: null,
      },
      {
        id: 'disabled',
        label: 'Disabled',
        silent: true,
        activeParts: [],
        description: 'Silent. No interaction, no feedback.',
        mapping: [{ visual: 'opacity: reduced', sound: 'Causality: inert element' }],
        sound: null,
      },
    ],
  },
  {
    id: 'toggle',
    label: 'Toggle / Switch',
    tag: '<div role="switch">',
    parts: ['track', 'thumb', 'on/off label', 'focus ring'],
    states: [
      {
        id: 'off',
        label: 'Off (Rest)',
        silent: true,
        activeParts: ['track', 'thumb'],
        description:
          'Silent. The toggle is in its resting off position. No user action has occurred.',
        mapping: [
          { visual: 'track: muted/gray', sound: 'No change → silence' },
          { visual: 'thumb: left position', sound: 'Resting state' },
        ],
        sound: null,
      },
      {
        id: 'switch-on',
        label: 'Switch On',
        silent: false,
        activeParts: ['track', 'thumb', 'on/off label'],
        description:
          'A quick two-note ascending pair — low → high. The interval is small (major second or third). The two distinct notes mirror the binary nature of the toggle. Ascending direction means "activation." The thumb sliding right and the pitch rising create a cross-modal metaphor. Sound timing syncs with the thumb reaching its final position (after any spring overshoot).',
        mapping: [
          { visual: 'thumb: slides right', sound: 'Pitch: ascending (500→660Hz)' },
          { visual: 'track: fills with accent color', sound: 'Amplitude: medium (0.35)' },
          { visual: 'transition: spring ease ~200ms', sound: 'Duration: 140ms' },
          { visual: 'label: changes to "On"', sound: 'Two notes = binary toggle' },
        ],
        sound: {
          type: 'two-note-up',
          freqs: [500, 660],
          oscType: 'sine',
          attack: 0.004,
          duration: 0.14,
          gain: 0.35,
          timbre: 'Quick ascending pair',
        },
        params: { attack: 4, duration: 140, pitch: 65, amplitude: 70, decay: 55 },
      },
      {
        id: 'switch-off',
        label: 'Switch Off',
        silent: false,
        activeParts: ['track', 'thumb', 'on/off label'],
        description:
          'The inverse pair — high → low. Same timbre and interval as the on sound, just reversed. Slightly softer overall — deactivation is inherently less energetic than activation. A user should never confuse which direction they toggled based on the sound alone. The paired-sound principle ensures immediate recognition.',
        mapping: [
          { visual: 'thumb: slides left', sound: 'Pitch: descending (660→500Hz)' },
          { visual: 'track: returns to gray', sound: 'Amplitude: slightly softer (0.28)' },
          { visual: 'transition: spring ease ~200ms', sound: 'Duration: 130ms' },
          { visual: 'label: changes to "Off"', sound: 'Descending = deactivation' },
        ],
        sound: {
          type: 'two-note-down',
          freqs: [660, 500],
          oscType: 'sine',
          attack: 0.004,
          duration: 0.13,
          gain: 0.28,
          timbre: 'Quick descending pair',
        },
        params: { attack: 4, duration: 130, pitch: 55, amplitude: 56, decay: 50 },
      },
    ],
  },
  {
    id: 'button',
    label: 'Button',
    tag: '<button>',
    parts: ['container', 'label', 'icon', 'focus ring', 'ripple effect'],
    states: [
      {
        id: 'rest',
        label: 'Rest',
        silent: true,
        activeParts: ['container', 'label'],
        description:
          'Silent. The button awaits interaction. Its visual affordance (filled container, label text) communicates clickability without sound.',
        mapping: [
          { visual: 'container: filled, accent or neutral', sound: 'No change → silence' },
          { visual: 'elevation: subtle shadow', sound: 'Resting state' },
        ],
        sound: null,
      },
      {
        id: 'hover',
        label: 'Hover',
        silent: true,
        activeParts: ['container'],
        description:
          'Silent. Exception: game UIs or explicitly playful interfaces may use a very subtle hover tick, but this is rare and opt-in. For standard form UI, hover sound is omitted to avoid fatigue.',
        mapping: [
          {
            visual: 'container: slight brightness/elevation change',
            sound: 'No sound — standard UI convention',
          },
        ],
        sound: null,
      },
      {
        id: 'primary-press',
        label: 'Primary Press',
        silent: false,
        activeParts: ['container', 'label', 'ripple effect'],
        description:
          "The most \"physical\" sound in the entire form vocabulary. A definitive mechanical click with fast attack, matching the CSS scale(0.98) compression. This is the most important form sound — it confirms the primary action was received. Medium-high pitch, medium amplitude. The ripple animation's expansion should temporally match the sound's decay. Material Design treats this as a \"hero\" tier sound.",
        mapping: [
          { visual: 'scale: 0.98 (press compression)', sound: 'Attack: <5ms (definitive)' },
          { visual: 'ripple: expands from click point', sound: 'Decay: matches ripple expansion' },
          { visual: 'fill: darkens momentarily', sound: 'Pitch: 600Hz (medium-high)' },
          { visual: 'elevation: drops to 0', sound: 'Amplitude: highest (0.45)' },
        ],
        sound: {
          type: 'tick',
          freqs: [600],
          oscType: 'sine',
          attack: 0.003,
          duration: 0.07,
          gain: 0.45,
          timbre: 'Definitive mechanical click',
        },
        params: { attack: 3, duration: 70, pitch: 60, amplitude: 90, decay: 50 },
      },
      {
        id: 'destructive-press',
        label: 'Destructive Press',
        silent: false,
        activeParts: ['container', 'label', 'ripple effect'],
        description:
          "Lower pitch, slightly longer, more \"weighted\" than the primary click. Triangle wave adds subtle edge/roughness. Lower frequency signals seriousness and irreversibility. This sound should make the user pause — add gravitas, but don't startle. The amplitude hierarchy principle: destructive uses lower pitch (gravity), not higher volume (aggression).",
        mapping: [
          { visual: 'fill: red / destructive color', sound: 'Pitch: 180Hz (low, weighted)' },
          { visual: 'scale: 0.98', sound: 'Timbre: triangle wave (rougher)' },
          { visual: 'color temperature: warm red', sound: 'Low frequency = seriousness' },
          { visual: 'ripple: slower expansion', sound: 'Duration: 120ms (longer)' },
        ],
        sound: {
          type: 'tick',
          freqs: [180],
          oscType: 'triangle',
          attack: 0.005,
          duration: 0.12,
          gain: 0.4,
          timbre: 'Weighted thud with sub-bass',
        },
        params: { attack: 5, duration: 120, pitch: 12, amplitude: 80, decay: 70 },
      },
      {
        id: 'secondary-press',
        label: 'Secondary Press',
        silent: false,
        activeParts: ['container', 'label'],
        description:
          'Same timbre as primary but quieter and shorter. The visual hierarchy (filled vs outlined button) is mirrored in the amplitude hierarchy. Secondary actions should sound subordinate to primary ones. This is the amplitude hierarchy principle in direct application.',
        mapping: [
          { visual: 'border: outlined container', sound: 'Amplitude: quieter (0.25)' },
          { visual: 'scale: 0.98', sound: 'Pitch: 500Hz (slightly lower)' },
          { visual: 'fill: subtle bg change', sound: 'Duration: shorter (50ms)' },
        ],
        sound: {
          type: 'tick',
          freqs: [500],
          oscType: 'sine',
          attack: 0.005,
          duration: 0.05,
          gain: 0.25,
          timbre: 'Lighter subordinate tap',
        },
        params: { attack: 5, duration: 50, pitch: 50, amplitude: 50, decay: 32 },
      },
    ],
  },
  {
    id: 'select',
    label: 'Select / Dropdown',
    tag: '<select>',
    parts: ['trigger', 'chevron', 'floating panel', 'option list', 'selected option', 'scroll indicator'],
    states: [
      {
        id: 'closed',
        label: 'Closed',
        silent: true,
        activeParts: ['trigger', 'chevron'],
        description:
          'Silent. The select element is in its collapsed resting state. The trigger displays the current value (or placeholder) with a chevron indicating expandability.',
        mapping: [
          { visual: 'trigger: displays value', sound: 'No change → silence' },
          { visual: 'chevron: pointing down', sound: 'Resting state' },
        ],
        sound: null,
      },
      {
        id: 'open',
        label: 'Open',
        silent: false,
        activeParts: ['trigger', 'chevron', 'floating panel', 'option list'],
        description:
          "A soft ascending \"unfold\" — the sonic equivalent of a drawer sliding open. The sound has a slow attack matching the panel's CSS transition (ease-out, ~150ms). Slightly resonant to convey the spatial quality of a panel expanding. The pitch rise mirrors the chevron rotation and panel expansion. A three-note ascending run creates the unfolding sensation.",
        mapping: [
          { visual: 'panel: scales/fades in', sound: 'Pitch: ascending run (360→420→480Hz)' },
          { visual: 'chevron: rotates 180°', sound: 'Attack: slow (10ms) = ease-out feel' },
          { visual: 'transition: ease-out 150ms', sound: 'Duration: 160ms (matches transition)' },
          { visual: 'elevation: panel shadow appears', sound: 'Slight resonance = spatial quality' },
        ],
        sound: {
          type: 'three-note-up',
          freqs: [360, 420, 480],
          oscType: 'sine',
          attack: 0.01,
          duration: 0.16,
          gain: 0.2,
          timbre: 'Ascending unfold run',
        },
        params: { attack: 10, duration: 160, pitch: 45, amplitude: 40, decay: 65 },
      },
      {
        id: 'option-hover',
        label: 'Option Hover',
        silent: false,
        activeParts: ['option list', 'selected option'],
        description:
          'Extremely subtle tick per option. Volume is very low and duration is minimal (~20ms) since this runs in rapid succession as the user navigates the list. Physical metaphor: scrolling through a mechanical rolodex. Frequently omitted in production — shown here as an optional, toggleable layer.',
        mapping: [
          { visual: 'option: highlight bg moves', sound: 'Micro-tick at 600Hz ±3%' },
          { visual: 'transition: instant', sound: 'Duration: 20ms (minimal)' },
        ],
        sound: {
          type: 'tick',
          freqs: [600],
          oscType: 'sine',
          attack: 0.003,
          duration: 0.02,
          gain: 0.08,
          timbre: 'Micro-tick (very subtle)',
        },
        params: { attack: 3, duration: 20, pitch: 60, amplitude: 16, decay: 12 },
      },
      {
        id: 'select-close',
        label: 'Select + Close',
        silent: false,
        activeParts: ['trigger', 'chevron', 'floating panel', 'selected option'],
        description:
          'A compound sound: brief confirmation "pluck" followed by a descending tail that mirrors the panel closing. The confirmation is definitive (fast attack) while the closing fade is gentle. This is the timbral inverse of the open sound — same family, descending instead of ascending. The paired-sound principle applied to a three-note pattern.',
        mapping: [
          { visual: 'option: selected, highlighted', sound: 'Confirmation pluck (520Hz)' },
          { visual: 'panel: fades/scales out', sound: 'Descending tail (440→380Hz)' },
          { visual: 'chevron: rotates back', sound: 'Duration: 150ms compound' },
          { visual: 'trigger: updates displayed value', sound: 'Paired inverse of open sound' },
        ],
        sound: {
          type: 'three-note-down',
          freqs: [520, 440, 380],
          oscType: 'sine',
          attack: 0.005,
          duration: 0.15,
          gain: 0.3,
          timbre: 'Descending close pluck',
        },
        params: { attack: 5, duration: 150, pitch: 50, amplitude: 60, decay: 60 },
      },
    ],
  },
  {
    id: 'slider',
    label: 'Range Slider',
    tag: '<input type="range">',
    parts: ['track', 'fill/progress', 'thumb', 'tick marks', 'value tooltip'],
    states: [
      {
        id: 'rest',
        label: 'Rest',
        silent: true,
        activeParts: ['track', 'thumb'],
        description:
          'Silent. The slider is at rest, displaying its current value position. The track and thumb are visual affordances.',
        mapping: [
          { visual: 'track: full length visible', sound: 'No change → silence' },
          { visual: 'thumb: positioned at value', sound: 'Resting state' },
        ],
        sound: null,
      },
      {
        id: 'grab',
        label: 'Thumb Grab',
        silent: false,
        activeParts: ['thumb', 'value tooltip'],
        description:
          "A brief tactile \"grab\" confirming the thumb is engaged. Matches the visual scale-up of the thumb (1.0 → 1.3). Short and non-committal since the real interaction hasn't started yet. This sound says \"I've got it\" without implying a value change.",
        mapping: [
          { visual: 'thumb: scales up (1.0→1.3)', sound: 'Pitch: 400Hz (neutral)' },
          { visual: 'tooltip: appears with value', sound: 'Amplitude: moderate (0.25)' },
          { visual: 'cursor: grabbing', sound: 'Duration: brief (40ms)' },
        ],
        sound: {
          type: 'tick',
          freqs: [400],
          oscType: 'sine',
          attack: 0.005,
          duration: 0.04,
          gain: 0.25,
          timbre: 'Brief tactile grab',
        },
        params: { attack: 5, duration: 40, pitch: 40, amplitude: 50, decay: 25 },
      },
      {
        id: 'drag',
        label: 'Dragging',
        silent: false,
        activeParts: ['track', 'fill/progress', 'thumb', 'tick marks', 'value tooltip'],
        description:
          'Discrete detent clicks at each step boundary — like a ratchet mechanism or a physical knob with notches. Pitch maps to slider position: low at min, high at max. Click spacing conveys drag speed. This creates proprioceptive feedback without the fatigue of a continuous tone.',
        mapping: [
          { visual: 'fill: grows/shrinks with thumb', sound: 'Pitch: maps to value (250–700Hz)' },
          { visual: 'thumb: position = value', sound: 'Detent click per step boundary' },
          { visual: 'tick marks: pass under thumb', sound: 'Click spacing = drag speed' },
        ],
        sound: {
          type: 'tick',
          freqs: [400],
          oscType: 'sine',
          attack: 0.003,
          duration: 0.035,
          gain: 0.22,
          timbre: 'Stepped detent click',
        },
        params: { attack: 3, duration: 35, pitch: 40, amplitude: 44, decay: 22 },
      },
      {
        id: 'release',
        label: 'Release',
        silent: false,
        activeParts: ['thumb', 'value tooltip'],
        description:
          'A brief "settle" sound confirming the final value. The pitch of this terminal note can match the final slider position, resolving the continuous drag tone into a single definitive note. Physical metaphor: a ball landing in a notch. The sound provides closure after the continuous drag experience.',
        mapping: [
          { visual: 'thumb: scales back (1.3→1.0)', sound: 'Pitch: 500Hz (settle)' },
          { visual: 'tooltip: fades after delay', sound: 'Amplitude: definitive (0.30)' },
          { visual: 'fill: final position locked', sound: 'Duration: 60ms (crisp resolution)' },
        ],
        sound: {
          type: 'tick',
          freqs: [500],
          oscType: 'sine',
          attack: 0.005,
          duration: 0.06,
          gain: 0.3,
          timbre: 'Settle pluck',
        },
        params: { attack: 5, duration: 60, pitch: 50, amplitude: 60, decay: 40 },
      },
    ],
  },
  {
    id: 'number-input',
    label: 'Number',
    tag: '<input type="number">',
    parts: ['container', 'border', 'digits', 'spin buttons', 'caret'],
    states: [
      {
        id: 'rest', label: 'Rest', silent: true,
        activeParts: ['container', 'border'],
        description: 'Silent. The number input awaits interaction.',
        mapping: [{ visual: 'border: default', sound: 'No change \u2192 silence' }],
        sound: null,
      },
      {
        id: 'focus', label: 'Focus', silent: false,
        activeParts: ['container', 'border', 'caret'],
        description: 'Same ascending open as text input.',
        mapping: [
          { visual: 'border: accent color', sound: 'Pitch: ascending (380\u2192440Hz)' },
        ],
        sound: { type: 'focus-ascend', freqs: [380, 440], oscType: 'sine', attack: 0.015, duration: 0.12, gain: 0.20, timbre: 'Ascending breath' },
        params: { attack: 15, duration: 120, pitch: 72, amplitude: 40, decay: 80 },
      },
      {
        id: 'typing', label: 'Typing (Phone Tones)', silent: false,
        activeParts: ['digits', 'caret'],
        description: 'DTMF dual-tone multi-frequency \u2014 each digit plays its unique pair of frequencies simultaneously, exactly like a phone keypad. The row frequency (697\u2013941 Hz) and column frequency (1209\u20131477 Hz) combine to create a distinct tone per digit. This gives the user immediate auditory confirmation of which digit was pressed without looking.',
        mapping: [
          { visual: 'digit appears', sound: 'DTMF: two simultaneous sine tones' },
          { visual: 'each digit is unique', sound: 'e.g. "5" = 770 Hz + 1336 Hz' },
        ],
        sound: { type: 'dtmf', freqs: [697, 1209], oscType: 'sine', attack: 0.005, duration: 0.10, gain: 0.20, timbre: 'DTMF dual-tone' },
        params: { attack: 5, duration: 100, pitch: 65, amplitude: 40, decay: 30 },
      },
      {
        id: 'blur', label: 'Filled + Blur', silent: false,
        activeParts: ['container', 'border'],
        description: 'Descending settle, same as text input.',
        mapping: [
          { visual: 'border: returns to default', sound: 'Pitch: descending (420\u2192360Hz)' },
        ],
        sound: { type: 'focus-descend', freqs: [420, 360], oscType: 'sine', attack: 0.01, duration: 0.08, gain: 0.18, timbre: 'Descending settle' },
        params: { attack: 10, duration: 80, pitch: 55, amplitude: 36, decay: 50 },
      },
      {
        id: 'disabled', label: 'Disabled', silent: true,
        activeParts: [],
        description: 'Silent. Inert element.',
        mapping: [{ visual: 'opacity: reduced', sound: 'No response' }],
        sound: null,
      },
    ],
  },
  {
    id: 'password-input',
    label: 'Password',
    tag: '<input type="password">',
    parts: ['container', 'border', 'bullets', 'visibility toggle', 'caret'],
    states: [
      {
        id: 'rest', label: 'Rest', silent: true,
        activeParts: ['container', 'border'],
        description: 'Silent. Same as text input — the element awaits interaction.',
        mapping: [{ visual: 'border: 1px solid gray', sound: 'No change → silence' }],
        sound: null,
      },
      {
        id: 'focus', label: 'Focus', silent: false,
        activeParts: ['container', 'border', 'caret'],
        description: 'Same ascending open as text input but slightly lower register — the field is preparing to receive secret input. The subtle pitch difference from a text field is not consciously noticed but contributes to a distinct identity.',
        mapping: [
          { visual: 'border: accent color', sound: 'Pitch: ascending (360→420Hz)' },
          { visual: 'caret: appears', sound: 'Attack: gentle 15ms' },
        ],
        sound: { type: 'focus-ascend', freqs: [360, 420], oscType: 'sine', attack: 0.015, duration: 0.12, gain: 0.18, timbre: 'Muted ascending breath' },
        params: { attack: 15, duration: 120, pitch: 68, amplitude: 36, decay: 78 },
      },
      {
        id: 'typing', label: 'Typing', silent: false,
        activeParts: ['bullets', 'caret'],
        description: 'Lower-pitched micro-taps than text input (600Hz vs 700Hz). The lower pitch subtly suggests obscurity — the sound is "heavier," matching the visual weight of the bullet characters that replace typed letters.',
        mapping: [
          { visual: 'bullet (●) appears', sound: 'Tick at 600Hz (lower than text)' },
          { visual: 'character obscured', sound: 'Slightly muted timbre' },
        ],
        sound: { type: 'tick', freqs: [600], oscType: 'sine', attack: 0.003, duration: 0.03, gain: 0.13, timbre: 'Muted micro-tap' },
        params: { attack: 3, duration: 30, pitch: 50, amplitude: 26, decay: 18 },
      },
      {
        id: 'blur', label: 'Filled + Blur', silent: false,
        activeParts: ['container', 'border', 'bullets'],
        description: 'Descending settle, paired inverse of focus.',
        mapping: [
          { visual: 'border: returns to default', sound: 'Pitch: descending (400→340Hz)' },
        ],
        sound: { type: 'focus-descend', freqs: [400, 340], oscType: 'sine', attack: 0.01, duration: 0.08, gain: 0.16, timbre: 'Muted descending settle' },
        params: { attack: 10, duration: 80, pitch: 50, amplitude: 32, decay: 48 },
      },
      {
        id: 'error', label: 'Error', silent: false,
        activeParts: ['container', 'border'],
        description: 'Same double-tap as text input — error patterns should be consistent across all text-type inputs.',
        mapping: [
          { visual: 'border: red', sound: 'Double-tap (260, 240Hz)' },
          { visual: 'shake animation', sound: 'Triangle wave roughness' },
        ],
        sound: { type: 'double-tap', freqs: [260, 240], oscType: 'triangle', attack: 0.005, duration: 0.18, gain: 0.35, timbre: 'Low double-tap' },
        params: { attack: 5, duration: 180, pitch: 22, amplitude: 70, decay: 40 },
      },
      {
        id: 'disabled', label: 'Disabled', silent: true,
        activeParts: [],
        description: 'Silent. Inert element.',
        mapping: [{ visual: 'opacity: reduced', sound: 'No response' }],
        sound: null,
      },
    ],
  },
  {
    id: 'file-input',
    label: 'File Input',
    tag: '<input type="file">',
    parts: ['button', 'filename label', 'border', 'drop zone'],
    states: [
      {
        id: 'rest', label: 'Rest', silent: true,
        activeParts: ['button', 'filename label'],
        description: 'Silent. The file input shows a browse button and "No file chosen" label.',
        mapping: [{ visual: 'button: default state', sound: 'No change → silence' }],
        sound: null,
      },
      {
        id: 'click', label: 'Browse Click', silent: false,
        activeParts: ['button'],
        description: 'A definitive click confirming the file dialog is opening. Similar to a primary button press — it\'s a deliberate action with a system-level consequence (OS file picker).',
        mapping: [
          { visual: 'button: pressed', sound: 'Pitch: 550Hz click' },
          { visual: 'OS dialog: opens', sound: 'Amplitude: medium (0.35)' },
        ],
        sound: { type: 'tick', freqs: [550], oscType: 'sine', attack: 0.003, duration: 0.07, gain: 0.35, timbre: 'Definitive browse click' },
        params: { attack: 3, duration: 70, pitch: 55, amplitude: 70, decay: 48 },
      },
      {
        id: 'file-selected', label: 'File Selected', silent: false,
        activeParts: ['button', 'filename label'],
        description: 'An ascending two-note chime confirming the file was chosen. Similar to a success state — the action completed positively. The filename now appears in the label.',
        mapping: [
          { visual: 'label: shows filename', sound: 'Ascending (480→640Hz)' },
          { visual: 'border: success tint', sound: 'Two-note confirmation' },
        ],
        sound: { type: 'two-note-up', freqs: [480, 640], oscType: 'sine', attack: 0.005, duration: 0.13, gain: 0.28, timbre: 'File confirmed chime' },
        params: { attack: 5, duration: 130, pitch: 72, amplitude: 56, decay: 55 },
      },
      {
        id: 'disabled', label: 'Disabled', silent: true,
        activeParts: [],
        description: 'Silent. Inert element.',
        mapping: [{ visual: 'opacity: reduced', sound: 'No response' }],
        sound: null,
      },
    ],
  },
  {
    id: 'details-summary',
    label: 'Details / Summary',
    tag: '<details>',
    parts: ['summary', 'disclosure triangle', 'content panel'],
    states: [
      {
        id: 'collapsed', label: 'Collapsed', silent: true,
        activeParts: ['summary', 'disclosure triangle'],
        description: 'Silent. The details element is closed, showing only the summary text and disclosure triangle.',
        mapping: [{ visual: 'triangle: pointing right', sound: 'No change → silence' }],
        sound: null,
      },
      {
        id: 'expand', label: 'Expand', silent: false,
        activeParts: ['summary', 'disclosure triangle', 'content panel'],
        description: 'An ascending two-note unfold — the sonic equivalent of a panel opening. Same principle as the select dropdown open but with a slightly different pitch to distinguish accordion from menu. The disclosure triangle rotates down as the pitch rises.',
        mapping: [
          { visual: 'triangle: rotates to down', sound: 'Pitch: ascending (440→580Hz)' },
          { visual: 'content: slides/fades in', sound: 'Duration: 120ms' },
        ],
        sound: { type: 'two-note-up', freqs: [440, 580], oscType: 'sine', attack: 0.006, duration: 0.12, gain: 0.30, timbre: 'Ascending unfold' },
        params: { attack: 6, duration: 120, pitch: 62, amplitude: 60, decay: 50 },
      },
      {
        id: 'collapse', label: 'Collapse', silent: false,
        activeParts: ['summary', 'disclosure triangle'],
        description: 'The paired descending inverse. Same timbre family as expand, opposite pitch direction. Slightly softer — closing is less energetic than opening.',
        mapping: [
          { visual: 'triangle: rotates to right', sound: 'Pitch: descending (580→440Hz)' },
          { visual: 'content: collapses', sound: 'Slightly softer (0.25 gain)' },
        ],
        sound: { type: 'two-note-down', freqs: [580, 440], oscType: 'sine', attack: 0.006, duration: 0.11, gain: 0.25, timbre: 'Descending fold' },
        params: { attack: 6, duration: 110, pitch: 52, amplitude: 50, decay: 45 },
      },
    ],
  },
  {
    id: 'textarea',
    label: 'Textarea',
    tag: '<textarea>',
    parts: ['container', 'border', 'text content', 'scrollbar', 'resize handle'],
    states: [
      {
        id: 'rest', label: 'Rest', silent: true,
        activeParts: ['container', 'border'],
        description: 'Silent. The textarea awaits input. Its larger visual footprint compared to a text input suggests more content is expected.',
        mapping: [{ visual: 'border: default', sound: 'No change → silence' }],
        sound: null,
      },
      {
        id: 'focus', label: 'Focus', silent: false,
        activeParts: ['container', 'border'],
        description: 'Slightly deeper ascending open than text input (340→400Hz vs 380→440Hz). The lower register matches the larger visual canvas — a bigger space being prepared.',
        mapping: [
          { visual: 'border: accent color', sound: 'Pitch: ascending (340→400Hz)' },
          { visual: 'caret: appears', sound: 'Deeper than text input' },
        ],
        sound: { type: 'focus-ascend', freqs: [340, 400], oscType: 'sine', attack: 0.015, duration: 0.12, gain: 0.18, timbre: 'Deep ascending breath' },
        params: { attack: 15, duration: 120, pitch: 62, amplitude: 36, decay: 78 },
      },
      {
        id: 'typing', label: 'Typing', silent: false,
        activeParts: ['text content'],
        description: 'Same staccato micro-taps as text input. No change in sound for multiline — the per-character feedback should be consistent across all text-type inputs.',
        mapping: [
          { visual: 'characters appear', sound: 'Micro-tap at 680Hz' },
        ],
        sound: { type: 'tick', freqs: [680], oscType: 'sine', attack: 0.003, duration: 0.03, gain: 0.14, timbre: 'Staccato micro-tap' },
        params: { attack: 3, duration: 30, pitch: 56, amplitude: 28, decay: 18 },
      },
      {
        id: 'blur', label: 'Filled + Blur', silent: false,
        activeParts: ['container', 'border', 'text content'],
        description: 'Descending settle matching the deeper focus tone.',
        mapping: [
          { visual: 'border: returns to default', sound: 'Pitch: descending (380→320Hz)' },
        ],
        sound: { type: 'focus-descend', freqs: [380, 320], oscType: 'sine', attack: 0.01, duration: 0.08, gain: 0.16, timbre: 'Deep descending settle' },
        params: { attack: 10, duration: 80, pitch: 48, amplitude: 32, decay: 48 },
      },
      {
        id: 'disabled', label: 'Disabled', silent: true,
        activeParts: [],
        description: 'Silent. Inert element.',
        mapping: [{ visual: 'opacity: reduced', sound: 'No response' }],
        sound: null,
      },
    ],
  },
];
