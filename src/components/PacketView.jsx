import { useState, useEffect } from 'react'
import { getPacket, getProgress, saveProgress } from '../db'
import { CONTENT_TIERS } from '../constants/tiers'
import { getAllowedTierIds, getEffectiveTier, getStrictCapability } from '../utils/capability'

export default function PacketView({ packetId, onBack }) {
  const [packet, setPacket] = useState(null)
  const [progress, setProgress] = useState(null)
  const [contentTier, setContentTier] = useState(null)
  const [step, setStep] = useState('tier') // tier | content | practice | assessment | done
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const p = await getPacket(packetId)
      const prog = await getProgress(packetId)
      setPacket(p)
      setProgress(prog || null)
      if (prog?.answers) setAnswers(prog.answers)
      if (prog?.status === 'completed') {
        setStep('done')
        setContentTier(prog.contentTier || 'textOnly')
      } else if (prog?.contentTier) {
        setContentTier(prog.contentTier)
        setStep('content')
      } else {
        setStep('tier')
      }
      setLoading(false)
    }
    load()
  }, [packetId])

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleTierSelect = async (tierId) => {
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
    const completedAt = new Date().toISOString()
    await saveProgress({
      packetId,
      status: 'completed',
      contentTier,
      answers,
      completedAt,
      retryCount: (progress?.retryCount || 0) + 1,
    })
    setStep('done')
  }

  if (loading || !packet) return <div className="loading">Loading…</div>

  const practice = packet.practice || []
  const assessment = packet.assessment || []
  const effectiveTier = contentTier ? getEffectiveTier(contentTier) : 'textOnly'
  const allowedKeys = CONTENT_TIERS[effectiveTier]?.keys ?? ['text']

  const showText = allowedKeys.includes('text')
  const showImage = allowedKeys.includes('image') && packet.content?.image
  const showAudio = allowedKeys.includes('audio') && packet.content?.audio
  const showVideo = allowedKeys.includes('videoRef') && packet.content?.videoRef

  const contentText = packet.content?.text || 'No content.'

  return (
    <div className="packet-view">
      <header>
        <button type="button" className="back" onClick={onBack}>
          ← Back
        </button>
        <h1>{packet.title}</h1>
      </header>

      {step === 'tier' && (() => {
        const allowedTierIds = getAllowedTierIds()
        const { reason } = getStrictCapability()
        return (
          <section className="tier-select">
            <h2>Content mode</h2>
            <p className="tier-capability">{reason}</p>
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
          <button type="button" className="primary" onClick={() => setStep('practice')}>
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
          <button type="button" className="primary" onClick={() => setStep('assessment')}>
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
