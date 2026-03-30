import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import type { FormElement } from '../../data/elements';
import { audioEngine } from '../../audio/AudioEngine';
import { getSoundKey, type SoundProfile, type SoundDef } from 'sonify-elements';
import { getSequence, SELECT_OPTIONS } from './simulationSequences';
import type { SimStep } from './simulationSequences';
import './ElementSimulation.scss';

interface Props {
  element: FormElement;
  elementIdx: number;
  profile: SoundProfile;
  onStateChange: (stateIdx: number) => void;
  onSoundPlay: (duration: number) => void;
  onPlaybackStart?: (totalDurationMs: number) => void;
  onPlaybackEnd?: () => void;
}

export interface SimHandle {
  play: () => void;
  stop: () => void;
  getState: () => PlayState;
}

type PlayState = 'idle' | 'playing' | 'done';

export const ElementSimulation = forwardRef<SimHandle, Props>(function ElementSimulation({ element, elementIdx, profile, onStateChange, onSoundPlay, onPlaybackStart, onPlaybackEnd }, ref) {
  const [playState, setPlayState] = useState<PlayState>('idle');
  const [stepIdx, setStepIdx] = useState(0);
  const [ripples, setRipples] = useState<{ id: number; cx: number; cy: number }[]>([]);
  const [clicking, setClicking] = useState(false);
  const [cursorPos, setCursorPos] = useState({ cx: 86, cy: 8 });
  const timeoutRef = useRef(0);
  const clickTimeoutRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<Map<string, HTMLElement>>(new Map());
  const onStateChangeRef = useRef(onStateChange);
  const onSoundPlayRef = useRef(onSoundPlay);
  const onPlaybackStartRef = useRef(onPlaybackStart);
  const onPlaybackEndRef = useRef(onPlaybackEnd);
  onStateChangeRef.current = onStateChange;
  onSoundPlayRef.current = onSoundPlay;
  onPlaybackStartRef.current = onPlaybackStart;
  onPlaybackEndRef.current = onPlaybackEnd;

  const sequence = getSequence(element.id);
  const step = sequence[stepIdx] || sequence[0];

  const registerTarget = useCallback((key: string, el: HTMLElement | null) => {
    if (el) targetRefs.current.set(key, el);
    else targetRefs.current.delete(key);
  }, []);

  // Resolve cursor position from target
  const resolveTarget = useCallback((s: SimStep) => {
    if (s.target === 'away') {
      setCursorPos({ cx: 86, cy: 8 });
      return;
    }
    // Special: slider thumb computed from value
    if (s.target === 'thumb') {
      const slider = targetRefs.current.get('slider');
      const stage = stageRef.current;
      if (slider && stage) {
        const sr = stage.getBoundingClientRect();
        const tr = slider.getBoundingClientRect();
        const val = (s.meta?.value as number) ?? 50;
        const thumbX = tr.left + (val / 100) * tr.width;
        setCursorPos({
          cx: ((thumbX - sr.left) / sr.width) * 100,
          cy: ((tr.top + tr.height / 2 - sr.top) / sr.height) * 100,
        });
      }
      return;
    }
    requestAnimationFrame(() => {
      const el = targetRefs.current.get(s.target);
      const stage = stageRef.current;
      if (!el || !stage) return;
      const sr = stage.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      setCursorPos({
        cx: ((er.left + er.width / 2 - sr.left) / sr.width) * 100,
        cy: ((er.top + er.height / 2 - sr.top) / sr.height) * 100,
      });
    });
  }, []);

  // Reset on element change
  useEffect(() => {
    setPlayState('idle');
    setStepIdx(0);
    setRipples([]);
    setClicking(false);
    setCursorPos({ cx: 86, cy: 8 });
    clearTimeout(timeoutRef.current);
    clearTimeout(clickTimeoutRef.current);
  }, [elementIdx]);

  // Step sequencer
  useEffect(() => {
    if (playState !== 'playing') return;
    const current = sequence[stepIdx];
    if (!current) { setPlayState('done'); onPlaybackEndRef.current?.(); return; }

    onStateChangeRef.current(current.stateIdx);
    resolveTarget(current);

    if (current.playSound) {
      const stateData = element.states[current.stateIdx];
      const soundKey = getSoundKey(element.id, stateData.id);
      const baseSound: SoundDef | null = soundKey ? profile[soundKey] : (stateData.sound as SoundDef | null);
      if (baseSound) {
        const soundDef: SoundDef = current.soundOverride
          ? { ...baseSound, freqs: current.soundOverride.freqs }
          : baseSound;
        audioEngine.play(soundDef);
        onSoundPlayRef.current(soundDef.duration);
        setRipples((prev) => [...prev, { id: Date.now(), cx: cursorPos.cx, cy: cursorPos.cy }]);
      }
    }

    if (current.clicking) {
      setClicking(true);
      clickTimeoutRef.current = window.setTimeout(() => setClicking(false), 200);
    }

    timeoutRef.current = window.setTimeout(() => {
      if (stepIdx < sequence.length - 1) {
        setStepIdx((p) => p + 1);
      } else {
        setPlayState('done');
        onPlaybackEndRef.current?.();
      }
    }, current.duration);

    return () => clearTimeout(timeoutRef.current);
  }, [playState, stepIdx, sequence, element.states, element.id, resolveTarget]);

  // Cleanup ripples
  useEffect(() => {
    if (ripples.length === 0) return;
    const t = window.setTimeout(() => setRipples((p) => p.slice(1)), 1000);
    return () => clearTimeout(t);
  }, [ripples]);

  const handlePlay = useCallback(() => {
    setStepIdx(0);
    setRipples([]);
    setClicking(false);
    const totalMs = sequence.reduce((s, st) => s + st.duration, 0);
    onPlaybackStartRef.current?.(totalMs);
    requestAnimationFrame(() => setPlayState('playing'));
  }, [sequence]);

  const handleStop = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setPlayState('done');
    onPlaybackEndRef.current?.();
  }, []);

  useImperativeHandle(ref, () => ({
    play: handlePlay,
    stop: handleStop,
    getState: () => playState,
  }), [handlePlay, handleStop, playState]);

  const showCursor = playState === 'playing';

  return (
    <div className="sim-stage" ref={stageRef}>
      <div className="sim-element">
        <ElementVisual elementId={element.id} vis={step.vis} meta={step.meta} playing={playState === 'playing'} registerTarget={registerTarget} />
      </div>

      {showCursor && (
        <div className={`sim-cursor${clicking ? ' clicking' : ''}`} style={{ left: `${cursorPos.cx}%`, top: `${cursorPos.cy}%` }}>
          <svg viewBox="0 0 24 28" width="20" height="24" className="cursor-svg">
            <path d="M10 0C8.9 0 8 .9 8 2V13.6L5.7 11.3C4.9 10.5 3.6 10.5 2.8 11.3C2 12.1 2 13.4 2.8 14.2L9.3 20.7C10 21.4 11 22 12.2 22H16.5C18.4 22 20 20.4 20 18.5V8C20 6.9 19.1 6 18 6C17.5 6 17 6.2 16.7 6.5C16.3 5.6 15.4 5 14.4 5C13.9 5 13.4 5.2 13 5.5C12.6 4.6 11.7 4 10.7 4C10.5 4 10.2 4 10 4.1V2C10 .9 9.1 0 8 0" fill="white" stroke="var(--fg)" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          {clicking && <div className="click-ring" />}
        </div>
      )}

      {ripples.map((r) => (
        <div key={r.id} className="ripple-group" style={{ left: `${r.cx}%`, top: `${r.cy}%` }}>
          <div className="ripple-ring" />
          <div className="ripple-ring" />
          <div className="ripple-ring" />
        </div>
      ))}

      {playState !== 'playing' && (
        <div className="sim-overlay" onClick={handlePlay}>
          <button className="sim-play-btn">
            {playState === 'done' ? <><ReplayIcon /> Replay</> : <><PlayIcon /> Play</>}
          </button>
        </div>
      )}
    </div>
  );
});

