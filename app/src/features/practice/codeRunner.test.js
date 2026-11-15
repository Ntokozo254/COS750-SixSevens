import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { Worker as NodeWorker } from 'node:worker_threads'
import { runCode, MAX_SOURCE_LENGTH } from './codeRunner.js'

const originalWorker = globalThis.Worker
const workers = []
const terminations = []

// Exercise the real browser-worker entry through worker_threads, with only
// message delivery adapted to the browser Worker interface.
class BrowserWorkerAdapter {
  constructor(url, options) {
    assert.equal(options.type, 'module')
    const bootstrap = `
      const { parentPort } = require('node:worker_threads');
      globalThis.self = {
        addEventListener(type, listener) {
          if (type === 'message') parentPort.on('message', data => listener({ data }));
        },
        postMessage(data) { parentPort.postMessage(data); }
      };
      import(${JSON.stringify(url.href)}).catch(error => { throw error; });
    `
    this.thread = new NodeWorker(bootstrap, { eval: true })
    this.terminated = false
    this.thread.on('message', (data) => this.onmessage?.({ data }))
    this.thread.on('error', (error) => this.onerror?.({ message: error.message, preventDefault() {} }))
    this.thread.on('messageerror', () => this.onmessageerror?.({}))
    workers.push(this)
  }

  postMessage(message) {
    this.thread.postMessage(message)
  }

  terminate() {
    this.terminated = true
    terminations.push(this.thread.terminate())
  }
}

globalThis.Worker = BrowserWorkerAdapter

after(async () => {
  for (const worker of workers) {
    if (!worker.terminated) worker.terminate()
  }
  await Promise.allSettled(terminations)
  if (originalWorker === undefined) delete globalThis.Worker
  else globalThis.Worker = originalWorker
})

test('executes solve in an actual worker and returns independent JSON-compatible data', async () => {
  const input = { keys: [12, 22], capacity: 10 }
  const result = await runCode('function solve(input) { input.keys.push(32); return { homes: input.keys.map(key => key % input.capacity) }; }', input)
  assert.deepEqual(result, { ok: true, value: { homes: [2, 2, 2] } })
  assert.deepEqual(input, { keys: [12, 22], capacity: 10 })
  assert.equal(workers.at(-1).terminated, true)
})

test('awaits an asynchronous solve result and supports primitive outputs', async () => {
  assert.deepEqual(await runCode('async function solve(input) { return await Promise.resolve(input * 2); }', 4), { ok: true, value: 8 })
  assert.deepEqual(await runCode('const solve = input => input === null;', null), { ok: true, value: true })
})

test('preserveInput rejects nested mutation while the default behavior remains compatible', async () => {
  const source = 'function solve(input) { input.table[0].push(3); return input.table; }'
  const input = { table: [[1, 2], [4]] }
  const rejected = await runCode(source, input, { preserveInput: true })
  assert.equal(rejected.ok, false)
  assert.equal(rejected.type, 'runtime')
  assert.match(rejected.error, /changed its input/)
  assert.match(rejected.error, /Make a copy/)
  assert.deepEqual(input, { table: [[1, 2], [4]] })
  assert.deepEqual(await runCode(source, input), { ok: true, value: [[1, 2, 3], [4]] })
})

test('preserveInput accepts copied nested data and rejects changes to object properties', async () => {
  const input = { table: [[1, 2], [4]] }
  const copied = 'function solve(input) { const table = input.table.map(row => [...row]); table[0].push(3); return table; }'
  assert.deepEqual(await runCode(copied, input, { preserveInput: true }), { ok: true, value: [[1, 2, 3], [4]] })
  const changed = await runCode('function solve(input) { input.extra = () => 1; return 2; }', {}, { preserveInput: true })
  assert.equal(changed.type, 'runtime')
  assert.match(changed.error, /changed its input/)
})

test('preserveInput requires a boolean option before creating a worker', async () => {
  const before = workers.length
  for (const preserveInput of ['true', 1, null, {}]) {
    const result = await runCode('function solve() { return 1; }', null, { preserveInput })
    assert.equal(result.type, 'unsupported')
    assert.match(result.error, /true or false/)
  }
  assert.equal(workers.length, before)
})

test('reports compilation errors separately from runtime errors and a missing solve function', async () => {
  const syntax = await runCode('function solve(input { return input; }', null)
  assert.equal(syntax.ok, false)
  assert.equal(syntax.type, 'syntax')
  assert.ok(syntax.error.length > 0)
  const runtime = await runCode('function solve() { throw new Error("Check the loop index"); }', null)
  assert.deepEqual(runtime, { ok: false, type: 'runtime', error: 'Check the loop index' })
  const missing = await runCode('const answer = 2;', null)
  assert.equal(missing.type, 'runtime')
  assert.match(missing.error, /solve\(input\)/)
  assert.equal((await runCode('function solve() { throw new SyntaxError("inside solve"); }', null)).type, 'runtime')
})

