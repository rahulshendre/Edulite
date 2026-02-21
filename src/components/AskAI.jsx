import { useState, useEffect, useRef } from 'react'
import { askGemini, isGeminiConfigured } from '../api/gemini'
import { getPacketInLocale } from '../utils/translate'
import { getPreferredLocale } from '../constants/locales'

export default function AskAI({ open, onClose, openPacketId, locale: localeProp }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState('')
  const messagesEndRef = useRef(null)
  const locale = localeProp ?? getPreferredLocale()

  useEffect(() => {
    if (!open || !openPacketId) {
      setContext('')
      return
    }
    let cancelled = false
    getPacketInLocale(openPacketId, locale).then((packet) => {
      if (cancelled || !packet) return
      const title = packet.title || ''
      const text = packet.content?.text ? packet.content.text.replace(/\n/g, ' ').slice(0, 1500) : ''
      setContext(title && text ? `${title}\n\n${text}` : title || '')
    })
    return () => { cancelled = true }
  }, [open, openPacketId, locale])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text }])
    setLoading(true)
    try {
      const reply = await askGemini(text, { context: context || undefined, locale: locale !== 'en' ? locale : undefined })
      setMessages((prev) => [...prev, { role: 'model', text: reply }])
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'model', text: e?.message || 'Something went wrong.' }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const configured = isGeminiConfigured()

  return (
    <div className="ask-ai-panel">
      <div className="ask-ai-header">
        <h2>Ask AI</h2>
        <button type="button" className="ask-ai-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      {!configured && (
        <p className="ask-ai-notice">Add VITE_GEMINI_API_KEY to .env to use Ask AI.</p>
      )}
      <div className="ask-ai-messages">
        {messages.length === 0 && configured && (
          <p className="ask-ai-placeholder">Ask a question about your lesson. I’ll try to help.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`ask-ai-msg ask-ai-msg--${m.role}`}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="ask-ai-msg ask-ai-msg--model ask-ai-typing">Thinking…</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="ask-ai-input-row">
        <input
          type="text"
          className="ask-ai-input"
          placeholder="Ask something…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          disabled={!configured || loading}
        />
        <button
          type="button"
          className="ask-ai-send"
          onClick={handleSend}
          disabled={!configured || loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  )
}
