import { useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Check, Ear, Eye, Hand, PencilLine } from 'lucide-react'
import { getLearningPreference } from '../../logic/learningCheckIn.js'
import './learningCheckIn.css'

const questions = [
  {
    prompt: 'You are meeting hash tables for the first time. What would help you get started?',
    options: [
      { mode: 'visual', label: 'See a diagram of keys moving into buckets', Icon: Eye },
      { mode: 'aural', label: 'Hear someone explain the idea and talk it through', Icon: Ear },
      { mode: 'read-write', label: 'Read a clear explanation and write a few notes', Icon: PencilLine },
      { mode: 'kinesthetic', label: 'Try inserting a few keys in an interactive table', Icon: Hand },
    ],
  },
  {
    prompt: 'A search hits a collision. What would you try first to understand what happens next?',
    options: [
      { mode: 'visual', label: 'Follow the highlighted path through the table', Icon: Eye },
      { mode: 'aural', label: 'Explain the next step aloud, or listen to an explanation', Icon: Ear },
      { mode: 'read-write', label: 'Read the steps and annotate where the search stops', Icon: PencilLine },
      { mode: 'kinesthetic', label: 'Change the key and test the search yourself', Icon: Hand },
    ],
  },
  {
    prompt: 'When an algorithm has several steps, which study activity sounds most useful?',
    options: [
      { mode: 'visual', label: 'Sketch the steps as a sequence or flow', Icon: Eye },
      { mode: 'aural', label: 'Discuss the steps with a classmate', Icon: Ear },
      { mode: 'read-write', label: 'Turn the steps into a short written summary', Icon: PencilLine },
      { mode: 'kinesthetic', label: 'Work through an example one step at a time', Icon: Hand },
    ],
  },
  {
    prompt: 'How would you most like to check your understanding?',
    options: [
      { mode: 'visual', label: 'Look at a completed trace and spot the pattern', Icon: Eye },
      { mode: 'aural', label: 'Describe the result and explain why it is correct', Icon: Ear },
      { mode: 'read-write', label: 'Answer a short written question', Icon: PencilLine },
      { mode: 'kinesthetic', label: 'Solve a small challenge and see what happens', Icon: Hand },
    ],
  },
]

const results = {
  visual: ['Visual approaches stood out', 'Start with the diagrams and follow the highlighted search paths. You can switch approaches any time.'],
  aural: ['Talking it through stood out', 'Try explaining each search step aloud. Read-aloud controls are available in Settings if you want them.'],
  'read-write': ['Reading and writing stood out', 'Start with the written explanations, then summarize the search rules in your own words.'],
  kinesthetic: ['Hands-on practice stood out', 'Try the interactive examples and predict each next step before you advance.'],
  multimodal: ['A mix of approaches stood out', 'HashLab combines explanations, diagrams, and practice. Try a few and keep what works for you.'],
}

export default function LearningCheckIn({ onComplete, onSkip }) {
  const [answers, setAnswers] = useState(Array(questions.length).fill(''))
  const [questionIndex, setQuestionIndex] = useState(0)
  const [resultMode, setResultMode] = useState('')
  const currentQuestion = questions[questionIndex]
  const result = resultMode ? results[resultMode] : null

  function choose(mode) {
    setAnswers((current) => current.map((answer, index) => index === questionIndex ? mode : answer))
  }

  function continueCheckIn() {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((current) => current + 1)
      return
    }
    setResultMode(getLearningPreference(answers))
  }

  return (
    <main className="learning-checkin" aria-labelledby="learning-checkin-title">
      <header className="checkin-header">
        <div className="checkin-brand" aria-label="HashLab">
          <span className="checkin-brand-icon"><BookOpen size={19} aria-hidden="true" /></span>
          <span>HashLab</span>
        </div>
        {!result && <button className="checkin-skip" type="button" onClick={onSkip}>Skip for now</button>}
      </header>

      <section className="checkin-content">
        {result ? (
          <div className="checkin-result">
            <div className="checkin-result-icon"><Check size={23} aria-hidden="true" /></div>
            <p className="checkin-eyebrow">YOUR STARTING POINT</p>
            <h1 id="learning-checkin-title">{result[0]}</h1>
            <p className="checkin-description">{result[1]}</p>
            <p className="checkin-note">This is a quick snapshot of your preferences, not a test of ability or a verdict on whether this software is right for you. Learning preferences can vary by topic and over time.</p>
            <button className="checkin-primary" type="button" onClick={() => onComplete(resultMode)}>Start learning <ArrowRight size={17} aria-hidden="true" /></button>
          </div>
        ) : (
          <>
            <div className="checkin-progress-row">
              <span className="checkin-eyebrow">A QUICK LEARNING CHECK-IN</span>
              <span className="checkin-step">{questionIndex + 1} <span>/ {questions.length}</span></span>
            </div>
            <div className="checkin-progress-track" aria-hidden="true"><span style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div>
            <p className="checkin-overline">Choose what sounds most helpful</p>
            <h1 id="learning-checkin-title">{currentQuestion.prompt}</h1>
            <fieldset className="checkin-options">
              <legend className="sr-only">Select one learning approach</legend>
              {currentQuestion.options.map(({ mode, label, Icon }) => (
                <label key={mode} className={`checkin-option ${answers[questionIndex] === mode ? 'is-selected' : ''}`}>
                  <input type="radio" name={`checkin-${questionIndex}`} value={mode} checked={answers[questionIndex] === mode} onChange={() => choose(mode)} />
                  <span className="checkin-option-icon"><Icon size={20} aria-hidden="true" /></span>
                  <span className="checkin-option-label">{label}</span>
                  <span className="checkin-option-check" aria-hidden="true"><Check size={14} /></span>
                </label>
              ))}
            </fieldset>
            <div className="checkin-actions">
              <button className="checkin-back" type="button" onClick={() => setQuestionIndex((current) => current - 1)} disabled={questionIndex === 0}><ArrowLeft size={16} aria-hidden="true" />Back</button>
              <button className="checkin-primary" type="button" onClick={continueCheckIn} disabled={!answers[questionIndex]}>{questionIndex === questions.length - 1 ? 'See my suggestions' : 'Continue'}<ArrowRight size={17} aria-hidden="true" /></button>
            </div>
            <p className="checkin-footnote">No right or wrong answers. You can change your preference later in Settings.</p>
          </>
        )}
      </section>
    </main>
  )
}