import { SoundEngine } from './engine';
import { SOUNDS, PROFILES, DTMF } from './sounds';
import type { SoundDef, ProfileName } from './sounds';

export { SoundEngine } from './engine';
export { SOUNDS, PROFILES, PROFILE_META, getSoundKey, DTMF } from './sounds';
export type { SoundDef, SoundProfile, SoundKey, ProfileName } from './sounds';
export { SelectWithSound } from './SelectWithSound';

// ── Selectors for matching elements ──
const TEXT_INPUTS = 'input[type="text"], input[type="email"], input[type="search"], input[type="url"], input[type="tel"], input[type="number"], input:not([type])';
const PASSWORD = 'input[type="password"]';
const TEXTAREA = 'textarea';
const CHECKBOX = 'input[type="checkbox"]';
const RADIO = 'input[type="radio"]';
const SELECT = 'select';
const RANGE = 'input[type="range"]';
const FILE = 'input[type="file"]';
const BUTTON = 'button, input[type="submit"], input[type="button"], input[type="reset"]';
const DETAILS = 'details';

export interface ElementSoundsOptions {
  /** Master volume 0-1. Default: 1 */
  volume?: number;
  /** Sound profile. Default: 'default' */
  profile?: ProfileName;
  /** Throttle interval in ms for range slider ticks. Default: 50 */
  rangeThrottleMs?: number;
  /** Force enable on mobile. Default: false (sounds are off on touch devices) */
  enableOnMobile?: boolean;
}

/**
 * Attaches interaction sounds to native HTML form elements using event delegation.
 *
 * @example
 * ```ts
 * import { ElementSounds } from 'native-element-sounds/lib';
 *
 * const sounds = new ElementSounds({ volume: 0.8 });
 * sounds.attach(document.body);
 *
 * // Later:
 * sounds.detach();
 * ```
 *
 * Opt-out a single element:
 * ```html
 * <input type="text" data-no-sound />
 * ```
 *
 * Specify button variant:
 * ```html
 * <button data-sound-variant="destructive">Delete</button>
 * <button data-sound-variant="secondary">Cancel</button>
 * ```
 */
