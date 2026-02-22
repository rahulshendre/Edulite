import { useState, useEffect } from 'react'
import { getAllPackets, savePacket, getAllProgress } from '../db'
import { getPacketInLocale } from '../utils/translate'
import { samplePacket } from '../data/samplePacket'
import { syncNow } from '../api/sync'
import { log, logError } from '../utils/debug'

const PACKETS_JSON_URL = (typeof import.meta.env?.BASE_URL === 'string' ? import.meta.env.BASE_URL : '') + 'packets/packets.json'
const ASSIGNMENTS_JSON_URL = (typeof import.meta.env?.BASE_URL === 'string' ? import.meta.env.BASE_URL : '') + 'packets/assignments.json'

export default function PacketList({ userId, userPath, mode, subject, onOpenPacket, onChangeContentMode, onChangeSubject, locale }) {
  const [packets, setPackets] = useState([])
  const [assignments, setAssignments] = useState([]) // { packetId, syncBy, courseName, maxTier? }[]
  const [progressMap, setProgressMap] = useState({})
  const [titleMap, setTitleMap] = useState({}) // packetId -> translated title (from cache)
  const [loading, setLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | done | error
  const [syncMessage, setSyncMessage] = useState('')

  useEffect(() => {
    async function load() {
      let list = await getAllPackets()
      try {
        const res = await fetch(PACKETS_JSON_URL)
        if (res.ok) {
          const packetsFromJson = await res.json()
          if (Array.isArray(packetsFromJson) && packetsFromJson.length > 0) {
            for (const p of packetsFromJson) await savePacket(p)
            list = await getAllPackets()
            log('PacketList: loaded from JSON', { count: packetsFromJson.length })
          } else if (list.length === 0) {
            await savePacket(samplePacket)
            list = await getAllPackets()
            log('PacketList: JSON empty/invalid, using sample packet')
          }
        } else {
          if (list.length === 0) {
            await savePacket(samplePacket)
            list = await getAllPackets()
            log('PacketList: fetch not ok', res.status, ', using sample packet')
          } else {
            log('PacketList: fetch not ok, using cached packets', { cached: list.length })
          }
        }
      } catch (e) {
        logError('PacketList: load error', e)
        if (list.length === 0) {
          await savePacket(samplePacket)
          list = await getAllPackets()
          log('PacketList: using sample packet after error')
        } else {
          log('PacketList: using cached packets after error', { cached: list.length })
        }
      }
      setPackets(list)
      const progress = userId ? await getAllProgress(userId) : []
      const map = {}
      progress.forEach((p) => (map[p.packetId] = p))
      setProgressMap(map)
      setLoading(false)
      log('PacketList: ready', { packets: list.length, progressCount: progress.length })
    }
    load()
  }, [userId])

  useEffect(() => {
    if (mode !== 'school') return
    let cancelled = false
    fetch(ASSIGNMENTS_JSON_URL)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setAssignments(data)
          log('PacketList: assignments loaded', { count: data.length })
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setAssignments([])
          logError('PacketList: assignments fetch error', e)
        }
      })
    return () => { cancelled = true }
  }, [mode])

  // Preload full translation for each packet (cache or API) so list shows all titles in locale
  useEffect(() => {
    if (!locale || locale === 'en' || !packets.length) {
      setTitleMap({})
      return
    }
    let cancelled = false
    packets.forEach(async (p) => {
      const translated = await getPacketInLocale(p.id, locale)
      if (cancelled) return
      setTitleMap((prev) => ({ ...prev, [p.id]: translated?.title ?? p.title }))
    })
    return () => { cancelled = true }
  }, [locale, packets])

  const filteredAssignments = subject
    ? assignments.filter((a) => a.subject === subject)
    : assignments
  const assignmentByPacketId = filteredAssignments.reduce((acc, a) => ({ ...acc, [a.packetId]: a }), {})
  const displayPackets = mode === 'school'
    ? packets.filter((p) => assignmentByPacketId[p.id])
    : packets
  const formatSyncBy = (iso) => {
    if (!iso) return ''
    try {
      const d = new Date(iso)
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return iso
    }
  }

  async function handleSync() {
    if (!userId) return
    setSyncStatus('syncing')
    setSyncMessage('')
    log('PacketList: sync started')
    try {
      const result = await syncNow(userId, { path: userPath })
      setSyncStatus('done')
      setSyncMessage(result.message || (result.success ? 'Synced.' : 'Sync failed.'))
      log('PacketList: sync done', { success: result.success, message: result.message, pushedCount: result.pushedCount, pulledCount: result.pulledPackets?.length ?? 0 })
      if (result.pulledPackets?.length) {
        const { savePacket } = await import('../db')
        for (const p of result.pulledPackets) await savePacket(p)
        const list = await getAllPackets()
        setPackets(list)
      }
      const progress = await getAllProgress(userId)
      const map = {}
      progress.forEach((p) => (map[p.packetId] = p))
      setProgressMap(map)
    } catch (e) {
      setSyncStatus('error')
      setSyncMessage(e.message || 'Sync failed.')
      logError('PacketList: sync error', e)
    }
    setTimeout(() => setSyncStatus('idle'), 3000)
  }

  if (loading) return <div className="loading">Loading…</div>

  return (
    <div className="packet-list">
      <h1>{mode === 'school' ? (subject ? `${subject}` : 'School mode') : 'Study mode'}</h1>
      <p className="subtitle">
        {mode === 'school'
          ? 'Assigned packets. Sync your progress before the sync-by date.'
          : 'Tap a packet to learn offline.'}
      </p>
      <div className="packet-list-actions">
        {onChangeContentMode && (
          <button type="button" className="change-content-mode" onClick={onChangeContentMode}>
            Change content mode
          </button>
        )}
        {onChangeSubject && (
          <button type="button" className="change-subject" onClick={onChangeSubject}>
            Change subject
          </button>
        )}
      </div>
      <p className="sync-hint">Progress is saved on your device. Sync when you have connection to send it to your school.</p>
      <div className="sync-row">
        <button
          type="button"
          className="sync-btn"
          onClick={handleSync}
          disabled={syncStatus === 'syncing'}
        >
          {syncStatus === 'syncing' ? 'Syncing…' : 'Sync now'}
        </button>
        {syncMessage && (
          <p className={`sync-message ${syncStatus === 'error' ? 'sync-error' : ''}`}>
            {syncMessage}
          </p>
        )}
      </div>
      <ul role="list">
        {displayPackets.length === 0 ? (
          <li className="empty-state">
            <p>{mode === 'school' ? 'No assignments yet.' : 'No packets available.'}</p>
          </li>
        ) : displayPackets.map((p) => {
          const prog = progressMap[p.id]
          const assignment = assignmentByPacketId[p.id]
          return (
            <li key={p.id}>
              <button
                type="button"
                className="packet-card"
                onClick={() => onOpenPacket(p.id, mode === 'school' ? assignment : null)}
              >
                {mode === 'school' && assignment?.courseName && (
                  <span className="course-name">{assignment.courseName}</span>
                )}
                <span className="title">{titleMap[p.id] ?? p.title}</span>
                <span className="meta">
                  {p.estimatedMinutes} min · {p.difficulty}
                  {mode === 'school' && assignment?.syncBy && (
                    <> · Sync by {formatSyncBy(assignment.syncBy)}</>
                  )}
                </span>
                {prog?.status === 'completed' && (
                  <span className="badge">Done</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
