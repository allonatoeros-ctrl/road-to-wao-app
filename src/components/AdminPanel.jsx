import React from 'react';

// Stable key helper function
function getEntryKey(entry, index) {
  if (entry && entry.id) return entry.id;
  if (entry && entry.createdAt) return entry.createdAt;
  return `${entry?.type || 'req'}-${entry?.route || ''}-${entry?.nickname || ''}-${index}`;
}

export default function AdminPanel({ requests, onUpdateStatus, onClose }) {
  // Sort requests from newest to oldest by createdAt
  const sortedRequests = [...requests].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : a.id || 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : b.id || 0;
    return dateB - dateA;
  });

  const pendingRequests = sortedRequests.filter(r => r.status === 'pending' || !r.status);
  const processedRequests = sortedRequests.filter(r => r.status && r.status !== 'pending');

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
              Moderazione Pendenti ({pendingRequests.length})
            </h3>
            
            {pendingRequests.length === 0 ? (
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
                Non ci sono attività in attesa di approvazione.
              </p>
            ) : (
              pendingRequests.map((req, index) => {
                const isOffer = req.type === 'offer';
                return (
                  <div key={getEntryKey(req, index)} className="ride-card card-pending-gold">
                    <div className="ride-card-glow-gold" aria-hidden="true"></div>
                    
                    <div className="ride-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="ride-type-tag" style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        background: isOffer ? 'rgba(177, 43, 255, 0.2)' : 'rgba(42, 242, 224, 0.2)',
                        color: isOffer ? '#d18eff' : 'var(--turquoise)',
                        border: isOffer ? '1px solid rgba(177, 43, 255, 0.4)' : '1px solid rgba(42, 242, 224, 0.4)'
                      }}>
                        {isOffer ? "🚗 Offerta Passaggio" : "👥 Richiesta Join"}
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
                        {isOffer ? (
                          <>
                            <div>Driver: <strong>{req.nickname}</strong></div>
                            <div>Città di partenza: <strong>{req.departure}</strong></div>
                            {req.date && <div>Quando: <strong>{req.date}</strong></div>}
                            <div>Posti disponibili: <strong>{req.spots}</strong></div>
                            <div>Tipo viaggio: <strong>{req.tripType || 'n/d'}</strong></div>
                            <div>Fascia oraria: <strong>{req.travelTime || 'n/d'}</strong></div>
                            <div>Spazio bagagli: <strong>{req.luggageCapacity || 'n/d'}</strong></div>
                            {req.luggageDetails && <div>Cosa può caricare: <strong>{req.luggageDetails}</strong></div>}
                            {req.stops && <div>Tappe: <strong>{req.stops}</strong></div>}
                          </>
                        ) : (
                          <>
                            <div>Passeggero: <strong>{req.nickname}</strong></div>
                            <div>Città di partenza: <strong>{req.departure}</strong></div>
                            <div>Persone: <strong>{req.passengers} {req.passengers === '1' ? 'persona' : 'persone'}</strong></div>
                            <div>Tipo viaggio: <strong>{req.tripType || 'n/d'}</strong></div>
                            <div>Fascia oraria: <strong>{req.travelTime || 'n/d'}</strong></div>
                            <div>Bagaglio richiesto: <strong>{req.luggageNeed || 'n/d'}</strong></div>
                            {req.luggageDetails && <div>Cosa porta: <strong>{req.luggageDetails}</strong></div>}
                            <div>Flessibile città vicine: <strong>{req.nearbyFlexible || 'n/d'}</strong></div>
                          </>
                        )}
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
                        onClick={() => onUpdateStatus(req.id, 'approved')}
                        style={{ flex: 1, padding: '10px 14px', fontSize: '11px', background: 'linear-gradient(135deg, var(--turquoise), #17b3a4)', boxShadow: '0 0 10px rgba(42, 242, 224, 0.2)', color: '#0b0c1e' }}
                      >
                        Approva
                      </button>
                      <button
                        type="button"
                        className="wao-secondary-button wao-display"
                        onClick={() => onUpdateStatus(req.id, 'rejected')}
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
                Storico Moderazione ({processedRequests.length})
              </h3>
              
              {processedRequests.map((req, index) => {
                const isApproved = req.status === 'approved';
                const isOffer = req.type === 'offer';
                return (
                  <div 
                    key={getEntryKey(req, index)} 
                    className={`ride-card ${isApproved ? 'card-approved' : 'card-rejected'}`}
                    style={{ opacity: 0.8 }}
                  >
                    {isApproved && <div className="ride-card-glow-approved" aria-hidden="true"></div>}
                    
                    <div className="ride-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="ride-type-tag" style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        background: isOffer ? 'rgba(177, 43, 255, 0.15)' : 'rgba(42, 242, 224, 0.15)',
                        color: isOffer ? '#d18eff' : 'var(--turquoise)',
                        border: isOffer ? '1px solid rgba(177, 43, 255, 0.3)' : '1px solid rgba(42, 242, 224, 0.3)'
                      }}>
                        {isOffer ? "🚗 Offerta" : "👥 Richiesta"}
                      </span>
                      <span className={`ride-badge ${isApproved ? 'badge-approved' : 'badge-rejected'}`}>
                        {isApproved ? 'Approvata' : 'Rifiutata'}
                      </span>
                    </div>

                    <div className="ride-details" style={{ fontSize: '12.5px' }}>
                      <div className="ride-route wao-display" style={{ fontSize: '14px', textTransform: 'none', margin: '2px 0' }}>
                        {req.route}
                      </div>
                      <div style={{ color: 'var(--text-soft)' }}>
                        {isOffer ? "Driver: " : "Passeggero: "}
                        <strong>{req.nickname}</strong>
                      </div>
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
