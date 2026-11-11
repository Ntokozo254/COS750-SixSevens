# HashLab – COS212 React starter

A responsive React + Vite front-end starter for the COS212 hashing tutor application.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Included

- Responsive application shell and blue visual identity
- Dashboard with progress overview
- Six learning-objective module cards
- Reusable module detail screen with lesson-content placeholders
- Placeholder pages for visualiser, practice lab, assessment and settings
- Browser-local React state for marking modules complete during the current session
- Search/filter for learning modules

## Suggested next implementation steps

1. Connect persistent progress with `localStorage`.
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

The learning content is intentionally represented by placeholders. The interface is ready for your group to connect its hashing logic and instructional content.
