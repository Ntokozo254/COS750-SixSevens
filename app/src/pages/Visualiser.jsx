import { useEffect, useId, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Dices,
  History,
  Lightbulb,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2
} from "lucide-react";
import {
  MAX_KEY,
  PSEUDOCODE,
  TABLE_SIZES,
  checkKey,
  countDeleted,
  countKeys,
  deleteTrace,
  emptyTable,
  insertTrace,
  isDeleted,
  isEmpty,
  loadFactor,
  searchTrace,
  summarise
} from "../features/visualiser/visualiserLogic";
import "../features/visualiser/visualiser.css";

const SPEEDS = [
  { id: "slow", label: "Slow", ms: 1800 },
  { id: "normal", label: "Normal", ms: 1100 },
  { id: "fast", label: "Fast", ms: 550 }
];

const OPERATIONS = {
  insert: { label: "Insert", icon: Plus, run: insertTrace },
  search: { label: "Search", icon: Search, run: searchTrace },
  delete: { label: "Delete", icon: Trash2, run: deleteTrace }
};

const EXAMPLE_KEYS = [23, 43, 13, 27, 37, 9];

// How the slot being looked at should look for each kind of frame.
const CURRENT_STATE = {
  hash: "home",
  wrap: "home",
  collision: "collision",
  deleted: "passed",
  insert: "done",
  found: "done",
  tombstone: "done",
  duplicate: "done",
  empty: "stop"
};

function slotText(slot) {
  if (isEmpty(slot)) return "";
  if (isDeleted(slot)) return "Deleted";
  return String(slot);
}

