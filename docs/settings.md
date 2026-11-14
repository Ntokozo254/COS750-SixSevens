# Settings and student preferences

Settings provides a local student profile, accessibility/display choices, optional text-to-speech, and learning preferences. Changes apply immediately and are saved in this browser; this feature does not require the API or a database connection.

The four cards expose **Display name**, optional **Student number**; **Reading text size**, **Higher contrast**, **Reduce motion**; **Enable read-aloud**, **Voice**, **Speaking speed**; and **Preferred learning approach**, **Study session goal**, respectively. Each control has a visible associated label; checkbox controls expose switch semantics.

## Components and integration

| Source | Responsibility |
| --- | --- |
| [Settings.jsx](../app/src/pages/Settings.jsx) | Profile, Accessibility, Audio preferences, Learning preferences, and reset controls. |
| [usePreferences.js](../app/src/hooks/usePreferences.js) | Owns the current preference values and persistence status. |
| [preferences.js](../app/src/logic/preferences.js) | Defaults, validation, and guarded browser-storage reads/writes. |
| [App.jsx](../app/src/App.jsx) | Creates one shared preferences hook and passes its values/actions to Settings, Layout, and Dashboard. |
| [Layout.jsx](../app/src/components/layout/Layout.jsx) | Applies display preferences through `data-reading-size`, `data-high-contrast`, and `data-reduce-motion`; mounts ReadAloud. |
| [Navbar.jsx](../app/src/components/layout/Navbar.jsx) | Shows initials derived from the display name; its avatar button opens Settings. |
| [Dashboard.jsx](../app/src/pages/Dashboard.jsx) | Shows the selected study-session goal and a study suggestion matching the chosen preference. |
| [ReadAloud.jsx](../app/src/components/settings/ReadAloud.jsx) | Optional page narration and playback controls. |
| [settings.css](../app/src/features/settings/settings.css) | Settings cards/controls, profile preview, narration bar, and application-wide accessibility overrides. |
| [main.jsx](../app/src/main.jsx) | Loads settings styles after the existing global stylesheet. |

## Preference schema

The record is a flat JSON object stored under **`hashlab.preferences.v1`**. The key carries the schema version. Unknown properties and inherited properties are ignored; invalid values fall back to defaults.

| Field | Default | Accepted value |
| --- | --- | --- |
| `displayName` | `""` | Text up to 60 characters. |
| `studentNumber` | `""` | Text up to 20 characters. |
| `readingSize` | `"standard"` | `standard`, `large`, or `extra-large`. |
| `highContrast` | `false` | Boolean. |
| `reduceMotion` | `false` | Boolean. |
| `speechEnabled` | `false` | Boolean. |
| `speechRate` | `1` | Finite number from `0.75` to `1.5`. |
| `speechVoice` | `""` | Browser voice identifier up to 200 characters; empty selects the browser default. |
| `preferredMode` | `"explore"` | `explore`, `visual`, `aural`, `read-write`, `kinesthetic`, or `multimodal`. |
| `studyGoal` | `15` | Integer from 5 to 60 minutes, in five-minute steps. |

Text fields retain ordinary spaces while the student types. Control characters are removed, and overly long values are truncated. Numeric strings are not treated as numbers by the validation layer.

## Saving and profile behaviour

- `usePreferences()` returns `{ preferences, updatePreference, resetPreferences, storageAvailable }`.
- `updatePreference(key, value)` validates and saves a known field. Successive edits preserve the other current fields, including before React completes a render.
- `resetPreferences()` restores the defaults and writes them to the preferences key. It does not remove completed-module progress or assessment records.
- The hook reads stored settings lazily on initial mount. Missing or malformed JSON restores safe defaults; storage access/read/write errors are caught.
- When persistence fails, the interface keeps the current choices for the session and reports that browser saving is unavailable. A later successful save restores the normal status.
- The profile is a browser-local display profile, not an account, sign-in, or enrolment check. It is not synchronised between devices or sent to the backend.
- The header avatar uses the first letters of up to two display-name words, falling back to `S` when the name is empty.

## Accessibility and display

The standard reading size preserves existing typography. Large and extra-large use **14px** and **16px** reading text, with `1.8` line height, for the targeted paragraphs, lists, form fields, metadata, and module-row text inside page content. Heading sizes and navigation geometry retain their existing rules.

