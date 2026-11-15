# HashLab software styling guide

This document records the styling implemented in the repository, including interactive states, responsive layouts, and components that are present in source but not mounted by the current application. It is a reference for maintaining the existing HashLab visual identity.

## 1. Sources and scope

| Source | Responsibility |
| --- | --- |
| [`app/src/main.jsx`](../app/src/main.jsx) | Mounts `App` and imports the active global `styles.css`, settings styles, and `tailwind.css`. |
| [`app/src/styles.css`](../app/src/styles.css) | HashLab fonts, palette, shell, dashboard, module pages, shared controls, and responsive rules. Later rules in this file override earlier definitions of the same selector. |
| [`app/src/features/search/search.css`](../app/src/features/search/search.css) | Styles for the implemented search lesson, scoped primarily under `.hash-search-module` or `.hash-search-*` selectors. Imported by `SearchLesson`. |
| [`app/src/components/learning/lesson.css`](../app/src/components/learning/lesson.css) | Active Introduction to Hashing carousel, outline, demonstration palette, and responsive lesson rules. Imported by `LessonCarousel`. |
| [`app/src/tailwind.css`](../app/src/tailwind.css) | Active Tailwind theme/utilities without Preflight; supplies the visual components’ layout utilities and Manrope heading alias. The light lesson colours are defined by semantic classes in `lesson.css`. |
| [`app/src/features/settings/settings.css`](../app/src/features/settings/settings.css) | Settings controls and application-wide reading-size, contrast, and reduced-motion preferences; see [settings reference](settings.md). |
| [`app/src/App.jsx`](../app/src/App.jsx) | Current navigation and mounted page inventory. |
| [`app/src/index.css`](../app/src/index.css) | Separate Tailwind/shadcn theme with Geist and neutral OKLCH light/dark tokens. **Not imported by the active entry point.** |
| [`app/src/App.css`](../app/src/App.css) | Unused starter/demo styles. **Not imported by the active application.** |

The active application uses a light interface, a navy navigation rail, bright blue actions, white cards, and pale blue surfaces. The separate theme's `.dark` rules do not enable a dark mode in the current application. The Express API has no rendered interface and therefore has no component styling.

## 2. Design foundations

### Colour tokens

These are the custom properties declared by the active global stylesheet. Additional component colours are literal values, documented below rather than implied to be global tokens.

| Token or role | Value | Use |
| --- | --- | --- |
| `--navy` | `#102a56` | Sidebar background. |
| `--blue` | `#2563eb` | Primary actions, active navigation, focus treatment. |
| `--blue-dark` | `#1d4ed8` | Primary button hover. |
| `--muted` | `#718096` | Available muted text token. Most components currently use local muted shades. |
| `--line` | `#e8edf5` | Standard card and header borders. |
| `--surface` | `#fff` | White surface token. |
| Page background | `#f5f7fb` | Root and body canvas. |
| Default text | `#172b4d` | Root text colour. |
| Heading family | Approximately `#142b4e`–`#274268` | Navy headings and emphasis. |
| Secondary text family | Approximately `#687d9a`–`#a5afbd` | Explanations, metadata, captions. Search lesson uses darker `#526985` for body copy. |
| Blue tint | `#eaf1ff`, `#edf3ff`, `#f8faff` | Icon tiles, selected items, and quiet panels. |
| Success family | `#23a779`, `#278a66` | Completion icons, successful search/assessment states; paired with pale green surfaces. |
| Support family | `#e6a33b`, `#ce952d` | Learning tips, hints, and amber panels. |
| Error text | `#aa4836` | Search input validation errors. |

### Typography and icons

| Element | Existing styling |
| --- | --- |
| Body and controls | `DM Sans`, sans-serif; root weight `400`. Buttons and inputs inherit the font. Google Fonts import requests weights `400`–`800`. |
| Main headings | `Manrope`, sans-serif; usually weight `800`, tight negative tracking. Welcome/page titles: `34px`, `-1.5px`; module hero: `29px`. |
| Section headings | Usually `Manrope 800`, `14px`–`20px`, with navy colour. |
| General body copy | Most shell/dashboard text is `9px`–`12px`, line height `1.6`–`1.8`. Search lesson increases primary reading text to `13px`, line height `1.75`–`1.85`. |
| Eyebrows and metadata | Small bold labels, often uppercase content, `8px`–`9px`, letter spacing around `0.6px`–`1.2px`. |
| Large metrics | `Manrope 800`, `23px`; progress overview percentage `43px`. |
| Algorithm text | `ui-monospace, monospace` in the search trace, `10px`, with wrapped content. |
| Icons | Lucide React line icons. Common sizes: `13px`–`17px` for metadata/actions, `19px`–`23px` for navigation and card icons, `27px`–`35px` for feature/lesson symbols. The welcome hash is `48px`, stroke width `2.5`. Icon colour generally inherits from its tile or button. |

### Geometry, spacing, elevation, and motion

- All elements use `box-sizing: border-box`. Body margin is `0`, minimum width is `320px`, and the application/root fill at least the viewport height.
- Common spacing values are `5`, `8`, `9`, `10`, `12`, `13`, `14`, `17`, `18`, `19`, `20`, `21`, `24`, `25`, `28`, `30`, `34`, `38`, and `42px`; the source does not define a formal spacing-token scale.
- Cards usually use a `1px` border and `13px`–`15px` radius. Controls usually use `7px`–`9px` radii. Icon tiles usually use `8px`–`14px` radii. Pills and avatars use fully rounded shapes.
- Most white cards have no shadow. Primary actions use `0 4px 10px #2563eb28`; active sidebar navigation uses `0 5px 15px #061b3d55`; the brand tile uses `0 7px 18px #071b3c66`. Decorative welcome art has stronger blue-tinted shadows.
- Control transitions are generally `0.2s`; progress width is `0.3s`; sidebar width and main margin are `0.25s ease`. Primary buttons move upward `1px` on hover. Search lesson transitions are disabled for `prefers-reduced-motion: reduce`.

## 3. Application shell and navigation

Sources: [`Layout.jsx`](../app/src/components/layout/Layout.jsx), [`Navbar.jsx`](../app/src/components/layout/Navbar.jsx), [`Sidebar.jsx`](../app/src/components/layout/Sidebar.jsx).

