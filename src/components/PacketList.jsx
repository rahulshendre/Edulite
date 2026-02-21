import { useState, useEffect } from 'react'
import { getAllPackets, savePacket, getAllProgress } from '../db'
import { samplePacket } from '../data/samplePacket'
import { syncNow } from '../api/sync'
import { log, logError } from '../utils/debug'

const PACKETS_JSON_URL = '/packets/packets.json'
const ASSIGNMENTS_JSON_URL = '/packets/assignments.json'

export default function PacketList({ mode, onOpenPacket, onChangeContentMode }) {
  const [packets, setPackets] = useState([])
  const [assignments, setAssignments] = useState([]) // { packetId, syncBy, courseName, maxTier? }[]
  const [progressMap, setProgressMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | done | error
  const [syncMessage, setSyncMessage] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(PACKETS_JSON_URL)
        if (res.ok) {
          const packetsFromJson = await res.json()
          if (Array.isArray(packetsFromJson) && packetsFromJson.length > 0) {
            for (const p of packetsFromJson) await savePacket(p)
            log('PacketList: loaded from JSON', { count: packetsFromJson.length })
          } else {
            await savePacket(samplePacket)
            log('PacketList: JSON empty/invalid, using sample packet')
          }
        } else {
          await savePacket(samplePacket)
          log('PacketList: fetch not ok', res.status, ', using sample packet')
        }
      } catch (e) {
        logError('PacketList: load error', e)
        await savePacket(samplePacket)
      }
      const list = await getAllPackets()
      setPackets(list)
      const progress = await getAllProgress()
      const map = {}
      progress.forEach((p) => (map[p.packetId] = p))
      setProgressMap(map)
      setLoading(false)
      log('PacketList: ready', { packets: list.length, progressCount: progress.length })
    }
    load()
  }, [])

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

  const assignmentByPacketId = assignments.reduce((acc, a) => ({ ...acc, [a.packetId]: a }), {})
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
    setSyncStatus('syncing')
    setSyncMessage('')
    log('PacketList: sync started')
    try {
      const result = await syncNow()
      setSyncStatus('done')
      setSyncMessage(result.message || (result.success ? 'Synced.' : 'Sync failed.'))
      log('PacketList: sync done', { success: result.success, message: result.message, pushedCount: result.pushedCount, pulledCount: result.pulledPackets?.length ?? 0 })
      if (result.pulledPackets?.length) {
        const { savePacket } = await import('../db')
        for (const p of result.pulledPackets) await savePacket(p)
        const list = await getAllPackets()
        setPackets(list)
      }
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
      <h1>{mode === 'school' ? 'School mode' : 'Study mode'}</h1>
      <p className="subtitle">
        {mode === 'school'
          ? 'Assigned packets. Sync your progress before the sync-by date.'
          : 'Tap a packet to learn offline.'}
      </p>
      {onChangeContentMode && (
        <button type="button" className="change-content-mode" onClick={onChangeContentMode}>
          Change content mode
        </button>
      )}
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
                <span className="title">{p.title}</span>
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
