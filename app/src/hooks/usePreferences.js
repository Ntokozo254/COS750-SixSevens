import { useRef, useState } from 'react'
import {
  DEFAULT_PREFERENCES,
  readPreferencesState,
  sanitizePreferences,
  writePreferences,
} from '../logic/preferences.js'

export default function usePreferences() {
  const [state, setState] = useState(() => readPreferencesState())
  const currentPreferences = useRef(state.preferences)

  function commitPreferences(preferences) {
    // Event-handler writes keep rendering and state updaters free of storage side effects.
    // The ref also preserves successive field changes before React commits a render.
    currentPreferences.current = preferences
    const storageAvailable = writePreferences(preferences)
    setState(() => ({ preferences, storageAvailable }))
  }

  function updatePreference(key, value) {
    if (!Object.hasOwn(DEFAULT_PREFERENCES, key)) return
    commitPreferences(sanitizePreferences({ ...currentPreferences.current, [key]: value }))
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
