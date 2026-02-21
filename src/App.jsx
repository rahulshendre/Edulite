import { useState } from 'react'
import { registerSW } from 'virtual:pwa-register'
import PacketList from './components/PacketList'
import PacketView from './components/PacketView'
import './App.css'

registerSW({ immediate: true })

export default function App() {
  const [openPacketId, setOpenPacketId] = useState(null)

  return (
    <div className="app">
      {openPacketId ? (
        <PacketView
          packetId={openPacketId}
          onBack={() => setOpenPacketId(null)}
        />
      ) : (
        <PacketList onOpenPacket={setOpenPacketId} />
      )}
    </div>
  )
}