| Component / element | Styling and states |
| --- | --- |
| `Layout` / `.app-shell` | Full viewport minimum height. Fixed sidebar and offset `.main-area`; the main area animates its left margin when sidebar collapse changes. |
| `.sidebar` | Fixed to the left edge, full viewport height, navy background, white text, column flex layout, `z-index:20`, padding `27px 18px 18px`. Desktop width `258px`; `230px` at widths up to `1100px`. |
| Sidebar brand | `.sidebar-brand` is a horizontal flex row with `11px` gap and `0 9px 38px` padding. `.brand-icon` is a `40px` square, blue, `13px` radius, white hash icon and navy shadow. Brand heading: `Manrope 800 20px`, `-0.6px` tracking; subtitle: `10px`, `#a9bddc`. |
| Sidebar section label | `9px`, weight `800`, `1.2px` tracking, `#7892b8`, padding `0 12px 12px`. |
| Sidebar navigation | `.sidebar-nav` is a grid with `5px` gaps. `.nav-item` is transparent, borderless, left-aligned flex with `13px` gap, `12px 13px` padding and `9px` radius; text `12px/600`, `#b9c9e0`. Hover: translucent white `#ffffff12` and white text. Active: blue fill, white text and dark shadow. |
| Sidebar footer | Pushed to the bottom with `margin-top:auto`; top divider `#ffffff19`; flex row, `10px` gap, `14px 9px` padding. Footer icon: `34px` square with `9px` radius, translucent white fill, `#8db6ff` icon. Title `11px` white; supporting line `9px #9db1cf`. |
| Collapse button | Desktop-only `30px` square, `7px` radius, transparent and borderless, `#9db1cf`; hover uses `#ffffff15` and white. Uses open/close panel icons. Hidden at widths up to `820px` in both expanded and collapsed states; mobile uses the menu trigger and close control instead. |
| Collapsed sidebar | Width and main-area offset become `78px`; sidebar horizontal padding `14px`. Brand/navigation/footer centre; text is omitted by the component. Collapse button is positioned at top `77px`, right `23px`. |
| `.topbar` | Sticky top header, white background, `70px` high, bottom border `var(--line)`, `z-index:10`, vertically centred grid with `auto minmax(0,1fr) auto` columns and `12px` gaps; horizontal padding `42px` on large screens. Breadcrumb, course button and right-side actions occupy separate columns. Up to `560px`, uses two rows with breadcrumb/actions above the centred full-width course label; height is automatic with a `90px` minimum, `8px 14px` padding, `10px` column gap and `2px` row gap. |
| Breadcrumb | `11px` text with `9px` gap; muted `#9aa7b9` brand and navy `#263b5c` current page at weight `700`. Separating chevron is `15px`. Maximum width `30vw`, minimum width `0`; long current-page titles truncate with an ellipsis on one line. On phones, the HashLab brand remains visible, the gap becomes `6px`, text `10px`, and the width cap is removed within its flexible first-row column. |
| `.topbar-right` | Right-aligned grid item containing a horizontal flex action group, `19px` gap on larger screens; `8px` at widths up to `560px`, in the first-row actions area. Avatar, logout and menu controls remain available. |
| Course/home button | `.course-tag.course-home`: centred in the flexible middle column, with equal free space between the breadcrumb and right-side action group. Small uppercase `9px/800` text, `0.7px` tracking and home icon; minimum height `36px`, minimum width `0`, maximum width `100%`, `8px 10px` padding, `8px` radius, transparent borderless background, centred text and contents. Hover uses `#edf3ff` and blue text. Keyboard focus: `2px` blue outline, `2px` offset. On phones, occupies a centred second row spanning the header, retains its home icon, and uses `11px` text, `1.5` line height, `0.6px` tracking, `4px 8px` padding and `28px` minimum height. |
| Avatar | `33px` circular profile-settings button, `#e8efff` background, `#2455b5` initials, `12px/800`. |
| Logout | White bordered button with navy text and a logout icon. At widths up to `640px`, only its icon is visible; its accessible label remains “Log out”. |
| Mobile menu trigger | Top-right `.mobile-menu`: `40px` square (`44px` up to `560px`), `10px` radius, `1px #dfe7f3` border, `#edf3ff` fill, blue icon, shadow `0 2px 6px #102a5608`. Hover and expanded state use blue fill/white icon and `0 4px 10px #2563eb28` shadow; pressed state darkens to `--blue-dark`. Focus is a `2px` blue outline with `3px` offset. Hidden above `820px`; grid-centred below. Exposes expanded state and controls the `main-navigation` sidebar. |
| Mobile close control | `.mobile-close`: `36px` square, `9px` radius, white icon, translucent white border/background; hover uses `#ffffff20` fill and `#ffffff40` border; keyboard focus uses `#8db6ff`. Hidden on desktop and grid-centred up to `820px`; aligned to the end of the brand row. |
| Mobile scrim | Fixed full-screen `#071b3c80` overlay, borderless, `z-index:15`; visible when mobile navigation is open. Clicking it closes navigation. |
| Page container | `.page-content`: `34px 42px 22px` padding, max width `1500px`, centred. `.content-wrap`: max width `1250px`, centred. |

The middle course column fills the space between the breadcrumb and right-side actions. Its button is centred within that space, while long breadcrumb titles truncate instead of pushing controls off-screen. At widths up to `820px`, the sidebar becomes a `270px` off-canvas drawer, translated left by `100%` until `.sidebar-open` resets the transform. Width and transform transitions both last `0.25s ease`. The main area's margin is `0`; mobile menu and close controls appear. Collapsed-sidebar CSS also restores the drawer to `270px` and clears its main offset at this breakpoint.

## 4. Shared controls and content patterns

| Element / selector | Styling |
| --- | --- |
| `.primary-button` | Blue fill, white text, no border, `8px` radius, `10px 13px` padding, `10px/700`, inline flex with `9px` gap, blue shadow. Hover: darker blue and `translateY(-1px)`. Search lesson overrides size and disabled appearance locally. |
| `.secondary-button` | White fill, `1px #dfe7f3` border, `8px` radius, `9px 12px` padding, `10px/700 #42618d`, inline flex and `8px` gap. Hover: `#9bb8e9` border and `#f8faff` fill. |
| `.text-button` | Transparent and borderless blue text, `10px/700`, flex with `6px` gap and `4px 0` padding. |
| `.back-button` | Transparent and borderless, `10px/700 #6f829e`, flex with `7px` gap, `3px 0` padding, bottom margin `20px`. |
| `.eyebrow` | Flex with `7px` gap, `9px/800`, `1.1px` tracking, `#4777ce`. Search lesson darkens this to `#315f9c`. |
| `.pill` | Inline flex with `4px` gap; `8px/800`, `0.6px` tracking, `30px` radius, `6px 9px` padding. Blue: `#edf3ff` / `#3975dc`; green: `#e8f8f0` / `#21966d`. |
| `.module-icon` | `42px` square, `12px` radius, centred icon, no shrinking. Large variant: `53px` square with `17px` bottom margin. Colour pairs: blue `#eaf1ff/#3273e7`; violet `#f0edff/#8065df`; orange `#fff2e4/#e99435`; cyan `#e6f8fc/#2598b6`; green `#e8f8f0/#23a779`; pink `#ffedf3/#d85d8d`. Current module metadata defaults to blue. |
| `.section-heading` | Flex, items aligned to the bottom, space-between, bottom margin `13px`. Heading: `Manrope 800 17px`, `-0.4px`, `#1b3152`, margin `5px 0 0`. Nested eyebrow: `8px`. |
| `.page-intro` | Margin `8px 0 25px`; title `Manrope 800 34px`, `-1.5px`, `#142b4e`; supporting copy `12px #7c8ba1`, line height `1.7`. |
| `.side-card` | White fill, standard border, `14px` radius, `17px` padding. Heading `Manrope 800 14px`, `-0.3px #233a5c`; paragraph `10px #8794a7`, line height `1.7`. |
| `.side-card-heading`, `.mini-icon` | Small label `8px/800`, `1px` tracking, `#8190a5`, flex with `8px` gap. Icon tile `27px`, `8px` radius, `#edf3ff` / `#3474e7`. |
| `.support-card` | `.side-card` variant with `#fffcf4` fill, `#f5ecd7` border and amber `#e6a33b` icon. |
| `.checkpoint-row` | Flex with `8px` gap, top margin `13px`, `9px #72849d`; green `#39a982` check icon. |
| `.progress-line` | `5px` high track, `9px` radius, `#edf1f7`; margin `17px 0 12px`, clipped overflow. Inner fill uses `linear-gradient(90deg,#3478ed,#73a6ff)` and a `0.3s` width transition. |
| `.search-box` | White field, standard `1px` border, `9px` radius, `40px` high, width `min(360px,100%)`, `0 12px` padding, `9px` icon gap. Icon `#94a3b8`; input `11px #334968`, transparent, borderless, full height. Placeholder `#a2adbc`. Focus-within: blue border and `0 0 0 3px #2563eb20` halo. |

