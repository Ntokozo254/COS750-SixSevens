export const PREFERENCES_STORAGE_KEY = 'hashlab.preferences.v1'

export const DEFAULT_PREFERENCES = Object.freeze({
  displayName: '',
  studentNumber: '',
  readingSize: 'standard',
  highContrast: false,
  reduceMotion: false,
  speechEnabled: false,
  speechRate: 1,
  speechVoice: '',
  preferredMode: 'explore',
  studyGoal: 15,
})

const readingSizes = new Set(['standard', 'large', 'extra-large'])
const learningModes = new Set([
  'explore',
  'visual',
  'aural',
  'read-write',
  'kinesthetic',
  'multimodal',
])

const browserStorage = () => (typeof window === 'undefined' ? null : window.localStorage)

function text(value, limit) {
  return typeof value === 'string' ? value.replace(/\p{Cc}/gu, '').slice(0, limit) : ''
}

export function sanitizePreferences(saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
    return { ...DEFAULT_PREFERENCES }
  }

  // Only copy the known own properties; old, unexpected and inherited fields are ignored.
  const supplied = Object.fromEntries(
    Object.keys(DEFAULT_PREFERENCES)
      .filter((key) => Object.hasOwn(saved, key))
      .map((key) => [key, saved[key]]),
  )

  return {
    displayName: text(supplied.displayName, 60),
    studentNumber: text(supplied.studentNumber, 20),
    readingSize: readingSizes.has(supplied.readingSize) ? supplied.readingSize : 'standard',
    highContrast: supplied.highContrast === true,
    reduceMotion: supplied.reduceMotion === true,
    speechEnabled: supplied.speechEnabled === true,
    speechRate:
      typeof supplied.speechRate === 'number' &&
      Number.isFinite(supplied.speechRate) &&
      supplied.speechRate >= 0.75 &&
      supplied.speechRate <= 1.5
        ? supplied.speechRate
        : 1,
    speechVoice: text(supplied.speechVoice, 200),
    preferredMode: learningModes.has(supplied.preferredMode) ? supplied.preferredMode : 'explore',
    studyGoal:
      Number.isInteger(supplied.studyGoal) &&
      supplied.studyGoal >= 5 &&
      supplied.studyGoal <= 60 &&
      supplied.studyGoal % 5 === 0
        ? supplied.studyGoal
        : 15,
  }
}

export function readPreferencesState(getStorage = browserStorage) {
  try {
    const storage = getStorage()
    if (!storage) return { preferences: { ...DEFAULT_PREFERENCES }, storageAvailable: false }

    const value = storage.getItem(PREFERENCES_STORAGE_KEY)
    let saved
    try {
      saved = value == null ? null : JSON.parse(value)
    } catch {
      // A corrupt record should not prevent settings from being changed and saved again.
      saved = null
    }
    return { preferences: sanitizePreferences(saved), storageAvailable: true }
  } catch {
    return { preferences: { ...DEFAULT_PREFERENCES }, storageAvailable: false }
  }
}

export function readPreferences(getStorage = browserStorage) {
  return readPreferencesState(getStorage).preferences
}

export function writePreferences(preferences, getStorage = browserStorage) {
  try {
    const storage = getStorage()
    if (!storage) return false
    storage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(sanitizePreferences(preferences)))
    return true
  } catch {
    return false
  }
}
