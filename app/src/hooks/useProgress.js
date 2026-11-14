import { useEffect, useMemo, useState } from 'react'
import { modules } from '../data/modules'
import {
  LEGACY_PROGRESS_STORAGE_KEY,
  PROGRESS_STORAGE_KEY,
  readProgress,
  sanitizeProgress,
} from '../logic/progress'
import { validateSearchCompletionEvidence } from '../features/search/searchMastery'

const moduleIds = new Set(modules.map((module) => module.id))

export default function useProgress() {
  const [savedProgress, setSavedProgress] = useState(() => readProgress(moduleIds))
  const progressRecord = useMemo(() => sanitizeProgress(savedProgress, moduleIds), [savedProgress])
  const { completed } = progressRecord

  useEffect(() => {
    try {
      // Completion and checked answers share one authoritative storage write.
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressRecord))
      // Keep the numeric list readable by the group's earlier application branches.
      localStorage.setItem(LEGACY_PROGRESS_STORAGE_KEY, JSON.stringify(completed))
    } catch {
      // Verified session progress remains usable when storage is unavailable.
    }
  }, [progressRecord, completed])

  const progress = Math.round((completed.length / modules.length) * 100)

  function completeModule(id, evidence) {
    if (!moduleIds.has(id)) return
    const searchAssessment = id === 5 ? validateSearchCompletionEvidence(evidence) : null
    if (id === 5 && !searchAssessment) return

    setSavedProgress((saved) => {
      const current = sanitizeProgress(saved, moduleIds)
      if (current.completed.includes(id)) return saved
      return {
        ...current,
        completed: [...current.completed, id],
        searchAssessment: id === 5 ? searchAssessment : current.searchAssessment,
      }
    })
  }

  return { completed, progress, completeModule }
}
