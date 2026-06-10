import React from 'react';

export default function MessagesPanel({ requests, onFindRide, onOpenControlRoom }) {
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
          {requests.map((req, index) => {
            const isApproved = req.status === 'approved';
            const isRejected = req.status === 'rejected';
            const isPending = !req.status || req.status === 'pending';

            let cardClass = "card-pending-gold";
            let badgeClass = "badge-pending-gold";
            let badgeText = "In attesa approvazione";
            if (isApproved) {
              cardClass = "card-approved";
              badgeClass = "badge-approved";
              badgeText = "Richiesta approvata";
            } else if (isRejected) {
              cardClass = "card-rejected";
              badgeClass = "badge-rejected";
              badgeText = "Richiesta non approvata";
            }

            return (
              <div key={req.id || `${req.route}-${req.nickname}-${req.departure}-${req.message ? req.message.substring(0, 15) : ''}`} className={`ride-card ${cardClass}`}>
                {isPending && <div className="ride-card-glow-gold" aria-hidden="true"></div>}
                {isApproved && <div className="ride-card-glow-approved" aria-hidden="true"></div>}
                
                {/* Header: Richiesta inviata + Badge */}
                <div className="ride-card-header">
                  <div className="ride-status-info">
                    <span className="ride-status-title wao-display" style={{ fontSize: '11px', color: 'var(--text-soft)', letterSpacing: '0.08em', fontWeight: 'bold' }}>
                      Richiesta inviata
                    </span>
                  </div>
                  <span className={`ride-badge ${badgeClass}`}>
                    {badgeText}
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
                        
                        {/* Step 1: Richiesta inviata */}
                        <div className="mini-timeline-step active">
                          <div className="mini-timeline-dot">✓</div>
                          <span className="mini-timeline-label">Richiesta inviata</span>
                        </div>

                        {/* Step 2: In review */}
                        <div className={`mini-timeline-step active ${isPending ? 'active-pulse' : ''}`}>
                          <div className="mini-timeline-dot">{isPending ? '•' : '✓'}</div>
                          <span className="mini-timeline-label">In review</span>
                        </div>

                        {/* Step 3: Approvazione crew / Non approvata */}
                        {isRejected ? (
                          <div className="mini-timeline-step active">
                            <div className="mini-timeline-dot">✕</div>
                            <span className="mini-timeline-label" style={{ color: 'var(--solar-orange)' }}>Non approvata</span>
                          </div>
                        ) : (
                          <div className={`mini-timeline-step ${isApproved ? 'active' : ''}`}>
                            <div className="mini-timeline-dot">{isApproved ? '✓' : '3'}</div>
                            <span className="mini-timeline-label">Approvazione crew</span>
                          </div>
                        )}

                        {/* Step 4: Crew sbloccata */}
                        <div className={`mini-timeline-step ${isApproved ? 'active' : ''}`}>
                          <div className="mini-timeline-dot">{isApproved ? '✓' : '4'}</div>
                          <span className="mini-timeline-label">Crew sbloccata</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Approved Box: telegram crew unlock */}
                {isApproved && (
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
                    <div style={{ fontWeight: 'bold', color: 'var(--solar-orange)', marginBottom: '4px' }}>Richiesta non approvata</div>
                    La crew non ha potuto accogliere la tua richiesta per questo viaggio. Non arrenderti! Ci sono molte altre crew pronte a partire sulla Bacheca.
                  </div>
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
                    Nessun contatto viene mostrato prima dell’approvazione.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
