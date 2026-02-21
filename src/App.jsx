import { useState, useCallback } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { getStoredUser, logout as doLogout } from './utils/auth'
import { getDefaultTier, setDefaultTier as saveDefaultTier, clearDefaultTier } from './utils/prefs'
import { log } from './utils/debug'
import Login from './components/Login'
import Navbar from './components/Navbar'
import ContentModeScreen from './components/ContentModeScreen'
import PacketList from './components/PacketList'
import PacketView from './components/PacketView'
import Profile from './components/Profile'
import HowItWorks from './components/HowItWorks'
import './App.css'

registerSW({ immediate: true })

export default function App() {
  const [user, setUser] = useState(getStoredUser)
  const [defaultContentTier, setDefaultContentTier] = useState(getDefaultTier)
  const [openPacketId, setOpenPacketId] = useState(null)
  const [openAssignment, setOpenAssignment] = useState(null)
  const [mode, setMode] = useState('study')
  const [showProfile, setShowProfile] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  const handleLogin = useCallback(() => {
    const u = getStoredUser()
    setUser(u)
    log('App: user logged in', { name: u?.name })
  }, [])

  const handleLogout = useCallback(() => {
    doLogout()
    clearDefaultTier()
    setUser(null)
    setDefaultContentTier(null)
    setOpenPacketId(null)
    setOpenAssignment(null)
    setShowProfile(false)
    log('App: logout, tier cleared')
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

  if (!user) {
    return (
      <div className="app">
        <Login onLogin={handleLogin} />
      </div>
    )
  }

  return (
    <div className="app">
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
              />
            </>
          )}

          {showHowItWorks && <HowItWorks onClose={() => setShowHowItWorks(false)} />}
        </>
      )}
    </div>
  )
}
