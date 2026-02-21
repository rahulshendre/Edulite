# Packets (no backend)

Packets are loaded from `packets.json` at app load. Assignments (School mode) come from `assignments.json`.

## packets.json

Add more packets by editing this file. **Format:** JSON array of packet objects. Each packet:

- `id` (string) — unique, e.g. `"packet-2"`
- `version` (number)
- `title`, `difficulty` (e.g. `"easy"`), `estimatedMinutes`, `syncBy` (null or ISO date)
- `content`: `{ "text": "...", "audio": null, "image": "/path.png", "videoRef": "https://..." }`
- `practice`, `assessment`: arrays of `{ "id", "type": "mcq", "question", "options": [], "correct": 0 }`

Copy the first object in `packets.json` and change fields to add a new packet.

## assignments.json (School mode)

JSON array of assignments. Each item: `{ "packetId": "packet-1", "syncBy": "2025-12-31T23:59:59Z", "courseName": "Math 101", "maxTier": null }`. Only packets listed here appear in School mode; `syncBy` is shown as "Sync by &lt;date&gt;".
