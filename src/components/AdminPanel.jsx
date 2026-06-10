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

  const getCity = (entry) => (entry.departureCity || entry.departure || "").trim().toLowerCase();

  const offers = sortedRequests.filter(r => r.type === 'offer' && (r.status === 'pending' || r.status === 'approved'));
  const joins = sortedRequests.filter(r => r.type === 'join' && (r.status === 'pending' || r.status === 'approved'));

  const isCompatible = (offer, join) => {
    const cityOffer = getCity(offer);
    const cityJoin = getCity(join);
    if (!cityOffer || !cityJoin || cityOffer !== cityJoin) return false;

    const tripOffer = (offer.tripType || '').trim().toLowerCase();
    const tripJoin = (join.tripType || '').trim().toLowerCase();
    if (!tripOffer || !tripJoin || tripOffer !== tripJoin) return false;

    const timeOffer = (offer.travelTime || '').trim().toLowerCase();
    const timeJoin = (join.travelTime || '').trim().toLowerCase();
    
    if (timeOffer !== timeJoin && timeOffer !== 'flessibile' && timeJoin !== 'flessibile') {
      return false;
    }
    
    return true;
  };

  const candidates = [];
  offers.forEach(offer => {
    const compatibleJoins = joins.filter(join => isCompatible(offer, join));
    if (compatibleJoins.length > 0) {
      candidates.push({
        offer,
        joins: compatibleJoins.slice(0, 3)
      });
    }
  });

  const visibleCandidates = candidates.slice(0, 3);

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
          
          {/* Crew Candidate Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="wao-display" style={{ fontSize: '12.5px', color: 'var(--amber-gold)', letterSpacing: '0.05em', margin: 0 }}>
                Crew candidate ({candidates.length})
              </h3>
              <span style={{ 
                fontSize: '9px', 
                color: '#d18eff', 
                background: 'rgba(177, 43, 255, 0.15)', 
                border: '1px solid rgba(177, 43, 255, 0.3)',
                padding: '2px 8px',
                borderRadius: '20px',
                fontWeight: 'bold',
                letterSpacing: '0.02em',
                textTransform: 'uppercase'
              }}>
                Match demo — da confermare manualmente
              </span>
            </div>

            {visibleCandidates.length === 0 ? (
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(255, 197, 71, 0.15)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                  Nessuna crew candidate al momento. Approva o raccogli nuove richieste/offerte compatibili.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {visibleCandidates.map((cand, candIdx) => {
                  const { offer, joins } = cand;
                  return (
                    <div key={`cand-${offer.id || candIdx}`} className="ride-card" style={{ border: '1px solid rgba(177, 43, 255, 0.3)' }}>
                      <div className="ride-card-glow" style={{
                        position: 'absolute',
                        top: '-40px',
                        right: '-40px',
                        width: '100px',
                        height: '100px',
                        background: 'radial-gradient(circle, rgba(177, 43, 255, 0.15) 0%, transparent 70%)',
                        zIndex: -1,
                        pointerEvents: 'none'
                      }} aria-hidden="true"></div>

                      {/* Header della card candidato */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
                        <div>
                          <div className="wao-display" style={{ fontSize: '14px', color: 'var(--text-main)', textTransform: 'none' }}>
                            🚗 Crew di: <strong style={{ color: 'var(--amber-gold)' }}>{offer.nickname}</strong>
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-soft)', marginTop: '4px' }}>
                            Partenza: <strong>{offer.departure || offer.departureCity}</strong> · {offer.tripType}
                          </div>
                        </div>
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          background: 'rgba(177, 43, 255, 0.2)',
                          color: '#d18eff',
                          border: '1px solid rgba(177, 43, 255, 0.4)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          Offerta attiva
                        </span>
                      </div>

                      {/* Dettagli logistici offerta */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11.5px', color: 'var(--text-soft)', background: 'rgba(0, 0, 0, 0.2)', padding: '8px', borderRadius: '8px' }}>
                        <div>Orario: <strong>{offer.travelTime}</strong></div>
                        <div>Posti: <strong>{offer.spots || 'n/d'}</strong></div>
                        <div>Spazio bagagli: <strong>{offer.luggageCapacity || 'n/d'}</strong></div>
                        <div>Cosa carica: <strong>{offer.luggageDetails || 'n/d'}</strong></div>
                        {offer.stops && <div style={{ gridColumn: 'span 2' }}>Tappe possibili: <strong>{offer.stops}</strong></div>}
                      </div>

                      {/* Rider Compatibili */}
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ fontSize: '10.5px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--turquoise)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>👥 Rider compatibili ({joins.length})</span>
                          <span style={{ flex: 1, height: '1px', background: 'rgba(42, 242, 224, 0.15)' }}></span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {joins.map((join, joinIdx) => (
                            <div key={`cand-join-${join.id || joinIdx}`} style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(42, 242, 224, 0.15)',
                              borderRadius: '8px',
                              padding: '8px 10px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span className="wao-display" style={{ fontSize: '12px', color: 'var(--turquoise)', textTransform: 'none' }}>
                                  {join.nickname}
                                </span>
                                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                                  👥 {join.passengers || join.peopleCount || '1'} {join.passengers === '1' ? 'persona' : 'persone'}
                                </span>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                <div>Bagaglio: <strong style={{ color: 'var(--text-soft)' }}>{join.luggageNeed || 'n/d'}</strong></div>
                                <div>Flessibile vicine: <strong style={{ color: 'var(--text-soft)' }}>{join.nearbyFlexible || 'n/d'}</strong></div>
                                {join.luggageDetails && (
                                  <div style={{ gridColumn: 'span 2' }}>
                                    Cosa porta: <strong style={{ color: 'var(--text-soft)' }}>{join.luggageDetails}</strong>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

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
