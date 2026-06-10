import React from 'react';

export default function MessagesPanel({ requests, onFindRide }) {
  return (
    <div className="messages-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header */}
      <header className="board-header">
        <h1 className="board-title wao-display">Messaggi</h1>
        <p className="board-subtitle">Gestisci le tue richieste di viaggio e i messaggi.</p>
      </header>

      {requests.length === 0 ? (
        <div className="placeholder-card">
          <div className="placeholder-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--amber-gold)" strokeWidth="1.5" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="placeholder-title wao-display">Nessuna richiesta ancora</h2>
          <p className="placeholder-text">
            Chiedi di unirti a un viaggio dalla Bacheca.
          </p>
          <button 
            type="button" 
            className="wao-primary-button wao-display"
            onClick={onFindRide}
            style={{ marginTop: '16px' }}
          >
            Esplora la Bacheca
          </button>
        </div>
      ) : (
        <div className="messages-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {requests.map((req, index) => (
            <div key={index} className="ride-card card-pending-gold">
              <div className="ride-card-glow-gold" aria-hidden="true"></div>
              
              {/* Header: Richiesta inviata + Badge */}
              <div className="ride-card-header">
                <div className="ride-status-info">
                  <span className="ride-status-title wao-display" style={{ fontSize: '11px', color: 'var(--text-soft)', letterSpacing: '0.08em', fontWeight: 'bold' }}>
                    Richiesta inviata
                  </span>
                </div>
                <span className="ride-badge badge-pending-gold">
                  In attesa approvazione
                </span>
              </div>

              {/* Dettagli Viaggio e Richiesta */}
              <div className="ride-details">
                <div className="ride-route wao-display" style={{ fontSize: '16px', margin: '4px 0 8px 0', textTransform: 'none' }}>
                  {req.route}
                </div>

                <div className="ride-detail-item">
                  <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="detail-text">Partenza da: <strong>{req.departure}</strong></span>
                </div>

                <div className="ride-detail-item">
                  <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="detail-text">Tu come: <strong>{req.nickname}</strong> ({req.passengers} {req.passengers === '1' ? 'persona' : 'persone'})</span>
                </div>

                {req.message && (
                  <div className="request-message-quote" style={{ 
                    marginTop: '8px', 
                    padding: '10px 12px', 
                    background: 'rgba(0, 0, 0, 0.2)', 
                    borderRadius: '8px',
                    borderLeft: '2px solid var(--amber-gold)',
                    fontSize: '12px',
                    color: 'var(--text-soft)',
                    fontStyle: 'italic'
                  }}>
                    "{req.message}"
                  </div>
                )}
              </div>

              {/* Nota di attesa */}
              <div className="ride-card-footer" style={{ 
                marginTop: '8px', 
                paddingTop: '8px', 
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                textAlign: 'center'
              }}>
                Nessun contatto viene mostrato prima dell’approvazione.
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
