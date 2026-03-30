import { useEffect, useRef, useState } from 'react';
import { ElementSounds } from 'sonify-elements';
import type { ProfileName } from 'sonify-elements';
import { SelectWithSound } from 'sonify-elements';
import '../../src/lib/SelectWithSound.css';
import './DemoPage.scss';

interface Props {
  profileName: ProfileName;
}

export function DemoPage({ profileName }: Props) {
  const rightRef = useRef<HTMLDivElement>(null);
  const soundsRef = useRef<ElementSounds | null>(null);
  const listboxRef = useRef<SelectWithSound | null>(null);

  useEffect(() => {
    if (!rightRef.current) return;
    soundsRef.current = new ElementSounds({ profile: profileName });
    soundsRef.current.attach(rightRef.current);

    const lbEl = rightRef.current.querySelector('#demo-listbox');
    if (lbEl) {
      listboxRef.current = SelectWithSound.create(
        lbEl as HTMLElement,
        [
          { value: 'ar', label: 'Argentina' }, { value: 'au', label: 'Australia' },
          { value: 'br', label: 'Brazil' }, { value: 'ca', label: 'Canada' },
          { value: 'dk', label: 'Denmark' }, { value: 'fi', label: 'Finland' },
          { value: 'de', label: 'Germany' }, { value: 'in', label: 'India' },
          { value: 'jp', label: 'Japan' }, { value: 'mx', label: 'Mexico' },
        ],
        { placeholder: 'Select country...' },
      );
    }

    return () => { soundsRef.current?.detach(); listboxRef.current?.destroy(); };
  }, []);

  useEffect(() => {
    soundsRef.current?.setProfile(profileName);
  }, [profileName]);

  return (
    <div className="demo-page">
      <h2>Demo</h2>
      <p>Same form, side by side.<br />Left is silent. Right has sound.</p>
      <div className="demo-split">
        <div className="demo-pane">
          <span className="demo-pane-label">Without sound</span>
          <DemoForm id="silent" />
        </div>
        <div className="demo-pane with-sound" ref={rightRef}>
          <span className="demo-pane-label">With sound</span>
          <DemoForm id="sound" />
        </div>
      </div>
    </div>
  );
}

function DemoForm({ id }: { id: string }) {
  const [exp, setExp] = useState(3);
  return (
    <form className="demo-form" onSubmit={(e) => e.preventDefault()}>
      {/* Row 1: Name + Email */}
      <div className="demo-form-row">
        <label>
          Name
          <input type="text" placeholder="Jane Doe" />
        </label>
        <label>
          Email
          <input type="email" placeholder="jane@example.com" />
        </label>
      </div>

      {/* Row 2: Password + Country */}
      <div className="demo-form-row">
        <label>
          Password
          <input type="password" placeholder="At least 8 chars" />
        </label>
        {id === 'sound' ? (
          <label>
            Country
            <div id="demo-listbox"></div>
          </label>
        ) : (
          <label>
            Country
            <select>
              <option value="">Select...</option>
              <option>Argentina</option><option>Australia</option>
              <option>Brazil</option><option>Canada</option>
              <option>Denmark</option><option>Finland</option>
            </select>
          </label>
        )}
      </div>

      {/* Experience slider with value */}
      <label>
        <span className="demo-label-row">
          Experience
          <span className="demo-range-value">{exp === 20 ? '20+' : exp} {exp === 1 ? 'year' : 'years'}</span>
        </span>
        <input
          type="range" min="0" max="20" value={exp}
          onChange={(e) => setExp(parseInt(e.target.value))}
        />
      </label>

      {/* Toggles */}
      <div className="demo-form-toggles">
        <label><input type="checkbox" role="switch" data-sound-variant="toggle" defaultChecked /> Enable subscriptions</label>
        <label><input type="checkbox" role="switch" data-sound-variant="toggle" /> Enable services</label>
      </div>

      {/* Notifications + Digest side by side */}
      <div className="demo-form-row">
        <fieldset className="demo-form-fieldset">
          <legend>Notification channels</legend>
          <label><input type="checkbox" defaultChecked /> Email</label>
          <label><input type="checkbox" /> Phone</label>
          <label><input type="checkbox" /> In-app</label>
        </fieldset>
        <fieldset className="demo-form-fieldset">
          <legend>Send digest</legend>
          <label><input type="radio" name={`digest-${id}`} defaultChecked /> Daily</label>
          <label><input type="radio" name={`digest-${id}`} /> Weekly</label>
          <label><input type="radio" name={`digest-${id}`} /> Never</label>
        </fieldset>
      </div>

      {/* Expandable */}
      <details>
        <summary>More options</summary>
        <label>
          Notes
          <textarea placeholder="Anything else..." rows={2} />
        </label>
      </details>

      {/* Actions */}
      <div className="demo-form-actions">
        <button type="submit">Submit</button>
        <button type="button" data-sound-variant="destructive">Reset</button>
        <button type="button" data-sound-variant="outline">Cancel</button>
      </div>
    </form>
  );
}