/* ── Icons ── */
function PlayIcon() { return <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><polygon points="3,1 14,8 3,15" /></svg>; }
function ReplayIcon() { return <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8a5 5 0 1 1 1.2 3.2" /><polyline points="1,8 3,8 3,6" /></svg>; }

/* ── Shared types ── */
type RegFn = (key: string, el: HTMLElement | null) => void;

/* ── Element Visual Router ── */
function ElementVisual({ elementId, vis, meta, playing, registerTarget }: {
  elementId: string; vis: string; meta?: Record<string, unknown>; playing: boolean; registerTarget: RegFn;
}) {
  switch (elementId) {
    case 'text-input': return <TextInputVis vis={vis} meta={meta} reg={registerTarget} />;
    case 'number-input': return <NumberInputVis vis={vis} meta={meta} reg={registerTarget} />;
    case 'checkbox': return <CheckboxVis vis={vis} reg={registerTarget} />;
    case 'radio': return <RadioVis vis={vis} reg={registerTarget} />;
    case 'toggle': return <ToggleVis vis={vis} playing={playing} reg={registerTarget} />;
    case 'button': return <ButtonVis vis={vis} reg={registerTarget} />;
    case 'select': return <SelectVis vis={vis} meta={meta} reg={registerTarget} />;
    case 'slider': return <SliderVis vis={vis} meta={meta} reg={registerTarget} />;
    case 'password-input': return <PasswordVis vis={vis} meta={meta} reg={registerTarget} />;
    case 'file-input': return <FileInputVis vis={vis} meta={meta} reg={registerTarget} />;
    case 'details-summary': return <DetailsSummaryVis vis={vis} reg={registerTarget} />;
    case 'textarea': return <TextareaVis vis={vis} meta={meta} reg={registerTarget} />;
    default: return null;
  }
}

/* ═══ NATIVE ELEMENT VISUALS ═══ */

function TextInputVis({ vis, meta, reg }: { vis: string; meta?: Record<string, unknown>; reg: RegFn }) {
  const text = (meta?.text as string) || '';
  const isFocused = vis === 'focus' || vis === 'typing';
  return (
    <div className="vis-native" data-vis={vis}>
      <input
        ref={(el) => reg('input', el)}
        type="text"
        value={text}
        placeholder="Enter your email"
        readOnly
        className={isFocused ? 'native-focused' : undefined}
        data-state={vis}
      />
    </div>
  );
}

function NumberInputVis({ vis, meta, reg }: { vis: string; meta?: Record<string, unknown>; reg: RegFn }) {
  const text = (meta?.text as string) || '';
  const isFocused = vis === 'focus' || vis === 'typing';
  return (
    <div className="vis-native" data-vis={vis}>
      <input
        ref={(el) => reg('number', el)}
        type="number"
        value={text}
        placeholder="0"
        readOnly
        className={isFocused ? 'native-focused' : undefined}
        data-state={vis}
        onChange={() => {}}
      />
    </div>
  );
}

function PasswordVis({ vis, meta, reg }: { vis: string; meta?: Record<string, unknown>; reg: RegFn }) {
  const len = (meta?.len as number) || 0;
  const isFocused = vis === 'focus' || vis === 'typing';
  return (
    <div className="vis-native" data-vis={vis}>
      <input
        ref={(el) => reg('password', el)}
        type="password"
        value={'•'.repeat(len)}
        placeholder="Password"
        readOnly
        className={isFocused ? 'native-focused' : undefined}
        data-state={vis}
      />
    </div>
  );
}

function CheckboxVis({ vis, reg }: { vis: string; reg: RegFn }) {
  const checked = vis === 'checked';
  return (
    <div className="vis-native vis-inline" data-vis={vis}>
      <input ref={(el) => reg('checkbox', el)} type="checkbox" checked={checked} onChange={() => {}} id="sim-cb" />
      <label htmlFor="sim-cb">Remember me</label>
    </div>
  );
}

function RadioVis({ vis, reg }: { vis: string; reg: RegFn }) {
  const sel = vis === 'first' ? 0 : vis === 'second' ? 1 : -1;
  return (
    <div className="vis-native vis-stack" data-vis={vis}>
      <div className="vis-radio-row">
        <input ref={(el) => reg('radio-0', el)} type="radio" name="sim-rad" checked={sel === 0} onChange={() => {}} id="sim-r0" />
        <label htmlFor="sim-r0">Standard shipping</label>
      </div>
      <div className="vis-radio-row">
        <input ref={(el) => reg('radio-1', el)} type="radio" name="sim-rad" checked={sel === 1} onChange={() => {}} id="sim-r1" />
        <label htmlFor="sim-r1">Express delivery</label>
      </div>
    </div>
  );
}

function ToggleVis({ vis, playing, reg }: { vis: string; playing: boolean; reg: RegFn }) {
  const on = vis === 'on';
  return (
    <div className="vis-native vis-inline" data-vis={vis}>
      <div ref={(el) => reg('toggle', el)} className={`vis-toggle-track${on ? ' on' : ''}`} style={!playing ? { transition: 'none' } : undefined}>
        <div className="vis-toggle-thumb" />
      </div>
      <span className="vis-toggle-text">{on ? 'On' : 'Off'}</span>
    </div>
  );
}

function ButtonVis({ vis, reg }: { vis: string; reg: RegFn }) {
  return (
    <div className="vis-native vis-stack vis-btn-group" data-vis={vis}>
      <button ref={(el) => reg('btn-primary', el)} className={`native-btn primary${vis.includes('primary') ? (vis.includes('press') ? ' pressed' : ' hover') : ''}`}>
        Submit
      </button>
      <button ref={(el) => reg('btn-destructive', el)} className={`native-btn destructive${vis.includes('destructive') ? (vis.includes('press') ? ' pressed' : ' hover') : ''}`}>
        Delete
      </button>
      <button ref={(el) => reg('btn-secondary', el)} className={`native-btn secondary${vis.includes('secondary') ? (vis.includes('press') ? ' pressed' : ' hover') : ''}`}>
        Cancel
      </button>
    </div>
  );
}

function SelectVis({ vis, meta, reg }: { vis: string; meta?: Record<string, unknown>; reg: RegFn }) {
  const panelOpen = vis === 'open';
  const hoverIdx = (meta?.hoverIdx as number) ?? -1;
  const selectedIdx = (meta?.selectedIdx as number) ?? -1;
  const display = selectedIdx >= 0 ? SELECT_OPTIONS[selectedIdx] : 'Select country...';
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to hovered option
  useEffect(() => {
    if (hoverIdx >= 0) {
      const el = targetRefs_select.current.get(`option-${hoverIdx}`);
      el?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
  }, [hoverIdx]);

  // Local option refs (separate from main target map)
  const targetRefs_select = useRef<Map<string, HTMLElement>>(new Map());
  const regOption = useCallback((key: string, el: HTMLElement | null) => {
    reg(key, el);
    if (el) targetRefs_select.current.set(key, el);
    else targetRefs_select.current.delete(key);
  }, [reg]);

  return (
    <div className="vis-native vis-select-wrapper" data-vis={vis}>
      <button ref={(el) => reg('trigger', el)} className={`vis-select-trigger${panelOpen ? ' open' : ''}`}>
        <span>{display}</span>
        <span className="vis-chevron">{panelOpen ? '\u25B4' : '\u25BE'}</span>
      </button>
      {panelOpen && (
        <div className="vis-select-dropdown" ref={dropdownRef}>
          {SELECT_OPTIONS.map((opt, i) => (
            <div
              key={i}
              ref={(el) => regOption(`option-${i}`, el)}
              className={`vis-select-opt${hoverIdx === i ? ' hovered' : ''}`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SliderVis({ vis, meta, reg }: { vis: string; meta?: Record<string, unknown>; reg: RegFn }) {
  const val = (meta?.value as number) ?? 20;
  return (
    <div className="vis-native" data-vis={vis}>
      <input
        ref={(el) => reg('slider', el)}
        type="range"
        min={0}
        max={100}
        value={val}
        onChange={() => {}}
        className="native-range"
      />
      <div className="vis-range-value">{val}</div>
    </div>
  );
}

function FileInputVis({ vis, meta, reg }: { vis: string; meta?: Record<string, unknown>; reg: RegFn }) {
  const filename = (meta?.filename as string) || '';
  return (
    <div className="vis-native" data-vis={vis}>
      <div className="vis-file-wrapper">
        <button ref={(el) => reg('file-btn', el)} className={`native-btn file-browse${vis === 'browsing' ? ' pressed' : ''}`}>
          Choose File
        </button>
        <span className="vis-file-name">{filename || 'No file chosen'}</span>
      </div>
    </div>
  );
}

function DetailsSummaryVis({ vis, reg }: { vis: string; reg: RegFn }) {
  const expanded = vis === 'expanded';
  return (
    <div className="vis-native" data-vis={vis}>
      <details open={expanded}>
        <summary ref={(el) => reg('summary', el)}>
          Show more information
        </summary>
        <div className="vis-details-content">
          <p>This content is revealed when the details element is expanded. The disclosure triangle rotates and the panel slides open.</p>
        </div>
      </details>
    </div>
  );
}

function TextareaVis({ vis, meta, reg }: { vis: string; meta?: Record<string, unknown>; reg: RegFn }) {
  const text = (meta?.text as string) || '';
  const isFocused = vis === 'focus' || vis === 'typing';
  return (
    <div className="vis-native" data-vis={vis}>
      <textarea
        ref={(el) => reg('textarea', el)}
        value={text}
        placeholder="Write something..."
        readOnly
        rows={4}
        className={isFocused ? 'native-focused' : undefined}
        data-state={vis}
      />
    </div>
  );
}
