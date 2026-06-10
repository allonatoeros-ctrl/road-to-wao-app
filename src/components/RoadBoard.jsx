export default function RoadBoard() {
  const rides = [
    {
      id: 1,
      from: 'Milano',
      to: 'WAO',
      spots: '2 posti liberi',
      departure: '14 Agosto mattina',
      vibe: 'tranquilla / music-first',
      status: 'Passaggio aperto',
      statusCode: 'open' // open, warning, pending
    },
    {
      id: 2,
      from: 'Roma',
      to: 'WAO',
      spots: '1 posto libero',
      departure: '13 Agosto sera',
      vibe: 'social / full experience',
      status: 'Quasi pieno',
      statusCode: 'warning'
    },
    {
      id: 3,
      from: 'Firenze',
      to: 'WAO',
      spots: 'Cerca driver',
      departure: '14 Agosto',
      vibe: 'easy / camping',
      status: 'In attesa driver',
      statusCode: 'pending'
    }
  ];

  return (
    <div className="board-content">
      {/* Header della bacheca */}
      <header className="board-header">
        <h1 className="board-title wao-display">Bacheca Viaggi</h1>
        <p className="board-subtitle">Trova una crew attiva o lascia la tua richiesta.</p>
      </header>

      {/* Pulsante per pubblicare annuncio */}
      <div className="board-actions">
        <button 
          type="button" 
          className="wao-secondary-button wao-display"
          onClick={() => console.log('Offro posti bacheca click (mock)')}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" style={{ marginRight: '6px' }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Offri un passaggio
        </button>
      </div>

      {/* Lista passaggi */}
      <section className="rides-list">
        {rides.map(ride => (
          <div key={ride.id} className={`ride-card card-${ride.statusCode}`}>
            <div className="ride-card-glow" aria-hidden="true"></div>
            
            {/* Header della card: Tratta e Stato */}
            <div className="ride-card-header">
              <div className="ride-route wao-display">
                <span>{ride.from}</span>
                <span className="route-arrow">→</span>
                <span className="route-dest">{ride.to}</span>
              </div>
              <span className={`ride-badge badge-${ride.statusCode}`}>
                {ride.status}
              </span>
            </div>

            {/* Dettagli del viaggio */}
            <div className="ride-details">
              <div className="ride-detail-item">
                <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="detail-text">{ride.spots}</span>
              </div>

              <div className="ride-detail-item">
                <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="detail-text">{ride.departure}</span>
              </div>

              <div className="ride-detail-item">
                <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
                <span className="detail-text">Vibe: {ride.vibe}</span>
              </div>
            </div>

            {/* CTA per unirsi */}
            <div className="ride-actions">
              <button 
                type="button" 
                className="wao-primary-button wao-display"
                onClick={() => console.log(`Unione richiesta per viaggio ${ride.id} (mock)`)}
              >
                Chiedi di unirti
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
