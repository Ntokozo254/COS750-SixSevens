# Instructional design for modules 2, 3, and 6

Prepared on 14 November 2026 for Hash Functions, Understanding Collisions, and Clustering and Load Factor.

## Learners and approach

The supplied COS750 knowledge base identifies novice COS212 students studying before a lecture. Part C recommends an adaptable environment and a variety of representations. Parts B and K support short explanations, worked examples, learner-controlled demonstrations, guided decisions, formative assessment, and corrective scaffolding.

These modules use multimodal learning. Visual slot diagrams connect calculations to storage positions. Written definitions and equations support careful reading. Editable examples and prediction tasks let learners act on the structure. The application's existing optional Read aloud controls provide spoken presentation when the browser supports it. Reading-size, contrast, and reduced-motion settings remain available. Learners can change activities and choose the representations they need.

ADDIE supplies the instructional-design frame. Analysis identifies the novice audience and prerequisite arithmetic. Design aligns each module's outcomes, examples, practice, and assessment. Development implements the content and controls. Implementation makes the modules available through the existing dashboard. Target-learner evaluation should inform later revisions and establish evidence of learning outcomes.

## Constructive alignment

| Module | Outcomes and examples | Guided application | Knowledge-check evidence |
| --- | --- | --- | --- |
| 2, Hash Functions | Calculate quotient, remainder, and home slot. Explain deterministic mapping and why a home slot can differ from a final storage position | Calculate a new key's home slot with progressively explicit arithmetic hints | Questions on modulo, index range, repeatable results, capacity, and the role of a home slot |
| 3, Understanding Collisions | Recognise distinct keys with equal hash results. Trace preservation of entries through chaining and linear probing | Identify a collision and predict how the selected resolution method stores a key | Questions distinguish collisions and duplicates, calculate home slots, follow resolution, and reason about changing capacity |
| 6, Clustering and Load Factor | Calculate α = n / m, identify wrapped occupied runs, measure concrete probe counts, and explain resizing with rehashing | Calculate occupancy and interpret cluster/probe examples | Questions assess ratios, clusters, the effect of distribution, bounded probing, and recomputation after resize |

The examples connect to student-record and course-portal lookups. Each module begins with observable outcomes and an optional prerequisite check. Its Understand activity explains the rule. Explore shows the rule operating on concrete data. Guided practice requests a decision and reveals additional help after difficulty. The knowledge check samples Explain and Apply outcomes.

## Feedback, motivation, and completion

Small achievable tasks, immediate explanations, learner-controlled pacing, and unlimited retries support the knowledge base's guidance on confidence and self-regulation. Hints become more explicit after difficulty. The shared assessment preserves the current checked answers/result, attempt count, personal best, reflection, and confidence while the learner visits review activities.

Each attempt contains five questions. The module's chosen mastery rule requires all five answers to be checked and at least four correct. Below 60%, the learner receives a complete refresher. Below 80%, missed concepts lead to targeted review. Retrying selects another authored question set. The finite bank eventually repeats.

Completion is supported by saved question IDs and checked answers. The progress layer grades that evidence against the module's canonical question bank whenever it is restored. Evidence from another module, incomplete or failing answers, and a bare completed-ID flag cannot complete these modules. Earlier manual completions of modules 2, 3, or 6 require a checked assessment once. Verified results and module 1 progress are retained. Module 4 now follows the same evidence rule; see the [Linear Probing update](linear-probing-knowledge-base-alignment.md).

The 60% and 80% thresholds are implementation choices adapted from Part K4. The examination requires assessment-triggered scaffolding and leaves the precise thresholds to the designers.

## Technical verification

The initial contribution passed 81 automated regression tests, covering the shared arithmetic, collision and probing operations, authored examples and assessment keys, settings, and progress evidence. The Linear Probing update extends this suite. Changed JavaScript/JSX files pass ESLint, and the production build succeeds. Run the repeatable checks from `app/` with `node --test src/logic/*.test.js src/features/*/*.test.js` and `npm run build`.

Before the Linear Probing update, temporary isolated JSDOM harnesses passed 44 interaction workflows across normal dashboard entry, editable demonstrations, guided practice, hints, failed/passing assessments, retained review state, preferences, progress migration/restoration, blocked storage, and existing search behaviour. The Linear Probing record reports the subsequent integrated checks and expanded completion rules. These checks exercise React DOM behaviour; they do not establish visual rendering quality across devices or learning effectiveness. Browser/device review and evaluation with target learners remain human validation tasks.

## Sources and GenAI record

The design uses `COS750_Knowledge_Base.md`, particularly Parts B, C, F, G, and K, and the prototype context in section 2.1 of `COS750_ExaminationSpecification_V1.md`.

OpenAI Codex, based on GPT-6, assisted with implementation, lesson text, examples, assessment items, and technical verification on 14 November 2026. The user's request was the following.

> study the code base and implement the following within the software:
>
> Hash Functions
> Understanding Collisions
> Clustering and Load Factor
>
> This should be a educational tool, so learn from the knowledge base on what is a suited learning style.

The implementation reuses the existing hashing, probing, slot visualisation, feedback, settings, and progress infrastructure. Mathematical examples and assessment keys are checked against the executable operations. This module contribution can support the group's separate final SE and ID documents, including their human review and learner-evaluation records.