High contrast darkens supporting text, strengthens borders, deepens primary-button blue, and brightens inactive sidebar labels. Reduced motion disables CSS animations/transitions and smooth scrolling within the app. The operating-system `prefers-reduced-motion: reduce` setting is honoured independently of the saved checkbox.

## Audio preferences and read aloud

Read aloud uses the browser's `speechSynthesis` and `SpeechSynthesisUtterance` APIs. It is optional and starts only after a playback action. Voice availability depends on the browser/device; an unavailable stored voice falls back to the browser's default voice.

Settings lists the browser's current voices and refreshes the list when voices become available. Its speed selector offers `0.75×`, `1×`, `1.25×`, and `1.5×`. **Preview voice** plays a sample; **Stop preview** cancels it. Changing an audio preference, resetting settings, or leaving Settings stops the sample. Audio controls disable when support or the enabling preference is absent, with explanatory text.

When enabled, the narration bar provides **Read page**, **Pause/Resume**, and **Stop**. It reads visible headings, paragraphs, and list text within `.page-content`, while excluding hidden content, navigation, form controls, alerts/status regions, and screen-reader-only duplicates. Long text is queued in smaller utterances.

Navigation, module changes, audio-setting changes, and unmounting cancel active narration. Playback completion, empty content, and speech errors have visible status messages. Unsupported browsers show an explanatory message while leaving on-screen lesson content available.

## Learning preferences and VARK

The learning preference updates optional study suggestions in Settings and the Dashboard. The session goal changes the displayed study plan; it is not a countdown timer or a change to completion requirements.

The external link points to the [official VARK questionnaire](https://vark-learn.com/the-vark-questionnaire/) and opens in a new tab with `noopener noreferrer`. VARK describes Visual, Aural, Read/write, and Kinesthetic preferences, including combinations. Use the questionnaire for reflection and experimenting with study strategies, rather than treating a preference as a fixed ability or restricting lesson formats. See VARK's [explanation of the questionnaire](https://vark-learn.com/about-vark/frequently-asked-questions/).

## Styling reference

| Component or state | Style |
| --- | --- |
| Settings layout | Two equal columns with `20px` gaps; start-aligned cards. |
| Settings card | White `var(--surface)`, `1px var(--line)` border, `14px` radius, `24px` padding. |
| Card headings | Manrope `800`, `16px`, navy `#233a5c`; supporting copy `11px/1.7`, `#647792`. |
| Section icon tiles | `40px` square, `12px` radius; blue, purple, green, and orange pale-fill/icon pairs. |
| Form fields | Full width, minimum height `42px`, `10px 12px` padding, `8px` radius, `#d9e2f0` border; labels `12px/600`. |
| Switches | Native checkbox controls with blue accent, `18px` square; toggle rows have pale top dividers, descriptive text, and a flexible text column. |
| Buttons | Existing primary/secondary styles, minimum height `38px`, `11px` text. |
| Keyboard focus | Settings controls/links, profile avatar, and narration buttons use a `3px #df9b2c` outline with `3px` offset. |
| Disabled controls | Opacity `0.5`, not-allowed cursor, no hover translation. |
| Profile preview | Pale blue `#f7faff`, `#e1eafa` border, `11px` radius; `48px` initials tile with `14px` radius; long profile text wraps. |
| Study tips panel | Pale `#f8faff` fill, `#e1eafa` border, `9px` radius, `15px` padding; `13px` bold Manrope heading, `11px/1.8` body, indented tip list and polite live updates. |
| VARK panel | Pale blue `#f3f7ff`, `#dce6f5` border, `10px` radius, `17px` padding; blue wrapping external link with icon and new-tab hint. |
| Save status | Green `#267758`; unavailable-storage state amber `#805b2b`, with text/icon feedback. |
| Narration bar | Pale blue `#edf3ff`, `#dce6f5` border, `11px` radius, wrapping controls, `13px 17px` padding. |

At **1000px and below**, settings cards form one column. At **560px and below**, heading/actions stack, cards use `19px` padding, card gaps become `15px`, and paired fields become one column. Narration horizontal gutters follow the app at **1100px** (`25px`), **820px** (`19px`), and **560px** (`14px`, with `12px` internal padding).

Preference validation/storage tests live in [preferences.test.js](../app/src/logic/preferences.test.js).