Outside the search lesson and explicitly styled menu/course controls, the stylesheet does not define a universal `:focus-visible` or `:disabled` treatment. Retain browser semantics and verify focus when introducing new controls; do not assume search-specific rules apply elsewhere.

## 5. Dashboard and module browser

Sources: [`Dashboard.jsx`](../app/src/pages/Dashboard.jsx), [`WelcomeBanner.jsx`](../app/src/components/dashboard/WelcomeBanner.jsx), [`ProgressCards.jsx`](../app/src/components/dashboard/ProgressCards.jsx), [`ModuleCard.jsx`](../app/src/components/dashboard/ModuleCard.jsx), [`Modules.jsx`](../app/src/pages/Modules.jsx).

| Component / element | Styling and states |
| --- | --- |
| `WelcomeBanner` | `.welcome-row`: white-to-pale-blue `112deg` gradient, `1px #e8eef9` border, `17px` radius, `28px 38px` padding, minimum height `190px`, horizontal flex, relative and overflow hidden. Text max width `560px`, positioned above decoration. Heading `34px/800 Manrope`, highlighted word blue `#3476ed`. Supporting copy `12px #74839a`, line height `1.8`, max width `520px`. Primary action has `15px` top margin. |
| Welcome art | `300×155px` stage, no flex shrinking, right margin `25px`. Main hash: `75px` square, `23px` radius, blue gradient `145deg`, `7px #d9e7ff` border, blue shadow. Two dashed elliptical orbits (`170×105px`, `240×135px`), rotated `-22deg`/`27deg`. Floating white number tiles: `34px`, `11px` radius, `10px/800 #3268c3`, soft shadow. Caption: `8px/800 #9aacc7`, `1.5px` tracking. |
| `ProgressCards` | `.stats-grid`: four equal columns, `14px` gap, margin `19px 0 30px`. `StatCard` is a white bordered flex card, `13px` radius, `17px 18px` padding, `12px` gap, min height `126px`. Icon `36px`, `10px` radius. Label `10px/600 #8390a4`; value `Manrope 800 23px #1a3153`, `-0.7px`; note `9px #a1adbd`. |
| Stat colour variants | Blue `#eaf1ff/#3474e7`; purple `#f0edff/#8065df`; orange `#fff3e5/#ec9a39`; green `#e7f9f1/#22a878`. These apply to `.stat-icon`, and remain effective despite later shared icon sizing rules. |
| Dashboard columns | `.dashboard-grid`: `minmax(0,1.75fr) minmax(240px,.9fr)`, `20px` gap, top aligned. Main column has `min-width:0`; secondary column is a start-aligned grid with `14px` gaps and `2px` top padding. |
| Continue-learning card | `.continue-card`: white, standard border, `14px` radius, `19px 20px` padding. Top row spaces icon and pill. Title `Manrope 800 16px #1c3151`, margin-top `15px`; body `10px #8592a5`, `1.7` line height. Metadata `9px #8492a7`, `16px` gap. Footer flex space-between, `9px #99a5b6`; primary button does not shrink. |
| `ModuleCard` | Despite its component name, the mounted implementation renders `.module-row`, not `.module-card`. It is a full-width transparent row button with `13px` gap, `12px 4px` padding, thin bottom divider `#f0f3f8`, and no final-row border. Text column fills remaining space; title `10px #344968`, objective `9px #98a5b6`. Hover turns title blue. |
| Module row status | Completed icon `19px #23aa7b`; otherwise a `9px #8c9aaf` duration with `13px` clock. End chevron `17px #a4b1c2`. Duration is hidden at phone widths. |
| Module list | `.module-list`: white, standard border, `13px` radius, `4px 15px` padding. Used by Dashboard, Modules, and Progress. |
| Quick-think card | Uses `.side-card`. `.mini-table` is a flex row with `5px` gaps, margin `16px 0`. Slots `45px` high, equal width, `6px` radius, `#e1e8f2` border, `#f8faff` fill, `11px/800 #3c5f96`; indices `7px #aab6c7` at top-left. Filled slots use `#eaf1ff`, `#a9c5f7` border, `#2867d0` text. Secondary action spans the full card width. |
| Ready-for-lecture card | `.ready-card`: `135deg` gradient `#edf4ff` to `#f7faff`, `#e2ecfc` border. White `36px` icon tile, `11px` radius, blue icon and soft shadow. `.ready-note`: flex, `6px` gap, `9px/600 #5e83bc`, `13px` top margin. |
| `Modules` page | Shared page intro, then `.module-toolbar` flex with space-between and `17px` bottom margin; search field and module list reuse patterns above. Empty search result currently renders a plain paragraph and inherits the list typography; it does not use `.empty-state`. |

## 6. Module detail and remaining pages

Sources: [`ModuleDetail.jsx`](../app/src/pages/ModuleDetail.jsx), [`Progress.jsx`](../app/src/pages/Progress.jsx), [`Visualiser.jsx`](../app/src/pages/Visualiser.jsx), [`PracticeLab.jsx`](../app/src/pages/PracticeLab.jsx), [`Assessment.jsx`](../app/src/pages/Assessment.jsx), [`Settings.jsx`](../app/src/pages/Settings.jsx).

