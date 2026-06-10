export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <div className="bottom-nav-bar">
      <div 
        className={`nav-item ${activeTab === 'casa' ? 'active' : ''}`}
        onClick={() => setActiveTab && setActiveTab('casa')}
      >
        <svg viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span>Casa</span>
      </div>

      <div 
        className={`nav-item ${activeTab === 'bacheca' ? 'active' : ''}`}
        onClick={() => setActiveTab && setActiveTab('bacheca')}
      >
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
        <span>Bacheca</span>
      </div>

      <div 
        className={`nav-item ${activeTab === 'messaggi' ? 'active' : ''}`}
        onClick={() => {
          console.log('Messaggi click (mock)');
          if (setActiveTab) setActiveTab('messaggi');
        }}
      >
        <svg viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>Messaggi</span>
      </div>

      <div 
        className={`nav-item ${activeTab === 'profilo' ? 'active' : ''}`}
        onClick={() => {
          console.log('Profilo click (mock)');
          if (setActiveTab) setActiveTab('profilo');
        }}
      >
        <svg viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>Profilo</span>
      </div>
    </div>
  );
}
