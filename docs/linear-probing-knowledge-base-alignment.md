# Linear Probing: knowledge-base alignment

Updated on 14 November 2026 for module 4, learning objective LO4.

## Learners, learning approach, and visual design

The COS750 knowledge base describes novice COS212 students preparing for a lecture. The examination specification, section 2.1, requires an introduction that assumes no knowledge of the chosen structure/algorithm and assessment that can trigger additional scaffolding.

The module follows the application's existing **Understand → Explore an example → Guided practice → Knowledge check** frame. White lesson cards, navy text, pale blue examples, shared blue buttons, labelled slot diagrams, and responsive controls replace its previous dark-card presentation. Activity navigation remains available throughout. Answers and practice/trace state remain mounted during review.

Part C supports multimodal variety and adaptable environments. This module combines reading and equations, visual slot states and pseudocode, hands-on placement, and optional self-explanation/reflection. Existing Read aloud and reading/contrast settings remain available. A study preference can choose an entry activity without restricting access to the others. Reduced-motion preferences use manual trace advancement. No fixed learning-style classification is required.

## Instructional design

ADDIE supplies the design frame: analyse novice prerequisites; design outcomes and assessment together; develop and integrate the lesson; implement it in the existing app; evaluate its usability and learning effect with target students. The technical checks below support implementation verification. They do not replace the final learner-evaluation stage.

| Knowledge-base guidance | Implementation |
| --- | --- |
| K3: authentic problem, outcomes, activation | A student-record collision scenario, four observable outcomes, and an optional predict-where-22-goes check with progressively explicit reminders |
| K2/K3: demonstration, dual coding, manageable steps | Learner-controlled insertion traces pair the table, probe counts, explanations, and highlighted pseudocode; examples cover collisions, wrap-around, full capacity, and a repeated key |
| K2/K3: guided application and coping examples | Six placements use the real insertion logic. Incorrect choices trigger a nudge, a partial path, then a worked placement. The lesson explains why overwriting an occupied home slot loses a record |
| F/K4: elicit, interpret, respond | Two authored five-question sets sample home slots, collision handling, probe counts, wrap-around, and full-table stopping; checked answers receive explanations and misconception-specific support |
| K4: criterion-based mastery and remediation | All five answers must be checked; at least four correct completes the module. Below 60% gives a complete refresher; 60–79% gives targeted review. Retrying rotates the authored sets |
| K3/K5: reflection, confidence, learner control | An optional written explanation and confidence choice, an untimed assessment, unlimited retries, current attempt count and personal best, and preserved state while reviewing |

The 60% and 80% thresholds are implementation choices adapted from the examples in K4. The examination requires assessment-triggered scaffolding, rather than prescribing those exact values.

## Algorithm and progress guarantees

- The trace and placement checks reuse the shared linear-probing insertion engine.
- A different occupied key preserves the existing entry and continues probing. Finding the same key reports a duplicate.
- An empty slot found on the mth inspection still permits insertion. Full means all m inspected slots were occupied by other keys; the scan terminates.
- The worked trace creates the same table searched in module 5. Module 6 extends the discussion to clustering and resizing with rehashing.
- Watching a trace, finishing guided practice, choosing an unchecked answer, or supplying a bare completion flag cannot complete module 4.
- Saved question IDs and checked answers are regraded against the canonical module 4 question bank when progress loads. Evidence from another module is rejected. Verified completion is retained after a later unsuccessful retry.
- Earlier module 4 completion records contain no checked-answer evidence and require one passing knowledge check to restore completion. Validated completion for the other assessed modules is retained.

## Verification and remaining evaluation

The frontend regression suite contains 86 passing tests, including duplicate versus full outcomes, insertion on the final inspection, authored worked examples, assessment keys, and independent saved-evidence validation. Changed JavaScript/JSX files pass ESLint and the production build succeeds.

A temporary isolated JSDOM harness passed 13 integrated workflows: authenticated dashboard entry; warmup feedback; all four trace examples; keyboard/manual stepping and pseudocode highlighting; playback and cancellation during review; six guided placements with tiered hints; full and targeted assessment remediation; retained answers/reflection/practice state; checked 80% completion; reload and failed-retry retention; rejection of a fabricated passing claim; reading/contrast/study/reduced-motion preferences; and independent preservation of the other modules' verified results.

The available browser preview host could not open the local application. DOM interaction checks verify behaviour but cannot establish final visual rendering across devices. Target-student evaluation and device/browser visual review remain to be completed.

## Sources and GenAI record

Sources: `COS750_Knowledge_Base.md`, particularly Parts C, F, G, and K; `COS750_ExaminationSpecification_V1.md`, section 2.1. These supplied documents provide design context; the user's request defines the implementation scope.

OpenAI Codex, based on GPT-6, assisted with content, implementation, and technical verification. The user's request was:

> modify the
>
> # Linear Probing. to match the style of software, and make sure it also follows the knowledge base.

The shared application frame, hashing/probing logic, feedback, preferences, and checked-assessment infrastructure are reused. This contribution supports the group's separate SE and ID documentation.
