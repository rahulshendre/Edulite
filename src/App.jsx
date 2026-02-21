import { useState, useCallback, useEffect } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { getStoredUser, logout as doLogout } from './utils/auth'
import { getDefaultTier, setDefaultTier as saveDefaultTier, clearDefaultTier } from './utils/prefs'
import { log } from './utils/debug'
import PathChoiceScreen from './components/PathChoiceScreen'
import SchoolRoleScreen from './components/SchoolRoleScreen'
import SchoolSelectScreen from './components/SchoolSelectScreen'
import SchoolStudentLogin from './components/SchoolStudentLogin'
import SchoolTeacherLogin from './components/SchoolTeacherLogin'
import Login from './components/Login'
import Navbar from './components/Navbar'
import ContentModeScreen from './components/ContentModeScreen'
import PacketList from './components/PacketList'
import PacketView from './components/PacketView'
import Profile from './components/Profile'
import TeacherDashboard from './components/TeacherDashboard'
import HowItWorks from './components/HowItWorks'
import { getPreferredLocale, setStoredLocale } from './constants/locales'
import './App.css'

const SESSION_PATH_KEY = 'edulite_path'
const SESSION_SCHOOL_ROLE_KEY = 'edulite_school_role'
const SESSION_SCHOOL_KEY = 'edulite_school'

