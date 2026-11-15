const MAX_SOURCE_LENGTH = 20_000
const MAX_OUTPUT_LENGTH = 50_000

function errorMessage(error, fallback) {
  try {
    return String(error?.message ?? error).slice(0, 1000) || fallback
  } catch {
    return fallback
  }
}

function jsonText(value) {
  return JSON.stringify(value, (_key, item) => {
    const type = typeof item
    if (type === 'undefined' || type === 'function' || type === 'symbol' || type === 'bigint') {
      throw new TypeError('Use JSON-compatible values such as numbers, strings, booleans, arrays, objects, and null.')
    }
    if (type === 'number' && !Number.isFinite(item)) {
      throw new TypeError('Return finite numbers. NaN and Infinity cannot be represented in JSON.')
    }
    if (item !== null && type === 'object') {
      const prototype = Object.getPrototypeOf(item)
      if (!Array.isArray(item) && prototype !== Object.prototype && prototype !== null) {
        throw new TypeError('Use plain JSON-compatible objects and arrays.')
      }
      if (Object.getOwnPropertySymbols(item).length > 0) {
        throw new TypeError('JSON-compatible objects use string property names.')
      }
    }
    return item
  })
}

// This function is invoked only by the worker's message handler.
export async function evaluateSubmission(source, input, { preserveInput = false } = {}) {
  if (typeof source !== 'string' || source.trim() === '') {
    return { ok: false, type: 'syntax', error: 'Write a function named solve(input) before running the code.' }
  }
  if (source.length > MAX_SOURCE_LENGTH) {
    return { ok: false, type: 'unsupported', error: 'Keep the solution within 20,000 characters.' }
  }
  if (typeof preserveInput !== 'boolean') {
    return { ok: false, type: 'unsupported', error: 'The preserveInput option must be true or false.' }
  }

  let clonedInput
  let originalInput
  try {
    originalInput = jsonText(input)
    clonedInput = JSON.parse(originalInput)
  } catch (error) {
    return { ok: false, type: 'unsupported', error: `Input must be JSON-compatible. ${errorMessage(error, 'Check the input data.')}` }
  }

  let createSolve
  try {
    createSolve = new Function(`"use strict";\n${source}\n;\nreturn typeof solve === "function" ? solve : null;`)
  } catch (error) {
    return {
      ok: false,
      type: error?.name === 'EvalError' ? 'unsupported' : 'syntax',
      error: errorMessage(error, 'The JavaScript could not be parsed.'),
    }
  }

  let result
  try {
    const solve = createSolve()
    if (typeof solve !== 'function') {
      return { ok: false, type: 'runtime', error: 'Define a function named solve(input) and return its answer.' }
    }
    result = await solve(clonedInput)
  } catch (error) {
    return { ok: false, type: 'runtime', error: errorMessage(error, 'The solution stopped with an error.') }
  }

  if (preserveInput) {
    let inputAfter
    try {
      inputAfter = jsonText(clonedInput)
    } catch {
      inputAfter = null
    }
    if (inputAfter !== originalInput) {
      return {
        ok: false,
        type: 'runtime',
        error: 'The solution changed its input. Make a copy of arrays or objects before changing them, then return the requested result.',
      }
    }
  }

  try {
    const output = jsonText(result)
    if (output.length > MAX_OUTPUT_LENGTH) {
      return { ok: false, type: 'unsupported', error: 'Keep the returned JSON output within 50,000 characters.' }
    }
    return { ok: true, value: JSON.parse(output) }
  } catch (error) {
    return { ok: false, type: 'unsupported', error: `Return JSON-compatible output. ${errorMessage(error, 'Check the returned value.')}` }
  }
}

if (typeof document === 'undefined' && typeof self !== 'undefined' && typeof self.addEventListener === 'function') {
  // Capture the delivery function before the submitted program can change globals.
  const deliver = self.postMessage.bind(self)
  self.addEventListener('message', async (event) => {
    const { requestId, source, input, preserveInput } = event.data ?? {}
    const result = await evaluateSubmission(source, input, { preserveInput })
    deliver({ requestId, result })
  })
}
