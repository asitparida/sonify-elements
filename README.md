# sonify-elements

Haptics, but for the web.

Add subtle sound feedback to native HTML form elements. Every checkbox tick, toggle switch, button press, and slider drag gets a synthesized sound via Web Audio API. Five profiles, no audio files, one line to install.

## Install

```bash
npm install sonify-elements
```

## Usage

```ts
import { ElementSounds } from 'sonify-elements';

const sounds = new ElementSounds();
sounds.attach(document.body);
```

That's it. Every native form element inside the container now has sound.

## Profiles

```ts
const sounds = new ElementSounds({ profile: 'bubbly' });
```

| Profile | Character |
|---------|-----------|
| `default` | Balanced sine tones |
| `minimal` | Barely-there whispers |
| `bubbly` | Playful pops and bloops |
| `pop` | Dual-tone clicks |
| `tron` | Electronic glow |

Switch at runtime:

```ts
sounds.setProfile('tron');
```

## HTML attributes

```html
<!-- Opt out a single element -->
<input data-no-sound />

<!-- Button variants -->
<button>Submit (default)</button>
<button data-sound-variant="destructive">Reset</button>
<button data-sound-variant="outline">Cancel</button>
<button data-sound-variant="icon">Settings</button>

<!-- Toggle via checkbox -->
<input type="checkbox" role="switch" />

<!-- Number input with DTMF phone tones -->
<input type="number" data-phone-tones />
```

## Custom dropdown with per-option sounds

Native `<select>` can't expose hover events. Use `SelectWithSound` for per-option ticks:

```ts
import { SelectWithSound } from 'sonify-elements';

const select = SelectWithSound.create(container, [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
], { placeholder: 'Select country...' });
```

## What gets sound

| Element | Events |
|---------|--------|
| Text input | focus, blur, type, delete, paste |
| Password | focus, blur, type |
| Number | focus, blur, DTMF tones per digit |
| Textarea | focus, blur, type (lighter) |
| Checkbox | check, uncheck |
| Radio | select |
| Toggle (role=switch) | on, off |
| Button | primary, destructive, outline, icon |
| Select | open, hover, close |
| Range slider | grab, detent ticks, release |
| File input | browse click, file selected |
| Details/summary | expand, collapse |

## What stays silent

Rest, hover, disabled, and consequential state changes (like a radio sibling deselecting). Sound only fires on direct user action.

## Mobile

Sounds are off by default on touch devices. Force enable:

```ts
new ElementSounds({ enableOnMobile: true });
```

## API

```ts
sounds.attach(container)     // Start listening
sounds.detach()              // Stop listening
sounds.setProfile('pop')     // Switch profile
sounds.setEnabled(false)     // Mute
sounds.play(sound)           // Play a sound directly
```

## License

MIT
