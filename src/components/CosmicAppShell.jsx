export default function CosmicAppShell({ children }) {
  return (
    <div className="phone-frame">
      {/* Simula Dynamic Island / Notch */}
      <div className="phone-island"></div>
      
      <div className="phone-screen">
        {/* Status Bar Mockup */}
        <div className="phone-status-bar">
          <span>09:41</span>
          <div className="status-bar-icons">
            {/* Segnale cellulare */}
            <svg className="status-icon" viewBox="0 0 24 24">
              <path d="M2 22h20V2z" />
            </svg>
            {/* Wi-Fi */}
            <svg className="status-icon" viewBox="0 0 24 24">
              <path d="M12 21l-12-12a17 17 0 0 1 24 0z" />
            </svg>
            {/* Batteria */}
            <svg className="status-icon" viewBox="0 0 24 24" style={{ transform: 'rotate(90deg)' }}>
              <path d="M17 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m2 3v8h2V8h-2z" />
            </svg>
          </div>
        </div>

        {children}

        {/* Home Indicator per iOS finto */}
        <div className="ios-indicator"></div>
      </div>
    </div>
  );
}
