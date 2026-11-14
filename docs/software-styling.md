# HashLab software styling guide

This document records the styling implemented in the repository, including interactive states, responsive layouts, and components that are present in source but not mounted by the current application. It is a reference for maintaining the existing HashLab visual identity.

## 1. Sources and scope

| Source | Responsibility |
| --- | --- |
| [`app/src/main.jsx`](../app/src/main.jsx) | Mounts `App` and imports the active global `styles.css`. |
| [`app/src/styles.css`](../app/src/styles.css) | HashLab fonts, palette, shell, dashboard, module pages, shared controls, and responsive rules. Later rules in this file override earlier definitions of the same selector. |
| [`app/src/features/search/search.css`](../app/src/features/search/search.css) | Styles for the implemented search lesson, scoped primarily under `.hash-search-module` or `.hash-search-*` selectors. Imported by `SearchLesson`. |
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
| Collapse button | `30px` square, `7px` radius, transparent and borderless, `#9db1cf`; hover uses `#ffffff15` and white. Uses open/close panel icons. |
| Collapsed sidebar | Width and main-area offset become `78px`; sidebar horizontal padding `14px`. Brand/navigation/footer centre; text is omitted by the component. Collapse button is positioned at top `77px`, right `23px`. |
| `.topbar` | Sticky top header, white background, `70px` high, bottom border `var(--line)`, `z-index:10`, vertically centred grid with `auto minmax(0,1fr) auto` columns and `12px` gaps; horizontal padding `42px` on large screens. Breadcrumb, course button and right-side actions occupy separate columns. |
| Breadcrumb | `11px` text with `9px` gap; muted `#9aa7b9` brand and navy `#263b5c` current page at weight `700`. Separating chevron is `15px`. Maximum width `30vw`, minimum width `0`; long current-page titles truncate with an ellipsis on one line. |
| `.topbar-right` | Right-aligned grid item containing a horizontal flex action group, `19px` gap on larger screens; `10px` at widths up to `560px`. |
| Course/home button | `.course-tag.course-home`: centred in the flexible middle column, with equal free space between the breadcrumb and right-side action group. Small uppercase `9px/800` text, `0.7px` tracking and home icon; minimum height `36px`, minimum width `0`, maximum width `100%`, `8px 10px` padding, `8px` radius, transparent borderless background, centred text and contents. Hover uses `#edf3ff` and blue text. Keyboard focus: `2px` blue outline, `2px` offset. At phone widths, the label remains visible and wraps as needed; text becomes `8px`, line height `1.4`, tracking `0.4px`, padding `4px 6px`, and the home icon is hidden. |
| Avatar | Noninteractive `33px` circular tile, `#e8efff` background, `#2455b5` letter, `12px/800`. |
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
| Learning placeholder | Minimum height `280px`, dashed `#c9d8ed` border, `12px` radius, `145deg #f8faff`–`#f1f6ff` gradient, centred column, `25px` padding. Symbol tile `59px`, `17px` radius, `#e4edff` / `#3475df`. Caption `8px/800 #6890cf`, `1.1px` tracking. Heading `17px/800 Manrope #274268`; body `10px #8796ab`, max width `380px`, `1.7` line height. |
| Lesson actions and aside | `.lesson-actions`: flex space-between, `10px` gap, `17px` top margin. Aside is a start-aligned grid with `13px` gaps containing shared checkpoint/support cards. Mark-complete button is disabled by the component after completion; outside search it has no extra custom disabled visual rule. |
| Module 5 | Replaces the placeholder lesson with `SearchLesson`; see the dedicated search inventory below. |
| `Progress` overview | `.progress-overview`: flex space-between, `110deg` white-to-`#f1f6ff` gradient, `#e4ecf9` border, `14px` radius, `24px 30px` padding, `17px` bottom margin. Percentage is `Manrope 800 43px #2563eb`; supporting paragraph `10px #8492a6`. Trophy is `32px` and inherits text colour. Overview `h2` has no specific rule. |
| `Progress` track and rows | `.progress-track`, `.progress-fill`, and `.progress-module` are emitted by the page but have **no CSS definitions** in the active stylesheets. The fill receives an inline percentage width, but has no specified height/background. Row buttons and labels therefore use inherited/global/browser styling, rather than the styled `.module-row` pattern. |
| `Visualiser` | Page intro plus shared `.feature-placeholder` with Workflow icon, visualiser pill, heading/copy, and three icon-led feature rows. Currently an informational placeholder, not the reusable HashTable UI. |
| `PracticeLab` | Same placeholder layout, using Code2/Target/Lightbulb symbols and practice content. |
| `Assessment` | Same placeholder layout, using ListChecks/Target/Lightbulb/RefreshCcw symbols and assessment content. The implemented quiz is currently inside module 5. |
| Feature placeholder pattern | White standard bordered card, `15px` radius, minimum height `380px`, `35px` padding, centred column and text. Feature icon `65px`, `19px` radius, `#eaf1ff/#3475e4`. Heading `20px/800 Manrope #203858`; paragraph `11px #8492a6`, line height `1.8`, max width `490px`. Feature list is left aligned with `10px` row gaps and `22px 0` margin; rows `10px #607691`, `9px` icon gap, green `#36a77d` icons. |
| `Settings` | Shared page intro followed by Accessibility, Audio preferences, and Learning preferences content. `.settings-list`, `.settings-item`, and `.settings-item-icon` currently have **no CSS definitions**. Their headings, paragraphs, spacing and icon layout use inherited/global/browser styling. There are no rendered form controls or toggles yet. |

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

