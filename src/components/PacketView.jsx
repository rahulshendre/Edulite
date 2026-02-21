import { useState, useEffect } from 'react'
import { getPacket, getProgress, saveProgress } from '../db'
import { CONTENT_TIERS } from '../constants/tiers'
import { getAllowedTierIds, getAllowedTierIdsWithMax, getEffectiveTier, capTierByMax, getStrictCapability } from '../utils/capability'
import { log } from '../utils/debug'

export default function PacketView({ packetId, assignment, defaultTier, onBack }) {
  const [packet, setPacket] = useState(null)
  const [progress, setProgress] = useState(null)
  const [contentTier, setContentTier] = useState(null)
  const [step, setStep] = useState('tier') // tier | content | practice | assessment | feedback | done
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const p = await getPacket(packetId)
      const prog = await getProgress(packetId)
      setPacket(p)
      setProgress(prog || null)
      if (prog?.answers) setAnswers(prog.answers)
      let nextStep = 'tier'
      if (prog?.status === 'completed') {
        setStep('done')
        setContentTier(prog.contentTier || 'textOnly')
        nextStep = 'done'
      } else if (prog?.contentTier) {
        setContentTier(prog.contentTier)
        setStep('content')
        nextStep = 'content'
      } else if (defaultTier) {
        const effective = assignment?.maxTier
          ? capTierByMax(getEffectiveTier(defaultTier), assignment.maxTier)
          : getEffectiveTier(defaultTier)
        setContentTier(effective)
        await saveProgress({
          packetId,
          status: 'in_progress',
          contentTier: effective,
          answers: {},
        })
        setProgress({ packetId, status: 'in_progress', contentTier: effective, answers: {} })
        setStep('content')
        nextStep = 'content'
      } else {
        setStep('tier')
      }
      setLoading(false)
      log('PacketView: load', { packetId, found: !!p, step: nextStep, assignmentMaxTier: assignment?.maxTier })
    }
    load()
  }, [packetId, defaultTier, assignment?.maxTier])

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleTierSelect = async (tierId) => {
    log('PacketView: tier selected', { packetId, tierId })
    setContentTier(tierId)
    await saveProgress({
      packetId,
      status: 'in_progress',
      contentTier: tierId,
      answers: progress?.answers ?? {},
    })
    setProgress((prev) => ({ ...prev, contentTier: tierId, status: 'in_progress' }))
    setStep('content')
  }

  const handleComplete = async () => {
    log('PacketView: completing', { packetId, contentTier })
    const completedAt = new Date().toISOString()
    await saveProgress({
      packetId,
      status: 'completed',
      contentTier,
      answers,
      completedAt,
      retryCount: (progress?.retryCount || 0) + 1,
    })
    setStep('feedback')
    log('PacketView: step → feedback')
  }

  const isCorrect = (q) => answers[q.id] === q.correct
  const opts = (q) => Array.isArray(q.options) ? q.options : []
  const yourAnswerText = (q) => {
    const o = opts(q)
    const idx = answers[q.id]
    return idx != null && o[idx] != null ? o[idx] : '—'
  }
  const correctAnswerText = (q) => {
    const o = opts(q)
    const idx = q.correct
    return idx != null && o[idx] != null ? o[idx] : '—'
  }

  if (loading) return <div className="loading">Loading…</div>
  if (!packet) {
    return (
      <div className="packet-view packet-not-found">
        <header>
          <button type="button" className="back" onClick={onBack} aria-label="Back to packet list">
            ← Back
          </button>
        </header>
        <p className="not-found-message">Packet not found.</p>
        <button type="button" className="btn primary" onClick={onBack}>
          Back to list
        </button>
      </div>
    )
  }

  const practice = packet.practice || []
  const assessment = packet.assessment || []
  let effectiveTier = contentTier ? getEffectiveTier(contentTier) : 'textOnly'
  if (assignment?.maxTier) effectiveTier = capTierByMax(effectiveTier, assignment.maxTier)
  const allowedKeys = CONTENT_TIERS[effectiveTier]?.keys ?? ['text']

  const showText = allowedKeys.includes('text')
  const showImage = allowedKeys.includes('image') && packet.content?.image
  const showAudio = allowedKeys.includes('audio') && packet.content?.audio
  const showVideo = allowedKeys.includes('videoRef') && packet.content?.videoRef

  const contentText = packet.content?.text || 'No content.'

  return (
    <div className="packet-view">
      <header>
        <button type="button" className="back" onClick={onBack} aria-label="Back to packet list">
          ← Back
        </button>
        <h1>{packet.title}</h1>
      </header>

      {step === 'tier' && (() => {
        const allowedTierIds = getAllowedTierIdsWithMax(assignment?.maxTier ?? null)
        const { reason } = getStrictCapability()
        return (
          <section className="tier-select">
            <h2>Content mode</h2>
            <p className="tier-capability">{reason}</p>
            {assignment?.maxTier && (
              <p className="tier-assignment-max">
                This assignment allows up to: {CONTENT_TIERS[assignment.maxTier]?.label ?? assignment.maxTier}.
              </p>
            )}
            <p className="tier-hint">Only options safe for your connection are shown.</p>
            <div className="tier-options">
              {allowedTierIds.map((tierId) => {
                const t = CONTENT_TIERS[tierId]
                return (
                  <button
                    key={tierId}
                    type="button"
                    className="tier-card"
                    onClick={() => handleTierSelect(tierId)}
                  >
                    <span className="tier-label">{t.label}</span>
                    <span className="tier-desc">{t.description}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })()}

      {step === 'content' && (
        <section className="content">
          {showText && (
            <div
              className="content-body"
              dangerouslySetInnerHTML={{
                __html: contentText
                  .replace(/\n/g, '<br/>')
                  .replace(/# (.*)/g, '<h2>$1</h2>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
              }}
            />
          )}
          {showImage && (
            <div className="content-media">
              <img src={packet.content.image} alt="" />
            </div>
          )}
          {showAudio && (
            <div className="content-media">
              <audio src={packet.content.audio} controls />
            </div>
          )}
          {showVideo && (
            <div className="content-media">
              <a href={packet.content.videoRef} target="_blank" rel="noopener noreferrer">
                Watch video (opens in new tab)
              </a>
            </div>
          )}
          <button type="button" className="primary" onClick={() => { log('PacketView: step → practice'); setStep('practice') }}>
            Start practice
          </button>
        </section>
      )}

      {step === 'practice' && (
        <section className="questions">
          <h2>Practice</h2>
          {practice.map((q, idx) => (
            <div key={q.id} className="question">
              <p>{idx + 1}. {q.question}</p>
              <div className="options">
                {q.options.map((opt, i) => (
                  <label key={i}>
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === i}
                      onChange={() => handleAnswer(q.id, i)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button type="button" className="primary" onClick={() => { log('PacketView: step → assessment'); setStep('assessment') }}>
            Continue to assessment
          </button>
        </section>
      )}

      {step === 'assessment' && (
        <section className="questions">
          <h2>Assessment</h2>
          {assessment.map((q, idx) => (
            <div key={q.id} className="question">
              <p>{idx + 1}. {q.question}</p>
              <div className="options">
                {q.options.map((opt, i) => (
                  <label key={i}>
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === i}
                      onChange={() => handleAnswer(q.id, i)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button type="button" className="primary" onClick={handleComplete}>
            Submit & complete
          </button>
        </section>
      )}

      {step === 'feedback' && (
        <section className="feedback">
          <h2>Your results</h2>
          {practice.length > 0 && (
            <>
              <h3>Practice</h3>
              <ul className="feedback-list">
                {practice.map((q, idx) => {
                  const correct = isCorrect(q)
                  return (
                    <li key={q.id} className={correct ? 'correct' : 'incorrect'}>
                      <span className="feedback-q">{idx + 1}. {q.question}</span>
                      <span className="feedback-your">Your answer: {yourAnswerText(q)}</span>
                      {!correct && (
                        <span className="feedback-correct">Correct: {correctAnswerText(q)}</span>
                      )}
                      <span className="feedback-icon" aria-hidden>{correct ? '✓' : '✗'}</span>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
          {assessment.length > 0 && (
            <>
              <h3>Assessment</h3>
              <ul className="feedback-list">
                {assessment.map((q, idx) => {
                  const correct = isCorrect(q)
                  return (
                    <li key={q.id} className={correct ? 'correct' : 'incorrect'}>
                      <span className="feedback-q">{idx + 1}. {q.question}</span>
                      <span className="feedback-your">Your answer: {yourAnswerText(q)}</span>
                      {!correct && (
                        <span className="feedback-correct">Correct: {correctAnswerText(q)}</span>
                      )}
                      <span className="feedback-icon" aria-hidden>{correct ? '✓' : '✗'}</span>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
          <p className="feedback-saved">Progress saved offline.</p>
          <button type="button" className="primary" onClick={onBack}>
            Back to list
          </button>
        </section>
      )}

      {step === 'done' && (
        <section className="done">
          <p>Packet completed. Progress saved offline.</p>
          <button type="button" className="primary" onClick={onBack}>
            Back to list
          </button>
        </section>
      )}
    </div>
  )
}
