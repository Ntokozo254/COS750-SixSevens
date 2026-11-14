# API Documentation



## Modules

The backend uses the same 6 modules as the front end (`app/src/data/modules.js`):

| Front-end id | Title | Backend name |
| --- | --- | --- |
| 1 | Introduction to Hashing | `intro` |
| 2 | Hash Functions | `hash-functions` |
| 3 | Understanding Collisions | `collisions` |
| 4 | Linear Probing | `linear-probing` |
| 5 | Searching in Hash Tables | `searching` |
| 6 | Clustering and Load Factor | `clustering` |

## Health

### GET /api/health
Returns `{ "ok": true }` when the server is running.

## Students and progress

### POST /api/students/signin
Signs a student in, creating them the first time.

Body:
- `studentNumber` (required): `u` + 8 digits, e.g. `"u21234567"` (the `u` is optional)
- `name` (optional)

Returns the student: `{ id, studentNumber, name, createdAt }`.
Keep `id`; the other endpoints need it.

### GET /api/students/:id/progress
Returns one entry for each of the 6 modules, in order:
```json
[{ "module": "intro", "completed": false, "score": null }, ...]
```

### POST /api/students/:id/progress
Saves progress for one module.

Body:
- `module` (required): a backend name from the table above
- `completed` (optional, default `true`)
- `score` (optional, a whole number)

Returns the saved row.

## Quiz

### GET /api/quiz/questions?module=linear-probing
Returns the questions, filtered by `module` if given. Answers and
explanations are removed so the student can't see them before answering:
```json
[{ "id": "q-linear-probing-1", "module": "linear-probing", "objective": "LO4",
   "prompt": "What does linear probing do when a home slot is occupied?",
   "options": [{ "id": "a", "text": "Checks the next slot" }, ...] }]
```

### POST /api/quiz/answer
Checks one answer and saves the attempt.

Body:
- `questionId` (required), e.g. `"q-searching-1"`
- `optionId` (required): the option's `id`, e.g. `"a"`
- `studentId` (optional): if given, the attempt is saved to the database

Returns:
```json
{ "correct": false, "misconception": "stopAtOccupied",
  "explanation": "If the search reaches an empty slot, ..." }
```
`misconception` is `null` when the answer is right. The front end can use it to
choose which hint or easier example to show, then show `explanation`.

## Hash table (no database)

The server keeps no table. The client sends the current table and gets the new
one back. A table is `{ size, slots }`; each slot is `null` (empty),
`{ "tombstone": true }` (deleted) or `{ "key": 23, "value": null }`.
Keys are whole numbers from 0 to 1,000,000; size is 1 to 50 (default 10).

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| POST | /api/table/insert | `{ keys, size?, table? }` | `{ table, results }`, one result per key, each with `steps` |
| POST | /api/table/search | `{ table, key }` | `{ found, slot, value, checks, steps }` |
| POST | /api/table/update | `{ table, key, value }` | `{ ok, table, slot, steps }` |
| POST | /api/table/delete | `{ table, key }` | `{ ok, table, slot, steps }` |

### Steps (for the visualiser)
Each step has a `type` and a `text` caption; most also have `slot`.

| type | meaning |
| --- | --- |
| hash | home slot calculated, e.g. "23 mod 10 = 3" |
| occupied | slot holds a different key, move on |
| tombstone | slot held a deleted key, move on |
| wrap | reached the end, continue from slot 0 |
| empty | slot is empty |
| found / not_found | search result |
| placed / duplicate / full | insert result |
| updated | value changed |
| deleted | slot marked as a tombstone |

## Sign-in
Sign-in is by student number only, which is fine for the prototype. Whoever
builds the login page should store the returned `id` (e.g. in localStorage) and
send it with progress and quiz requests. Real passwords or tokens are not
implemented.