## 9. Alternate lesson and UI components

Sources: [`Home.jsx`](../app/src/pages/Home.jsx), [`L01.jsx`](../app/src/pages/L01.jsx), [`index.css`](../app/src/index.css), [`components/ui`](../app/src/components/ui).

`Home` and `L01` are present in source but are not imported or routed by the current `App`. Their Tailwind/shadcn styling represents an alternate implementation, rather than the mounted dashboard's global CSS design.

| Component | Source-defined appearance |
| --- | --- |
| `Home` | Outer `p-8`; Card constrained to `max-w-sm`, title “Fundamentals”, CardContent containing the L01 link in a Button. Relies on the separate Card/Button utility system. |
| `L01` | Full-height `bg-blue-600` page, white text, `px-4 py-12`. Heading block max width `5xl`, centred, `text-4xl font-bold tracking-tight`; supporting text `blue-100`. Back link `text-sm text-blue-100` with underline-on-hover and `underline-offset-4`. |
| L01 lesson carousel | Container `max-w-2xl px-12`, centred. Carousel item `p-8`. Cards fill height, no border/ring, `bg-blue-500 text-white`, strong `shadow-2xl shadow-blue-950/60`. Card title `text-xl`; descriptions/footer `blue-100`; footer `text-sm`, transparent and borderless. Previous/next buttons are white with blue-700 icons, hover `blue-50`. |
| L01 local `Placeholder` | Centred flex panel, `h-40`, rounded-lg, `bg-blue-600/60`, `text-sm text-blue-100`. Used for two hash-function explanation cards. |

### UI primitives

The following styles are authored as Tailwind utilities and depend on the separate theme. They are not the active app's compiled appearance. Referenced packages including `cn`, `class-variance-authority`, `radix-ui`, `embla-carousel-react`, `motion` and `@fontsource-variable/geist` are not declared in `app/package.json`; connecting this path requires dependency/theme work as well as navigation.

| Source / export | Authored styling |
| --- | --- |
| [`ui/button.jsx`](../app/src/components/ui/button.jsx): `Button`, `buttonVariants` | Inline flex centred, rounded-lg, transparent border, text-sm/medium, nowrap, transition-all, no selection; active translates `1px` except popup triggers; SVG defaults `16px`. Focus ring-3 at 50% ring colour and ring border; disabled pointer events removed, opacity `0.5`; invalid destructive border/ring. Variants: default primary/foreground with 80% hover; outline border/background with muted hover/expanded; secondary fill with 5% foreground hover mix; ghost muted hover/expanded; destructive 10% fill, 20% hover and destructive focus; link primary text with hover underline. Sizes: default `32px`, xs `24px`, sm `28px`, lg `36px`; icon variants `24/28/32/36px`. `asChild` uses Radix Slot. |
| [`ui/card.jsx`](../app/src/components/ui/card.jsx): `Card` | Flex column, clipped overflow, rounded-xl, card background/foreground, text-sm, `1px` foreground/10 ring. `--card-spacing` is `16px` default or `12px` small, applied to padding/gaps. Removes top padding with leading image and bottom padding with footer. |
| `CardHeader` | Grid with `4px` gap, horizontal card spacing, automatic rows. Optional action adds second column; description enables two rows; bordered variant adds bottom spacing. |
| `CardTitle`, `CardDescription`, `CardAction` | Title heading font, `16px` medium/snug (`14px` in small card); description `14px` muted. Action sits at top-right, second column, spanning two rows. |
| `CardContent`, `CardFooter` | Content horizontal card spacing. Footer flex/centred, top border, muted/50 fill, rounded bottom corners and full card spacing. |
| [`ui/carousel.jsx`](../app/src/components/ui/carousel.jsx): `Carousel`, `useCarousel` | Relative region with carousel role description; shared hook has no rendered styling. Arrow keys move between slides. |
| `CarouselContent`, `CarouselItem` | Overflow-hidden viewport, flex track. Horizontal track has negative `16px` left margin; vertical track negative `16px` top margin and column layout. Each item no shrink/grow, minimum width `0`, full flex basis; `16px` padding on the corresponding leading edge. |
| `CarouselPrevious`, `CarouselNext` | Default outline icon-sm buttons, absolute circular controls, centred vertically, left/right offset `48px`. Vertical mode centres horizontally, offsets top/bottom `48px`, rotates `90deg`. Disabled follows scroll availability; screen-reader labels describe direction. |

