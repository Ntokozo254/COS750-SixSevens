import { useRef, useState } from 'react'
import {
  DEFAULT_PREFERENCES,
  preferencesKey,
  readPreferencesState,
  sanitizePreferences,
  writePreferences,
} from '../logic/preferences.js'

// Preferences for the signed-in account, saved in this browser under a key of
// their own so one account's settings never show up for another.
export default function usePreferences(userId) {
  const key = preferencesKey(userId)
  const [state, setState] = useState(() => ({ key, ...readPreferencesState(undefined, key) }))
  // Another account signed in: load that account's preferences.
  if (state.key !== key) {
    setState({ key, ...readPreferencesState(undefined, key) })
  }
  // The latest preferences, so successive field changes build on each other
  // before React commits a render.
  const latest = useRef({ key, preferences: state.preferences })

  function commitPreferences(preferences) {
    // Event-handler writes keep rendering and state updaters free of storage side effects.
    latest.current = { key, preferences }
    const storageAvailable = writePreferences(preferences, undefined, key)
    setState({ key, preferences, storageAvailable })
  }

  function updatePreference(name, value) {
    if (!Object.hasOwn(DEFAULT_PREFERENCES, name)) return
    const base = latest.current.key === key ? latest.current.preferences : state.preferences
    commitPreferences(sanitizePreferences({ ...base, [name]: value }))
  }

  function resetPreferences() {
    commitPreferences({ ...DEFAULT_PREFERENCES })
  }

  return {
    preferences: state.preferences,
    updatePreference,
    resetPreferences,
    storageAvailable: state.storageAvailable,
  }
}