| Component / element | Styling and states |
| --- | --- |
| Module hero | `.module-hero`: `120deg` white-to-`#f1f6ff` gradient, `#e5edf9` border, `15px` radius, `25px 28px` padding, bottom margin `18px`. Large icon above title. Title `29px/800 Manrope`, navy with blue full stop; body `11px #7889a1`, line height `1.7`, max width `650px`. Metadata flex with `18px` gap, `9px #8796aa`, `15px` top margin. |
| Non-search lesson layout | `.lesson-layout`: `minmax(0,1.7fr) minmax(220px,.8fr)`, `17px` gap. `.lesson-card`: white, standard border, `14px` radius, `21px` padding. Header flex space-between; heading `Manrope 800 16px #233a5c`. Objective `11px #687d9a`, line height `1.7`, margin `15px 0 18px`. |
| Module 1: Introduction to Hashing | The `.intro-module` page uses the shared hero/cards, an 11-card `LessonCarousel`, and a clickable `LessonOutline`. The main/aside grid is `minmax(0,1fr) minmax(240px,.42fr)` with `20px` gap; copy and demonstrations use the app’s white, navy, pale-blue surfaces and consistent primary/secondary controls. See section 9 for all ten active visual components and lesson-specific states. |
| Learning placeholder | Minimum height `280px`, dashed `#c9d8ed` border, `12px` radius, `145deg #f8faff`–`#f1f6ff` gradient, centred column, `25px` padding. Symbol tile `59px`, `17px` radius, `#e4edff` / `#3475df`. Caption `8px/800 #6890cf`, `1.1px` tracking. Heading `17px/800 Manrope #274268`; body `10px #8796ab`, max width `380px`, `1.7` line height. |
| Lesson actions and aside | `.lesson-actions`: flex space-between, `10px` gap, `17px` top margin. Aside is a start-aligned grid with `13px` gaps containing shared checkpoint/support cards. Mark-complete button is disabled by the component after completion; outside search it has no extra custom disabled visual rule. |
| Modules 2, 3, 4, and 6 | Use `TopicLesson` and the shared checked `KnowledgeCheck`; see the foundational-module inventory below. |
| Module 5 | Uses `SearchLesson`; see the dedicated search inventory below. Its assessment also uses the shared `KnowledgeCheck`. |
| `Progress` overview | `.progress-overview`: flex space-between, `110deg` white-to-`#f1f6ff` gradient, `#e4ecf9` border, `14px` radius, `24px 30px` padding, `17px` bottom margin. Percentage is `Manrope 800 43px #2563eb`; supporting paragraph `10px #8492a6`. Trophy is `32px` and inherits text colour. Overview `h2` has no specific rule. |
| `Progress` track and rows | `.progress-track`, `.progress-fill`, and `.progress-module` are emitted by the page but have **no CSS definitions** in the active stylesheets. The fill receives an inline percentage width, but has no specified height/background. Row buttons and labels therefore use inherited/global/browser styling, rather than the styled `.module-row` pattern. |
| `Visualiser` | Page intro plus shared `.feature-placeholder` with Workflow icon, visualiser pill, heading/copy, and three icon-led feature rows. Currently an informational placeholder, not the reusable HashTable UI. |
| `PracticeLab` | `.practice-lab` in [`practice.css`](../app/src/features/practice/practice.css) uses white cards, navy text, blue controls, and a four-stage numbered map. The problem/editor workspace has two columns, collapsing below `1000px`. Stage cards collapse from four to two columns below `1250px`, then one below `560px`. Current problems have blue borders; accepted work uses green with text/icons; locked stages have labelled disabled controls. The JavaScript editor has a resizable frame, synchronised line-number gutter, focus outline, and editable JSON input. Case feedback, progressive hints, code snippets, and the table sandbox reuse the lesson palette. |
| `Assessment` | Same placeholder layout, using ListChecks/Target/Lightbulb/RefreshCcw symbols and assessment content. Implemented quizzes are inside the module lessons. |
| Feature placeholder pattern | White standard bordered card, `15px` radius, minimum height `380px`, `35px` padding, centred column and text. Feature icon `65px`, `19px` radius, `#eaf1ff/#3475e4`. Heading `20px/800 Manrope #203858`; paragraph `11px #8492a6`, line height `1.8`, max width `490px`. Feature list is left aligned with `10px` row gaps and `22px 0` margin; rows `10px #607691`, `9px` icon gap, green `#36a77d` icons. |
| `Settings` | Active Profile, Accessibility, Audio preferences, and Learning preferences cards with browser-saved controls, blue icon tiles, visible focus states, and responsive layout. See the detailed [settings styling reference](settings.md). |

## Foundational-module component inventory

Modules 2, 3, 4, and 6 reuse the search lesson's navigation, white main card, blue diagrams, checkpoint aside, feedback, and assessment styles. Their shared frame and scoped additions are in [`TopicLesson.jsx`](../app/src/features/learning/TopicLesson.jsx), [`KnowledgeCheck.jsx`](../app/src/features/learning/KnowledgeCheck.jsx), and [`topics.css`](../app/src/features/learning/topics.css).

| Component / region | Styling and states |
| --- | --- |
| Shared lesson frame | `.hash-topic-module` keeps all four activity panels mounted and hides inactive panels with `[hidden]`. Activity buttons expose `aria-current`. Scenario, outcomes, warmup, feedback, and reflection reuse the search lesson's readable text and focus states. |
| Editable worked examples | Wrapping controls use flexible labels with `130px` bases. Pale blue demonstration panels have `20px` padding, a `#dce6f5` border, and `10px` radius. Equations use `18px` monospace text with wrapping. Inputs, errors, replay, and step controls retain labelled keyboard controls. |
| Hash-function calculation | Learner-controlled steps connect division, quotient, remainder, and the home-slot highlight. Previous/Next disable at their bounds. Guided practice reveals progressive hints and a highlighted result after a correct calculation. |
| Collision comparison | Two columns show linear-probing slots and chaining buckets. Current buckets have a blue border/fill plus the text “current bucket.” Replay, Previous, Play/Pause, and Next control the trace. Reduced motion uses manual advancement; hidden activity panels do not advance playback. |
| Linear Probing | [`probing.css`](../app/src/features/probing/probing.css) scopes light table cards, readable code, key queues, progress, controls, and feedback to `.hash-probing-module`. The table uses up to five equal columns; each slot names its index, contents, and state. Blue marks the current check, amber a collision, double green a stored key, dashed blue a visited slot, and red a wrong/full state. Text supplements colour. Trace table/code columns collapse below `1200px`; controls wrap and mobile padding reduces. Shared checked assessment styling replaces the old dark quiz. |
| Load-factor comparison | Two table cards display occupancy, longest cluster, measured search, and insertion metrics. A labelled range input and occupancy presets change density. The rehash control expands a 20-slot table. Metrics use white bordered cards with labelled definitions. |
| Responsive behaviour | Comparison columns collapse to one column below `700px`; demonstration padding reduces to `15px`. Flexible forms wrap, table slots inherit the shared responsive grid, and long equations/bucket values wrap. |

## 7. Search lesson component inventory

