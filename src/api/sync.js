import { getAllProgress } from '../db'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { log, logError } from '../utils/debug'

function toSupabaseRow(p) {
  return {
    user_id: p.userId,
    packet_id: p.packetId,
    status: p.status,
    content_tier: p.contentTier ?? null,
    answers: p.answers ?? {},
    completed_at: p.completedAt ?? null,
    retry_count: p.retryCount ?? 0,
  }
}

/**
 * Push local progress to backend and pull new packets.
 * School users: pushes to Supabase. Study users: placeholder.
 * @param {string} userId - Current user id.
 * @param {{ path?: string }} options - user.path === 'school' uses Supabase
 * @returns {{ success: boolean, message: string, pushedCount?: number, pulledPackets?: array }}
 */
export async function syncNow(userId, options = {}) {
  log('sync: start', { userId, path: options.path })
  if (!userId) return { success: false, message: 'Not signed in.', pushedCount: 0, pulledPackets: [] }

  const progress = await getAllProgress(userId)

  if (options.path === 'school' && isSupabaseConfigured() && supabase) {
    try {
      const rows = progress.map(toSupabaseRow)
      for (const row of rows) {
        const { error } = await supabase.from('progress').upsert(row, {
          onConflict: 'user_id,packet_id',
        })
        if (error) throw error
      }
      log('sync: pushed to Supabase', { count: rows.length })
      return {
        success: true,
        message: `Synced ${rows.length} packet(s).`,
        pushedCount: rows.length,
        pulledPackets: [],
      }
    } catch (e) {
      logError('sync: Supabase push failed', e)
      return {
        success: false,
        message: e?.message || 'Sync failed.',
        pushedCount: 0,
        pulledPackets: [],
      }
    }
  }

  await new Promise((r) => setTimeout(r, 400))
  return {
    success: true,
    message: 'Progress saved offline.',
    pushedCount: progress.length,
    pulledPackets: [],
  }
}
