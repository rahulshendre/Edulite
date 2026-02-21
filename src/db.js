import Dexie from 'dexie'

export const db = new Dexie('EduLiteDB')

db.version(1).stores({
  packets: 'id, version, difficulty, estimatedMinutes',
  progress: 'packetId, status, completedAt',
})

db.version(2).stores({
  packets: 'id, version, difficulty, estimatedMinutes',
  progress: '[userId+packetId], userId, packetId, status, completedAt',
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
  if (!progress.userId) throw new Error('saveProgress requires userId')
  await db.progress.put(progress)
}

export async function getProgress(userId, packetId) {
  if (!userId) return null
  return db.progress.where('[userId+packetId]').equals([userId, packetId]).first()
}

export async function getAllProgress(userId) {
  if (!userId) return []
  return db.progress.where('userId').equals(userId).toArray()
}