Sources: [`SearchLesson.jsx`](../app/src/features/search/SearchLesson.jsx), [`SearchExplorer.jsx`](../app/src/features/search/SearchExplorer.jsx), [`SearchPractice.jsx`](../app/src/features/search/SearchPractice.jsx), [`SearchWarmup.jsx`](../app/src/features/search/SearchWarmup.jsx), [`SearchAssessment.jsx`](../app/src/features/search/SearchAssessment.jsx), [`search.css`](../app/src/features/search/search.css).

All search components are active within module 5. The feature inherits DM Sans; base copy is `13px`, line height `1.75`, navy `#233a5c`. H2 is `20px/1.4`, `-0.4px` tracking; H3 is `15px/1.5`. Explanatory paragraphs use `#526985`, `12px`–`13px`, line height `1.8`–`1.85`. Shared buttons are raised to at least `38px` high, `12px`, centred. Disabled buttons have opacity `0.45` and a default cursor. Buttons, inputs, selects and reflection textarea use a `3px #df9b2c` focus-visible outline with `3px` offset.

| Component / region | Styling and states |
| --- | --- |
| `SearchLesson` activity navigation | White, `1px #e0e8f4` border, `11px` radius, `5px` padding, wrapping flex, `6px` gaps. Buttons flex from `120px`, `11px 13px` padding, `7px` radius, `12px/600 #526985`; hover `#f1f5fd`; `[aria-current]` blue/white. Completion status uses `#edf9f2`, green `#267758`, `#cdebdc` border, `8px` radius, `13px 16px` padding. |
| `SearchLesson` main layout | Grid `minmax(0,1fr) minmax(220px,.38fr)`, `18px` gap. Main `.lesson-card` has `25px` padding. Section headings wrap with `12px` gaps; pill text `9px`. Context/outcomes cards: `23px` vertical margins, `19px` padding, `#dce6f5` border, `9px` radius, `#f7faff`; outcomes inset `19px`, `7px` between entries. |
| Procedure, worked content and support | Ordered procedure uses `18px` gaps, blue `#4170b6` markers, strong `#2a4265`, `12px` descriptions. `LearningContent` sections have `25px` vertical margins and `17px` headings. Tombstone note uses `#fffaf0`, `#f0dfb8` border, `9px` radius, `19px` padding, `20px` amber bulb. Aside extends shared side/support cards with `11px/1.8` copy, `10px` checkpoints and `#526985` text. Actions wrap with `12px` gaps and `24px` top margin; notes `11px`. |
| Exported `SearchTable` | Uses nested `HashTable`/`HashSlot`; grid has `min(table.length,5)` equal columns, `8px` gaps, `24px` vertical margin. Slots are at least `72px` tall, `9px 4px` padding, `7px` vertical gap, `8px` radius, `#f8faff`, `#dce5f3` border. Index `10px #526985`; value `16px/700 #355984`, wraps anywhere. Current: `2px solid #316fe6` and `#edf3ff`. Collision: amber `#d49c42` border, `#fff6e8` fill. Match: `3px double #278a66`, `#eaf8f1`; later match rule wins when states overlap. Empty/deleted values display “Empty”/“Deleted”. |
| Search table legend | Wraps with `13px` gaps, `10px #526985` text. Current swatch `8px` square with blue border/fill; match repeats the double green border. |
| `SearchExplorer` form | Two equal columns, `18px` gap. Labels `11px/600 #506a8e`; inputs/selects white, min height `39px`, `9px 11px` padding, `#d9e2f0` border, `7px` radius, `#35547d` text, `7px` top margin. Inline submit button also `39px` high, `7px` gap. Invalid input shows `11px #aa4836` error text. |
| Explorer workspace and calculation | Workspace `#dfe7f3` border, `10px` radius, clipped overflow. Canvas `20px` padding, `#f8faff`. Calculation strip white, `#dae5f8` border, `7px` radius, `11px 14px` padding; `10px` labels and `14px` blue strong calculation. |
| Explorer transport and summary | Wrapping controls, `8px` gap; buttons `33px` high, `7px 11px` padding, `11px` text. Pace label pushes right; select min height `31px`, `10px`. Trace summary wraps, `14px` top margin, `10px` text. |
| Explorer explanation and pseudocode | Grid `1fr 1.3fr`, `18px` gap, `20px` padding, white with top border `#e1e8f3`. Code panel `7px` radius, `#e0e8f4` border, `#f6f9ff`, `9px` list text, `2.3` line height; code `10px` monospace, wraps. Current line `[aria-current]` uses `#dce9ff` fill and blue text. Result spans both columns, `14px` padding, `7px` radius: absent amber `#fff9ed/#e9ddbd/#806637`; found green `#eff9f3/#cfe5d8/#357259`. |
| `SearchPractice` | Shared heading, pill and SearchTable. Prompt margin `22px 0 14px`, explanatory line `11px`. Slot choices five equal columns, `8px` gaps; buttons `4px` horizontal padding, `10px` text. Selected choice blue `#3272dd` border/`#edf4ff` fill. Choices disable after correct submission. Final status `20px` padding, `8px` radius, green `#eef9f3/#2f7254`, `12px` paragraph. |
| `SearchWarmup` | Shared pale blue context-card treatment. Each check has a `#dce6f5` top divider, `21px` top margin, `17px` top padding; H4 `13px`. Options wrap with `8px` gap; pressed state `#326bd4` border, `#eaf2ff` fill, `#224e91` text. Reuses feedback and progressive hints. |
| `SearchAssessment` question area | Intro `12px/1.85`; notes `11px`. Questions `24px` top margin, `20px` top padding, `#e6ecf5` divider. Position `11px/600`; legend `10px`; fieldset border/padding removed. `QuizQuestion` styles are in the shared component inventory below. Submit disabled before selection and after checking. |
| Assessment result | `25px` top margin, `20px` padding, `9px` radius, `#efdfbc` border, `#fffaf1` fill, `#806335` text; score heading `19px`, paragraphs `12px/1.85`. Passed state `#cee8d9` border, `#effaf4` fill, `#2c7454` text/heading. Review/retry actions wrap with `9px` gaps. |
| Assessment reflection | Context-card dimensions with white fill. Labels `16px` top margin. Textarea full width, `8px` top margin, `11px` padding, `#cad7eb` border, `7px` radius, `#304e73`, vertically resizable. Confidence select reuses feature forms. |

Activity selection and current pseudocode lines use `aria-current`; warmup/practice selections expose pressed state. The visible table grid is accompanied by a clipped `1px` screen-reader list naming slot contents and current/matching state. Form errors use alert semantics and invalid/described-by attributes. Trace explanations and feedback/completion/results have live/status regions. Assessment focuses the position heading on entry/advancement and remains mounted but hidden while other activities are shown. These states supplement colour with text, border treatment, and accessibility attributes.

## 8. Reusable learning, assessment, and visualisation components

