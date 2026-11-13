# Search lesson knowledge-base alignment

Reviewed on 13 November 2026 for module 5, Searching in Hash Tables, on `searching-feature`.

This audit uses the supplied `COS750_Knowledge_Base.md`, especially Parts F and K, and section 2.1 of `COS750_ExaminationSpecification_V1.md`. The examination establishes a novice, pre-lecture audience and assessment that provides additional scaffolding. The knowledge base supplies a suggested teaching sequence and examples of assessment thresholds. The module adopts 80% as its mastery target and 60% as the boundary for a complete refresher.

## Coverage found in the implementation

| Course context | Current implementation evidence | Coverage |
| --- | --- | --- |
| K1, novice explanations | Understand introduces array slots, keys, zero-based indexing, modulo, collisions, and linear probing | Present |
| K3, demonstration before practice | Worked searches show a found key and an absent key. The trace offers collision, wrap-around, deleted-slot, full-table, and empty-table examples | Present |
| K2 and K6, nearby visual and verbal representations | The reused slot table, captions, inspection count, and highlighted pseudocode describe the same recorded step | Present |
| K3 and K5, learner control | Previous, next, replay, play/pause, adjustable pace, key input, and activity navigation support self-paced work | Present |
| K2, K3, and F4, guided practice and corrective feedback | Learners choose the next inspected slot. Errors reveal a calculation or next-slot hint, followed by the indicated slot after further difficulty. Each new decision begins with less support | Present |
| F3–F5 and K4, focused formative assessment | Each five-question attempt covers probe order, empty-slot stopping, deleted markers, full-table termination, and cost. Questions elicit Explain and Apply evidence | Present |
| F4 and K4, respond to identified gaps | Each checked answer receives an explanation. Incorrect answers receive concept guidance. Scores below 60% add a complete worked refresher, while missed concepts lead to relevant review activities | Present |
| K4 and K5, low-stakes practice | Assessment is untimed with unlimited retries. Three authored question sets rotate across attempts | Present |
| K6 and K8, accessible interaction | Buttons support keyboard operation, focus is visible, slot states have an accessible text representation, and feedback uses status announcements | Present, with evaluation still needed |
| K3, authentic opening and explicit outcomes | Understand opens with a student-record lookup scenario and four observable outcomes | Present |
| K1 and K3, prerequisite activation | Two optional warm-up checks cover modulo and wrap-around with progressively explicit corrective hints | Present |
| F5 and K3, reflection and personal progress | Optional reflection and confidence prompts are available to every learner. Assessment state and personal scores survive review navigation | Present |
| F5, K4, and K5, mastery-based recognition | Completion requires all five checked answers and a regraded score of at least 80%. Legacy completion flags alone are removed | Present |

## Assessment and completion evidence

The original progress format stores only completed numeric module IDs. An earlier manually completed module 5 can therefore appear complete before the new quiz has been checked. That format contains no saved question-and-answer evidence from which to establish mastery.

The corrective design uses one authoritative `hashlab-progress-v2` record containing `version`, `completed`, and `searchAssessment`. A passing record supplies the exact five question IDs from one authored set and all five checked answers. The application grades those answers against its canonical questions when receiving and restoring the record. Stored score or pass claims alone do not establish completion.

The migration preserves other recognised module IDs and requires a new quiz attempt for legacy module 5 completion lacking that evidence. The versioned record saves completion and its supporting answers together. A compatibility copy of the completed-ID array follows a successful versioned save. Regression checks verify that a selected but unchecked fifth answer leaves the module pending, 60% leaves it pending, and a checked score of at least 80% creates evidence that survives reloads. Invalid stored evidence removes module 5 completion while retaining other module IDs. A later failed retry preserves earlier verified mastery.

Technical verification passed the production build, lint for the changed files, 33 unit regression tests, 12 completion/remediation interaction workflows, 21 dashboard-to-lesson workflows, and 8 startup recovery cases. Eight selected instructional foreground/background pairs measured at least 5.17:1 contrast, exceeding the 4.5:1 normal-text target. These checks provide technical evidence alongside the learner evaluation still required below.

## Remaining limits and group evaluation

The finite question bank repeats after three attempts. The current scope provides local formative practice and module completion. Longitudinal misconception analytics, lecturer reporting, and a matched pre/post learning-effectiveness study remain group evaluation work.

Semantic controls and responsive styles provide an implementation basis for accessibility. Muted instructional text has been darkened, and selected foreground/background pairs receive computed contrast checks. Keyboard-only, screen-reader, and target-device evaluation should record observed results. Learning gains and accessibility conformance require that evidence.

The group still needs its separate SE and ID examination documents. Those documents should incorporate the selected instructional-design model, outcome-to-assessment mapping, learning-theory rationale, source references, and the GenAI tool and prompt record requested by Part K9 and the examination specification. This audit supplies traceable implementation evidence for that work.

## Source files

- [Lesson and activity navigation](../app/src/features/search/SearchLesson.jsx)
- [Trace and accessible slot table](../app/src/features/search/SearchExplorer.jsx)
- [Guided practice](../app/src/features/search/SearchPractice.jsx)
- [Formative assessment and scaffolding](../app/src/features/search/SearchAssessment.jsx)
- [Question sets and marking](../app/src/features/search/searchQuestions.js)
- [Prerequisite warm-up](../app/src/features/search/SearchWarmup.jsx)
- [Assessment evidence validation](../app/src/features/search/searchMastery.js)
- [Progress migration and restoration](../app/src/logic/progress.js)
- [Application progress](../app/src/hooks/useProgress.js)
