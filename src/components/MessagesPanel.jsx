import React from 'react';

// Stable key helper function
function getEntryKey(entry, index) {
  if (entry && entry.id) return entry.id;
  if (entry && entry.createdAt) return entry.createdAt;
  return `${entry?.type || 'req'}-${entry?.route || ''}-${entry?.nickname || ''}-${index}`;
}

export default function MessagesPanel({ requests, onFindRide, onOpenControlRoom, onArchiveRequest }) {
  // Sort requests from newest to oldest by createdAt
  const sortedRequests = [...requests].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : a.id || 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : b.id || 0;
    return dateB - dateA;
  });

  const [showArchived, setShowArchived] = React.useState(false);

  const activeRequests = sortedRequests.filter(r => r.status !== 'rejected');
  const rejectedToArchive = sortedRequests.filter(r => r.status === 'rejected' && !r.archived);
  const archivedRequests = sortedRequests.filter(r => r.archived === true);

  const renderCard = (req, index) => {
    const isOffer = req.type === 'offer';
    const isApproved = req.status === 'approved';
    const isRejected = req.status === 'rejected';
    const isPending = !req.status || req.status === 'pending';

    let cardClass = "card-pending-gold";
    let badgeClass = "badge-pending-gold";
    let badgeText = isOffer ? "Offerta pendente" : "In attesa approvazione";
    if (isApproved) {
      cardClass = "card-approved";
      badgeClass = "badge-approved";
      badgeText = isOffer ? "Offerta approvata" : "Richiesta approvata";
    } else if (isRejected) {
      cardClass = "card-rejected";
      badgeClass = "badge-rejected";
      badgeText = isOffer ? "Offerta non approvata" : "Richiesta non approvata";
    }

    return (
      <div key={getEntryKey(req, index)} className={`ride-card ${cardClass}`}>
        {isPending && <div className="ride-card-glow-gold" aria-hidden="true"></div>}
        {isApproved && <div className="ride-card-glow-approved" aria-hidden="true"></div>}
        
        {/* Header: Stato + Badge */}
        <div className="ride-card-header">
          <div className="ride-status-info">
            <span className="ride-status-title wao-display" style={{ fontSize: '11px', color: 'var(--text-soft)', letterSpacing: '0.08em', fontWeight: 'bold' }}>
              {isOffer ? "Offerta passaggio inviata" : "Richiesta inviata"}
            </span>
          </div>
          <span className={`ride-badge ${badgeClass}`}>
            {badgeText}
          </span>
        </div>

        {/* Dettagli Viaggio e Richiesta/Offerta */}
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

          {isOffer && req.date && (
            <div className="ride-detail-item">
              <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="detail-text">Quando: <strong>{req.date}</strong></span>
            </div>
          )}

          <div className="ride-detail-item">
            <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="detail-text">
              Tu come: <strong>{req.nickname}</strong>
            </span>
          </div>

          {!isOffer ? (
            /* --- JOIN DETAILS --- */
            <>
              <div className="ride-detail-item">
                <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                <span className="detail-text">Persone: <strong>{req.passengers} {req.passengers === '1' ? 'persona' : 'persone'}</strong></span>
              </div>

              {req.tripType && (
                <div className="ride-detail-item">
                  <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M17 2.1l4 4-4 4M3 6h18M7 21.9l-4-4 4-4M21 18H3" />
                  </svg>
                  <span className="detail-text">Tipo viaggio: <strong>{req.tripType}</strong></span>
                </div>
              )}

              {req.travelTime && (
                <div className="ride-detail-item">
                  <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="detail-text">Fascia oraria: <strong>{req.travelTime}</strong></span>
                </div>
              )}

              {req.luggageNeed && (
                <div className="ride-detail-item">
                  <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <span className="detail-text">Bagaglio: <strong>{req.luggageNeed}</strong></span>
                </div>
              )}

              {req.luggageDetails && (
                <div className="ride-detail-item">
                  <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="detail-text">Cosa porta: <strong>{req.luggageDetails}</strong></span>
                </div>
              )}

              {req.nearbyFlexible && (
                <div className="ride-detail-item">
                  <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12" />
                  </svg>
                  <span className="detail-text">Flessibile città vicine: <strong>{req.nearbyFlexible}</strong></span>
                </div>
              )}
            </>
          ) : (
            /* --- OFFER DETAILS --- */
            <>
              <div className="ride-detail-item">
                <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="detail-text">Posti disponibili: <strong>{req.spots}</strong></span>
              </div>

              {req.tripType && (
                <div className="ride-detail-item">
                  <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M17 2.1l4 4-4 4M3 6h18M7 21.9l-4-4 4-4M21 18H3" />
                  </svg>
                  <span className="detail-text">Tipo viaggio: <strong>{req.tripType}</strong></span>
                </div>
              )}

              {req.travelTime && (
                <div className="ride-detail-item">
                  <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="detail-text">Fascia oraria: <strong>{req.travelTime}</strong></span>
                </div>
              )}

              {req.luggageCapacity && (
                <div className="ride-detail-item">
                  <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <span className="detail-text">Spazio bagagli: <strong>{req.luggageCapacity}</strong></span>
                </div>
              )}

              {req.luggageDetails && (
                <div className="ride-detail-item">
                  <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="detail-text">Cosa può caricare: <strong>{req.luggageDetails}</strong></span>
                </div>
              )}

              {req.stops && (
                <div className="ride-detail-item">
                  <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                    <line x1="9" y1="3" x2="9" y2="18" />
                    <line x1="15" y1="6" x2="15" y2="21" />
                  </svg>
                  <span className="detail-text">Tappe possibili: <strong>{req.stops}</strong></span>
                </div>
              )}
            </>
          )}

          {req.message && (
            <div className="request-message-quote" style={{ 
              marginTop: '8px', 
              padding: '10px 12px', 
              background: 'rgba(0, 0, 0, 0.2)', 
              borderRadius: '8px',
              borderLeft: isApproved ? '2px solid var(--turquoise)' : (isRejected ? '2px solid var(--solar-orange)' : '2px solid var(--amber-gold)'),
              fontSize: '12px',
              color: 'var(--text-soft)',
              fontStyle: 'italic'
            }}>
              "{req.message}"
            </div>
          )}
        </div>

        {/* Mini Timeline Visiva */}
        {(() => {
          let progressWidth = '0%';
          let progressColor = 'var(--amber-gold)';
          let activeBg = 'var(--amber-gold)';
          let activeBorder = 'var(--amber-gold)';
          let activeShadow = 'rgba(255, 197, 71, 0.4)';
          let activeLabelColor = 'var(--text-main)';
          let activeTextColor = '#0b0c1e';

          if (isApproved) {
            progressWidth = '100%';
            progressColor = 'var(--turquoise)';
            activeBg = 'var(--turquoise)';
            activeBorder = 'var(--turquoise)';
            activeShadow = 'rgba(42, 242, 224, 0.4)';
            activeLabelColor = 'var(--text-main)';
          } else if (isRejected) {
            progressWidth = '66.6%';
            progressColor = 'rgba(255, 106, 0, 0.7)';
            activeBg = 'rgba(255, 106, 0, 0.7)';
            activeBorder = 'rgba(255, 106, 0, 0.7)';
            activeShadow = 'rgba(255, 106, 0, 0.3)';
            activeLabelColor = 'var(--text-soft)';
            activeTextColor = '#fff';
          } else {
            progressWidth = '33.3%';
            progressColor = 'var(--amber-gold)';
            activeBg = 'var(--amber-gold)';
            activeBorder = 'var(--amber-gold)';
            activeShadow = 'rgba(255, 197, 71, 0.4)';
            activeLabelColor = 'var(--text-main)';
            activeTextColor = '#0b0c1e';
          }

          const timelineStyle = {
            '--progress-color': progressColor,
            '--active-bg': activeBg,
            '--active-border': activeBorder,
            '--active-shadow': activeShadow,
            '--active-label-color': activeLabelColor,
            '--active-text-color': activeTextColor,
          };

          return (
            <div className="mini-timeline-container" style={timelineStyle}>
              <div className="mini-timeline">
                <div className="mini-timeline-progress" style={{ width: progressWidth }} />
                
                {/* Step 1 */}
                <div className="mini-timeline-step active">
                  <div className="mini-timeline-dot">✓</div>
                  <span className="mini-timeline-label">
                    {isOffer ? "Offerta inviata" : "Richiesta inviata"}
                  </span>
                </div>

                {/* Step 2: In review */}
                <div className={`mini-timeline-step active ${isPending ? 'active-pulse' : ''}`}>
                  <div className="mini-timeline-dot">{isPending ? '•' : '✓'}</div>
                  <span className="mini-timeline-label">In review</span>
                </div>

                {/* Step 3: Esito */}
                {isRejected ? (
                  <div className="mini-timeline-step active">
                    <div className="mini-timeline-dot">✕</div>
                    <span className="mini-timeline-label" style={{ color: 'var(--solar-orange)' }}>Non approvata</span>
                  </div>
                ) : (
                  <div className={`mini-timeline-step ${isApproved ? 'active' : ''}`}>
                    <div className="mini-timeline-dot">{isApproved ? '✓' : '3'}</div>
                    <span className="mini-timeline-label">
                      {isOffer ? "Approvazione admin" : "Approvazione crew"}
                    </span>
                  </div>
                )}

                {/* Step 4: Sblocco / Pubblicazione */}
                <div className={`mini-timeline-step ${isApproved ? 'active' : ''}`}>
                  <div className="mini-timeline-dot">{isApproved ? '✓' : '4'}</div>
                  <span className="mini-timeline-label">
                    {isOffer ? "Visibile in Board" : "Crew sbloccata"}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Approved Box for join requests */}
        {isApproved && !isOffer && (
          <div className="telegram-unlocked-card" style={{
            marginTop: '12px',
            padding: '12px 14px',
            background: 'linear-gradient(135deg, rgba(42, 242, 224, 0.15), rgba(24, 26, 70, 0.6))',
            border: '1px solid rgba(42, 242, 224, 0.3)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--turquoise)', fontWeight: 'bold', fontSize: '12.5px' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Gruppo Telegram crew sbloccato</span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-soft)', margin: 0 }}>
              Contatta la crew e accordati per la partenza!
            </p>
            <a 
              href="#telegram-mock" 
              onClick={(e) => e.preventDefault()}
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#0088cc',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '999px',
                textDecoration: 'none',
                fontSize: '11px',
                fontWeight: 'bold',
                marginTop: '4px',
                border: 'none',
                boxShadow: '0 4px 10px rgba(0, 136, 204, 0.3)'
              }}
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.38-.49 1.04-.75 4.08-1.77 6.8-2.94 8.16-3.5 3.88-1.61 4.68-1.89 5.21-1.9.12 0 .38.03.55.17.14.12.18.28.19.4z" />
              </svg>
              Entra nella Crew Telegram
            </a>
          </div>
        )}

        {/* Approved Box for offers */}
        {isApproved && isOffer && (
          <div className="offer-approved-card" style={{
            marginTop: '12px',
            padding: '12px 14px',
            background: 'linear-gradient(135deg, rgba(42, 242, 224, 0.15), rgba(24, 26, 70, 0.6))',
            border: '1px solid rgba(42, 242, 224, 0.3)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--turquoise)', fontWeight: 'bold', fontSize: '12.5px' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Offerta approvata</span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-soft)', margin: 0 }}>
              Offerta approvata — la tua proposta può essere mostrata nella board demo.
            </p>
          </div>
        )}

        {/* Rejected Box: kind notice */}
        {isRejected && (
          <div className="rejection-notice-card" style={{
            marginTop: '12px',
            padding: '10px 12px',
            background: 'rgba(255, 106, 0, 0.05)',
            border: '1px solid rgba(255, 106, 0, 0.15)',
            borderRadius: '8px',
            fontSize: '11.5px',
            color: 'var(--text-soft)',
            lineHeight: '1.4'
          }}>
            <div style={{ fontWeight: 'bold', color: 'var(--solar-orange)', marginBottom: '4px' }}>
              {isOffer ? "Offerta non approvata" : "Richiesta non approvata"}
            </div>
            {isOffer 
              ? "Offerta non approvata per questa demo. Puoi modificarla o proporre un altro passaggio più avanti."
              : "Questa crew non è disponibile per ora. Puoi provare un’altra crew dalla Bacheca."
            }
          </div>
        )}

        {/* Action Button for Rejected (Archivia) */}
        {isRejected && !req.archived && (
          <button
            type="button"
            className="wao-secondary-button wao-display"
            onClick={() => onArchiveRequest(req.id)}
            style={{ 
              marginTop: '10px', 
              width: '100%', 
              padding: '8px 14px', 
              fontSize: '11px',
              borderColor: 'rgba(255, 106, 0, 0.4)',
              background: 'rgba(255, 106, 0, 0.05)',
              color: 'var(--solar-orange)'
            }}
          >
            Archivia
          </button>
        )}

        {/* Nota di attesa */}
        {isPending && (
          <div className="ride-card-footer" style={{ 
            marginTop: '8px', 
            paddingTop: '8px', 
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}>
            {isOffer 
              ? "La crew/admin sta verificando la tua offerta." 
              : "Nessun contatto viene mostrato prima dell’approvazione."
            }
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="messages-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header */}
      <header className="board-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h1 className="board-title wao-display" style={{ margin: 0 }}>Messaggi</h1>
          <button 
            type="button" 
            className="wao-secondary-button wao-display"
            onClick={onOpenControlRoom}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '10.5px', background: 'linear-gradient(135deg, rgba(255, 106, 0, 0.4), rgba(255, 197, 71, 0.2))', borderColor: 'rgba(255, 197, 71, 0.3)' }}
          >
            ⚙️ Control Room demo
          </button>
        </div>
        <p className="board-subtitle" style={{ marginTop: '6px' }}>Gestisci le tue richieste di viaggio e i messaggi.</p>
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
          
          {/* Main active requests (pending / approved) */}
          {activeRequests.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeRequests.map((req, index) => renderCard(req, index))}
            </div>
          )}

          {/* Section: Da archiviare (rejected requests not yet archived) */}
          {rejectedToArchive.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <h3 className="wao-display" style={{ fontSize: '13px', color: 'var(--solar-orange)', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>
                Da archiviare
              </h3>
              {rejectedToArchive.map((req, index) => renderCard(req, index))}
            </div>
          )}

          {/* Light empty state if there is no active or to-archive requests, but there are archived ones */}
          {activeRequests.length === 0 && rejectedToArchive.length === 0 && (
            <div className="placeholder-card" style={{ padding: '24px', textAlign: 'center' }}>
              <p className="placeholder-text" style={{ fontSize: '13px', margin: 0 }}>
                Nessuna attività attiva al momento.
              </p>
              <button 
                type="button" 
                className="wao-primary-button wao-display"
                onClick={onFindRide}
                style={{ marginTop: '12px', padding: '8px 16px', fontSize: '11px' }}
              >
                Esplora la Bacheca
              </button>
            </div>
          )}

          {/* Archive toggle and archived section */}
          {archivedRequests.length > 0 && (
            <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {showArchived ? 'Nascondi archiviate' : 'Mostra archiviate'} ({archivedRequests.length})
              </button>

              {showArchived && (
                <div className="archived-section" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                  <h3 className="wao-display" style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Attività Archiviate
                  </h3>
                  {archivedRequests.map((req, index) => renderCard(req, index))}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
