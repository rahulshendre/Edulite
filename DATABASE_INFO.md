# EduLite — Database & Storage

This document describes all persistent storage used by EduLite: client-side (IndexedDB, localStorage, sessionStorage), intended backend (MongoDB), and how they connect.

---

## 1. Client-Side Storage (Current)

### 1.1 IndexedDB (Dexie — `EduLiteDB`)

**Library:** Dexie.js  
**Database name:** `EduLiteDB`  
**Location:** `src/db.js`

#### Stores (Schema)

| Store      | Primary Key           | Indexes                                      | Purpose |
|------------|------------------------|----------------------------------------------|---------|
| `packets`  | `id`                   | `id, version, difficulty, estimatedMinutes`  | Packet content (title, content, practice, assessment, metadata). Loaded from `/packets/packets.json` and/or backend. |
| `progress` | `[userId+packetId]`   | `userId`, `packetId`, `status`, `completedAt`| Per-user progress: status, contentTier, answers, completedAt, retryCount. |

**Version history:**
- **v1:** `packets` by `id`; `progress` by `packetId` only (no user scoping).
- **v2:** `progress` compound key `[userId+packetId]` and index on `userId` for per-user progress.

#### Packet Document Shape (in `packets`)

- `id` (string): Unique packet id (e.g. `packet-1`).
- `version` (number): Schema version for migrations.
- `title`, `difficulty`, `estimatedMinutes`, `syncBy` (optional).
- `content`: `{ text, audio?, image?, videoRef? }`.
- `practice`: Array of `{ id, type, question, options, correct }`.
- `assessment`: Same shape as practice.

#### Progress Document Shape (in `progress`)

- `userId` (string): From auth; required.
- `packetId` (string): Packet id.
- `status`: `'in_progress'` | `'completed'`.
- `contentTier`: `'textOnly'` | `'textAndImages'` | `'full'`.
- `answers`: `{ [questionId]: selectedOptionIndex }`.
- `completedAt` (ISO string): When status became `'completed'`.
- `retryCount` (number, optional): Number of completions/retries.

#### API (from `src/db.js`)

- `savePacket(packet)` — Put one packet.
- `getPacket(id)` — Get one packet by id.
- `getAllPackets()` — All packets (for list).
- `saveProgress(progress)` — Put progress (must include `userId`).
- `getProgress(userId, packetId)` — One user's progress for a packet.
- `getAllProgress(userId)` — All progress rows for a user (for profile count and sync).

---

### 1.2 localStorage

| Key                     | Set By              | Purpose |
|-------------------------|---------------------|---------|
| `edulite_user`          | `src/utils/auth.js` | Logged-in user: `{ id, name?, studentId?, path, role, grNo?, teacherId?, loggedIn }`. Used for auth and `userId` for progress. |
| `edulite_defaultTier`   | `src/utils/prefs.js`| Default content tier: `'textOnly'` \| `'textAndImages'` \| `'full'`. Cleared on "Change content mode" and logout. |

---

### 1.3 sessionStorage

| Key                     | Purpose |
|-------------------------|---------|
| `edulite_path`          | Path choice before login: `'school'` \| `'study'`. Cleared on logout. |
| `edulite_school_role`   | School role before login: `'student'` \| `'teacher'`. Cleared on logout. |

---

## 2. Static Data (No DB)

- **Packets (initial load):** `public/packets/packets.json` — Array of packet objects. Fetched at app load; merged into IndexedDB `packets` store.
- **Assignments (school mode):** `public/packets/assignments.json` — Array of `{ packetId, syncBy, courseName, maxTier? }`. Fetched when mode is school; not stored in IndexedDB.

---

## 3. Backend (Intended / Future)

### 3.1 MongoDB (or Equivalent)

Planned use:

- **Users:** School users (students by GR no., teachers by teacher ID), passwords (hashed), roles, school/class links.
- **Packets:** Canonical packet content; versioning; possibly i18n.
- **Assignments:** Teacher-created assignments (packetIds, class/group, syncBy, maxTier).
- **Progress / submissions:** Per-user, per-packet progress (status, answers, completedAt) for sync and reporting.
- **Schools / classes:** For teacher dashboard and assignment targeting.

### 3.2 Sync Flow (Target)

1. **Push:** `syncNow(userId)` sends local `progress` (from `getAllProgress(userId)`) to backend; backend stores by `userId` and `packetId`.
2. **Pull:** Backend may return new/updated packets; app saves them via `savePacket()` and refreshes the list.
3. **Auth:** School login (GR no. + password or teacher ID + password) validated against backend; token or session stored (e.g. in memory or httpOnly cookie); `userId` (and role) used for all progress and sync.

### 3.3 ODM / API Layer

- Backend can use an ODM (e.g. Mongoose) for MongoDB.
- Client: Replace `src/api/sync.js` placeholder with real HTTP calls (push progress, pull packets, and optionally pull assignments per user/school).

---

## 4. Data Flow Summary

- **Study user:** Login (name + optional ID) → `user.id` generated and stored in localStorage. Progress keyed by `user.id` in IndexedDB. No backend required for current flow.
- **School student:** Login (GR + password) → Mock or backend returns `user` with `user.id`; progress keyed by `user.id`. Assignments from `assignments.json` or future backend.
- **School teacher:** Login (teacher ID + password) → Same idea; future: teacher dashboard reads assignments/classes from backend.
- **Packets:** Fetched from `packets.json` (and later backend); stored in IndexedDB; list from `getAllPackets()`. On fetch failure, cached packets in IndexedDB are used; sample packet only if DB is empty.

---

## 5. Migrations and Compatibility

- **IndexedDB:** Schema changes require a new Dexie version and migration (e.g. new indexes or stores). v1 → v2 dropped old `progress` shape; no migration of old progress data.
- **localStorage:** Changing `edulite_user` shape (e.g. adding fields) should be backward-compatible (ignore unknown keys). Clearing `edulite_user` or changing `id` logic will reset "current user" and effectively reset progress for that user on that device.
- **Backend:** When adding a real API, keep `userId` stable (backend should return or accept the same id used in progress). Prefer one source of truth for user identity (e.g. backend id).

---

## 6. Security and Privacy (Considerations)

- **Client:** All data in IndexedDB and localStorage is device-local and not encrypted by the app. Logout clears user and path/role; progress remains in IndexedDB keyed by `userId`.
- **Backend (future):** Passwords must be hashed; use HTTPS; consider token expiry and refresh for school auth.
- **PII:** User name, student ID, GR no., teacher ID, and progress (answers) may be PII; handle according to policy and regulations (e.g. consent, retention, deletion).

---

## 7. Files Reference

| File / Path                       | Role |
|-----------------------------------|------|
| `src/db.js`                       | Dexie schema and packet/progress API. |
| `src/utils/auth.js`               | User read/write and path/role clear. |
| `src/utils/prefs.js`              | Default tier read/write. |
| `src/api/sync.js`                 | Placeholder sync (push progress, pull packets). |
| `public/packets/packets.json`     | Initial packet list and content. |
| `public/packets/assignments.json` | School-mode assignments (packetId, syncBy, courseName, maxTier). |
| `src/data/samplePacket.js`       | Fallback single packet when fetch fails and DB is empty. |
