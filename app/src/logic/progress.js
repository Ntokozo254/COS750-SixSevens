import { validateSearchCompletionEvidence } from '../features/search/searchMastery.js'

export const PROGRESS_STORAGE_KEY = 'hashlab-progress-v2'
export const LEGACY_PROGRESS_STORAGE_KEY = 'hashlab-completed-modules'

export function createEmptyProgress() {
  return { version: 2, completed: [], searchAssessment: null }
}

export function sanitizeProgress(saved, allowedIds) {
  const allowed =
    allowedIds instanceof Set ? allowedIds : new Set(Array.isArray(allowedIds) ? allowedIds : [])
  const legacy = Array.isArray(saved)
  if (!legacy && (!saved || typeof saved !== 'object' || saved.version !== 2)) {
    return createEmptyProgress()
  }

  const suppliedIds = legacy ? saved : saved.completed
  const completed = Array.isArray(suppliedIds)
    ? [...new Set(suppliedIds.filter((id) => Number.isSafeInteger(id) && allowed.has(id)))]
    : []
  const evidence = legacy ? null : validateSearchCompletionEvidence(saved.searchAssessment)
  const verifiedSearch = completed.includes(5) && evidence !== null

  return {
    version: 2,
    completed: completed.filter((id) => id !== 5 || verifiedSearch),
    searchAssessment: verifiedSearch ? evidence : null,
  }
}

export function readProgress(
  allowedIds,
  getStorage = () => (typeof window === 'undefined' ? null : window.localStorage),
) {
  let storage
  let current
  try {
    storage = getStorage()
    if (!storage) return createEmptyProgress()
    current = storage.getItem(PROGRESS_STORAGE_KEY)
  } catch {
    return createEmptyProgress()
  }

  if (current !== null && current !== undefined) {
    try {
      const parsed = JSON.parse(current)
      if (Array.isArray(parsed) || (parsed?.version === 2 && Array.isArray(parsed.completed))) {
        return sanitizeProgress(parsed, allowedIds)
      }
    } catch {
      // Recover available legacy progress when the current JSON is unreadable.
    }
  }

  try {
    const legacy = JSON.parse(storage.getItem(LEGACY_PROGRESS_STORAGE_KEY) || '[]')
    return sanitizeProgress(Array.isArray(legacy) ? legacy : [], allowedIds)
  } catch {
    return createEmptyProgress()
  }
}