| Component/source | Usage | Styling and states |
| --- | --- | --- |
| [`LearningContent`](../app/src/components/learning/LearningContent.jsx) | Active in SearchLesson | `.lesson-section`: `25px` bottom margin; base H2 `Manrope 800 16px #233a5c`, margin `7px 0 13px`; paragraphs `11px #7889a1`, line height `1.8`. Search overrides sections to `25px 0`, H2 `17px` with `9px` bottom margin, paragraphs `13px/1.85 #526985`. Optional `.lesson-example` has no dedicated rule. |
| [`FeedbackPanel`](../app/src/components/learning/FeedbackPanel.jsx) | Active in search warmup/practice/assessment | Search-scoped `16px` padding, `20px` vertical margin, `8px` radius, `#e7d7bd` border, `#fff7e9` fill, `#805b2b` text. Correct: `#cde8d8/#f0faf4/#2e7854`. Heading flex, `9px` gap, `12px` text, `20px` icon. Explanation `12px`, `10px` top margin. Optional hint has `17px` bulb; `.feedback-hint` has no dedicated CSS. Incorrect uses base amber. |
| [`QuizQuestion`](../app/src/components/assessment/QuizQuestion.jsx) | Active in search assessment | Scoped H2 `16px/1.75`, `18px` bottom margin. Options grid `9px` gap; full-width left-aligned flex option `11px` gap, `13px` padding, `8px` radius, `#dee6f3` border, white, `12px/1.8 #526985`. Selected: `#edf4ff`, `#2b5ba0`, `#6d97de` border and inset `1px` ring. Letter tile `22px`, `5px` radius, `#f5f8ff`, `#dce6f7` border, `10px` text. Check button `17px` top margin. |
| [`ScaffoldingPanel`](../app/src/components/assessment/ScaffoldingPanel.jsx) | Active in search warmup/practice/assessment | Scoped amber card: `18px` padding, `20px` vertical margin, `8px` radius, `#eddfbf` border, `#fffaf0`, `#725c37`. Heading flex `9px` gap, `20px` bulb, `14px` H3. Hint rows `10px` gap, `12px` top margin, `12px` text; number badges `21px` circular `#f5e8c9`, `10px` text. |
| [`HashTable`](../app/src/components/visualiser/HashTable.jsx) | Active through SearchTable | `.hash-search-table .hash-table`: grid `repeat(var(--search-columns), minmax(0,1fr))`, `8px` gaps. No general `.hash-table` rule outside search scope. |
| [`HashSlot`](../app/src/components/visualiser/HashSlot.jsx) | Active through HashTable | Search-scoped slot dimensions, typography and current/collision/highlighted states are specified in section 7. Outside search scope these class names have no dedicated styling. |
| [`LessonLayout`](../app/src/components/learning/LessonLayout.jsx) | Present, unmounted | Reuses two-column `.lesson-layout`, one column up to `820px`. `.learning-content`: white, standard border, `14px` radius, `21px` padding (`16px` up to `560px`). Optional `.lesson-sidebar`: same surface/border/radius, `19px` padding, align-self start; H3 `Manrope 800 14px #233a5c`, `17px` bottom margin. Shared page intro. |
| [`AnswerFeedback`](../app/src/components/assessment/AnswerFeedback.jsx) | Present, unmounted | `.answer-feedback.correct`/`.incorrect`, `21px` result icon, strong label and paragraph. No matching CSS rules: inherited/global/browser styling, without a custom green/red treatment. |
| [`StepControls`](../app/src/components/visualiser/StepControls.jsx) | Present, unmounted | Reset/Previous use secondary buttons, Next primary, `16px` icons. `.step-controls`, `.step-indicator`, `.step-buttons` have no dedicated CSS. Boundary buttons use native disabled attributes; there is no unscoped custom disabled rule. |

## 9. Introduction to Hashing lesson

Sources: [`LessonCards.jsx`](../app/src/data/LessonCards.jsx), [`LessonCarousel.jsx`](../app/src/components/learning/LessonCarousel.jsx), [`LessonOutline.jsx`](../app/src/components/learning/LessonOutline.jsx), [`lesson.css`](../app/src/components/learning/lesson.css), and the ten visual components below.

Module 1 is mounted through `ModuleDetail`. Its eleven cards reuse ten visual components (`HashFunctionVisual` appears twice). The lesson uses the existing application shell and light card design; the earlier full-blue L01 presentation and removed `components/ui` primitives are not the active lesson. The remaining [`Home.jsx`](../app/src/pages/Home.jsx) is unmounted legacy source and still refers to those removed UI primitives.

### Carousel, navigation and controls

| Component / element | Current styling and states |
| --- | --- |
| `LessonCarousel` | Named inline-size container `lesson`, with a white viewport, `1px #dce5f3` border and `12px` radius. Flex slides fill the viewport width; a resize observer fits viewport height to the active card as text and demonstrations resize, with a `.2s` height transition. Embla provides swipe navigation; `data-no-swipe` prevents demonstrations from stealing or starting a lesson swipe. |
| Lesson copy | `22px` padding, shared `8px` eyebrow, navy `Manrope 800 20px/1.4` heading with `-.4px` tracking, and `13px/1.85 #526985` explanatory paragraphs. Content no longer relies on white text against a dark slide. |
| Interactive example stage | `#f8faff` background, `1px #e1e8f3` top divider, `20px` padding; small `8px/800 #6881a6` label with `1px` tracking. Demonstration content is centred and at most `480px` wide. At a lesson-container width of at least `760px`, copy and stage sit side by side (`.85fr/1.25fr`); copy padding becomes `24px` and the divider moves to the left edge of the stage. |
| Previous/Next | Shared secondary buttons, `38px` minimum height, `11px` text, and `16px` chevrons. First/last boundaries disable the appropriate control with `.4` opacity. Keyboard arrow navigation applies to the carousel itself without taking arrow keys from embedded buttons, fields or demonstrations. |
| Position and card dots | A centred `10px/600 #647792` counter with status semantics. Each dot has a `20×24px` button target; its indicator is `6px` round and `#cbd9ef`, widening to `16px` with blue fill for `[aria-current]`. Dot labels include each card’s number and title. Inactive slides are hidden from assistive technology and made inert. |
| `LessonOutline` | Shared white `.side-card` surface with mini ListChecks icon, heading, current-card text, progress line and a numbered list. List gaps `5px`; buttons have `38px` minimum height, `9px` padding, `8px` radius, `11px/1.6` muted text, and a transparent border/background. Titles wrap instead of truncating. Hover is pale blue/navy; the current step uses `#edf3ff`, `#d3e2fa` border, `#245bb6`, bold text and a blue/white number tile. |
| Outline step number | `22px` square, `6px` radius, `10px/800`; inactive `#f0f4fb/#687d9a`, current blue/white. Buttons expose `aria-current="step"` when selected. |
| Shared visual [`Button`](../app/src/components/learning/visuals/Button.jsx) | Semantic `.lesson-visual-button` classes, `36px` minimum height, `8px` radius, `8px 11px` padding, `11px/700` DM Sans, `6px` icon gap. Secondary is white with `#dfe7f3` border and `#42618d`; hover uses `#f8faff/#9bb8e9`. Primary uses blue/white, a quiet blue shadow and darker-blue hover. Danger uses pale red with dark red text/border. Pressed choices use pale blue, `#245bb6` and `#6d97de` border. Disabled controls use `.45` opacity and a not-allowed cursor. |
| Focus and completion | Carousel, lesson/outline buttons, focusable diagram scroll regions, and completion action use a `3px #df9b2c` focus-visible outline with `3px` offset. The completion area has a top divider and `17px` top padding. Its primary action has `38px` minimum height and `11px` text; completed/disabled state uses `.55` opacity and no hover lift. |

