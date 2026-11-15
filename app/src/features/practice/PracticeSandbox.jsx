import { useId, useState } from 'react'
import { SearchTable } from '../search/SearchExplorer'
import '../search/search.css'
import {
  buildSandboxTable,
  MAX_SANDBOX_KEYS,
  parseSandboxInputs,
  parseSandboxKey,
  runSandboxOperation,
} from './sandboxLogic'

export default function PracticeSandbox({ preferences = {} }) {
  const instanceId = useId()
  const [capacityInput, setCapacityInput] = useState('10')
  const [keysInput, setKeysInput] = useState('12, 22, 32, 9, 19')
  const [keyInput, setKeyInput] = useState('42')
  const [setupError, setSetupError] = useState('')
  const [operationError, setOperationError] = useState('')
  const [sandbox, setSandbox] = useState(() => ({
    ...buildSandboxTable(10, [12, 22, 32, 9, 19]),
    lastOperation: null,
  }))
  const lastOperation = sandbox.lastOperation
  const occupied = sandbox.table.filter((slot) => slot !== null).length
  const builtEntries = sandbox.outcomes.filter((outcome) => outcome.status === 'inserted').length

  function buildTable(event) {
    event.preventDefault()
    try {
      const { capacity, keys } = parseSandboxInputs(capacityInput, keysInput)
      setSandbox({ ...buildSandboxTable(capacity, keys), lastOperation: null })
      setSetupError('')
      setOperationError('')
    } catch (error) {
      setSetupError(error.message)
    }
  }

  function resetTable() {
    setSandbox({ ...buildSandboxTable(sandbox.capacity), lastOperation: null })
    setCapacityInput(String(sandbox.capacity))
    setKeysInput('')
    setSetupError('')
    setOperationError('')
  }

  function performOperation(event) {
    event.preventDefault()
    const operation = event.nativeEvent.submitter?.value ?? 'insert'
    try {
      const key = parseSandboxKey(keyInput)
      const result = runSandboxOperation(sandbox.table, operation, key)
      setSandbox((previous) => ({ ...previous, table: result.table, lastOperation: result }))
      setOperationError('')
    } catch (error) {
      setOperationError(error.message)
    }
  }

  let code
  if (lastOperation) {
    const inserting = lastOperation.operation === 'insert'
    const functionName = inserting ? 'insertLinearProbing' : 'searchLinearProbing'
    const fileName = inserting ? 'linearProbing' : 'searching'
    const slots = lastOperation.initialTable.map((slot) => slot === null ? 'null' : String(slot))
    code = [
      `import { ${functionName} } from "./logic/${fileName}.js"`,
      '',
      `const table = [${slots.join(', ')}]`,
      `const result = ${functionName}(table, ${lastOperation.key})`,
      'console.log(result)',
    ].join('\n')
  } else {
    code = [
      'import { insertLinearProbing } from "./logic/linearProbing.js"',
      '',
      `const table = Array(${sandbox.capacity}).fill(null)`,
      `const keys = [${sandbox.keys.join(', ')}]`,
      'for (const key of keys) {',
      '  insertLinearProbing(table, key)',
      '}',
      'console.log(table)',
    ].join('\n')
  }

  return (
    <section
      className="practice-sandbox"
      aria-labelledby={`${instanceId}-title`}
      data-reduce-motion={Boolean(preferences.reduceMotion)}
    >
      <div className="practice-section-heading">
        <span className="eyebrow">TRY YOUR OWN EXAMPLE</span>
        <h2 id={`${instanceId}-title`}>Build a table and test a prediction.</h2>
        <p>Choose the capacity and insertion order, then compare what insertion and search do with the same key.</p>
      </div>

      <form className="practice-setup-form" onSubmit={buildTable}>
        <label htmlFor={`${instanceId}-capacity`}>
          Table capacity, from 1 to 20
          <input
            id={`${instanceId}-capacity`}
            inputMode="numeric"
            maxLength={32}
            value={capacityInput}
            onChange={(event) => {
              setCapacityInput(event.target.value)
              setSetupError('')
            }}
            aria-invalid={Boolean(setupError)}
            aria-describedby={setupError ? `${instanceId}-setup-error` : undefined}
          />
        </label>
        <label htmlFor={`${instanceId}-keys`}>
          Keys in insertion order, separated by commas
          <input
            id={`${instanceId}-keys`}
            maxLength={400}
            value={keysInput}
            onChange={(event) => {
              setKeysInput(event.target.value)
              setSetupError('')
            }}
            aria-invalid={Boolean(setupError)}
            aria-describedby={`${instanceId}-limits${setupError ? ` ${instanceId}-setup-error` : ''}`}
          />
        </label>
        <div className="practice-actions">
          <button className="primary-button" type="submit">Build table</button>
          <button className="secondary-button" type="button" onClick={resetTable}>Reset to empty</button>
        </div>
      </form>
      <p className="practice-note" id={`${instanceId}-limits`}>
        Use up to {MAX_SANDBOX_KEYS} keys from 0 to 1,000,000. An empty key list builds an empty table.
        Build applies your settings. Reset empties the current table.
      </p>
      {setupError && <p className="practice-error" id={`${instanceId}-setup-error`} role="alert">{setupError}</p>}

      <div className="practice-table-panel">
        <div className="practice-table-heading">
          <h3>Your current table</h3>
          <span>{occupied} of {sandbox.capacity} slots occupied</span>
        </div>
        <SearchTable
          table={sandbox.table}
          currentIndex={lastOperation?.path.at(-1)}
          matchIndex={lastOperation?.index}
        />
        <p className="practice-note">Home slot = key mod {sandbox.capacity}. Linear probing continues through consecutive slots and wraps to slot 0.</p>
      </div>

      <form className="practice-operation-form" onSubmit={performOperation}>
        <label htmlFor={`${instanceId}-key`}>
          Key to insert or find
          <input
            id={`${instanceId}-key`}
            inputMode="numeric"
            maxLength={32}
            value={keyInput}
            onChange={(event) => {
              setKeyInput(event.target.value)
              setOperationError('')
            }}
            aria-invalid={Boolean(operationError)}
            aria-describedby={operationError ? `${instanceId}-operation-error` : undefined}
          />
        </label>
        <div className="practice-actions">
          <button className="primary-button" type="submit" name="operation" value="insert">Insert key</button>
          <button className="secondary-button" type="submit" name="operation" value="search">Search key</button>
        </div>
      </form>
      {operationError && <p className="practice-error" id={`${instanceId}-operation-error`} role="alert">{operationError}</p>}

      {lastOperation && (
        <div className="practice-operation-result" role="status" aria-live="polite">
          <h3>{lastOperation.message}</h3>
          <p>Home slot {lastOperation.home} · {lastOperation.probes} {lastOperation.probes === 1 ? 'probe' : 'probes'}.</p>
          <p className="practice-probe-path">Probe path {lastOperation.path.join(' → ')}.</p>
          <p>{lastOperation.nextAction}</p>
        </div>
      )}

      {lastOperation && (
        <details className="practice-trace">
          <summary>Inspect the operation steps</summary>
          <ol>
            {lastOperation.steps.map((step, index) => <li key={index}>{step.message}</li>)}
          </ol>
        </details>
      )}
      {sandbox.outcomes.length > 0 && (
        <details className="practice-build-report">
          <summary>Initial build processed {sandbox.keys.length} keys and stored {builtEntries} entries</summary>
          <ol>
            {sandbox.outcomes.map((outcome, index) => (
              <li key={index}>
                {outcome.message} Path {outcome.path.join(' → ')} · {outcome.probes} {outcome.probes === 1 ? 'probe' : 'probes'}.
              </li>
            ))}
          </ol>
        </details>
      )}

      <div className="practice-code-preview">
        <h3>JavaScript for this experiment</h3>
        <p className="practice-note">This uses the shared helpers in src/logic and reflects your last applied build or operation.</p>
        <pre><code>{code}</code></pre>
      </div>
    </section>
  )
}
