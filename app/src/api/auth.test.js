import test from 'node:test'
import assert from 'node:assert/strict'
import { AuthError, login, register } from './auth.js'

const user = { id: 1, email: 'sam@example.com', name: 'Sam', surname: 'Dube' }
const signup = { name: 'Sam', surname: 'Dube', email: 'sam@example.com', password: 'longenough' }

// A stand-in for fetch that answers with a status and JSON body.
const respond = (status, body) => async () => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => {
    if (body === undefined) throw new SyntaxError('not json')
    return body
  },
})

async function failure(promise) {
  try {
    await promise
  } catch (error) {
    return error
  }
  assert.fail('expected the request to fail')
}

test('successful login and registration return the user', async () => {
  assert.deepEqual(await login('sam@example.com', 'pw', respond(200, user)), user)
  assert.deepEqual(await register(signup, respond(201, user)), user)
})

test('invalid input is caught before anything is sent', async () => {
  let called = false
  const spy = async () => {
    called = true
  }
  const cases = [
    [login('not-an-email', 'pw', spy), 'email'],
    [login('sam@example.com', '', spy), 'password'],
    [register({ ...signup, name: '   ' }, spy), 'name'],
    [register({ ...signup, surname: '' }, spy), 'surname'],
    [register({ ...signup, email: 'sam@' }, spy), 'email'],
    [register({ ...signup, password: 'short' }, spy), 'password'],
  ]
  for (const [promise, field] of cases) {
    const error = await failure(promise)
    assert.ok(error instanceof AuthError)
    assert.equal(error.field, field)
  }
  assert.equal(called, false)
})

test('server validation messages are shown and linked to their field', async () => {
  const error = await failure(register(signup, respond(400, { error: 'Enter a valid email address' })))
  assert.equal(error.message, 'Enter a valid email address.')
  assert.equal(error.field, 'email')
})

test('wrong credentials get one message that does not reveal which part was wrong', async () => {
  const error = await failure(login('sam@example.com', 'pw', respond(401, { error: 'Invalid email or password' })))
  assert.match(error.message, /don't match an account/)
  assert.equal(error.field, 'password')
})

test('an existing account offers logging in instead', async () => {
  const error = await failure(register(signup, respond(409, { error: 'exists' })))
  assert.equal(error.field, 'email')
  assert.equal(error.action, 'login')
})

test('rate limiting asks the user to wait', async () => {
  const error = await failure(login('sam@example.com', 'pw', respond(429, {})))
  assert.match(error.message, /Too many attempts/)
})

test('server faults and unreadable replies get a specific retry message', async () => {
  for (const reply of [respond(500, { error: 'something went wrong' }), respond(502), respond(404, {}), respond(200, { nope: true })]) {
    assert.match((await failure(login('sam@example.com', 'pw', reply))).message, /couldn't log you in right now/)
    assert.match((await failure(register(signup, reply))).message, /couldn't create your account right now/)
  }
})

test('connection failures and timeouts are explained without technical detail', async () => {
  const offline = await failure(login('sam@example.com', 'pw', async () => {
    throw new TypeError('Failed to fetch')
  }))
  assert.match(offline.message, /couldn't connect/)

  const slow = await failure(login('sam@example.com', 'pw', async () => {
    throw Object.assign(new Error('aborted'), { name: 'AbortError' })
  }))
  assert.match(slow.message, /taking longer than usual/)
})

test('no message ever mentions the server or says "something went wrong"', async () => {
  const replies = [
    respond(500, { error: 'something went wrong' }),
    respond(503),
    async () => {
      throw new TypeError('Failed to fetch')
    },
  ]
  for (const reply of replies) {
    const { message } = await failure(login('sam@example.com', 'pw', reply))
    assert.doesNotMatch(message, /server|something went wrong/i)
  }
})