The unimported `index.css` theme uses Geist Variable. Light surfaces are white OKLCH, foreground `oklch(.145 0 0)`, primary `.205` neutral, muted/secondary/accent `.97` neutral, border/input `.922` neutral; destructive `oklch(.577 .245 27.325)`. Dark mode reverses foreground/surface and uses 10% white borders/15% white inputs. Base radius `.625rem`; aliases multiply it by `.6/.8/1/1.4/1.8/2.2/2.6`. These are separate from the active blue HashLab tokens.

### Alternate L01 visual components

All nine visuals below are imported by the unmounted `L01` page. Their common authored look is white value tiles, blue-700 text, blue-700/40 empty slots over blue-500 lesson cards, blue-100 captions, monospace keys/formulas, rounded-md/lg/xl shapes and translucent blue-950 shadows. White buttons hover blue-50; dark blue buttons hover blue-800; emerald Play buttons hover emerald-600. Busy controls usually use disabled opacity `0.5`. `data-no-swipe` excludes embedded controls from carousel drag. Local flex wrapping/scrolling supports narrow screens. These Motion animations have no component-specific reduced-motion override.

| Component/source | Authored structure, states and movement |
| --- | --- |
| [`ArrayDragVisual`](../app/src/components/visuals/ArrayDragVisual.jsx) | Six flexible columns, max `64px`; square blue slots with white/15 crosshairs, inset `6px` white blocks, `18px` bold values, `12px` indices, `8px`/`12px` gaps at sm. Hover scale `1.05`; dragging scale `1.15`, z-index `20`, grab/grabbing cursor; elastic `.6`, snap-back spring `500/25`. Caption top margin `16px`. |
| [`ArrayInsertVisual`](../app/src/components/visuals/ArrayInsertVisual.jsx) | Seven `48px` capacity slots, `8px` gaps, `76px` high horizontal viewport. `16px` bold values, `12px` indices; insertion placeholder `2px` dashed white/70. Layout spring `380/30`; new blocks enter at y `-28px`, opacity `0`, scale `.6`. Caption text-sm/min height `40px`; controls wrap with `8px` gaps; busy/full insertion disabled. |
| [`ArraySearchDeleteVisual`](../app/src/components/visuals/ArraySearchDeleteVisual.jsx) | `116px` high scrolling viewport, `48px` blocks/`8px` gaps, pointer steps `56px`. Idle white/blue; checking amber-300/blue-900 scale `1.12`; visited white/35 with blue-100; found emerald-400/white scale `1.12`; deleting red-400/white scale `.92`. Delete bubble white, `12px` bold with triangular pointer. Removal scale `.4`, y `-16px`; spring `380/30`. Red Delete/blue Reset, polite captions. |
| [`HashingExampleVisual`](../app/src/components/visuals/HashingExampleVisual.jsx) | Wrapping pipeline of local `Step`, `Arrow`, `FnBox`, `Chip`; ten-column square table with `4px` gaps, target emerald ring-2. Key white/blue, hash amber/blue-900, index emerald/white. Key drops from y `-90px`, scale `.7`; spring `300/24`; caption crossfade `.2s`; Previous/Play/Step controls. `Arrow`: `36px` high, `18px` white/80. `Step`: `4px` gaps, `10px` uppercase label, `.35s` fade/y `6px`. `FnBox`: `36px`, `2px` border, rounded-lg, `12px` bold mono; active white/blue scale `1.1`, inactive blue-700/50 with white/50 border. `Chip`: `36px`, rounded-full, px-3, `12px` bold mono. |
| [`HashSearchVisual`](../app/src/components/visuals/HashSearchVisual.jsx) | Same local pipeline vocabulary. Inactive opacity `.2`, skipped `.4` with strikethrough, active scale `1.1`. Ten slots/five columns, `8px` gaps, `56px` high. Locked target amber ring-2; found emerald/white, ring-4 emerald-200/60, scale `1.1`; other cells opacity `.4`. Found badge white `20px` circle/emerald check. Values `11px` mono (`12px` sm), indices `10px`; spring `300/24`, caption crossfade `.2s`, busy controls disabled. |
| [`CollisionVisual`](../app/src/components/visuals/CollisonVisual.jsx) | Source filename is `CollisonVisual.jsx`. Ten columns include square arrival area/slot, `10px` index, chain area min height `56px`. Local `TwoLine` splits keys at underscores; `NewKey` amber-300/blue-900, `9px` bold/1.1, rounded/shadow/shared layout animation. Collision red ring-2/fill; next-free amber ring; success emerald. Existing key shakes x `[0,-4,4,-4,4,0]` over `.5s`. Mode buttons white selected/dark blue otherwise; emerald Play min width `112px`; spring `260/24`. |
| [`ChainingPointersVisual`](../app/src/components/visuals/ChainingPointersVisual.jsx) | Five scrolling bucket rows, `6px` gap, rounded-lg, ring-2, `6px/4px` padding. Indices `12px`, pointer `48×36px`, NULL `10px` mono, node pills `11px` bold mono with arrows/shadows. Empty-current amber, collision red, insertion emerald; new node amber, existing white. Entry x `-16px`, scale `.8`, spring `260/24`. Current key amber pill, text-xs summary, polite text-sm captions; emerald Play. |
| [`TerminologyVisual`](../app/src/components/visuals/TerminologyVisual.jsx) | Wrapping term selectors, white active/dark blue inactive. Panel top margin `16px`, min height `224px`, rounded-xl, blue-700/40, `16px` padding; title `16px` bold, explanation `14px`, diagram min height `112px`. Panel crossfade/y `±8px` over `.25s`. `Pop`: spring `300/24`, fade/y `8px`/scale `.85`; `Chip` `36px`, `12px` bold mono; `Arrow` `18px` white/80. Internal diagrams: key→hash→emerald index; collision into `56px` red bucket; linked nodes/arrows/NULL; five `48px` probing cells with red/emerald rings and amber hop; load grid of ten `24px` squares, eight white, amber resize badge. Play min width `96px`; optional auto advance `4500ms`. |
| [`TimeComplexityVisual`](../app/src/components/visuals/TimeComplexityVisual.jsx) | Eight scrolling bucket rows, `40×24px` pointer cells, `10px` indices/NULL, `11px` bold mono nodes. Idle white, visited white/35, checking amber, found emerald. Target row amber during search/emerald when done. Counter scale `1.5→1`, spring `260/24`, staggered node entry. Complexity table rounded-xl blue-700/40, three columns, `12px` text/`10px` uppercase headings, white/10 top border; active column white/15 and completed lookup emerald. Mode/Play buttons match CollisionVisual. |

