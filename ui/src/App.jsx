import { useState } from 'react'
import Camera from './pages/Camera'
import History from './pages/History'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import { useAuth } from './context/AuthContext'

function App() {
  const [activeTab, setActiveTab] = useState('camera')
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background-950 flex flex-col" style={{
        backgroundImage: 'radial-gradient(circle, #1d2949 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}>
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full bg-background-900 shadow-2xl overflow-hidden">
          <Login />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-950 flex flex-col" style={{
      backgroundImage: 'radial-gradient(circle, #1d2949 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}>
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full bg-background-900 shadow-2xl overflow-hidden pb-20">
        {activeTab === 'camera' && <Camera />}
        {activeTab === 'history' && <History />}
        {activeTab === 'profile' && <Profile />}
      </div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}

export default App
