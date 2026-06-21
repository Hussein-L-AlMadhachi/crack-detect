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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-white shadow-2xl overflow-hidden">
          <Login />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-white shadow-2xl overflow-hidden">
        {activeTab === 'camera' && <Camera />}
        {activeTab === 'history' && <History />}
        {activeTab === 'profile' && <Profile />}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  )
}

export default App