## 10. Responsive behaviour

Breakpoints are inclusive `max-width` media queries, not JavaScript device categories. Later stylesheet definitions still participate in the cascade.

| Viewport | Existing behaviour |
| --- | --- |
| Above `1100px` | `258px` sidebar; `70px` header; `42px` horizontal page/header gutters; four stats; two dashboard columns and two generic lesson columns. |
| Up to `1150px` | Search lesson becomes one main column; its aside becomes two columns. |
| Up to `1100px` | Sidebar `230px`, main offset `230px`; page padding `27px 25px`, header gutters `25px`; dashboard column proportions `1.5fr/.8fr`; welcome art scales to `.85`. |
| Up to `820px` | Sidebar becomes off-canvas `270px`; main offset cleared; menu, close control and conditional scrim displayed. Header gutters `19px`, page padding `25px 19px`. Stats two columns. Dashboard and generic lesson layout one column. Secondary cards and generic lesson aside two columns. Welcome art shrinks/scales, brand bottom padding `30px`. |
| Up to `700px` | Search explorer input/step-panel grids become one column; search content padding `18px`, canvas/step panels `15px`; search aside one column; search heading `18px`; hash values `13px`, slot minimum height `61px`. |
| Up to `560px` | Header `60px` high with `14px` gutters; page `20px 14px`. Centred course label remains visible with wrapping `8px` text, `1.4` line height, `0.4px` tracking and `4px 6px` padding; its home icon is hidden. Topbar action gap `10px`. Welcome padding `22px`, title `27px`, copy `10px`, artwork hidden. Stats gap `9px`, values `20px`; dashboard gap `17px`; secondary/lesson aside one column. Continue footer stacks, action full width. Module row durations hidden. Page intro heading `28px`; module hero padding `20px`, title `25px`. Lesson actions wrap. |
| Up to `400px` | Search transport gap `6px`; playback pace control occupies a full row aligned right; practice slot choices change from five to three columns. |
| Reduced motion | Search module disables CSS transitions. Other shell transitions currently retain their normal duration. |

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
