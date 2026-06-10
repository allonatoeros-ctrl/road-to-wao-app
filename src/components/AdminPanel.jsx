import React from 'react';

export default function AdminPanel({ requests, onUpdateStatus, onClose }) {
  // We can show all requests, but prioritize pending ones.
  const pendingRequests = requests.filter(r => r.status === 'pending' || !r.status);
  const processedRequests = requests.filter(r => r.status && r.status !== 'pending');

  return (
    <div className="admin-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header */}
      <header className="board-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            type="button" 
            className="wao-cancel-button wao-display"
            onClick={onClose}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            ← Indietro
          </button>
        </div>
        <h1 className="board-title wao-display" style={{ marginTop: '10px' }}>Control Room</h1>
        <p className="board-subtitle">Pannello driver demo. Approva o rifiuta le richieste in tempo reale.</p>
      </header>

      {requests.length === 0 ? (
        <div className="placeholder-card">
          <div className="placeholder-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--amber-gold)" strokeWidth="1.5" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 className="placeholder-title wao-display">Nessuna richiesta da moderare</h2>
          <p className="placeholder-text">
            Invia una richiesta dalla Bacheca per vederla apparire qui.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          {/* Richieste da gestire */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 className="wao-display" style={{ fontSize: '12px', color: 'var(--amber-gold)', letterSpacing: '0.05em' }}>
              Richieste Pendenti ({pendingRequests.length})
            </h3>
            
            {pendingRequests.length === 0 ? (
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
                Non ci sono richieste in attesa di approvazione.
              </p>
            ) : (
              requests.map((req, index) => {
                if (req.status && req.status !== 'pending') return null;
                return (
                  <div key={req.id || `${req.route}-${req.nickname}-${req.departure}-${req.message ? req.message.substring(0, 15) : ''}`} className="ride-card card-pending-gold">
                    <div className="ride-card-glow-gold" aria-hidden="true"></div>
                    
                    <div className="ride-card-header">
                      <span className="wao-display" style={{ fontSize: '11px', color: 'var(--text-soft)', fontWeight: 'bold' }}>
                        Driver View
                      </span>
                      <span className="ride-badge badge-pending-gold">
                        Pendente
                      </span>
                    </div>

                    <div className="ride-details">
                      <div className="ride-route wao-display" style={{ fontSize: '15px', textTransform: 'none', margin: '4px 0' }}>
                        {req.route}
                      </div>
                      
                      <div style={{ fontSize: '12.5px', color: 'var(--text-soft)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>Passeggero: <strong>{req.nickname}</strong></div>
                        <div>Città di partenza: <strong>{req.departure}</strong></div>
                        <div>Persone: <strong>{req.passengers} {req.passengers === '1' ? 'persona' : 'persone'}</strong></div>
                      </div>

                      {req.message && (
                        <div style={{ 
                          marginTop: '6px', 
                          padding: '8px 10px', 
                          background: 'rgba(0, 0, 0, 0.25)', 
                          borderRadius: '8px',
                          borderLeft: '2px solid var(--amber-gold)',
                          fontSize: '11.5px',
                          color: 'var(--text-soft)',
                          fontStyle: 'italic'
                        }}>
                          "{req.message}"
                        </div>
                      )}
                    </div>

                    {/* Azioni di approvazione */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <button
                        type="button"
                        className="wao-primary-button wao-display"
                        onClick={() => onUpdateStatus(index, 'approved')}
                        style={{ flex: 1, padding: '10px 14px', fontSize: '11px', background: 'linear-gradient(135deg, var(--turquoise), #17b3a4)', boxShadow: '0 0 10px rgba(42, 242, 224, 0.2)', color: '#0b0c1e' }}
                      >
                        Approva
                      </button>
                      <button
                        type="button"
                        className="wao-secondary-button wao-display"
                        onClick={() => onUpdateStatus(index, 'rejected')}
                        style={{ flex: 1, padding: '10px 14px', fontSize: '11px' }}
                      >
                        Rifiuta
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Storico richieste gestite */}
          {processedRequests.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <h3 className="wao-display" style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Storico Richieste ({processedRequests.length})
              </h3>
              
              {requests.map((req, index) => {
                if (!req.status || req.status === 'pending') return null;
                const isApproved = req.status === 'approved';
                return (
                  <div 
                    key={req.id || `${req.route}-${req.nickname}-${req.departure}-${req.message ? req.message.substring(0, 15) : ''}`} 
                    className={`ride-card ${isApproved ? 'card-approved' : 'card-rejected'}`}
                    style={{ opacity: 0.8 }}
                  >
                    {isApproved && <div className="ride-card-glow-approved" aria-hidden="true"></div>}
                    
                    <div className="ride-card-header">
                      <span className="wao-display" style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                        Driver View
                      </span>
                      <span className={`ride-badge ${isApproved ? 'badge-approved' : 'badge-rejected'}`}>
                        {isApproved ? 'Approvata' : 'Rifiutata'}
                      </span>
                    </div>

                    <div className="ride-details" style={{ fontSize: '12.5px' }}>
                      <div className="ride-route wao-display" style={{ fontSize: '14px', textTransform: 'none', margin: '2px 0' }}>
                        {req.route}
                      </div>
                      <div>Passeggero: <strong>{req.nickname}</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