export default function Visualiser() {
  const id = useId();
  const [size, setSize] = useState(10);
  const [slots, setSlots] = useState(() => emptyTable(10));
  const [keyInput, setKeyInput] = useState("23");
  const [error, setError] = useState("");
  const [trace, setTrace] = useState(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState("normal");
  const [history, setHistory] = useState([]);

  const frames = trace?.frames ?? [];
  const frame = frames[frameIndex] ?? null;
  const atEnd = frames.length > 0 && frameIndex === frames.length - 1;
  const delay = SPEEDS.find((item) => item.id === speed).ms;
  // While an operation is playing, show the table as it was at that step.
  const shown = frame ? frame.slots : slots;

  // Auto-advance while playing. The state change happens in the timer callback.
  useEffect(() => {
    if (!playing || !trace) return undefined;
    const timer = setTimeout(() => {
      const next = Math.min(frameIndex + 1, trace.frames.length - 1);
      setFrameIndex(next);
      if (next === trace.frames.length - 1) setPlaying(false);
    }, delay);
    return () => clearTimeout(timer);
  }, [playing, trace, frameIndex, delay]);

  function run(op) {
    const problem = checkKey(keyInput);
    if (problem) {
      setError(problem);
      return;
    }
    const key = Number(keyInput.trim());
    const result = OPERATIONS[op].run(slots, key);
    setError("");
    setSlots(result.slots);
    setTrace(result);
    setFrameIndex(0);
    setPlaying(true);
    setHistory((items) => [{ id: Date.now() + Math.random(), op, text: summarise(result) }, ...items].slice(0, 8));
  }

  function clearAnimation() {
    setTrace(null);
    setFrameIndex(0);
    setPlaying(false);
  }

  function changeSize(next) {
    setSize(next);
    setSlots(emptyTable(next));
    clearAnimation();
    setHistory([]);
  }

  function reset() {
    setSlots(emptyTable(size));
    clearAnimation();
    setHistory([]);
  }

  function loadExample() {
    const filled = EXAMPLE_KEYS.reduce((current, key) => insertTrace(current, key).slots, emptyTable(size));
    setSlots(filled);
    clearAnimation();
    setHistory([{ id: Date.now(), op: "example", text: `Loaded example keys ${EXAMPLE_KEYS.join(", ")}` }]);
  }

  function randomKey() {
    const used = new Set(slots.filter((slot) => typeof slot === "number"));
    let key;
    do key = Math.floor(Math.random() * 100);
    while (used.has(key) && used.size < 100);
    setKeyInput(String(key));
    setError("");
  }

  function step(delta) {
    setPlaying(false);
    setFrameIndex((index) => Math.max(0, Math.min(frames.length - 1, index + delta)));
  }

  function togglePlay() {
    if (atEnd) setFrameIndex(0);
    setPlaying((value) => !value);
  }

  function onTableKeyDown(event) {
    if (!trace) return;
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  }

  function slotState(index) {
    if (!frame) return "";
    if (index === frame.index) return CURRENT_STATE[frame.type] ?? "home";
    if (frame.checked.includes(index)) return "checked";
    return "";
  }

  const stored = countKeys(slots);
  const deleted = countDeleted(slots);
  const alpha = loadFactor(slots);
  const busy = alpha > 0.7;

  return (
    <div className="content-wrap viz-page">
      <div className="page-intro">
        <div className="eyebrow">INTERACTIVE EXPLORATION</div>
        <h1>See hashing in action<span>.</span></h1>
        <p>
          Build your own hash table. Insert, search for and delete keys, then step through every
          slot that linear probing checks.
        </p>
      </div>

      <div className="viz-layout">
        <section className="viz-card" aria-labelledby={`${id}-title`}>
          <div className="viz-card-header">
            <div>
              <div className="eyebrow">YOUR HASH TABLE</div>
              <h2 id={`${id}-title`}>h(key) = key mod {size}</h2>
            </div>
            <label className="viz-size">
              <span>Table size m</span>
              <select value={size} onChange={(event) => changeSize(Number(event.target.value))}>
                {TABLE_SIZES.map((m) => (
                  <option key={m} value={m}>
                    {m} slots
                  </option>
                ))}
              </select>
            </label>
          </div>

          <form
            className="viz-controls"
            onSubmit={(event) => {
              event.preventDefault();
              run("insert");
            }}
          >
            <label className="viz-key" htmlFor={`${id}-key`}>
              <span>Key (0 to {MAX_KEY})</span>
              <div className="viz-key-row">
                <input
                  id={`${id}-key`}
                  inputMode="numeric"
                  value={keyInput}
                  onChange={(event) => {
                    setKeyInput(event.target.value);
                    setError("");
                  }}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${id}-error` : undefined}
                />
                <button type="button" className="secondary-button" onClick={randomKey} title="Pick a random key">
                  <Dices size={15} aria-hidden="true" />
                  <span className="viz-hide-sm">Random</span>
                </button>
              </div>
            </label>
            <div className="viz-ops" role="group" aria-label="Operation">
              {Object.entries(OPERATIONS).map(([op, { label, icon: Icon }]) => (
                <button
                  key={op}
                  type={op === "insert" ? "submit" : "button"}
                  className={op === "insert" ? "primary-button" : "secondary-button"}
                  onClick={op === "insert" ? undefined : () => run(op)}
                >
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </form>
          {error && (
            <p className="viz-error" id={`${id}-error`} role="alert">
              {error}
            </p>
          )}

          <div
            className="viz-table"
            style={{ "--viz-columns": Math.min(size, 7) }}
            tabIndex={trace ? 0 : -1}
            onKeyDown={onTableKeyDown}
            aria-label={trace ? "Hash table. Use the left and right arrow keys to step." : "Hash table"}
          >
            {shown.map((slot, index) => {
              const state = slotState(index);
              return (
                <div
                  key={index}
                  className={`viz-slot${state ? ` viz-slot--${state}` : ""}${isDeleted(slot) ? " viz-slot--tombstone" : ""}`}
                  aria-label={`Slot ${index}, ${isEmpty(slot) ? "empty" : isDeleted(slot) ? "deleted" : `key ${slot}`}`}
                >
                  <span className="viz-slot-index">{index}</span>
                  <strong className="viz-slot-value">{slotText(slot)}</strong>
                  {frame && index === frame.index && frame.type === "hash" && (
                    <span className="viz-slot-tag">home</span>
                  )}
                </div>
              );
            })}
          </div>

          <ul className="viz-legend" aria-label="Colour key">
            <li><i className="viz-swatch viz-swatch--home" /> Slot being checked</li>
            <li><i className="viz-swatch viz-swatch--collision" /> Collision</li>
            <li><i className="viz-swatch viz-swatch--done" /> Stored / found</li>
            <li><i className="viz-swatch viz-swatch--stop" /> Empty: search stops</li>
            <li><i className="viz-swatch viz-swatch--tombstone" /> Deleted</li>
          </ul>

          <div className="viz-step">
            <div className="viz-step-copy" aria-live="polite" aria-atomic="true">
              <h3>{frame ? frame.title : "Choose a key and an operation"}</h3>
              <p>
                {frame
                  ? frame.message
                  : "Type a key and press Insert, Search or Delete. Each slot the algorithm checks is shown one step at a time."}
              </p>
            </div>
            <ol className="viz-code" aria-label="Pseudocode with the current line highlighted">
              {PSEUDOCODE[trace?.op ?? "insert"].map((line) => (
                <li key={line.id} aria-current={frame?.line === line.id ? "step" : undefined}>
                  <code>{line.text}</code>
                </li>
              ))}
            </ol>
          </div>

          <div className="viz-transport">
            <div className="viz-transport-buttons">
              <button type="button" className="secondary-button" aria-label="Restart" disabled={!trace} onClick={() => { setPlaying(false); setFrameIndex(0); }}>
                <RotateCcw size={15} />
              </button>
              <button type="button" className="secondary-button" aria-label="Previous step" disabled={!trace || frameIndex === 0} onClick={() => step(-1)}>
                <ChevronLeft size={16} />
              </button>
              <button type="button" className="primary-button viz-play" disabled={!trace} onClick={togglePlay}>
                {playing ? <Pause size={15} /> : <Play size={15} />}
                {playing ? "Pause" : atEnd ? "Replay" : "Play"}
              </button>
              <button type="button" className="secondary-button" aria-label="Next step" disabled={!trace || atEnd} onClick={() => step(1)}>
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="viz-speed" role="group" aria-label="Playback speed">
              {SPEEDS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="secondary-button"
                  aria-pressed={item.id === speed}
                  onClick={() => setSpeed(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <p className="viz-progress">
            {trace ? `Step ${frameIndex + 1} of ${frames.length} · ${frame.checked.length} slot${frame.checked.length === 1 ? "" : "s"} checked` : "No operation yet"}
          </p>
        </section>

        <aside className="viz-aside">
          <div className="side-card">
            <div className="side-card-heading">TABLE AT A GLANCE</div>
            <div className="viz-stats">
              <div><strong>{stored}</strong><span>keys stored</span></div>
              <div><strong>{size}</strong><span>slots (m)</span></div>
              <div><strong>{deleted}</strong><span>deleted</span></div>
            </div>
            <div className="viz-load">
              <div className="viz-load-label">
                <span>Load factor α = n / m</span>
                <strong>{alpha.toFixed(2)}</strong>
              </div>
              <div className={`viz-load-bar${busy ? " viz-load-bar--busy" : ""}`} aria-hidden="true">
                <span style={{ width: `${Math.min(alpha, 1) * 100}%` }} />
              </div>
              <p>
                {busy
                  ? "The table is getting full. Collisions and long probe runs become much more likely."
                  : "Plenty of space. Most keys land in or near their home slot."}
              </p>
            </div>
            <div className="viz-table-actions">
              <button type="button" className="secondary-button" onClick={loadExample}>
               Example keys
              </button>
              <button type="button" className="secondary-button" onClick={reset} disabled={stored === 0 && deleted === 0}>
                <RotateCcw size={14} /> Empty table
              </button>
            </div>
          </div>

          <div className="side-card">
            <div className="side-card-heading">
              <History size={14} /> RECENT OPERATIONS
            </div>
            {history.length ? (
              <ol className="viz-history">
                {history.map((item) => (
                  <li key={item.id} className={`viz-history--${item.op}`}>
                    {item.text}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="viz-empty-note">Your inserts, searches and deletes will appear here.</p>
            )}
          </div>

          <div className="side-card support-card">
            <Lightbulb size={22} />
            <h3>Things to try</h3>
            <ul className="viz-tips">
              <li>Insert 12, 22 and 32 to build a cluster.</li>
              <li>Delete 22, then search for 32. Why does the search not stop at the deleted slot?</li>
              <li>Fill the table past α = 0.7 and watch how many slots an insert checks.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
