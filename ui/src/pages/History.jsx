import { useState, useEffect } from 'react'
import api from '../utils/api'

const History = () => {
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const data = await api.getHistory()
      setHistoryData(data)
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (maxWidth) => {
    if (maxWidth >= 2) return 'bg-red-100 border-red-300'
    if (maxWidth >= 1) return 'bg-orange-100 border-orange-300'
    return 'bg-green-100 border-green-300'
  }

  const getSeverityTextColor = (maxWidth) => {
    if (maxWidth >= 2) return 'text-red-800'
    if (maxWidth >= 1) return 'text-orange-800'
    return 'text-green-800'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">History</h1>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">History</h1>
      
      {historyData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p>No crack analysis history yet</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          {historyData.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border-2 ${getSeverityColor(item.max_width_mm)}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <div className="flex-1">
                  <div className={`font-semibold ${getSeverityTextColor(item.max_width_mm)}`}>
                    {item.crack_type.charAt(0).toUpperCase() + item.crack_type.slice(1)} Crack
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Length: {item.length_mm}mm • Max Width: {item.max_width_mm}mm
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(item.created_at)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default History
