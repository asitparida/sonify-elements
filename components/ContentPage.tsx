import { PROFILE_META, SOUNDS, type SoundDef } from '../lib/sounds';
import { audioEngine } from '../audio/AudioEngine';
import { CodeBlock } from './CodeBlock';
import './ContentPage.scss';

interface Props {
  profileName: string;
}

export function ContentPage({ profileName }: Props) {
  return (
    <div className="content-page">
      {/* Left: about */}
      <div className="content-left">
        <AboutContent />
      </div>
      {/* Right: get started */}
      <div className="content-right">
        <div className="content-right-scroll">
          <GetStartedContent profileName={profileName} />
        </div>
      </div>
    </div>
  );
}

function PlayBtn({ sound }: { sound: SoundDef }) {
  return (
    <button className="inline-play" onClick={() => audioEngine.play(sound)} title="Play">
      <svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor"><polygon points="2,1 10,6 2,11" /></svg>
    </button>
  );
}

function AboutContent() {
  const entries = Object.entries(PROFILE_META) as [string, { label: string; sub: string }][];
  return (
    <div className="about-scroll">
      <h2>Sonify Elements</h2>
      <p>
        Phones have haptics. Every tap vibrates,
        every toggle clicks. Desktop has nothing.
        You check a box and only pixels change.
      </p>
      <p>
        This library adds sound to native HTML form elements.
        Not alerts, not music. Quiet ticks
        tied to what you did.
      </p>

      <h3>The six parameters</h3>
      <p>
        Every sound is shaped by six values.
      </p>
      <p>
        <strong>Frequency</strong> (260-880 Hz) controls pitch.
        Higher feels lighter. Lower feels heavier.
      </p>
      <p>
        <strong>Gain</strong> (0.04-0.45) controls volume.
        Not all interactions deserve the same loudness.
      </p>
      <p>
        <strong>Duration</strong> (20-180 ms) controls length.
        How long a sound rings before it fades.
      </p>
      <p>
        <strong>Attack</strong> (1-15 ms) controls onset.
        How quickly the sound reaches peak volume.
      </p>
      <p>
        <strong>Type</strong> controls shape: tick, two-note pair,
        double-tap, or DTMF dual-tone.
      </p>
      <p>
        <strong>Waveform</strong> controls timbre.
        Sine for nearly everything. Triangle for error.
      </p>

      <h3>Pitch tells you what happened</h3>
      <p>
        Adding something uses higher pitch.
        Removing something drops lower.
        The direction registers on its own.
      </p>
      <div className="sound-examples">
        <span>Typing (700 Hz)</span><PlayBtn sound={SOUNDS.textType} />
        <span>Check (880 Hz)</span><PlayBtn sound={SOUNDS.checkboxCheck} />
        <span>Delete (500 Hz)</span><PlayBtn sound={SOUNDS.textDelete} />
        <span>Uncheck (660 Hz)</span><PlayBtn sound={SOUNDS.checkboxUncheck} />
        <span>Destructive (260 Hz)</span><PlayBtn sound={SOUNDS.buttonDestructive} />
      </div>

      <h3>Paired sounds</h3>
      <p>
        Binary elements share a timbre family.
        One direction goes up, the other goes down.
      </p>
      <div className="sound-examples">
        <span>Toggle on (rising)</span><PlayBtn sound={SOUNDS.toggleOn} />
        <span>Toggle off (falling)</span><PlayBtn sound={SOUNDS.toggleOff} />
        <span>Focus (ascending)</span><PlayBtn sound={SOUNDS.textFocus} />
        <span>Blur (descending)</span><PlayBtn sound={SOUNDS.textBlur} />
      </div>

      <h3>Volume tracks importance</h3>
      <p>
        Actions you do once should be clear.
        Actions you repeat should disappear.
      </p>
      <div className="sound-examples">
        <span>Button (0.45, loudest)</span><PlayBtn sound={SOUNDS.buttonIcon} />
        <span>Checkbox (0.40)</span><PlayBtn sound={SOUNDS.checkboxCheck} />
        <span>Typing (0.15)</span><PlayBtn sound={SOUNDS.textType} />
        <span>Textarea (0.06)</span><PlayBtn sound={SOUNDS.textareaType} />
        <span>Select hover (0.04)</span><PlayBtn sound={SOUNDS.selectHover} />
      </div>

      <h3>Silence is intentional</h3>
      <p>
        Rest, hover, disabled: all silent.
        Sound only fires on direct user action.
      </p>

      <h3>Profiles</h3>
      <p>
        Each profile multiplies the six parameters.
        Same structure, different texture.
      </p>
      <div className="profiles-grid">
        {entries.map(([key, meta]) => (
          <div key={key} className="profile-card">
            <strong>{meta.label}</strong>
            <span>{meta.sub}</span>
            <code>{`'${key}'`}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

function GetStartedContent({ profileName }: { profileName: string }) {
  return (
    <>
      <h3>Install</h3>
      <CodeBlock code="npm install sonify-elements" language="bash" />

      <h3>Usage</h3>
      <CodeBlock code={`import { ElementSounds } from 'sonify-elements';

const sounds = new ElementSounds({
  profile: '${profileName}'
});

sounds.attach(document.body);`} />

      <h3>HTML attributes</h3>
      <CodeBlock language="markup" code={`<!-- Opt-out a single element -->
<input data-no-sound />

<!-- Button variants -->
<button>Submit (default)</button>
<button data-sound-variant="destructive">Reset</button>
<button data-sound-variant="outline">Cancel</button>
<button data-sound-variant="icon">Settings</button>

<!-- Toggle via checkbox -->
<input type="checkbox" role="switch" />

<!-- Number with phone tones -->
<input type="number" data-phone-tones />

<!-- Dropdown with per-option sounds -->
<div data-select-with-sound>...</div>`} />

      <h3>API</h3>
      <CodeBlock code={`// Switch profile at runtime
sounds.setProfile('bubbly');

// Disable on mobile (default)
// Force enable:
new ElementSounds({ enableOnMobile: true });

// Cleanup
sounds.detach();`} />
    </>
  );
}
