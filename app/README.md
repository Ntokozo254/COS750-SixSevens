# HashLab – COS212 hashing tutor

A responsive React + Vite application for learning hash tables before a COS212 lecture.

## Requirements

- Node.js 20.19+ (20.x) or 22.12+, matching Vite's supported versions
- npm

## Run locally

To sign in and use the software with its backend, follow the [two-terminal running guide](../docs/running-locally.md). Start the backend on port 3000, then run the frontend below.

```bash
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open [http://localhost:5173/](http://localhost:5173/) to match the configured backend CORS origin.

## Included

- [Student profile and settings](../docs/settings.md): browser-saved profile, reading/display preferences, read-aloud controls, and study preferences with the official VARK questionnaire link.

- Responsive application shell and blue visual identity
- Dashboard with progress overview
- Six learning-objective module cards
- Six module detail screens, including interactive lessons for hash functions, collisions, linear probing, searching, and clustering/load factor
- Standalone visualiser, practice lab, and assessment pages reserved for the group's remaining integration work; lesson practice and assessments are available inside the modules
- Browser-local progress saved with `localStorage`, with session progress available when storage is blocked
- Search/filter for learning modules

## Searching in Hash Tables

Open **Learning modules → Searching in Hash Tables**. The module is also available from its dashboard card and My progress entry.

Module 5 uses the existing application shell and module metadata. Its Understand, Trace a search, Guided practice, and Knowledge check sections cover the home slot, linear probing, collisions, wrap-around, found and absent keys, and search stopping conditions. The interactive trace and guided practice connect each inspected slot with the algorithm's next action.

The LO5 knowledge check provides explanations, targeted support, and fresh retry sets. Review navigation retains the current assessment, attempt count, and personal best score for the visit. Optional prerequisite checks, a student-record scenario, explicit outcomes, and reflection support the knowledge-base learning sequence. All five answers must be checked, with a score of at least 80%, before module 5 is marked complete. The application saves the checked question IDs and answers in a versioned progress record and regrades them when progress is restored. Earlier module 5 completion without this evidence requires one checked passing attempt. Lessons run in the browser after signing in; authentication uses the existing backend.

## Hash Functions, Understanding Collisions, and Clustering and Load Factor

Modules 2, 3, and 6 follow **Understand → Explore an example → Guided practice → Knowledge check**. They combine written explanations, visual tables, editable worked examples, prediction tasks, immediate feedback, and progressively explicit hints. Existing optional Read aloud and accessibility settings remain available. This multimodal approach follows the supplied knowledge base without assigning learners a fixed learning-style label.

- **Hash Functions:** calculate the quotient, remainder, and home slot for editable keys and capacities; distinguish a home slot from the final storage position.
- **Understanding Collisions:** compare linear probing and separate chaining, step through collisions and wrap-around, and distinguish a duplicate key from a collision.
- **Clustering and Load Factor:** calculate α = n / m, compare equally full tables with different probe costs, explore empty/full tables, and resize with rehashing.

Each module has two five-question assessment sets. Completion requires all five answers to be checked and at least four correct. Lower scores trigger a full refresher or targeted review. Review navigation retains the attempt, reflection, and confidence choice during the module visit. Saved evidence is independently regraded for each module when progress loads. Earlier completion flags without evidence for modules 2, 3, 4, and 6 require one checked passing assessment; verified results and existing module 1 progress are retained.

See the [instructional-design record](../docs/foundational-modules-instructional-design.md) for outcomes, knowledge-base alignment, assessment rules, and the GenAI record.

## Linear Probing

Module 4 uses the same light-card lesson frame and four activities as the other interactive modules. The insertion trace includes collisions, wrap-around, a full table, and a duplicate request, with highlighted pseudocode, probe counts, manual stepping, replay, and optional playback. Reduced motion uses manual advancement. Guided practice provides progressive hints and worked placements. A checked five-question assessment, targeted remediation, retained review state, and reflection complete the learning flow. See the [Linear Probing alignment record](../docs/linear-probing-knowledge-base-alignment.md) for the knowledge-base mapping and completion migration.

Run the regression checks from `app/`.

```bash
node --test src/logic/*.test.js src/features/*/*.test.js
npm run build
```

## Suggested next implementation steps

1. Connect browser-local progress to the group's backend when shared progress is needed.
2. Connect the standalone visualiser, practice lab, and assessment pages to the lesson activities.
3. Evaluate the learning flows with novice COS212 students and revise the examples using their feedback.

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

The module lessons are organised under `src/features/`; `src/features/learning/` contains the shared lesson frame, checked assessment, and completion-evidence validation. Settings and module 1's introductory carousel retain the group's existing implementations.

The [knowledge-base alignment audit](../docs/search-knowledge-base-alignment.md) maps module 5 to the supplied course context and records its coverage and evaluation limits.
