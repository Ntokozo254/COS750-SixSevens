export const MAX_SOURCE_LENGTH = 20_000

const DEFAULT_TIMEOUT_MS = 1500
const MAX_TIMEOUT_MS = 10_000
const ERROR_TYPES = new Set(['syntax', 'runtime', 'timeout', 'unsupported', 'cancelled'])

export function runCode(source, input, { timeoutMs = DEFAULT_TIMEOUT_MS, signal, preserveInput = false } = {}) {
  if (typeof source !== 'string' || source.trim() === '') {
    return Promise.resolve({ ok: false, type: 'syntax', error: 'Write a function named solve(input) before running the code.' })
  }
  if (source.length > MAX_SOURCE_LENGTH) {
    return Promise.resolve({ ok: false, type: 'unsupported', error: 'Keep the solution within 20,000 characters.' })
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > MAX_TIMEOUT_MS) {
    return Promise.resolve({ ok: false, type: 'unsupported', error: 'Execution time must be between 1 and 10,000 milliseconds.' })
  }
  if (typeof preserveInput !== 'boolean') {
    return Promise.resolve({ ok: false, type: 'unsupported', error: 'The preserveInput option must be true or false.' })
  }
  if (signal && (typeof signal.addEventListener !== 'function' || typeof signal.removeEventListener !== 'function')) {
    return Promise.resolve({ ok: false, type: 'unsupported', error: 'Provide an AbortSignal when requesting cancellation.' })
  }
  if (signal?.aborted) {
    return Promise.resolve({ ok: false, type: 'cancelled', error: 'Execution stopped.' })
  }
  if (typeof Worker !== 'function') {
    return Promise.resolve({ ok: false, type: 'unsupported', error: 'This browser cannot start an isolated coding worker.' })
  }

  return new Promise((resolve) => {
    let worker
    let timer
    let settled = false
    const requestId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

    function finish(result) {
      if (settled) return
      settled = true
      clearTimeout(timer)
      signal?.removeEventListener('abort', cancel)
      if (worker) {
        worker.onmessage = null
        worker.onerror = null
        worker.onmessageerror = null
        worker.terminate()
      }
      resolve(result)
    }

    function cancel() {
      finish({ ok: false, type: 'cancelled', error: 'Execution stopped.' })
    }

    try {
      worker = new Worker(new URL('./codeRunner.worker.js', import.meta.url), { type: 'module' })
      worker.onmessage = (event) => {
        if (event.data?.requestId !== requestId) return
        const result = event.data.result
        if (result?.ok === true) {
          finish({ ok: true, value: result.value })
        } else if (result?.ok === false && ERROR_TYPES.has(result.type) && typeof result.error === 'string') {
          finish({ ok: false, type: result.type, error: result.error })
        } else {
          finish({ ok: false, type: 'runtime', error: 'The coding worker returned an invalid result.' })
        }
      }
      worker.onerror = (event) => {
        event.preventDefault?.()
        finish({ ok: false, type: 'runtime', error: event.message || 'The coding worker could not complete this run.' })
      }
      worker.onmessageerror = () => {
        finish({ ok: false, type: 'unsupported', error: 'The worker result could not be read. Return JSON-compatible data.' })
      }
      signal?.addEventListener('abort', cancel, { once: true })
      if (signal?.aborted) {
        cancel()
        return
      }
      timer = setTimeout(() => {
        finish({ ok: false, type: 'timeout', error: `Execution exceeded ${timeoutMs} milliseconds. Check loops and stopping conditions.` })
      }, timeoutMs)
      worker.postMessage({ requestId, source, input, preserveInput })
    } catch {
      finish({ ok: false, type: 'unsupported', error: 'The coding worker could not start or read the input. Use JSON-compatible input and a browser that supports module workers.' })
    }
  })
}
