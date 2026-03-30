/**
 * SelectWithSound — A custom dropdown that exposes per-option hover events
 * so the ElementSounds library can play navigation ticks.
 *
 * Uses WAI-ARIA listbox pattern. Styling is intentionally bare —
 * just enough to be usable, easy to override.
 *
 * Usage:
 *   <div data-select-with-sound>
 *     <button data-select-trigger>Select country...</button>
 *     <div data-select-panel>
 *       <div data-select-option value="ar">Argentina</div>
 *     </div>
 *   </div>
 *
 * Or create programmatically:
 *   SelectWithSound.create(container, options, { placeholder: 'Choose...' });
 */

export interface SelectWithSoundOptions {
  placeholder?: string;
  onSelect?: (value: string, label: string) => void;
  onOptionFocus?: (value: string, label: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

const ATTRS = {
  root: 'data-select-with-sound',
  trigger: 'data-select-trigger',
  panel: 'data-select-panel',
  option: 'data-select-option',
} as const;

export const SELECT_SELECTORS = {
  root: `[${ATTRS.root}]`,
  trigger: `[${ATTRS.trigger}]`,
  panel: `[${ATTRS.panel}]`,
  option: `[${ATTRS.option}]`,
} as const;

export class SelectWithSound {
  private root: HTMLElement;
  private trigger: HTMLElement;
  private panel: HTMLElement;
  private options: HTMLElement[];
  private focusedIdx = -1;
  private isOpen = false;
  private callbacks: SelectWithSoundOptions;

  // Typeahead state
  private typeaheadQuery = '';
  private typeaheadTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly TYPEAHEAD_TIMEOUT = 500;

  private _onTriggerClick: () => void;
  private _onKeyDown: (e: KeyboardEvent) => void;
  private _onOptionPointerEnter: (e: PointerEvent) => void;
  private _onOptionClick: (e: MouseEvent) => void;
  private _onOutsideClick: (e: MouseEvent) => void;

  constructor(root: HTMLElement, callbacks: SelectWithSoundOptions = {}) {
    this.root = root;
    this.trigger = root.querySelector(`[${ATTRS.trigger}]`) as HTMLElement;
    this.panel = root.querySelector(`[${ATTRS.panel}]`) as HTMLElement;
    this.options = Array.from(root.querySelectorAll(`[${ATTRS.option}]`));
    this.callbacks = callbacks;

    this.trigger.setAttribute('role', 'combobox');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.setAttribute('aria-haspopup', 'listbox');
    this.panel.setAttribute('role', 'listbox');
    this.panel.style.display = 'none';
    this.options.forEach((opt, i) => {
      opt.setAttribute('role', 'option');
      opt.setAttribute('id', `sws-opt-${i}`);
    });

    this._onTriggerClick = () => this.toggle();
    this._onKeyDown = (e) => this.handleKey(e);
    this._onOptionPointerEnter = (e) => {
      const idx = this.options.indexOf(e.currentTarget as HTMLElement);
      if (idx >= 0) this.setFocus(idx);
    };
    this._onOptionClick = (e) => {
      const opt = (e.target as HTMLElement).closest(`[${ATTRS.option}]`) as HTMLElement | null;
      if (opt) {
        const idx = this.options.indexOf(opt);
        if (idx >= 0) this.select(idx);
      }
    };
    this._onOutsideClick = (e) => {
      if (this.isOpen && !this.root.contains(e.target as Node)) this.close();
    };

    this.trigger.addEventListener('click', this._onTriggerClick);
    this.root.addEventListener('keydown', this._onKeyDown);
    this.panel.addEventListener('click', this._onOptionClick);
    this.options.forEach((opt) => opt.addEventListener('pointerenter', this._onOptionPointerEnter));
    document.addEventListener('click', this._onOutsideClick, true);
  }

  destroy() {
    if (this.typeaheadTimer) clearTimeout(this.typeaheadTimer);
    this.trigger.removeEventListener('click', this._onTriggerClick);
    this.root.removeEventListener('keydown', this._onKeyDown);
    this.panel.removeEventListener('click', this._onOptionClick);
    this.options.forEach((opt) => opt.removeEventListener('pointerenter', this._onOptionPointerEnter));
    document.removeEventListener('click', this._onOutsideClick, true);
  }

  private toggle() { this.isOpen ? this.close() : this.open(); }

  private open() {
    this.isOpen = true;
    this.panel.style.display = '';
    this.trigger.setAttribute('aria-expanded', 'true');
    this.root.setAttribute('data-open', '');
    this.focusedIdx = -1;
    this.callbacks.onOpen?.();
  }

  private close() {
    this.isOpen = false;
    this.panel.style.display = 'none';
    this.trigger.setAttribute('aria-expanded', 'false');
    this.root.removeAttribute('data-open');
    this.clearFocus();
    this.callbacks.onClose?.();
  }

  private setFocus(idx: number) {
    this.clearFocus();
    this.focusedIdx = idx;
    const opt = this.options[idx];
    if (!opt) return;
    opt.setAttribute('data-focused', '');
    opt.scrollIntoView({ block: 'nearest' });
    this.trigger.setAttribute('aria-activedescendant', opt.id);
    const value = opt.getAttribute('value') || opt.textContent || '';
    opt.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    this.callbacks.onOptionFocus?.(value, opt.textContent || '');
  }

  private clearFocus() {
    this.options.forEach((o) => o.removeAttribute('data-focused'));
  }

  private select(idx: number) {
    const opt = this.options[idx];
    if (!opt) return;
    const value = opt.getAttribute('value') || opt.textContent || '';
    const label = opt.textContent || '';
    this.trigger.textContent = label;
    this.options.forEach((o) => o.removeAttribute('aria-selected'));
    opt.setAttribute('aria-selected', 'true');
    this.close();
    this.callbacks.onSelect?.(value, label);
  }

  private handleKey(e: KeyboardEvent) {
    if (!this.isOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault();
      this.open();
      return;
    }
    if (!this.isOpen) return;
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); this.setFocus(Math.min(this.focusedIdx + 1, this.options.length - 1)); break;
      case 'ArrowUp':   e.preventDefault(); this.setFocus(Math.max(this.focusedIdx - 1, 0)); break;
      case 'Enter': e.preventDefault(); if (this.focusedIdx >= 0) this.select(this.focusedIdx); break;
      case 'Escape': e.preventDefault(); this.close(); break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          this.handleTypeahead(e.key);
        }
        break;
    }
  }

  /**
   * Native <select> typeahead: typing a character jumps to the first matching
   * option. Typing the same character again cycles through matches. Typing
   * different characters within the timeout builds a multi-char query.
   */
  private handleTypeahead(char: string) {
    if (this.typeaheadTimer) clearTimeout(this.typeaheadTimer);
    this.typeaheadTimer = setTimeout(() => { this.typeaheadQuery = ''; }, this.TYPEAHEAD_TIMEOUT);

    const isSameChar = this.typeaheadQuery.length === 1 && this.typeaheadQuery === char;

    if (isSameChar) {
      // Same single char repeated — cycle to next match after current focus
      const startIdx = this.focusedIdx + 1;
      const match = this.findMatchFrom(startIdx, char);
      if (match >= 0) {
        this.setFocus(match);
      } else {
        // Wrap around to find from beginning
        const wrapped = this.findMatchFrom(0, char);
        if (wrapped >= 0) this.setFocus(wrapped);
      }
      // Keep query as single char so next press continues cycling
    } else {
      // Building a multi-char query
      this.typeaheadQuery += char;
      const match = this.findMatchFrom(0, this.typeaheadQuery);
      if (match >= 0) this.setFocus(match);
    }
  }

  /** Find the first option starting at `from` whose label starts with `query` (case-insensitive). */
  private findMatchFrom(from: number, query: string): number {
    const q = query.toLowerCase();
    for (let i = from; i < this.options.length; i++) {
      const label = (this.options[i].textContent || '').toLowerCase();
      if (label.startsWith(q)) return i;
    }
    return -1;
  }

  static create(
    container: HTMLElement,
    items: { value: string; label: string }[],
    opts: SelectWithSoundOptions = {},
  ): SelectWithSound {
    container.setAttribute(ATTRS.root, '');
    container.classList.add('select-with-sound');
    container.innerHTML = `
      <button ${ATTRS.trigger} class="select-with-sound-trigger" type="button">${opts.placeholder || 'Select...'}</button>
      <div ${ATTRS.panel} class="select-with-sound-panel">
        ${items.map((it) => `<div ${ATTRS.option} value="${it.value}" class="select-with-sound-option">${it.label}</div>`).join('')}
      </div>
    `;
    return new SelectWithSound(container, opts);
  }
}
