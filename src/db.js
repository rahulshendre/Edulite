import Dexie from 'dexie'

export const db = new Dexie('LearningPacketsDB')

db.version(1).stores({
  packets: 'id, version, difficulty, estimatedMinutes',
  progress: 'packetId, status, completedAt',
})

export async function savePacket(packet) {
  await db.packets.put(packet)
}

export async function getPacket(id) {
  return db.packets.get(id)
}

export async function getAllPackets() {
  return db.packets.toArray()
}

export async function saveProgress(progress) {
  await db.progress.put(progress)
}

export async function getProgress(packetId) {
  return db.progress.where('packetId').equals(packetId).first()
}

export async function getAllProgress() {
  return db.progress.toArray()
}
