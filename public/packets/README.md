# Packets (no backend)

Packets are loaded from `packets.json` at app load. Add more by editing that file.

**Format:** JSON array of packet objects. Each packet:

- `id` (string) — unique, e.g. `"packet-2"`
- `version` (number)
- `title`, `difficulty` (e.g. `"easy"`), `estimatedMinutes`, `syncBy` (null or ISO date)
- `content`: `{ "text": "...", "audio": null, "image": "/path.png", "videoRef": "https://..." }`
- `practice`, `assessment`: arrays of `{ "id", "type": "mcq", "question", "options": [], "correct": 0 }`

Copy the first object in `packets.json` and change fields to add a new packet.