### Shared visual palette

Values, labels, formula text and pointers remain readable against the pale demonstration background. State colours are accompanied by visible captions, values, pointer positions or labels rather than colour alone. The slot classes add a border without heavy shadows.

| Semantic class / state | Styling |
| --- | --- |
| `.lesson-visual` | `12px/1.7`, `#526985`. |
| `.lesson-visual-surface` | `#edf3fb` fill, `1px #dce5f3` border, `9px` radius, `#355984` text. |
| `.lesson-visual-slot` | White fill, `1px #dce5f3` border, navy `#355984` values, no shadow. |
| `--occupied` | Pale blue `#eaf1ff`, `#a9c5f7` border, `#2867d0` text. |
| `--current` | Amber `#fff6e8`, `#d49c42` border, `#805b2b` text. |
| `--visited` | Muted `#edf1f7`, `#dce5f3` border, `#687d9a` text. |
| `--found` | Green `#eaf8f1`, `#278a66` border, `#21674e` text. |
| `--collision` | Red `#fff1ef`, `#d46c61` border, `#aa4836` text. Also identifies a deleting array value. |
| `.lesson-visual-gap` | Dashed `2px #a9c5f7` border and `#edf3ff` fill for an insertion target. |
| Caption / index / pointer | `.lesson-visual-caption`: `12px/1.8 #526985`; `.lesson-visual-index`: `10px #687d9a`; `.lesson-visual-pointer`: blue `#3475df`. |
| Formula / rule / tag | Monospace formula text `#304e73`; rule panels use `#edf3ff`, `#dce5f3` border and `9px` radius. Tags use pale blue fill, `#d3e2fa` border, `7px` radius and `#2867d0`. State modifiers also tint key/hash/index tags. |

### Active visual component inventory

| Component / source | Structure and state styling |
| --- | --- |
| [`ArrayDragVisual`](../app/src/components/learning/visuals/ArrayDragVisual.jsx) | Six flexible square surface slots, each at most `64px`; inset occupied-blue value blocks with grab/grabbing cursors, navy/blue values, muted indices, and `#dce5f3` crosshairs. Drag/snap-back behavior remains intact; no heavy block shadow. |
| [`ArrayInsertVisual`](../app/src/components/learning/visuals/ArrayInsertVisual.jsx) | Seven `48px` capacity slots with `8px` gaps in a horizontally scrollable `76px` viewport. Occupied-blue blocks and a dashed blue insertion gap show the shift. A polite caption explains the operation; insertion controls are secondary and New array is primary. Busy/full boundaries retain disabled states. |
| [`ArraySearchDeleteVisual`](../app/src/components/learning/visuals/ArraySearchDeleteVisual.jsx) | `48px` blocks with `56px` pointer steps in a `116px` scrolling viewport. Current amber, visited grey, found green and deleting red states; blue pointer and amber Delete bubble. Search is secondary, Delete uses danger treatment and Reset is primary. The existing comparison/deletion motion and live captions remain. |
| [`HashFunctionVisual`](../app/src/components/learning/visuals/HashFunctionVisual.jsx) | Pale-blue formula panel for `h(k) = k mod N`, with amber keys, blue table-size terms and dark-green results. Ten table slots use bordered current/found/occupied states; muted index labels and live explanatory caption. Play/Replay is primary. Used by two cards. |
| [`HashingExampleVisual`](../app/src/components/learning/visuals/HashingExampleVisual.jsx) | Wrapping key → hash → modulo → index pipeline with blue arrows, uppercase muted step labels, bordered tags and function boxes. Key/hash/result use occupied/current/found colours; table slots and indices reuse the common palette. Previous/Step controls are secondary and Play is primary. Local `Step`, `Arrow`, `FnBox` and `Chip` helpers share these treatments. |
| [`HashSearchVisual`](../app/src/components/learning/visuals/HashSearchVisual.jsx) | The same pipeline vocabulary over a ten-slot, five-column table. Amber target, green found slot/check badge, muted other values and live captions distinguish stages. Search controls are secondary and Reset primary. `Step`, `Arrow`, `FnBox` and `Chip` use the shared tag/slot/index/pointer palette. |
| [`CollisionVisual`](../app/src/components/learning/visuals/CollisonVisual.jsx) | Ten-column arrival/table/chain diagram, including `TwoLine` key labels and current-key `NewKey` helper. Occupied pale-blue slots, red collisions, amber next-free/current key and green success state; thin blue chain connectors. Mode choices expose pressed state using the common selected-button treatment; Play/Replay is primary. The source filename retains `CollisonVisual.jsx`. |
| [`ChainingPointersVisual`](../app/src/components/learning/visuals/ChainingPointersVisual.jsx) | Five horizontally scrollable bucket rows with muted indices, blue pointers/NULL labels and bordered node pills. Row/new-node states use amber, red and green to accompany insertion captions. Existing nodes use pale blue, and Play/Replay uses the shared primary button. |
| [`TerminologyVisual`](../app/src/components/learning/visuals/TerminologyVisual.jsx) | Wrapping selected-term buttons above a pale bordered panel, navy heading, muted explanation and changing diagram. Key/hash/slot, collision, chaining, probing and load-factor diagrams reuse occupied/current/found/collision states, dark pointers and monospace tags. `Pop`, `Chip` and `Arrow` helpers retain their motion and geometry. Play/Pause is primary. |
| [`TimeComplexityVisual`](../app/src/components/learning/visuals/TimeComplexityVisual.jsx) | Eight scrollable bucket rows and a light three-column complexity table. Bordered node states distinguish idle/visited/checking/found; headers and table dividers use muted navy and pale blue. The active mode/result has blue or green emphasis. Average/worst-case choices use pressed-state buttons and Play/Replay is primary. |

### Responsive and accessibility behaviour

At viewport widths up to **1100px**, the Introduction lesson becomes one main column, its aside uses two columns, and the outline spans the aside width with a two-column list. At **560px and below**, aside/outline lists become one column; lesson-card, copy and stage padding is `16px`, slide headings become `18px`, and Previous/Next become compact icon-only `36px` controls with accessible names. Internal array/chain diagrams scroll within their stages when needed; control groups wrap. A **760px lesson-container query** controls side-by-side copy/visual placement independently of viewport width.

