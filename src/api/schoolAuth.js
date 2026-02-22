/**
 * School auth via Supabase: email = gr_{grNo}@{schoolId}.edulite.local (student)
 * or teacher_{teacherId}@{schoolId}.edulite.local (teacher)
 */
import { supabase } from '../lib/supabase'
import { log, logError } from '../utils/debug'

function toStudentEmail(grNo, schoolId) {
  return `gr_${grNo}@${schoolId}.edulite.local`
}

function toTeacherEmail(teacherId, schoolId) {
  return `teacher_${teacherId}@${schoolId}.edulite.local`
}

/**
 * Sign in student with GR no. + password.
 * @param {{ grNo: string, password: string, schoolId: string, schoolName: string }} params
 * @returns {{ user: object } | { error: string }}
 */
export async function signInStudent({ grNo, password, schoolId, schoolName }) {
  if (!supabase) return { error: 'Supabase not configured.' }
  const email = toStudentEmail(grNo, schoolId)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    logError('schoolAuth: signInStudent failed', error)
    return { error: error.message || 'Invalid GR number or password.' }
  }
  const profile = await fetchSchoolProfile(data.user.id)
  if (!profile) return { error: 'Profile not found.' }
  const user = {
    id: data.user.id,
    path: 'school',
    role: 'student',
    grNo: profile.gr_no ?? grNo,
    name: profile.name,
    schoolId: profile.school_id,
    schoolName: schoolName ?? profile.school_id,
  }
  log('schoolAuth: student signed in', { userId: user.id, grNo: user.grNo })
  return { user }
}

/**
 * Sign in teacher with teacher ID + password.
 * @param {{ teacherId: string, password: string, schoolId: string, schoolName: string }} params
 * @returns {{ user: object } | { error: string }}
 */
export async function signInTeacher({ teacherId, password, schoolId, schoolName }) {
  if (!supabase) return { error: 'Supabase not configured.' }
  const email = toTeacherEmail(teacherId, schoolId)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    logError('schoolAuth: signInTeacher failed', error)
    return { error: error.message || 'Invalid teacher ID or password.' }
  }
  const profile = await fetchSchoolProfile(data.user.id)
  if (!profile) return { error: 'Profile not found.' }
  const user = {
    id: data.user.id,
    path: 'school',
    role: 'teacher',
    teacherId: profile.teacher_id ?? teacherId,
    name: profile.name,
    schoolId: profile.school_id,
    schoolName: schoolName ?? profile.school_id,
  }
  log('schoolAuth: teacher signed in', { userId: user.id, teacherId: user.teacherId })
  return { user }
}

async function fetchSchoolProfile(userId) {
  const { data, error } = await supabase
    .from('school_profiles')
    .select('school_id, gr_no, teacher_id, role, name')
    .eq('user_id', userId)
    .single()
  if (error || !data) {
    logError('schoolAuth: fetchSchoolProfile failed', error)
    return null
  }
  return data
}

/**
 * Restore user from Supabase session (e.g. after refresh when localStorage was cleared).
 * @returns {{ user: object } | null }
 */
export async function restoreSessionUser() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  const session = data?.session
  if (!session?.user?.id) return null
  const profile = await fetchSchoolProfile(session.user.id)
  if (!profile) return null
  const user = {
    id: session.user.id,
    path: 'school',
    role: profile.role,
    grNo: profile.gr_no,
    teacherId: profile.teacher_id,
    name: profile.name,
    schoolId: profile.school_id,
    schoolName: profile.school_id,
  }
  return { user }
}
