import { useAuth } from '../context/AuthContext'

const Profile = () => {
  const { user, logout } = useAuth()

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden" style={{
      backgroundImage: 'radial-gradient(circle, #1d2949 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}>
      <h1 className="text-2xl font-bold text-text-50 mb-6">Profile</h1>
      
      <div className="flex-1 flex flex-col items-center">
        <div className="w-32 h-32 bg-gradient-to-br from-primary-700 to-secondary-700 rounded-full flex items-center justify-center shadow-lg mb-6">
          <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-text-50">{user.username}</h2>
        <p className="text-lg text-text-300 capitalize">{user.user_type.replace('_', ' ')}</p>
        
        <div className="mt-8 w-full space-y-4">
          <div className="bg-background-800 rounded-xl p-4 border border-background-700">
            <div className="text-sm text-text-300">Email</div>
            <div className="text-text-50 font-medium">{user.email}</div>
          </div>
          
          <div className="bg-background-800 rounded-xl p-4 border border-background-700">
            <div className="text-sm text-text-300">User Type</div>
            <div className="text-text-50 font-medium capitalize">{user.user_type.replace('_', ' ')}</div>
          </div>
          
          <div className="bg-background-800 rounded-xl p-4 border border-background-700">
            <div className="text-sm text-text-300">Member Since</div>
            <div className="text-text-50 font-medium">{formatDate(user.created_at)}</div>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="mt-8 w-full bg-red-900 hover:bg-red-800 text-white font-medium py-3 rounded-xl transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Profile
