import { useId, useState } from 'react'
import { CheckCircle2, Code2, FlaskConical, Lock, Map, Target } from 'lucide-react'
import CodeWorkspace from '../features/practice/CodeWorkspace'
import PracticeSandbox from '../features/practice/PracticeSandbox'
import { PRACTICE_CHALLENGES, PRACTICE_STAGES } from '../features/practice/practiceChallenges'
import {
  createPracticeReceipt,
  nextChallengeId,
  readPracticeState,
  stageStatus,
  writePracticeState,
} from '../features/practice/practiceLogic'
import '../features/practice/practice.css'

export default function PracticeLab({ preferences = {}, learnerId = 'local' }) {
  const id = useId()
  const [saved, setSaved] = useState(() => readPracticeState(learnerId))
  const [activeId, setActiveId] = useState(() => {
    const restored = readPracticeState(learnerId)
    return PRACTICE_CHALLENGES.find(challenge => !restored.receipts[challenge.id] && stageStatus(challenge.stageId, restored.receipts) !== 'locked')?.id ?? PRACTICE_CHALLENGES[0].id
  })
  const [mode, setMode] = useState('path')
  const [storageAvailable, setStorageAvailable] = useState(true)
  const challenge = PRACTICE_CHALLENGES.find(item => item.id === activeId)
  const solved = Object.keys(saved.receipts).length
  const source = saved.drafts[activeId] ?? saved.receipts[activeId]?.source ?? challenge.starterCode

  function commit(next) {
    setSaved(next)
    setStorageAvailable(writePracticeState(learnerId, next))
  }

  function saveDraft(code) {
    commit({ ...saved, drafts: { ...saved.drafts, [activeId]: code } })
  }

  function accept(code, runs) {
    const receipt = createPracticeReceipt(challenge, code, runs)
    if (!receipt) return
    commit({ ...saved, drafts: { ...saved.drafts, [activeId]: code }, receipts: { ...saved.receipts, [activeId]: receipt } })
  }

  function next() {
    const nextId = nextChallengeId(activeId, saved.receipts)
    if (nextId === activeId) setMode('sandbox')
    else setActiveId(nextId)
  }

  return (
    <div className="content-wrap practice-lab">
      <div className="page-intro">
        <div className="eyebrow">LEARN BY DOING</div>
        <h1>Your practice space.</h1>
        <p>Turn hash-table ideas into working code. Begin with small calculations, build an insertion algorithm, then tackle searching, rehashing, and clustering.</p>
      </div>
      <section className="practice-overview" aria-label="Practice Lab overview">
        <div className="practice-overview-copy"><span className="mini-icon"><Code2 size={21} /></span><div><h2>A path from beginner to advanced</h2><p>Original coding problems · Untimed · Unlimited retries · JavaScript</p></div></div>
        <div className="practice-progress"><strong>{solved} / {PRACTICE_CHALLENGES.length}</strong><span>coding challenges accepted</span><progress value={solved} max={PRACTICE_CHALLENGES.length} aria-label="Accepted coding challenges" /></div>
      </section>
      {!storageAvailable && <p className="practice-storage-note" role="status">Browser storage is unavailable. Your code and accepted results remain available for this visit.</p>}
      <nav className="practice-modes" aria-label="Practice Lab activities">
        <button type="button" aria-current={mode === 'path' ? 'page' : undefined} onClick={() => setMode('path')}><Map size={16} /> Coding path</button>
        <button type="button" aria-current={mode === 'sandbox' ? 'page' : undefined} onClick={() => setMode('sandbox')}><FlaskConical size={16} /> Experiment sandbox</button>
      </nav>
      <div hidden={mode !== 'path'}>
        <section className="practice-path" aria-labelledby={`${id}-map`}>
          <div className="practice-section-heading"><div><span className="eyebrow">YOUR LEARNING MAP</span><h2 id={`${id}-map`}>One stage at a time</h2></div><p>Pass every coding check for both problems in a stage to unlock the next.</p></div>
          <ol className="practice-stage-map">{PRACTICE_STAGES.map((stage, index) => {
            const status = stageStatus(stage.id, saved.receipts)
            return <li className="practice-stage" key={stage.id} data-status={status}>
              <div className="practice-stage-heading"><span className="practice-stage-number">{status === 'complete' ? <CheckCircle2 size={20} aria-label="Complete" /> : status === 'locked' ? <Lock size={17} aria-label="Locked" /> : index + 1}</span><div><span>{stage.level} · Stage {index + 1}</span><h3>{stage.title}</h3></div></div>
              <p>{stage.description}</p>
              <ol>{stage.challengeIds.map(challengeId => {
                const item = PRACTICE_CHALLENGES.find(challenge => challenge.id === challengeId)
                return <li key={item.id}><button type="button" disabled={status === 'locked'} aria-current={activeId === item.id ? 'step' : undefined} onClick={() => setActiveId(item.id)}>{saved.receipts[item.id] ? <CheckCircle2 size={15} aria-label="Accepted" /> : <Code2 size={15} aria-hidden="true" />}<span>{item.title}</span></button></li>
              })}</ol>
              <span className="practice-stage-status">{status === 'complete' ? 'Stage complete — revisit any problem' : status === 'locked' ? 'Complete the earlier stages to unlock' : 'Open — choose either problem'}</span>
            </li>
          })}</ol>
        </section>
        <div className="practice-learning-note"><Target size={19} /><p>Read the problem, predict the result, then code. Use a worked snippet or a hint when you need support. Running examples and reading solutions do not mark a challenge complete.</p></div>
        {solved === PRACTICE_CHALLENGES.length && <div className="practice-all-complete" role="status"><CheckCircle2 size={20} /><p>Every coding challenge is accepted. Revisit a problem, or test your own ideas in the sandbox.</p></div>}
        <CodeWorkspace
          key={activeId}
          challenge={challenge}
          source={source}
          onChange={saveDraft}
          accepted={saved.receipts[activeId]}
          onAccepted={accept}
          onNext={next}
          active={mode === 'path'}
        />
      </div>
      <div hidden={mode !== 'sandbox'}><PracticeSandbox preferences={preferences} /></div>
    </div>
  )
}
