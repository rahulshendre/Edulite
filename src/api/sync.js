/**
 * Sync API placeholder. Replace with real backend calls when ready.
 * - pushProgress(localProgress) → send to server
 * - pullPackets() → fetch new/updated packets, return array to save to IndexedDB
 */

import { getAllProgress } from '../db'

/**
 * Push local progress to backend and pull new packets.
 * @returns {{ success: boolean, message: string, pulledPackets?: array }}
 */
export async function syncNow() {
  // TODO: replace with real API
  const progress = await getAllProgress()
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 800))
  // Placeholder: no backend yet
  return {
    success: true,
    message: 'Sync placeholder — backend not connected. Progress is saved offline.',
    pushedCount: progress.length,
    pulledPackets: [],
  }
}
