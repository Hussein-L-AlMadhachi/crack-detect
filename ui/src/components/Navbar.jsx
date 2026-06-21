const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-around items-center">
      <button
        onClick={() => setActiveTab('camera')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'camera' ? 'text-blue-500' : 'text-gray-400'
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-xs">Camera</span>
      </button>
      
      <button
        onClick={() => setActiveTab('history')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'history' ? 'text-blue-500' : 'text-gray-400'
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs">History</span>
      </button>
      
      <button
        onClick={() => setActiveTab('profile')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'profile' ? 'text-blue-500' : 'text-gray-400'
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="text-xs">Profile</span>
      </button>
    </div>
  )
}

export default Navbar