test('isolates source execution from the main thread and from later runs', async () => {
  delete globalThis.practiceRunnerTouched
  assert.deepEqual(await runCode('globalThis.practiceRunnerTouched = true; function solve() { return typeof document; }', null), { ok: true, value: 'undefined' })
  assert.equal(globalThis.practiceRunnerTouched, undefined)
  assert.deepEqual(await runCode('function solve() { return typeof globalThis.practiceRunnerTouched; }', null), { ok: true, value: 'undefined' })
})

test('ignores unrelated worker messages and retains the requested result', async () => {
  const source = 'function solve() { self.postMessage({ requestId: "unrelated", result: { ok: true, value: 999 } }); return 7; }'
  assert.deepEqual(await runCode(source, null), { ok: true, value: 7 })
})

test('terminates an infinite loop within the configured timeout', { timeout: 5000 }, async () => {
  const started = performance.now()
  const result = await runCode('function solve() { while (true) {} }', null, { timeoutMs: 120 })
  assert.equal(result.ok, false)
  assert.equal(result.type, 'timeout')
  assert.match(result.error, /120 milliseconds/)
  assert.ok(performance.now() - started < 3000)
  assert.equal(workers.at(-1).terminated, true)
})

test('pre-aborted and actively aborted runs return cancelled and terminate promptly', { timeout: 5000 }, async () => {
  const before = workers.length
  const preAborted = new AbortController()
  preAborted.abort()
  assert.equal((await runCode('function solve() { return 1; }', null, { signal: preAborted.signal })).type, 'cancelled')
  assert.equal(workers.length, before)
  const controller = new AbortController()
  const running = runCode('function solve() { while (true) {} }', null, { signal: controller.signal })
  setTimeout(() => controller.abort(), 50)
  const result = await running
  assert.deepEqual(result, { ok: false, type: 'cancelled', error: 'Execution stopped.' })
  assert.equal(workers.at(-1).terminated, true)
})

test('timed-out work cannot replace a later fresh worker result', { timeout: 5000 }, async () => {
  const delayed = runCode('async function solve() { return await new Promise(resolve => setTimeout(() => resolve("late"), 500)); }', null, { timeoutMs: 100 })
  const current = runCode('function solve() { return "current"; }', null)
  assert.deepEqual(await current, { ok: true, value: 'current' })
  assert.equal((await delayed).type, 'timeout')
  assert.ok(workers.slice(-2).every((worker) => worker.terminated))
})

test('rejects oversized sources, invalid timeouts and unavailable workers before executing', async () => {
  const before = workers.length
  assert.equal((await runCode('x'.repeat(MAX_SOURCE_LENGTH + 1), null)).type, 'unsupported')
  assert.equal((await runCode('   ', null)).type, 'syntax')
  for (const timeoutMs of [0, -1, Infinity, 10_001, 1.5]) {
    assert.equal((await runCode('function solve() { return 1; }', null, { timeoutMs })).type, 'unsupported')
  }
  assert.equal(workers.length, before)
  globalThis.Worker = undefined
  try {
    assert.equal((await runCode('function solve() { return 1; }', null)).type, 'unsupported')
  } finally {
    globalThis.Worker = BrowserWorkerAdapter
  }
})

test('rejects non-JSON and oversized outputs with readable feedback', async () => {
  const invalidSources = [
    'function solve() { return undefined; }',
    'function solve() { return NaN; }',
    'function solve() { return Infinity; }',
    'function solve() { return 1n; }',
    'function solve() { return [1, undefined]; }',
    'function solve() { const result = {}; result.self = result; return result; }',
    'function solve() { return new Map([["x", 1]]); }',
    'function solve() { return "x".repeat(50001); }',
  ]
  for (const source of invalidSources) {
    const result = await runCode(source, null)
    assert.equal(result.ok, false)
    assert.equal(result.type, 'unsupported')
    assert.ok(result.error.length > 0)
    assert.equal(workers.at(-1).terminated, true)
  }
})

test('a non-cloneable input returns unsupported and still cleans up its worker', async () => {
  const result = await runCode('function solve(input) { return input; }', () => 1)
  assert.equal(result.ok, false)
  assert.equal(result.type, 'unsupported')
  assert.equal(workers.at(-1).terminated, true)
})
