import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ELEMENTS } from '../data/elements';
import { PROFILES, PROFILE_META, getSoundKey, type ProfileName, type SoundProfile, type SoundKey } from '../lib/sounds';
import { audioEngine } from '../audio/AudioEngine';
import { ElementSimulation, type SimHandle } from './ElementSimulation/ElementSimulation';
import { EnvelopeSVG } from './EnvelopeSVG';
import { CodeBlock } from './CodeBlock';
import './ElementDetail.scss';

interface Props {
  profileName: ProfileName;
  onProfileChange: (name: ProfileName) => void;
}

// Generate usage code for an element
function getUsageCode(elementId: string, tag: string): string {
  const examples: Record<string, string> = {
    'text-input': `<!-- Sounds play automatically on focus, blur, type, delete, paste -->
<input type="text" placeholder="Name" />

<!-- Opt out -->
<input type="text" data-no-sound />`,
    'password-input': `<!-- Same as text input, slightly lower typing pitch -->
<input type="password" />`,
    'number-input': `<!-- Enable DTMF phone tones per digit -->
<input type="number" data-phone-tones />

<!-- Without DTMF, uses regular typing ticks -->
<input type="number" />`,
    'textarea': `<!-- Lighter typing sound for long-form input -->
<textarea rows="4"></textarea>`,
    'checkbox': `<!-- Check/uncheck sounds automatic -->
<input type="checkbox" />

<!-- Toggle sound instead of checkbox -->
<input type="checkbox" role="switch" />`,
    'radio': `<!-- Select sound on change. Sibling deselect is silent. -->
<input type="radio" name="group" />`,
    'toggle': `<!-- Use role="switch" or data attribute -->
<input type="checkbox" role="switch" />
<input type="checkbox" data-sound-variant="toggle" />`,
    'button': `<!-- Primary (default) -->
<button>Submit</button>

<!-- Variants -->
<button data-sound-variant="destructive">Delete</button>
<button data-sound-variant="outline">Cancel</button>
<button data-sound-variant="icon">Settings</button>`,
    'select': `<!-- Native select: open on focus, close on change -->
<select>
  <option>Option A</option>
</select>

<!-- Custom dropdown with per-option hover sounds -->
import { SelectWithSound } from 'sonify-elements';
SelectWithSound.create(container, items);`,
    'slider': `<!-- Detent clicks with pitch mapped to value -->
<input type="range" min="0" max="100" />`,
    'file-input': `<!-- Click sound on browse, chime on file selected -->
<input type="file" />`,
    'details-summary': `<!-- Expand/collapse sounds on toggle -->
<details>
  <summary>More info</summary>
  <p>Content here</p>
</details>`,
  };
  return examples[elementId] || `${tag}`;
}

function getSoundKeys(elementId: string): { state: string; key: SoundKey }[] {
  const map: Record<string, Record<string, SoundKey>> = {
    'text-input': { focus: 'textFocus', typing: 'textType', delete: 'textDelete', paste: 'textPaste', blur: 'textBlur', error: 'error', success: 'success' },
    'password-input': { focus: 'textFocus', typing: 'textType', blur: 'textBlur', error: 'error' },
    'number-input': { focus: 'textFocus', typing: 'numberType', blur: 'textBlur' },
    'textarea': { focus: 'textareaFocus', typing: 'textareaType', blur: 'textareaBlur' },
    'checkbox': { check: 'checkboxCheck', uncheck: 'checkboxUncheck' },
    'radio': { select: 'radioSelect' },
    'toggle': { on: 'toggleOn', off: 'toggleOff' },
    'button': { primary: 'buttonPrimary', destructive: 'buttonDestructive', secondary: 'buttonSecondary', icon: 'buttonIcon' },
    'select': { open: 'selectOpen', hover: 'selectHover', close: 'selectClose' },
    'slider': { grab: 'sliderGrab', tick: 'sliderTick', release: 'sliderRelease' },
    'file-input': { browse: 'fileBrowse', selected: 'fileSelected' },
    'details-summary': { expand: 'detailsExpand', collapse: 'detailsCollapse' },
  };
  const m = map[elementId];
  if (!m) return [];
  return Object.entries(m).map(([state, key]) => ({ state, key }));
}

