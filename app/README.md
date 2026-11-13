# HashLab – COS212 React starter

A responsive React + Vite front-end starter for the COS212 hashing tutor application.

## Requirements

- Node.js 20.19+ (20.x) or 22.12+, matching Vite's supported versions
- npm

## Run locally

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Included

- Responsive application shell and blue visual identity
- Dashboard with progress overview
- Six learning-objective module cards
- Reusable module detail screen, with an implemented Searching in Hash Tables lesson and placeholders for the other modules
- Placeholder pages for visualiser, practice lab, assessment and settings
- Browser-local progress saved with `localStorage`, with session progress available when storage is blocked
- Search/filter for learning modules

## Searching in Hash Tables

On the `searching-feature` branch, open **Dashboard → Learning modules → Searching in Hash Tables**. The module is also available from its dashboard card and My progress entry.

Module 5 uses the existing application shell and module metadata. Its Understand, Trace a search, Guided practice, and Knowledge check sections cover the home slot, linear probing, collisions, wrap-around, found and absent keys, and search stopping conditions. The interactive trace and guided practice connect each inspected slot with the algorithm's next action.

The LO5 knowledge check provides explanations, targeted support, and fresh retry sets. Review navigation retains the current assessment and personal score history. Optional prerequisite checks, a student-record scenario, explicit outcomes, and reflection support the knowledge-base learning sequence. All five answers must be checked, with a score of at least 80%, before module 5 is marked complete. The application saves the checked question IDs and answers in a versioned progress record and regrades them when progress is restored. Earlier module 5 completion without this evidence requires one quiz attempt. Other recognised module completions are preserved. The lesson runs in the browser, and the backend is optional for this frontend workflow.

Run the search checks from `app/`.

```bash
node --test src/logic/*.test.js src/features/search/*.test.js
npm run build
```

## Suggested next implementation steps

1. Connect browser-local progress to the group's backend when shared progress is needed.
2. Build the hash-function lesson for LO2.
3. Implement a reusable hash-table visualisation component.
4. Add the six-key linear-probing worked example as step data.
5. Build guided practice and misconception-based assessment feedback.
6. Add text-to-speech and accessibility preferences.

## Project structure

```text
hashlab-react-starter/
├── index.html
├── package.json
└── src/
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```

Module 5 contains the implemented search lesson. Other module detail screens and the standalone visualiser, practice lab, assessment, and settings pages retain their existing placeholders for the group's remaining contributions.

The [knowledge-base alignment audit](../docs/search-knowledge-base-alignment.md) maps module 5 to the supplied course context and records its coverage and evaluation limits.