function getStoredPath() {
  try {
    return sessionStorage.getItem(SESSION_PATH_KEY) || null
  } catch {
    return null
  }
}
function getStoredSchoolRole() {
  try {
    return sessionStorage.getItem(SESSION_SCHOOL_ROLE_KEY) || null
  } catch {
    return null
  }
}
function getStoredSchool() {
  try {
    const raw = sessionStorage.getItem(SESSION_SCHOOL_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return data && data.id && data.name ? data : null
  } catch {
    return null
  }
}

registerSW({ immediate: true })

export default function App() {
  const [user, setUser] = useState(getStoredUser)
  const [pathChoice, setPathChoice] = useState(getStoredPath)
  const [schoolRole, setSchoolRole] = useState(getStoredSchoolRole)
  const [selectedSchool, setSelectedSchool] = useState(getStoredSchool)
  const [defaultContentTier, setDefaultContentTier] = useState(getDefaultTier)
  const [openPacketId, setOpenPacketId] = useState(null)
  const [openAssignment, setOpenAssignment] = useState(null)
  const [mode, setMode] = useState('study')
  const [showProfile, setShowProfile] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [locale, setLocale] = useState(() => getPreferredLocale())
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' && navigator.onLine)

  useEffect(() => {
    const setOnline = () => setIsOnline(true)
    const setOffline = () => setIsOnline(false)
    window.addEventListener('online', setOnline)
    window.addEventListener('offline', setOffline)
    return () => {
      window.removeEventListener('online', setOnline)
      window.removeEventListener('offline', setOffline)
    }
  }, [])

  useEffect(() => {
    if (user?.path === 'school' && user?.role === 'student') setMode('school')
  }, [user?.path, user?.role])

  const handleLogin = useCallback(() => {
    const u = getStoredUser()
    setUser(u)
    log('App: user logged in', { path: u?.path, role: u?.role })
  }, [])

  const handleLogout = useCallback(() => {
    doLogout()
    clearDefaultTier()
    setUser(null)
    setPathChoice(null)
    setSchoolRole(null)
    setSelectedSchool(null)
    setDefaultContentTier(null)
    setOpenPacketId(null)
    setOpenAssignment(null)
    setShowProfile(false)
    log('App: logout, tier and path/role cleared')
  }, [])

  const setPathSchool = useCallback(() => {
    setPathChoice('school')
    try { sessionStorage.setItem(SESSION_PATH_KEY, 'school') } catch {}
  }, [])
  const setPathStudy = useCallback(() => {
    setPathChoice('study')
    try { sessionStorage.setItem(SESSION_PATH_KEY, 'study') } catch {}
  }, [])
  const setRoleStudent = useCallback(() => {
    setSchoolRole('student')
    try { sessionStorage.setItem(SESSION_SCHOOL_ROLE_KEY, 'student') } catch {}
  }, [])
  const setRoleTeacher = useCallback(() => {
    setSchoolRole('teacher')
    try { sessionStorage.setItem(SESSION_SCHOOL_ROLE_KEY, 'teacher') } catch {}
  }, [])
  const goBackToPathChoice = useCallback(() => {
    setPathChoice(null)
    setSchoolRole(null)
    try {
      sessionStorage.removeItem(SESSION_PATH_KEY)
      sessionStorage.removeItem(SESSION_SCHOOL_ROLE_KEY)
    } catch {}
  }, [])
  const goBackToSchoolRole = useCallback(() => {
    setSchoolRole(null)
    try { sessionStorage.removeItem(SESSION_SCHOOL_ROLE_KEY) } catch {}
  }, [])
  const setSchool = useCallback((school) => {
    setSelectedSchool(school)
    try { sessionStorage.setItem(SESSION_SCHOOL_KEY, JSON.stringify(school)) } catch {}
  }, [])

  const handleLocaleChange = useCallback((code) => {
    setStoredLocale(code)
    setLocale(code)
  }, [])
  const goBackToSchoolSelect = useCallback(() => {
    setSelectedSchool(null)
    try { sessionStorage.removeItem(SESSION_SCHOOL_KEY) } catch {}
  }, [])

  const handleContentModeSelect = useCallback((tierId) => {
    saveDefaultTier(tierId)
    setDefaultContentTier(tierId)
    log('App: content mode selected', { tierId })
  }, [])

  const handleChangeContentMode = useCallback(() => {
    clearDefaultTier()
    setDefaultContentTier(null)
    setShowProfile(false)
    log('App: change content mode (tier cleared)')
  }, [])

  const handleOpenPacket = (packetId, assignment) => {
    setOpenPacketId(packetId)
    setOpenAssignment(assignment ?? null)
    log('App: open packet', { packetId, mode, assignment: assignment ? { syncBy: assignment.syncBy, maxTier: assignment.maxTier, courseName: assignment.courseName } : null })
  }

  const handleBack = () => {
    setOpenPacketId(null)
    setOpenAssignment(null)
    log('App: back from packet')
  }

  const handleHome = useCallback(() => setShowProfile(false), [])

  const setModeStudy = useCallback(() => { setMode('study'); log('App: mode', 'study') }, [])
  const setModeSchool = useCallback(() => { setMode('school'); log('App: mode', 'school') }, [])

  const connectionBar = (
    <div
      className={`connection-status connection-status--${isOnline ? 'online' : 'offline'}`}
      role="status"
      aria-label={isOnline ? 'Online' : 'Offline'}
      title={isOnline ? 'Online' : 'Offline'}
    />
  )

  if (!user) {
    return (
      <div className="app">
        {connectionBar}
        {pathChoice === null && (
          <PathChoiceScreen onSelectSchool={setPathSchool} onSelectStudy={setPathStudy} />
        )}
        {pathChoice === 'study' && (
          <Login onLogin={handleLogin} />
        )}
        {pathChoice === 'school' && schoolRole === null && (
          <SchoolRoleScreen
            onSelectStudent={setRoleStudent}
            onSelectTeacher={setRoleTeacher}
            onBack={goBackToPathChoice}
          />
        )}
        {pathChoice === 'school' && schoolRole && !selectedSchool && (
          <SchoolSelectScreen onSelect={setSchool} onBack={goBackToSchoolRole} />
        )}
        {pathChoice === 'school' && schoolRole === 'student' && selectedSchool && (
          <SchoolStudentLogin school={selectedSchool} onLogin={handleLogin} onBack={goBackToSchoolSelect} />
        )}
        {pathChoice === 'school' && schoolRole === 'teacher' && selectedSchool && (
          <SchoolTeacherLogin school={selectedSchool} onLogin={handleLogin} onBack={goBackToSchoolSelect} />
        )}
      </div>
    )
  }

  if (user.role === 'teacher') {
    return (
      <div className="app">
        {connectionBar}
        <Navbar
          onHome={() => {}}
          onHowItWorks={() => setShowHowItWorks(true)}
          onProfile={() => {}}
          onLogout={handleLogout}
          showProfile={false}
          locale={locale}
          onLocaleChange={handleLocaleChange}
        />
        <TeacherDashboard user={user} onLogout={handleLogout} />
        {showHowItWorks && <HowItWorks onClose={() => setShowHowItWorks(false)} />}
      </div>
    )
  }

  return (
    <div className="app">
      {connectionBar}
      {openPacketId ? (
        <PacketView
          userId={user?.id}
          packetId={openPacketId}
          assignment={openAssignment}
          defaultTier={defaultContentTier}
          onBack={handleBack}
        />
      ) : (
        <>
          <Navbar
            onHome={handleHome}
            onHowItWorks={() => setShowHowItWorks(true)}
            onProfile={() => setShowProfile(true)}
            onLogout={handleLogout}
            showProfile={showProfile}
            locale={locale}
            onLocaleChange={handleLocaleChange}
          />

          {showProfile ? (
            <Profile
              user={user}
              onUpdateUser={() => setUser(getStoredUser())}
              onChangeContentMode={handleChangeContentMode}
              onLogout={handleLogout}
            />
          ) : defaultContentTier === null ? (
            <>
              <div className="app-header">
                <div className="mode-toggle">
                  <div className="mode-toggle-option">
                    <button
                      type="button"
                      className={mode === 'study' ? 'active' : ''}
                      onClick={setModeStudy}
                    >
                      Study
                    </button>
                    <span className="mode-toggle-sub">Learn at your pace • All packets</span>
                  </div>
                  <div className="mode-toggle-option">
                    <button
                      type="button"
                      className={mode === 'school' ? 'active' : ''}
                      onClick={setModeSchool}
                    >
                      School
                    </button>
                    <span className="mode-toggle-sub">Assigned courses • Sync-by dates • Tier limits</span>
                  </div>
                </div>
              </div>
              <ContentModeScreen onSelect={handleContentModeSelect} />
            </>
          ) : (
            <>
              <div className="app-header">
                <div className="mode-toggle">
                  <div className="mode-toggle-option">
                    <button
                      type="button"
                      className={mode === 'study' ? 'active' : ''}
                      onClick={setModeStudy}
                    >
                      Study
                    </button>
                    <span className="mode-toggle-sub">Learn at your pace • All packets</span>
                  </div>
                  <div className="mode-toggle-option">
                    <button
                      type="button"
                      className={mode === 'school' ? 'active' : ''}
                      onClick={setModeSchool}
                    >
                      School
                    </button>
                    <span className="mode-toggle-sub">Assigned courses • Sync-by dates • Tier limits</span>
                  </div>
                </div>
              </div>
              <PacketList
                userId={user?.id}
                mode={mode}
                onOpenPacket={handleOpenPacket}
                onChangeContentMode={handleChangeContentMode}
                locale={locale}
              />
            </>
          )}

          {showHowItWorks && <HowItWorks onClose={() => setShowHowItWorks(false)} />}
        </>
      )}
    </div>
  )
}
