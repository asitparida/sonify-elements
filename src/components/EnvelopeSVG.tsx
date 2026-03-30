import { useEffect, useRef, useState, useMemo } from 'react';
import type { FormElement } from '../data/elements';
import { getSoundKey, type SoundProfile } from '../lib/sounds';
import { getSequence } from './ElementSimulation/simulationSequences';

interface Props {
  element: FormElement;
  activeStateIdx: number;
  playback: { key: number; totalDurationMs: number } | null;
  profile: SoundProfile;
}

const W = 900;
const H = 100;
const PAD = 10;
const LABEL_Y = H - 2;
const DRAW_TOP = PAD;
const DRAW_BOT = H - 18;
const DRAW_H = DRAW_BOT - DRAW_TOP;

interface ComputedStep {
  x: number;
  w: number;
  stateIdx: number;
  label: string;
  hasSound: boolean;
  gain: number;
  soundType: string;
  soundDurPx: number;
}

export function EnvelopeSVG({ element, activeStateIdx, playback, profile }: Props) {
  const [progress, setProgress] = useState(-1);
  const rafRef = useRef(0);
  const startRef = useRef(0);

  // Animate playhead
  useEffect(() => {
    if (!playback) {
      setProgress(-1);
      return;
    }
    startRef.current = performance.now();
    const durMs = playback.totalDurationMs;
    const tick = (now: number) => {
      const p = Math.min((now - startRef.current) / durMs, 1);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playback]);

  const sequence = getSequence(element.id);
  const totalDurMs = useMemo(
    () => sequence.reduce((s, st) => s + st.duration, 0),
    [sequence],
  );
  const usableW = W - PAD * 2;

  // Compute step positions
  const steps: ComputedStep[] = useMemo(() => {
    let cumul = 0;
    return sequence.map((step) => {
      const x = PAD + (cumul / totalDurMs) * usableW;
      const w = (step.duration / totalDurMs) * usableW;
      cumul += step.duration;
      const stateData = element.states[step.stateIdx];
      const soundKey = step.playSound ? getSoundKey(element.id, stateData?.id ?? '') : null;
      const sound = soundKey ? profile[soundKey] : (step.playSound ? stateData?.sound : null);
      return {
        x,
        w,
        stateIdx: step.stateIdx,
        label: stateData?.label ?? '',
        hasSound: !!sound,
        gain: sound?.gain ?? 0,
        soundType: sound?.type ?? '',
        soundDurPx: sound ? Math.max((sound.duration * 1000 / totalDurMs) * usableW, 8) : 0,
      };
    });
  }, [sequence, element.states, totalDurMs, usableW]);

  // Build continuous polyline points
  const { lineStr, fillStr } = useMemo(() => {
    const pts: [number, number][] = [[PAD, DRAW_BOT]];

    for (const step of steps) {
      if (step.hasSound) {
        const peakH = Math.min((step.gain / 0.45) * DRAW_H * 0.92, DRAW_H);
        const sw = step.soundDurPx;
        const sx = step.x;

        // Arrive at baseline
        pts.push([sx, DRAW_BOT]);

        // Draw shape based on sound type
        if (step.soundType === 'double-tap') {
          const hw = sw * 0.38;
          pts.push([sx + 1.5, DRAW_BOT - peakH * 0.9]);
          pts.push([sx + hw, DRAW_BOT]);
          pts.push([sx + hw + sw * 0.12, DRAW_BOT]);
          pts.push([sx + hw + sw * 0.14, DRAW_BOT - peakH * 0.72]);
          pts.push([sx + sw, DRAW_BOT]);
        } else if (step.soundType === 'sweep') {
          pts.push([sx + 2, DRAW_BOT - peakH * 0.6]);
          pts.push([sx + sw * 0.18, DRAW_BOT - peakH]);
          pts.push([sx + sw * 0.82, DRAW_BOT - peakH]);
          pts.push([sx + sw - 2, DRAW_BOT - peakH * 0.6]);
          pts.push([sx + sw, DRAW_BOT]);
        } else if (step.soundType === 'two-note-up' || step.soundType === 'focus-ascend') {
          // Ascending: first bump shorter, second taller
          const hw = sw * 0.42;
          pts.push([sx + 1.5, DRAW_BOT - peakH * 0.55]);
          pts.push([sx + hw * 0.7, DRAW_BOT - peakH * 0.15]);
          pts.push([sx + hw, DRAW_BOT - peakH * 0.06]);
          pts.push([sx + hw + 1.5, DRAW_BOT - peakH]);
          pts.push([sx + sw - 1, DRAW_BOT - peakH * 0.12]);
          pts.push([sx + sw, DRAW_BOT]);
        } else if (step.soundType === 'two-note-down' || step.soundType === 'focus-descend') {
          // Descending: first bump taller, second shorter
          const hw = sw * 0.42;
          pts.push([sx + 1.5, DRAW_BOT - peakH]);
          pts.push([sx + hw * 0.7, DRAW_BOT - peakH * 0.2]);
          pts.push([sx + hw, DRAW_BOT - peakH * 0.06]);
          pts.push([sx + hw + 1.5, DRAW_BOT - peakH * 0.55]);
          pts.push([sx + sw - 1, DRAW_BOT - peakH * 0.08]);
          pts.push([sx + sw, DRAW_BOT]);
        } else if (step.soundType === 'three-note-up') {
          // Ascending: each bump taller than the last
          const tw = sw / 3.3;
          pts.push([sx + 1.5, DRAW_BOT - peakH * 0.4]);
          pts.push([sx + tw, DRAW_BOT - peakH * 0.06]);
          pts.push([sx + tw + 1.5, DRAW_BOT - peakH * 0.65]);
          pts.push([sx + tw * 2, DRAW_BOT - peakH * 0.06]);
          pts.push([sx + tw * 2 + 1.5, DRAW_BOT - peakH]);
          pts.push([sx + sw, DRAW_BOT]);
        } else if (step.soundType === 'three-note-down') {
          // Descending: each bump shorter than the last
          const tw = sw / 3.3;
          pts.push([sx + 1.5, DRAW_BOT - peakH]);
          pts.push([sx + tw, DRAW_BOT - peakH * 0.06]);
          pts.push([sx + tw + 1.5, DRAW_BOT - peakH * 0.65]);
          pts.push([sx + tw * 2, DRAW_BOT - peakH * 0.06]);
          pts.push([sx + tw * 2 + 1.5, DRAW_BOT - peakH * 0.4]);
          pts.push([sx + sw, DRAW_BOT]);
        } else if (step.soundType === 'dtmf') {
          // Dual-tone: two simultaneous frequencies shown as a wide plateau
          pts.push([sx + 1, DRAW_BOT - peakH * 0.8]);
          pts.push([sx + sw * 0.15, DRAW_BOT - peakH]);
          pts.push([sx + sw * 0.85, DRAW_BOT - peakH]);
          pts.push([sx + sw - 1, DRAW_BOT - peakH * 0.8]);
          pts.push([sx + sw, DRAW_BOT]);
        } else {
          // tick / pip: sharp spike
          pts.push([sx + 1.5, DRAW_BOT - peakH]);
          pts.push([sx + sw * 0.4, DRAW_BOT - peakH * 0.2]);
          pts.push([sx + sw, DRAW_BOT]);
        }

        // Trailing silence to end of step
        if (step.w > sw + 1) {
          pts.push([step.x + step.w, DRAW_BOT]);
        }
      } else {
        // Silent — baseline
        pts.push([step.x + step.w, DRAW_BOT]);
      }
    }

    const lineStr = pts.map((p) => p.join(',')).join(' ');
    const fillPts = [...pts, [PAD + usableW, DRAW_BOT] as [number, number]];
    const fillStr = fillPts.map((p) => p.join(',')).join(' ');
    return { lineStr, fillStr };
  }, [steps, usableW]);

  // Labels — deduplicate by stateIdx (only first occurrence with sound)
  const labels = useMemo(() => {
    const seen = new Set<number>();
    const result: { x: number; text: string; stateIdx: number }[] = [];
    for (const step of steps) {
      if (step.hasSound && !seen.has(step.stateIdx)) {
        seen.add(step.stateIdx);
        result.push({ x: step.x, text: step.label, stateIdx: step.stateIdx });
      }
    }
    return result;
  }, [steps]);

  // Active state highlight region
  const activeRegion = useMemo(() => {
    const matching = steps.filter((s) => s.stateIdx === activeStateIdx);
    if (matching.length === 0) return null;
    const x1 = matching[0].x;
    const last = matching[matching.length - 1];
    const x2 = last.x + last.w;
    return { x: x1, w: x2 - x1 };
  }, [steps, activeStateIdx]);

  // Playhead x position
  const playheadX = progress >= 0 ? PAD + progress * usableW : -10;

  return (
    <svg
      className="envelope-canvas"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Grid lines */}
      {[0, 1, 2, 3].map((i) => {
        const y = DRAW_TOP + (i * DRAW_H) / 3;
        return (
          <line key={i} className="env-grid" x1={PAD} y1={y} x2={W - PAD} y2={y} />
        );
      })}
      <line className="env-grid" x1={PAD} y1={DRAW_BOT} x2={W - PAD} y2={DRAW_BOT} />

      {/* Active state highlight */}
      {activeRegion && (
        <rect
          className="env-highlight"
          x={activeRegion.x}
          y={DRAW_TOP - 2}
          width={activeRegion.w}
          height={DRAW_H + 6}
          rx={3}
        />
      )}

      {/* Step boundary ticks */}
      {steps.map((s, i) =>
        i > 0 ? (
          <line
            key={i}
            className="env-step-tick"
            x1={s.x}
            y1={DRAW_BOT}
            x2={s.x}
            y2={DRAW_BOT + 3}
          />
        ) : null,
      )}

      {/* Envelope shape */}
      <polyline className="env-fill" points={fillStr} />
      <polyline className="env-line" points={lineStr} />

      {/* Labels */}
      {labels.map((l, i) => (
        <text
          key={i}
          className={`env-label${l.stateIdx === activeStateIdx ? ' active' : ''}`}
          x={l.x + 2}
          y={LABEL_Y}
        >
          {l.text}
        </text>
      ))}

      {/* Playhead */}
      {progress >= 0 && progress <= 1 && (
        <>
          <line
            className="env-playhead"
            x1={playheadX}
            y1={DRAW_TOP - 4}
            x2={playheadX}
            y2={DRAW_BOT + 4}
          />
          <circle className="env-playhead-dot" cx={playheadX} cy={DRAW_TOP - 4} r={3} />
        </>
      )}
    </svg>
  );
}
