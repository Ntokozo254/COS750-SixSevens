import { useEffect, useId, useRef, useState } from 'react'
import { ArrowRight, CheckCircle2, Lightbulb, Play, RotateCcw, Send, Square } from 'lucide-react'
import { runCode } from './codeRunner'
import { gradeResults, MAX_SOURCE_LENGTH, sameValue } from './practiceLogic'

const pretty = value => value === undefined ? 'No return value' : JSON.stringify(value, null, 2)

export default function CodeWorkspace({ challenge, source, onChange, accepted, onAccepted, onNext, active = true }) {
  const id = useId()
  const [input, setInput] = useState(() => pretty(challenge.example.input))
  const [result, setResult] = useState(null)
  const [hintLevel, setHintLevel] = useState(0)
  const [busy, setBusy] = useState(false)
  const [checked, setChecked] = useState(0)
  const [backup, setBackup] = useState(null)
  const [reflection, setReflection] = useState('')
  const controller = useRef(null)
  const mounted = useRef(true)
  const resultRef = useRef(null)
  const gutterRef = useRef(null)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false; controller.current?.abort() }
  }, [])
  useEffect(() => { if (!active) controller.current?.abort() }, [active])

  async function execute(submit) {
    if (busy || controller.current) return
    let customInput
    if (!submit) {
      try { customInput = JSON.parse(input) }
      catch { setResult({ kind: 'error', error: 'Enter valid JSON in the test input before running the code.' }); return }
    }
    const request = new AbortController()
    controller.current = request
    setBusy(true)
    setChecked(0)
    setResult(null)
    try {
      if (submit) {
        const runs = []
        for (const test of challenge.tests) {
          if (request.signal.aborted) return
          const run = await runCode(source, structuredClone(test.input), { signal: request.signal, preserveInput: true })
          if (request.signal.aborted) return
          runs.push(run)
          if (mounted.current) setChecked(runs.length)
        }
        const grade = gradeResults(challenge, runs)
        if (!mounted.current || request.signal.aborted) return
        setResult({ kind: 'submit', ...grade })
        if (grade.passed) onAccepted(source, runs)
        else setHintLevel(level => Math.min(challenge.hints.length, Math.max(1, level + 1)))
      } else {
        const run = await runCode(source, customInput, { signal: request.signal, preserveInput: true })
        if (!mounted.current || request.signal.aborted) return
        setResult({ kind: 'run', input: customInput, run, isExample: sameValue(customInput, challenge.example.input) })
        if (!run.ok) setHintLevel(level => Math.max(1, level))
      }
    } catch {
      if (mounted.current && !request.signal.aborted) setResult({ kind: 'error', error: 'The run could not finish. Try again, or review the code and input.' })
    } finally {
      if (mounted.current) {
        setBusy(false)
        if (request.signal.aborted) setResult({ kind: 'error', error: 'Run stopped. Your code is still in the editor.' })
      }
      if (controller.current === request) controller.current = null
    }
  }

  function replaceCode(nextSource) {
    setBackup(source)
    onChange(nextSource)
    setResult(null)
  }

  return (
    <div className="practice-workspace">
      <section className="practice-card practice-problem" aria-labelledby={`${id}-problem`}>
        <div className="practice-card-top">
          <span className="pill pill-blue">{challenge.difficulty}</span>
          {accepted && <span className="practice-accepted"><CheckCircle2 size={16} /> Previously accepted</span>}
        </div>
        <h2 id={`${id}-problem`}>{challenge.title}</h2>
        <p>{challenge.prompt}</p>
        <h3>Your task</h3>
        <ul>{challenge.objectives.map(item => <li key={item}>{item}</li>)}</ul>
        <div className="practice-example">
          <h3>Example</h3>
          <span>Input</span><pre>{pretty(challenge.example.input)}</pre>
          <span>Expected output</span><pre>{pretty(challenge.example.output)}</pre>
          <p>{challenge.example.explanation}</p>
        </div>
        <h3>Constraints and return value</h3>
        <ul>{challenge.constraints.map(item => <li key={item}>{item}</li>)}</ul>
        <details className="practice-details">
          <summary>Learn from a code snippet</summary>
          <pre><code>{challenge.workedCode}</code></pre>
          <p>{challenge.workedExplanation}</p>
        </details>
        <div className="practice-hints">
          <button type="button" className="secondary-button" disabled={hintLevel >= challenge.hints.length} onClick={() => setHintLevel(level => level + 1)}>
            <Lightbulb size={15} /> {hintLevel ? 'Show the next hint' : 'Get a hint'}
          </button>
          <ol aria-live="polite">{challenge.hints.slice(0, hintLevel).map(hint => <li key={hint}>{hint}</li>)}</ol>
        </div>
        <details className="practice-details">
          <summary>Inspect all {challenge.tests.length} coding checks</summary>
          {challenge.tests.map(test => <div className="practice-test-example" key={test.name}>
            <h4>{test.name}</h4><span>Input</span><pre>{pretty(test.input)}</pre>
            <span>Expected output</span><pre>{pretty(test.expected)}</pre>
          </div>)}
        </details>
        <details className="practice-details">
          <summary>Study a reference solution</summary>
          <p>Compare each decision with your attempt, then explain why it works.</p>
          <pre><code>{challenge.solution}</code></pre>
        </details>
      </section>

      <div className="practice-code-column">
        <section className="practice-card practice-code-card" aria-labelledby={`${id}-editor-heading`}>
          <div className="practice-card-top"><h2 id={`${id}-editor-heading`}>Code your solution</h2><span className="pill pill-blue">JavaScript</span></div>
          <p>Write <code>solve(input)</code> and return the requested value. Keep the input unchanged; copy arrays before editing them. Each run starts fresh.</p>
          <label htmlFor={`${id}-code`}>Solution editor</label>
          <div className="practice-editor-frame">
            <pre ref={gutterRef} className="practice-line-numbers" aria-hidden="true">{source.split('\n').map((_, index) => index + 1).join('\n')}</pre>
            <textarea
              id={`${id}-code`}
              className="practice-editor"
              value={source}
              onChange={event => { onChange(event.target.value); setResult(null) }}
              disabled={busy}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              wrap="off"
              onScroll={event => { if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop }}
              maxLength={MAX_SOURCE_LENGTH}
              aria-describedby={`${id}-editor-help`}
              onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); execute(false) } }}
            />
          </div>
          <p id={`${id}-editor-help`} className="practice-note">Ctrl/⌘ + Enter runs your test input. Tab moves to the next control. Use spaces to indent. Drafts save in this browser.</p>
          <div className="practice-actions">
            <button type="button" className="secondary-button" disabled={busy} onClick={() => replaceCode(challenge.starterCode)}><RotateCcw size={14} /> Reset starter</button>
            {backup !== null && <button type="button" className="secondary-button" disabled={busy} onClick={() => { onChange(backup); setBackup(null); setResult(null) }}>Undo replacement</button>}
            {accepted && <button type="button" className="secondary-button" disabled={busy} onClick={() => replaceCode(accepted.source)}>Load accepted code</button>}
          </div>
          <label htmlFor={`${id}-input`}>Test input — editable JSON</label>
          <textarea id={`${id}-input`} className="practice-input-editor" rows={5} value={input} onChange={event => { setInput(event.target.value); setResult(null) }} disabled={busy} maxLength={5000} spellCheck={false} />
          <div className="practice-actions">
            <button type="button" className="secondary-button" disabled={busy || !source.trim()} onClick={() => execute(false)}><Play size={15} /> Run code</button>
            <button type="button" className="primary-button" disabled={busy || !source.trim()} onClick={() => execute(true)}><Send size={15} /> Submit solution</button>
            {busy && <button type="button" className="secondary-button" onClick={() => controller.current?.abort()}><Square size={14} /> Stop</button>}
          </div>
          <p className="practice-note">Run code is for experiments. Submit solution checks every official case and unlocks progress only when all pass.</p>
          {busy && <p role="status">Running code… {checked > 0 ? `${checked} of ${challenge.tests.length} cases checked.` : 'Waiting for the first result.'}</p>}
        </section>

        {result && <section ref={resultRef} className="practice-card practice-results" aria-label="Code results" role="status" aria-live="polite">
          {result.kind === 'error' ? <><h3>Check your run</h3><p>{result.error}</p></> : result.kind === 'run' ? <>
            <h3>{result.run.ok ? 'Code returned a result' : 'Your code needs a change'}</h3>
            {result.run.ok ? <><span>Input used</span><pre>{pretty(result.input)}</pre><span>Your output</span><pre>{pretty(result.run.value)}</pre>
              {result.isExample && <><span>Expected example output</span><pre>{pretty(challenge.example.output)}</pre><p>{sameValue(result.run.value, challenge.example.output) ? 'The example matches. Submit to check the remaining cases.' : 'The result differs. Use the example explanation and a hint to revise the code.'}</p></>}
            </> : <p>{result.run.error}</p>}
            <p className="practice-note">This experiment does not change your stage progress.</p>
          </> : <>
            <h3>{result.passed ? 'Accepted — all checks passed' : 'Keep working through the cases'}</h3>
            <p>{result.correct} of {result.total} coding checks passed.{result.passed ? ' This challenge is saved as complete.' : ' Start with the first failing case and compare the values below.'}</p>
            <ol className="practice-case-results">{result.cases.map(test => <li key={test.name} data-passed={test.passed}>
              <strong>{test.passed ? 'Passed' : 'Needs a change'} · {test.name}</strong>
              {!test.passed && <><p>{test.explanation}</p><span>Input</span><pre>{pretty(test.input)}</pre><span>Expected</span><pre>{pretty(test.expected)}</pre><span>Your result</span><pre>{test.error ?? pretty(test.actual)}</pre></>}
            </li>)}</ol>
            {result.passed && <button type="button" className="primary-button" onClick={onNext}>Continue on the path <ArrowRight size={15} /></button>}
          </>}
        </section>}
        <section className="practice-card practice-reflection">
          <h3>Explain one decision</h3>
          <label htmlFor={`${id}-reflection`}>Why does your approach work, and which edge case changed your thinking?</label>
          <textarea id={`${id}-reflection`} rows={3} value={reflection} onChange={event => setReflection(event.target.value)} maxLength={2000} />
          <p className="practice-note">Optional and ungraded. Your note stays during this challenge visit.</p>
        </section>
      </div>
    </div>
  )
}
