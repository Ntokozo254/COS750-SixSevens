const VARK_MODES = ['visual', 'aural', 'read-write', 'kinesthetic']

export function getLearningPreference(answers) {
  const scores = Object.fromEntries(VARK_MODES.map((mode) => [mode, 0]))
  for (const answer of answers) {
    if (Object.hasOwn(scores, answer)) scores[answer] += 1
  }

  const highestScore = Math.max(...Object.values(scores))
  const leaders = VARK_MODES.filter((mode) => scores[mode] === highestScore)
  return leaders.length === 1 ? leaders[0] : 'multimodal'
}