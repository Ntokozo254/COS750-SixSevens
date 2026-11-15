# Practice Lab: coding path and instructional design

Implemented on 15 November 2026 on the `Practice-Lab` branch.

## Use the lab

Start the frontend and backend using the [local running guide](running-locally.md), sign in, then open **Practice lab** or `/practice`.

1. Choose an open problem on the learning map. Read its task, return-value contract, constraints, and example.
2. Write a JavaScript `solve(input)` function in the editor. Worked snippets, three progressively explicit hints, all official cases, and an optional reference solution are available.
3. Use **Run code** to try the editable JSON input. This is an experiment and does not award completion.
4. Use **Submit solution** to check every official case. Compare expected and actual output for a failing case, revise, and resubmit. Input-preservation requirements are checked too.
5. Passing all cases accepts that challenge. Both problems in a stage must be accepted before the next stage opens. Accepted problems remain available for review.
6. Use **Experiment sandbox** at any point to build a table, insert/search keys, inspect paths and probe counts, and connect the operation to a project code snippet.

The editor supports Ctrl/⌘ + Enter to run the input. Tab moves focus normally. Resetting the starter provides an undo action, and previously accepted code can be loaded separately from a current draft.

## Learning map

These are eight original HashLab problems using the problem/constraints/example/editor/run/submit coding-challenge format. The bank contains 42 inspectable cases.

| Stage | Problems | Progression and course connection |
| --- | --- | --- |
| 1 · Fundamentals | Find the home slot; calculate load factor | Beginner calculations establish modulo, zero-based indices, entries and capacity; modules 2 and 6 |
| 2 · Guided insertion | Insert one key; build a hash table | Guided loop scaffolds support collision handling, duplicate preservation, wrap-around, and full-table stopping; modules 3 and 4 |
| 3 · Searching | Find a key; count probes | Learners apply the same probe path, empty stopping rule, bounded full scans, and concrete operation counts; module 5 |
| 4 · Advanced | Resize and rehash; find the longest cyclic cluster | Learners combine earlier skills, recompute homes, preserve entries, and reason across the table boundary; module 6 |

All examples use integer keys or `null` slots and bounded table sizes. Official cases include key zero, exact remainders, collisions, duplicate requests, wrap-around, absent keys, empty/full tables, resizing, and cyclic clusters as appropriate to each problem. These coding tables do not contain deletion markers.

## Knowledge-base alignment

The supplied COS750 knowledge base identifies novice COS212 learners preparing for a lecture. Parts C and K recommend multimodal variety, adaptable environments, worked examples followed by guided application, immediate corrective feedback, self-explanation, and low-stakes retries. Examination section 2.1 requires content that assumes no prior knowledge of the chosen structure/algorithm and assessment that can trigger scaffolding.

ADDIE frames this contribution: analyse array/indexing prerequisites; design the staged outcomes and cases; develop reusable coding, grading, and sandbox components; implement them in the existing shell; evaluate with the technical checks below and later with novice students.

- **Reading and visual representation:** each problem has plain-language instructions, concrete input/output examples, code snippets, labelled cases, and a numbered learning map. The sandbox pairs a table with written paths and probe counts.
- **Active application:** learners write and execute real JavaScript, inspect errors, adjust input, and experiment with insertion/search. Starter scaffolding fades as the problems become more complex.
- **Guidance and confidence:** optional hints progress from a nudge to a partial approach and explicit reasoning. A failed submission reveals expected/actual values and relevant case explanations. The exercises are untimed and allow unlimited retries.
- **Reflection and transfer:** an optional explanation asks why the approach works and which edge case changed the learner's thinking. It remains during the challenge visit and is ungraded.
- **Accessibility and learner control:** labelled keyboard controls, native text editing, focus indicators, text alongside status colours, responsive layouts, existing reading/contrast preferences, and optional Read aloud support varied approaches without assigning fixed learning-style labels. The sandbox uses no autoplay.

Coding completion uses **all official cases passing**, rather than the lesson quizzes' 80% rule. This criterion checks the stated code contract. It is a design choice appropriate to these programming tasks, not an examination-mandated threshold or a claim of measured learning effectiveness. Learners can inspect references and use hints; stage acceptance is a practice checkpoint.

## Execution and saved progress

Code executes in a fresh module Web Worker for each case. The page thread does not execute submitted source. Each run has a 1.5-second time limit, a 20,000-character source limit, bounded JSON output, and cancellation/worker cleanup. Syntax errors, runtime errors, unsupported values, timeouts, and stopped runs receive feedback. Challenge runs check that the supplied input remains unchanged; array-editing solutions must work on a copy.

Only a complete successful **Submit solution** action can create a challenge receipt. Running examples, opening hints/references, finishing sandbox operations, stopped runs, incomplete results, and bare completion flags cannot unlock stages. Accepted receipts retain the code snapshot, current case contract, and successful outputs. Restoration rechecks saved outputs against the canonical case bank without executing saved source. A changed case contract invalidates its older receipt. Failed retries preserve an earlier accepted result.

Drafts and receipts are saved in browser-local storage under a learner-specific Practice Lab key. Course lesson completion, course assessment results, settings, and backend records are separate. If storage is blocked, the current practice session still works. Reflection text is not persisted across challenge visits.

## Technical verification and evaluation limits

All 149 frontend regression tests pass, including 50 Practice Lab tests for authored examples and reference solutions, shared-algorithm agreement, cyclic-cluster boundaries, stage gating, output grading, input preservation, storage recovery, worker isolation, timeout/cancellation, and stale-result handling. Changed JavaScript/JSX files pass ESLint and the production build succeeds, including its separate worker asset. Run all frontend checks from `app/`:

```bash
node --test src/logic/*.test.js src/features/*/*.test.js
npm run build
```

A temporary isolated JSDOM harness passed 16 integrated workflows using actual isolated worker threads adapted to the browser Worker message interface. It covered authenticated `/practice` entry, hints, syntax errors, custom input, failed/accepted submissions, all eight reference solutions, read-only input enforcement, cancellation, background-run cancellation, all stage gates, drafts, reset/undo, accepted-code reload, saved-result revalidation, the sandbox, blocked storage, and separation from lesson progress.

The browser preview host was unavailable. These DOM and worker checks establish behaviour but do not replace visual device/browser review or target-learner evaluation. Those evaluations should inform the group's final instructional-design and software-engineering reports.

## Sources and GenAI record

Sources: `COS750_Knowledge_Base.md`, particularly Parts C, F, G, and K, and `COS750_ExaminationSpecification_V1.md`, section 2.1. These documents provide design context; the user's request defines this implementation's scope.

OpenAI Codex, based on GPT-6, assisted with the code, original problem bank, worked snippets, and technical verification. The user's request was:

> go through the software and on the Practice Lab.
>
> This is a section in which we would be putting the users understanding at work.
>
> With that create a leetcode format style questions with the topic we are teaching. should be a map that takes the user from beginner to advanced in stages. this should be:
> Guided insertion exercises
> Instant feedback and hints
> Independent experimentation
>
> There should be some code snippet in which teaches the code through practical coding
