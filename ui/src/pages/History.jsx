import { useState, useEffect } from 'react'
import api from '../utils/api'

const History = () => {
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)

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
    if (maxWidth < 0.3) return 'bg-green-500/20 border-green-500'
    if (maxWidth < 1) return 'bg-yellow-500/20 border-yellow-500'
    return 'bg-red-500/20 border-red-500'
  }

  const getSeverityTextColor = (maxWidth) => {
    if (maxWidth < 0.3) return 'text-green-500'
    if (maxWidth < 1) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getSeverityLevel = (maxWidth) => {
    if (maxWidth < 0.3) return 'Safe'
    if (maxWidth < 1) return 'Warning'
    return 'Critical'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <h1 className="text-2xl font-bold text-text-50 mb-4">History</h1>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 flex flex-col p-6 overflow-hidden" style={{
        backgroundImage: 'radial-gradient(circle, #1d2949 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}>
        <h1 className="text-2xl font-bold text-text-50 mb-4">History</h1>
        
        {historyData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-text-300">
            <p>No crack analysis history yet</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pb-4">
            {historyData.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border-2 ${getSeverityColor(item.avg_width_mm)}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-background-800 rounded-lg overflow-hidden shadow-sm border border-background-700 cursor-pointer" onClick={() => setSelectedItem(item)}>
                    <img 
                      src={`http://localhost:8000${item.image_path.startsWith('/') ? item.image_path : '/' + item.image_path}`} 
                      alt="Crack" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = `<svg class="w-8 h-8 text-text-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`
                      }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className={`font-semibold ${getSeverityTextColor(item.avg_width_mm)}`}>
                      {item.crack_type.charAt(0).toUpperCase() + item.crack_type.slice(1)} Crack
                    </div>
                    <div className="text-sm text-text-300 mt-1">
                      Length: {item.length_mm}mm • Width: {item.avg_width_mm}mm
                    </div>
                    <div className="text-xs text-text-300 mt-1">
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-background-900 rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto border border-background-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-text-50">Crack Analysis Details</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-text-300 hover:text-text-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <img 
                src={`http://localhost:8000${selectedItem.image_path.startsWith('/') ? selectedItem.image_path : '/' + selectedItem.image_path}`} 
                alt="Crack" 
                className="w-full rounded-xl mb-4 object-contain bg-background-800"
              />
              
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${getSeverityColor(selectedItem.avg_width_mm)}`}>
                  <div className={`font-semibold ${getSeverityTextColor(selectedItem.avg_width_mm)}`}>
                    {getSeverityLevel(selectedItem.avg_width_mm)}: {selectedItem.crack_type.charAt(0).toUpperCase() + selectedItem.crack_type.slice(1)} Crack
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background-800 p-3 rounded-lg border border-background-700">
                    <div className="text-xs text-text-300">Length</div>
                    <div className="text-lg font-semibold text-text-50">{selectedItem.length_mm} mm</div>
                  </div>
                  <div className="bg-background-800 p-3 rounded-lg border border-background-700">
                    <div className="text-xs text-text-300">Max Width</div>
                    <div className="text-lg font-semibold text-text-50">{selectedItem.max_width_mm} mm</div>
                  </div>
                  <div className="bg-background-800 p-3 rounded-lg border border-background-700">
                    <div className="text-xs text-text-300">Width</div>
                    <div className="text-lg font-semibold text-text-50">{selectedItem.avg_width_mm} mm</div>
                  </div>
                  <div className="bg-background-800 p-3 rounded-lg border border-background-700">
                    <div className="text-xs text-text-300">Area</div>
                    <div className="text-lg font-semibold text-text-50">{selectedItem.area_mm2} mm²</div>
                  </div>
                  <div className="bg-background-800 p-3 rounded-lg border border-background-700">
                    <div className="text-xs text-text-300">Angle</div>
                    <div className="text-lg font-semibold text-text-50">{selectedItem.angle_deg}°</div>
                  </div>
                  <div className="bg-background-800 p-3 rounded-lg border border-background-700">
                    <div className="text-xs text-text-300">Date</div>
                    <div className="text-sm font-semibold text-text-50">{formatDate(selectedItem.created_at)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default History
