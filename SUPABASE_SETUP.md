# Supabase Setup (Auth + Sync)

## 1. Run the migration

In [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor, run the contents of:

```
supabase/migrations/001_initial.sql
```

## 2. Seed test users

Supabase Auth users must be created via the Dashboard or Admin API. For local testing:

1. Go to **Authentication** → **Users** → **Add user** (or **Create new user**).

2. **Student** (school-1, GR no. student1):
   - Email: `gr_student1@school-1.edulite.local`
   - Password: `pass` (or your choice)
   - Create user → copy the **User UID** (UUID).

3. In SQL Editor, run:
   ```sql
   insert into school_profiles (user_id, school_id, gr_no, role, name)
   values ('<paste-student-uuid>', 'school-1', 'student1', 'student', 'Student student1');
   ```

4. **Teacher** (school-1, teacher ID teacher1):
   - Create Auth user: email `teacher_teacher1@school-1.edulite.local`, password `pass`.
   - Insert profile:
   ```sql
   insert into school_profiles (user_id, school_id, teacher_id, role, name)
   values ('<paste-teacher-uuid>', 'school-1', 'teacher1', 'teacher', 'Teacher teacher1');
   ```

## 3. Env vars

Ensure `.env` has:

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Use the **anon** (public) key from Project Settings → API, not the service_role key.

## 4. Test

- Path: School → Student → Riverside Primary (school-1)
- GR: `student1`, Password: `pass`
- Complete a packet → tap **Sync now** → progress should appear in Supabase Table Editor → `progress`.