export function ElementDetail({ profileName, onProfileChange }: Props) {
  const { elementId } = useParams<{ elementId: string }>();
  const navigate = useNavigate();
  const [stateIdx, setStateIdx] = useState(0);
  const [playback, setPlayback] = useState<{ key: number; totalDurationMs: number } | null>(null);
  const [simPlaying, setSimPlaying] = useState(false);
  const simRef = useRef<SimHandle>(null);
  const autoPlayRef = useRef(true);

  const profile: SoundProfile = PROFILES[profileName];
  const elementIdx = ELEMENTS.findIndex((el) => el.id === elementId);
  const element = ELEMENTS[elementIdx >= 0 ? elementIdx : 0];

  useEffect(() => {
    if (elementIdx < 0) navigate(`/element/${ELEMENTS[0].id}`, { replace: true });
  }, [elementIdx, navigate]);

  useEffect(() => {
    if (autoPlayRef.current) {
      autoPlayRef.current = false;
      setStateIdx(0);
      setPlayback(null);
      setSimPlaying(false);
      const t = setTimeout(() => simRef.current?.play(), 200);
      return () => clearTimeout(t);
    }
  }, [elementId, profileName]);

  useEffect(() => { autoPlayRef.current = true; }, [elementId]);

  const handleProfileChange = useCallback((name: ProfileName) => {
    autoPlayRef.current = true;
    onProfileChange(name);
  }, [onProfileChange]);

  const playStateSound = useCallback((stateId: string) => {
    const key = getSoundKey(element.id, stateId);
    const sound = key ? profile[key] : null;
    if (sound) audioEngine.play(sound);
  }, [element.id, profile]);

  const soundKeys = getSoundKeys(element.id);

  return (
    <div className="el-detail">
      {/* Left: sim + envelope + table */}
      <div className="el-detail-left">
        <div className="el-detail-bar">
          <span className="el-detail-name">{element.label}</span>
          <div className="el-detail-controls">
            <div className="el-detail-segment">
              {Object.entries(PROFILE_META).map(([key, meta]) => (
                <button
                  key={key}
                  className={`seg-btn${profileName === key ? ' active' : ''}`}
                  onClick={() => handleProfileChange(key as ProfileName)}
                >
                  {meta.label}
                </button>
              ))}
            </div>
            <button
              className="el-detail-play-btn"
              onClick={() => simPlaying ? simRef.current?.stop() : simRef.current?.play()}
              title={simPlaying ? 'Stop' : 'Play'}
            >
              {simPlaying ? (
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><rect x="3" y="2" width="4" height="12" rx="1" /><rect x="9" y="2" width="4" height="12" rx="1" /></svg>
              ) : (
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><polygon points="3,1 14,8 3,15" /></svg>
              )}
            </button>
          </div>
        </div>
        <div className="el-detail-sim">
          <ElementSimulation
            ref={simRef}
            element={element}
            elementIdx={elementIdx >= 0 ? elementIdx : 0}
            profile={profile}
            onStateChange={setStateIdx}
            onSoundPlay={() => {}}
            onPlaybackStart={(ms) => { setPlayback({ key: Date.now(), totalDurationMs: ms }); setSimPlaying(true); }}
            onPlaybackEnd={() => setSimPlaying(false)}
          />
        </div>
        <div className="el-detail-envelope">
          <EnvelopeSVG element={element} activeStateIdx={stateIdx} playback={playback} profile={profile} />
        </div>
        <div className="el-detail-table-wrap">
          <table className="el-states-table">
            <thead>
              <tr>
                <th>State</th><th>Freq</th><th>Gain</th><th>Dur</th><th>Attack</th><th>Type</th><th>Wave</th><th></th>
              </tr>
            </thead>
            <tbody>
              {element.states.map((s, i) => {
                const key = getSoundKey(element.id, s.id);
                const sound = key ? profile[key] : null;
                return (
                  <tr key={s.id} className={`${i === stateIdx ? 'active' : ''}${s.silent ? ' silent' : ''}`} onClick={() => setStateIdx(i)}>
                    <td className="el-st-name">{s.label}</td>
                    {sound ? (
                      <>
                        <td>{sound.freqs.join(', ')}</td>
                        <td>{sound.gain}</td>
                        <td>{Math.round(sound.duration * 1000)}ms</td>
                        <td>{Math.round(sound.attack * 1000)}ms</td>
                        <td>{sound.type}</td>
                        <td>{sound.oscType}</td>
                        <td><button className="el-st-play" onClick={(e) => { e.stopPropagation(); playStateSound(s.id); }}><svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor"><polygon points="2,1 10,6 2,11" /></svg></button></td>
                      </>
                    ) : (
                      <><td colSpan={6} className="el-st-silent">Silent</td><td></td></>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: usage instructions */}
      <div className="el-detail-right">
        <div className="el-usage-scroll">
          <h3>Usage</h3>
          <p className="el-usage-tag"><code>{element.tag}</code></p>
          <CodeBlock code={getUsageCode(element.id, element.tag)} language="markup" />

          <h3>Play programmatically</h3>
          <CodeBlock code={soundKeys.map((sk) =>
            `// ${sk.state}\nsounds.play(SOUNDS.${sk.key});`
          ).join('\n\n')} />

          <h3>Sound keys</h3>
          <div className="el-usage-keys">
            {soundKeys.map((sk) => (
              <div key={sk.key} className="el-usage-key-row">
                <code>{sk.key}</code>
                <button className="el-st-play" onClick={() => { const s = profile[sk.key]; if (s) audioEngine.play(s); }}>
                  <svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor"><polygon points="2,1 10,6 2,11" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
