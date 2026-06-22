import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState('engineer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await login(username, password)
      } else {
        await register(username, email, password, userType)
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden" style={{
      backgroundImage: 'radial-gradient(circle, #1d2949 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}>
      <h1 className="text-2xl font-bold text-text-50 mb-6">
        {isLogin ? 'Login' : 'Register'}
      </h1>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-300 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border border-background-700 bg-background-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-50 placeholder-text-300"
              placeholder="Enter username"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-text-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-background-700 bg-background-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-50 placeholder-text-300"
                placeholder="Enter email"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-background-700 bg-background-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-50 placeholder-text-300"
              placeholder="Enter password"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-text-300 mb-1">
                User Type
              </label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full px-4 py-3 border border-background-700 bg-background-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-50"
              >
                <option value="engineer">Engineer</option>
                <option value="home_owner">Home Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm border border-red-500">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-primary-500 hover:bg-primary-600 disabled:bg-background-700 text-white font-medium py-3 rounded-xl transition-colors"
        >
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin)
            setError('')
          }}
          className="mt-4 text-primary-500 hover:text-primary-600 text-sm"
        >
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </button>
      </form>
    </div>
  )
}

export default Login
