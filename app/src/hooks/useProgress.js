import { useEffect, useMemo, useRef, useState } from 'react'
import { modules } from '../data/modules'
import { createEmptyProgress, PROGRESS_STORAGE_KEY, sanitizeProgress } from '../logic/progress'
import { fetchProgress, saveProgress } from '../api/progress'
import { validateSearchCompletionEvidence } from '../features/search/searchMastery'
import {
  getAssessmentTopic,
  validateTopicCompletionEvidence,
} from '../features/learning/topicRegistry'

const moduleIds = new Set(modules.map((module) => module.id))

// A per-account copy in this browser, used only when the server can't be reached.
const cacheKey = (userId) => `${PROGRESS_STORAGE_KEY}:${userId}`

function readCache(userId) {
  try {
    return JSON.parse(localStorage.getItem(cacheKey(userId)))
  } catch {
    return null
  }
}

function writeCache(userId, json) {
  try {
    localStorage.setItem(cacheKey(userId), json)
  } catch {
    // Progress still saves to the server when browser storage is unavailable.
  }
}

// Progress for the signed-in account. The server holds the record; it is
// loaded when the account changes and saved again whenever it changes.
export default function useProgress(userId) {
  const [state, setState] = useState({ owner: null, loaded: false, saved: null })
  const current = state.owner === userId ? state : { owner: userId, loaded: false, saved: null }
  const progressRecord = useMemo(
    () => sanitizeProgress(current.saved ?? createEmptyProgress(), moduleIds),
    [current.saved]
  )
  const { completed } = progressRecord
  // The JSON the server is known to hold, so unchanged records aren't re-sent.
  const serverCopy = useRef(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    fetchProgress(userId)
      .then((record) => ({ record, fromServer: true }))
      .catch(() => ({ record: readCache(userId), fromServer: false }))
      .then(({ record, fromServer }) => {
        if (cancelled) return
        const saved = sanitizeProgress(record ?? createEmptyProgress(), moduleIds)
        serverCopy.current = fromServer ? JSON.stringify(saved) : null
        setState({ owner: userId, loaded: true, saved })
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const loaded = current.loaded
  useEffect(() => {
    if (!userId || !loaded) return
    const json = JSON.stringify(progressRecord)
    writeCache(userId, json)
    if (json === serverCopy.current) return
    saveProgress(userId, progressRecord)
      .then(() => {
        serverCopy.current = json
      })
      .catch(() => {
        // The cached copy keeps this session's progress; the next change retries.
      })
  }, [userId, loaded, progressRecord])

  const progress = Math.round((completed.length / modules.length) * 100)

  function completeModule(id, evidence) {
    if (!moduleIds.has(id)) return
    const searchAssessment = id === 5 ? validateSearchCompletionEvidence(evidence) : null
    if (id === 5 && !searchAssessment) return
    const assessedTopic = getAssessmentTopic(id)
    const topicAssessment = assessedTopic ? validateTopicCompletionEvidence(id, evidence) : null
    if (assessedTopic && !topicAssessment) return

    setState((previous) => {
      // Ignore completions that arrive before this account's record has loaded.
      if (previous.owner !== userId || !previous.loaded) return previous
      const record = sanitizeProgress(previous.saved, moduleIds)
      if (record.completed.includes(id)) return previous
      return {
        ...previous,
        saved: {
          ...record,
          completed: [...record.completed, id],
          searchAssessment: id === 5 ? searchAssessment : record.searchAssessment,
          ...(topicAssessment
            ? { moduleAssessments: { ...record.moduleAssessments, [id]: topicAssessment } }
            : {}),
        },
      }
    })
  }

  return { completed, progress, loaded, completeModule }
}
