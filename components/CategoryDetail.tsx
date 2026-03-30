import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { findInteraction } from '../data/categories';
import { PROFILES, PROFILE_META, type ProfileName, type SoundKey } from '../lib/sounds';
import { audioEngine } from '../audio/AudioEngine';
import { CategorySim } from './CategorySim';
import { CodeBlock } from './CodeBlock';
import './CategoryDetail.scss';

interface Props {
  profileName: ProfileName;
  onProfileChange: (name: ProfileName) => void;
}

export function CategoryDetail({ profileName, onProfileChange }: Props) {
  const { interactionId } = useParams<{ interactionId: string }>();
  const interaction = findInteraction(interactionId || '');
  const profile = useMemo(() => PROFILES[profileName], [profileName]);

  if (!interaction) return null;

  return (
    <div className="cat-detail">
      {/* Left: sim + table */}
      <div className="cat-detail-left">
        <div className="cat-bar">
          <span className="cat-name">{interaction.label}</span>
          <div className="cat-segment">
            {Object.entries(PROFILE_META).map(([key, meta]) => (
              <button
                key={key}
                className={`seg-btn${profileName === key ? ' active' : ''}`}
                onClick={() => onProfileChange(key as ProfileName)}
              >
                {meta.label}
              </button>
            ))}
          </div>
        </div>
        <CategorySim interactionId={interaction.id} profileName={profileName} />
        <div className="cat-table-wrap">
          <table className="cat-states-table">
            <thead>
              <tr>
                <th>Sound</th><th>Freq</th><th>Gain</th><th>Dur</th><th>Attack</th><th>Type</th><th>Wave</th><th></th>
              </tr>
            </thead>
            <tbody>
              {interaction.sounds.map((s) => {
                const sound = profile[s.soundKey as SoundKey];
                return (
                  <tr key={s.soundKey}>
                    <td className="cat-st-name">{s.label}</td>
                    {sound ? (
                      <>
                        <td>{sound.freqs.join(', ')}</td>
                        <td>{sound.gain}</td>
                        <td>{Math.round(sound.duration * 1000)}ms</td>
                        <td>{Math.round(sound.attack * 1000)}ms</td>
                        <td>{sound.type}</td>
                        <td>{sound.oscType}</td>
                        <td><button className="cat-st-play" onClick={() => sound && audioEngine.play(sound)}><svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor"><polygon points="2,1 10,6 2,11" /></svg></button></td>
                      </>
                    ) : (
                      <><td colSpan={6} className="cat-st-silent">Silent</td><td></td></>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: usage */}
      <div className="cat-detail-right">
        <div className="cat-usage-scroll">
          <h3>About</h3>
          <p>{interaction.description}</p>

          <h3>Play programmatically</h3>
          <CodeBlock code={interaction.sounds.map((s) =>
            `// ${s.label}\nsounds.play(SOUNDS.${s.soundKey});`
          ).join('\n\n')} />

          <h3>Sound keys</h3>
          <div className="cat-usage-keys">
            {interaction.sounds.map((s) => {
              const sound = profile[s.soundKey as SoundKey];
              return (
                <div key={s.soundKey} className="cat-usage-key-row">
                  <div>
                    <code>{s.soundKey}</code>
                    <span className="cat-usage-key-desc">{s.description}</span>
                  </div>
                  <button className="cat-st-play" onClick={() => sound && audioEngine.play(sound)}>
                    <svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor"><polygon points="2,1 10,6 2,11" /></svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