function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export class ElementSounds {
  private engine = new SoundEngine();
  private sounds: Record<string, SoundDef> = SOUNDS;
  private container: HTMLElement | null = null;
  private rangeThrottleMs: number;
  private disabled: boolean;
  private lastInputLength = new WeakMap<HTMLElement, number>();
  private lastInputValue = new WeakMap<HTMLElement, string>();
  private lastRangeValue = new WeakMap<HTMLElement, number>();
  private lastRangeTime = new WeakMap<HTMLElement, number>();
  private rangeActive = new WeakSet<HTMLElement>();
  private blurTimeout = 0;
  private blurTarget: HTMLElement | null = null;

  // Bound handlers for cleanup
  private _onFocusIn: (e: FocusEvent) => void;
  private _onFocusOut: (e: FocusEvent) => void;
  private _onInput: (e: Event) => void;
  private _onPaste: (e: Event) => void;
  private _onChange: (e: Event) => void;
  private _onClick: (e: MouseEvent) => void;
  private _onToggle: (e: Event) => void;
  private _onPointerEnter: (e: PointerEvent) => void;
  private _onPointerDown: (e: PointerEvent) => void;
  private _onPointerUp: (e: PointerEvent) => void;

  constructor(options?: ElementSoundsOptions) {
    if (options?.volume !== undefined) this.engine.volume = options.volume;
    if (options?.profile) this.sounds = PROFILES[options.profile];
    this.rangeThrottleMs = options?.rangeThrottleMs ?? 50;
    this.disabled = !options?.enableOnMobile && isTouchDevice();

    this._onFocusIn = this.handleFocusIn.bind(this);
    this._onFocusOut = this.handleFocusOut.bind(this);
    this._onInput = this.handleInput.bind(this);
    this._onPaste = this.handlePaste.bind(this);
    this._onChange = this.handleChange.bind(this);
    this._onClick = this.handleClick.bind(this);
    this._onToggle = this.handleToggle.bind(this);
    this._onPointerDown = this.handlePointerDown.bind(this);
    this._onPointerUp = this.handlePointerUp.bind(this);
    this._onPointerEnter = this.handlePointerEnter.bind(this);
  }

  /** Attach event listeners to a container element (uses event delegation). */
  attach(container: HTMLElement): void {
    this.detach();
    this.container = container;
    container.addEventListener('focusin', this._onFocusIn, true);
    container.addEventListener('focusout', this._onFocusOut, true);
    container.addEventListener('input', this._onInput, true);
    container.addEventListener('paste', this._onPaste, true);
    container.addEventListener('change', this._onChange, true);
    container.addEventListener('click', this._onClick, true);
    container.addEventListener('pointerenter', this._onPointerEnter, true);
    container.addEventListener('toggle', this._onToggle, true);
    container.addEventListener('pointerdown', this._onPointerDown, true);
    container.addEventListener('pointerup', this._onPointerUp, true);
  }

  /** Remove all listeners. */
  detach(): void {
    const c = this.container;
    if (!c) return;
    c.removeEventListener('focusin', this._onFocusIn, true);
    c.removeEventListener('focusout', this._onFocusOut, true);
    c.removeEventListener('input', this._onInput, true);
    c.removeEventListener('paste', this._onPaste, true);
    c.removeEventListener('change', this._onChange, true);
    c.removeEventListener('click', this._onClick, true);
    c.removeEventListener('toggle', this._onToggle, true);
    c.removeEventListener('pointerdown', this._onPointerDown, true);
    c.removeEventListener('pointerup', this._onPointerUp, true);
    c.removeEventListener('pointerenter', this._onPointerEnter, true);
    this.container = null;
  }

  /** Switch to a different platform sound profile at runtime. */
  setProfile(name: ProfileName): void {
    this.sounds = PROFILES[name];
  }

  /** Play a sound directly. Useful for custom integrations. */
  play(sound: SoundDef): void {
    this.engine.play(sound);
  }

  // ── Helpers ──

  private muted(el: HTMLElement): boolean {
    return this.disabled || el.hasAttribute('data-no-sound') || (el as HTMLInputElement).disabled;
  }

  /** Enable or disable sounds at runtime. */
  setEnabled(enabled: boolean): void {
    this.disabled = !enabled;
  }

  private matches(el: EventTarget | null, selector: string): el is HTMLElement {
    return el instanceof HTMLElement && el.matches(selector);
  }

  // ── Event handlers ──

  private handleFocusIn(e: FocusEvent) {
    const t = e.target;
    const isFormEl = this.matches(t, TEXT_INPUTS + ',' + PASSWORD + ',' + TEXTAREA + ',' + SELECT);
    if (!isFormEl || !t || this.muted(t)) return;

    // Track input length for add/delete detection
    if (this.matches(t, TEXT_INPUTS + ',' + PASSWORD + ',' + TEXTAREA)) {
      this.lastInputLength.set(t, (t as HTMLInputElement).value.length);
    }

    // If blur was pending, this is field-to-field navigation. Play a muted tick.
    if (this.blurTarget) {
      clearTimeout(this.blurTimeout);
      this.blurTarget = null;
      this.engine.play(this.sounds.focusNav);
      return;
    }

    // Fresh focus (not navigating from another field)
    if (this.matches(t, TEXTAREA)) {
      this.engine.play(this.sounds.textareaFocus);
    } else if (this.matches(t, SELECT)) {
      this.engine.play(this.sounds.selectOpen);
    } else {
      this.engine.play(this.sounds.textFocus);
    }
  }

  private handleFocusOut(e: FocusEvent) {
    const t = e.target;
    const isFormEl = this.matches(t, TEXT_INPUTS + ',' + PASSWORD + ',' + TEXTAREA);
    if (!isFormEl || !t || this.muted(t)) return;

    // Defer blur. If focusin fires within 50ms, it's navigation.
    this.blurTarget = t;
    this.blurTimeout = window.setTimeout(() => {
      if (!this.blurTarget) return;
      this.blurTarget = null;
      if (this.matches(t, TEXTAREA)) {
        this.engine.play(this.sounds.textareaBlur);
      } else {
        this.engine.play(this.sounds.textBlur);
      }
    }, 50);
  }

  private handleInput(e: Event) {
    const t = e.target;

    // Number input with DTMF phone tones — check BEFORE generic text handler
    if (this.matches(t, 'input[type="number"]') && !this.muted(t) && t.hasAttribute('data-phone-tones')) {
      const el = t as HTMLInputElement;
      const curr = el.value;
      const prev = (this.lastInputValue.get(t) as string) ?? '';
      this.lastInputValue.set(t, curr);
      if (curr.length > prev.length) {
        const digit = curr[curr.length - 1];
        const dtmfFreqs = DTMF[digit];
        if (dtmfFreqs) {
          this.engine.play({ ...this.sounds.numberType, freqs: dtmfFreqs });
          return;
        }
      }
      if (curr.length < prev.length) {
        this.engine.play(this.sounds.textDelete);
      }
      return;
    }

    // Text-type inputs: detect add vs delete
    if (this.matches(t, TEXT_INPUTS + ',' + PASSWORD + ',' + TEXTAREA) && !this.muted(t)) {
      const curr = (t as HTMLInputElement).value.length;
      const prev = this.lastInputLength.get(t) ?? 0;
      this.lastInputLength.set(t, curr);
      const isTextarea = this.matches(t, TEXTAREA);
      if (curr > prev) {
        this.engine.play(isTextarea ? this.sounds.textareaType : this.sounds.textType);
      } else if (curr < prev) {
        this.engine.play(this.sounds.textDelete);
      }
      return;
    }

    // Select: play hover tick on keyboard/mouse navigation
    if (this.matches(t, SELECT) && !this.muted(t)) {
      this.engine.play(this.sounds.selectHover);
      return;
    }

    // Range slider: detent ticks with pitch mapped to value
    if (this.matches(t, RANGE) && !this.muted(t)) {
      const el = t as HTMLInputElement;
      const now = Date.now();
      const lastTime = this.lastRangeTime.get(t) ?? 0;
      if (now - lastTime < this.rangeThrottleMs) return;

      const val = parseFloat(el.value);
      const min = parseFloat(el.min) || 0;
      const max = parseFloat(el.max) || 100;
      const pct = (val - min) / (max - min);
      const lastVal = this.lastRangeValue.get(t);
      const step = (max - min) * 0.04;
      if (lastVal !== undefined && Math.abs(val - lastVal) < step) return;

      this.lastRangeValue.set(t, val);
      this.lastRangeTime.set(t, now);

      // Pitch maps to position: 250–700Hz
      const freq = 250 + pct * 450;
      this.engine.play({ ...this.sounds.sliderTick, freqs: [freq] });
    }
  }

  private handlePaste(e: Event) {
    const t = e.target;
    if (this.matches(t, TEXT_INPUTS + ',' + PASSWORD + ',' + TEXTAREA) && !this.muted(t)) {
      // Update length after paste event settles
      requestAnimationFrame(() => {
        this.lastInputLength.set(t, (t as HTMLInputElement).value.length);
      });
      this.engine.play(this.sounds.textPaste);
    }
  }

  private handleChange(e: Event) {
    const t = e.target;

    if (this.matches(t, CHECKBOX) && !this.muted(t)) {
      const el = t as HTMLInputElement;
      // Toggle switch vs regular checkbox
      const isToggle =
        el.role === 'switch' ||
        el.getAttribute('data-sound-variant') === 'toggle' ||
        el.closest('[role="switch"]') !== null;
      if (isToggle) {
        this.engine.play(el.checked ? SOUNDS.toggleOn : SOUNDS.toggleOff);
      } else {
        this.engine.play(el.checked ? SOUNDS.checkboxCheck : SOUNDS.checkboxUncheck);
      }
      return;
    }

    if (this.matches(t, RADIO) && !this.muted(t)) {
      this.engine.play(this.sounds.radioSelect);
      return;
    }

    if (this.matches(t, SELECT) && !this.muted(t)) {
      this.engine.play(this.sounds.selectClose);
      return;
    }

    if (this.matches(t, FILE) && !this.muted(t)) {
      this.engine.play(this.sounds.fileSelected);
      return;
    }

    if (this.matches(t, RANGE) && !this.muted(t)) {
      this.engine.play(this.sounds.sliderRelease);
      return;
    }
  }

  private handleClick(e: MouseEvent) {
    const t = e.target;
    if (!t || !(t instanceof HTMLElement)) return;

    // SoundListbox: trigger click = open, option click = select+close
    const listboxTrigger = t.closest('[data-select-trigger]');
    if (listboxTrigger) {
      const root = listboxTrigger.closest('[data-select-with-sound]');
      if (root && !this.muted(root as HTMLElement)) {
        const isOpen = root.hasAttribute('data-open');
        // Will toggle — so if currently closed, it's opening
        if (!isOpen) this.engine.play(this.sounds.selectOpen);
      }
      return;
    }
    const listboxOption = t.closest('[data-select-option]');
    if (listboxOption) {
      const root = listboxOption.closest('[data-select-with-sound]');
      if (root && !this.muted(root as HTMLElement)) {
        this.engine.play(this.sounds.selectClose);
      }
      return;
    }

    // Regular buttons
    if (!this.matches(t, BUTTON) || this.muted(t)) return;

    const variant = t.getAttribute('data-sound-variant') || 'primary';
    switch (variant) {
      case 'destructive':
      case 'danger':
      case 'reset':
        this.engine.play(this.sounds.buttonDestructive);
        break;
      case 'secondary':
      case 'ghost':
      case 'outline':
        this.engine.play(this.sounds.buttonSecondary);
        break;
      case 'icon':
      case 'icon-button':
        this.engine.play(this.sounds.buttonIcon);
        break;
      default:
        this.engine.play(this.sounds.buttonPrimary);
    }
  }

  private handleToggle(e: Event) {
    const t = e.target;
    if (!this.matches(t, DETAILS) || this.muted(t)) return;
    const open = (t as HTMLDetailsElement).open;
    this.engine.play(open ? SOUNDS.detailsExpand : SOUNDS.detailsCollapse);
  }

  private handlePointerDown(e: PointerEvent) {
    const t = e.target;
    if (this.matches(t, RANGE) && !this.muted(t)) {
      this.rangeActive.add(t);
      this.engine.play(this.sounds.sliderGrab);
    }
    if (this.matches(t, FILE) && !this.muted(t)) {
      this.engine.play(this.sounds.fileBrowse);
    }
  }

  private handlePointerUp(e: PointerEvent) {
    const t = e.target;
    if (this.matches(t, RANGE) && this.rangeActive.has(t)) {
      this.rangeActive.delete(t);
    }
  }

  private lastHoverTime = 0;
  private lastHoverTarget: EventTarget | null = null;

  private handlePointerEnter(e: PointerEvent) {
    const t = e.target;
    if (!this.matches(t, '[data-select-option]')) return;
    // Skip if same option or too fast (< 120ms between options)
    if (t === this.lastHoverTarget) return;
    const now = Date.now();
    if (now - this.lastHoverTime < 120) return;
    this.lastHoverTime = now;
    this.lastHoverTarget = t;
    const root = t.closest('[data-select-with-sound]');
    if (root && !this.muted(root as HTMLElement)) {
      this.engine.play(this.sounds.selectHover);
    }
  }
}