`MotionConfig` and instant Embla navigation honour the saved Reduce motion preference or the device setting. High-contrast preference darkens captions, indices, outline buttons and counter text and strengthens the borders of the viewport, slots, surfaces and visual buttons. Global reading-size preferences continue to apply to lesson paragraphs and list text.

## 10. Responsive behaviour

Breakpoints are inclusive `max-width` media queries, not JavaScript device categories. Later stylesheet definitions still participate in the cascade.

| Viewport | Existing behaviour |
| --- | --- |
| Above `1100px` | `258px` sidebar; `70px` header; `42px` horizontal page/header gutters; four stats; two dashboard columns and two generic lesson columns. |
| Up to `1150px` | Search lesson becomes one main column; its aside becomes two columns. |
| Up to `1100px` | Sidebar `230px`, main offset `230px`; page padding `27px 25px`, header gutters `25px`; dashboard column proportions `1.5fr/.8fr`; welcome art scales to `.85`. Introduction lesson becomes one main column; aside/outline layouts use two columns, with the outline spanning the aside. |
| Up to `820px` | Sidebar becomes off-canvas `270px`; main offset cleared; menu, close control and conditional scrim displayed. Header gutters `19px`, page padding `25px 19px`. Stats two columns. Dashboard and generic lesson layout one column. Secondary cards and generic lesson aside two columns. Welcome art shrinks/scales, brand bottom padding `30px`. |
| Up to `700px` | Search explorer input/step-panel grids become one column; search content padding `18px`, canvas/step panels `15px`; search aside one column; search heading `18px`; hash values `13px`, slot minimum height `61px`. |
| Up to `560px` | Header uses two rows with automatic height, a `90px` minimum and `8px 14px` padding. HashLab/current-page breadcrumb and actions stay on row one; the full course label and home icon are centred on row two with `11px` text, `1.5` line height, `0.6px` tracking and `4px 8px` padding. Topbar action gap `8px`. Page padding `20px 14px`. Welcome padding `22px`, title `27px`, copy `10px`, artwork hidden. Stats gap `9px`, values `20px`; dashboard gap `17px`; secondary/lesson aside one column. Continue footer stacks, action full width. Module row durations hidden. Page intro heading `28px`; module hero padding `20px`, title `25px`. Lesson actions wrap. Introduction card/copy/stage padding becomes `16px`, its outline/aside become one column, slide title `18px`, and Previous/Next use accessible icon-only `36px` controls. |
| Up to `400px` | Search transport gap `6px`; playback pace control occupies a full row aligned right; practice slot choices change from five to three columns. |
| Lesson container at least `760px` | Introduction copy and visual stage sit side by side (`.85fr/1.25fr`), with a left divider and `24px` copy padding. This is an inline-size container query, not a viewport breakpoint. |
| Reduced motion | Global settings styles disable CSS transitions/animations when requested. Introduction additionally uses Motion’s reduced-motion setting and instant Embla navigation; search retains its scoped reduced-motion CSS. |

Cascade detail: the first phone breakpoint assigns stat-card padding/minimum height `13px/115px`, but the later unconditional `.stat-card` definition restores `17px 18px/126px`. Phone stat gaps and value sizes are updated again later. Document and verify the effective result before changing duplicate rules.

## 11. Additional source styles and implementation gaps

These selectors are retained in `styles.css` but are not all used by mounted components. They are documented so new work does not mistake an obsolete pattern for the current implementation.

| Pattern | Existing definition / usage |
| --- | --- |
| Legacy branding/navigation | `.brand`, `.brand-mark`, `.brand-name`, `.brand-subtitle`, `.sidebar-label`, `.main-nav`, `.sidebar-divider`, `.sidebar-bottom`, `.help-card`, `.help-icon`, `.help-title`, `.course-chip`, `.nav-dot`, `.status-pulse` describe earlier sidebar/header markup. Current components use the `.sidebar-brand`, `.brand-icon`, `.sidebar-nav` and `.sidebar-footer` patterns instead. |
| Legacy module cards | `.module-grid` defines a two-column grid, one at phone widths. Earlier `.module-card` styles specify bordered cards and hover lift, but later rules replace this with a transparent flex row, `15px 4px` padding, bottom divider, `13px` title and no lift/shadow. Current `ModuleCard` uses `.module-row`. Supporting legacy selectors include `.module-card-icon`, `.module-card-content`, `.module-card-top`, `.module-card-bottom`, `.completed-label`, `.module-number`, `.objective`, `.module-card-footer`, `.bloom-tag`, `.card-arrow`, `.module-count`, and `.empty-state`. |
| Progress ring | `.progress-ring` defines a `90px` conic-gradient circle controlled by `--progress`; inner `69px` light circle and overlaid `13px/800` label. Phone sizes `75px/57px`. `Progress` currently renders a plain progress track instead. |
| Activity outline | `.activity-outline`: `#e9eef6` border, `9px` radius, `5px 12px` padding; `.activity-item`: flex, `9px` gap, `10px` text and row dividers. Step marker `21px`, `7px` radius, pale blue fill. `.coming-soon`: `7px/800` muted label. Not used by current ModuleDetail. |
| Build note | `.build-note`: flex with `7px` gap, `#f5f8fd` fill, `#8b9bb1` text, `7px` radius, `9px 12px` padding, `8px/800`, `0.7px` tracking. Not rendered by current placeholder pages. |
| Page footer | `.page-footer`: spaced flex, `9px #a5afbd`, `30px 2px 5px` padding; `.footer-heart` pink `#e77c9c`; `8px` text on phones. Layout currently has no footer element. |
| Extra shell selectors | `.topbar-left`, `.topbar-label`, `.menu-button`, `.sidebar-close` are available source selectors but differ from current Navbar/Sidebar markup. In particular, `.menu-button` does not style the actual `.mobile-menu` trigger. |
| Starter App.css | `.counter`, `.hero`, `#center`, `#next-steps`, `#docs`, `#spacer`, `.ticks` style the Vite starter/demo; absent from the mounted app. These use unresolved starter token names if imported without their original theme. |

## 12. Guidelines for maintaining the current style

1. Use the active `DM Sans`/`Manrope` typography, navy/blue palette, white cards, pale borders and rounded controls for additions to the mounted app.
2. Reuse existing semantic patterns such as `.primary-button`, `.secondary-button`, `.module-row`, `.side-card`, `.page-intro` and `.search-box` where their role matches. Check later overrides before relying on an earlier declaration.
3. Keep search-specific changes scoped to the lesson so they do not unexpectedly alter compact dashboard/navigation typography.
4. Specify normal, hover, keyboard-focus, selected, disabled, success and error states when a new component needs them. Pair state colour with a border treatment, icon, label or selection attribute, as the search lesson does.
5. Check the narrow `320px` layout and the documented breakpoints. Keep icon-only buttons labelled and provide a clear keyboard focus indicator.
6. Update this guide when adding a component or changing a shared visual rule. Record unstyled/unmounted components honestly until their implementation is connected.
