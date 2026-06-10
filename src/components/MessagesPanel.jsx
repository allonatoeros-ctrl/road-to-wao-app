import React, { useState } from 'react';

// Stable key helper function
function getEntryKey(entry, index) {
  if (entry && entry.id) return entry.id;
  if (entry && entry.createdAt) return entry.createdAt;
  return `${entry?.type || 'req'}-${entry?.route || ''}-${entry?.nickname || ''}-${index}`;
}

export default function MessagesPanel({ 
  requests = [], 
  rides = [], 
  joinRequests = [], 
  generalRequests = [], 
  onFindRide, 
  onOpenControlRoom, 
  onArchiveRequest 
}) {
  const [showArchived, setShowArchived] = useState(false);
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpand = (id) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const hasNewModelData = (joinRequests && joinRequests.length > 0) || (generalRequests && generalRequests.length > 0);

  // -------------------------------------------------------------
  // NEW MODEL LOGIC
  // -------------------------------------------------------------
  const allNewRequests = [
    ...(joinRequests || []).map(r => ({ ...r, reqType: 'join' })),
    ...(generalRequests || []).map(r => ({ ...r, reqType: 'general' }))
  ];

  const sortedNewRequests = [...allNewRequests].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const activeNewRequests = sortedNewRequests.filter(r => r.status !== 'rejected' && !r.archived);
  const rejectedNewToArchive = sortedNewRequests.filter(r => r.status === 'rejected' && !r.archived);
  const archivedNewRequests = sortedNewRequests.filter(r => r.archived === true);

  // -------------------------------------------------------------
  // LEGACY MODEL LOGIC (FALLBACK)
  // -------------------------------------------------------------
  const sortedLegacyRequests = [...(requests || [])].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : a.id || 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : b.id || 0;
    return dateB - dateA;
  });

  const activeLegacyRequests = sortedLegacyRequests.filter(r => r.status !== 'rejected');
  const rejectedLegacyToArchive = sortedLegacyRequests.filter(r => r.status === 'rejected' && !r.archived);
  const archivedLegacyRequests = sortedLegacyRequests.filter(r => r.archived === true);

  // -------------------------------------------------------------
  // CARD RENDERERS
  // -------------------------------------------------------------
  const renderNewCard = (req, index) => {
    const isJoin = req.reqType === 'join';
    const isApproved = req.status === 'approved';
    const isRejected = req.status === 'rejected';
    const isPending = !req.status || req.status === 'pending' || req.status === 'active';

    const ride = isJoin ? rides.find(r => r.id === req.rideId) : null;
    const departure = isJoin ? (ride ? ride.departureCity : (req.departureCity || 'WAO')) : (req.departureCity || 'WAO');
    const routeTitle = isJoin ? `Richiesta per ${departure} → WAO` : `Richiesta generale per ${departure}`;

    let cardClass = "card-pending-gold";
    let badgeClass = "badge-pending-gold";
    let badgeText = isJoin ? "In approvazione" : "Attiva";
    let statusCopy = isJoin ? "Richiesta in approvazione" : "Stiamo cercando una crew compatibile.";

    if (isApproved) {
      cardClass = "card-approved";
      badgeClass = "badge-approved";
      badgeText = "Approvata";
      statusCopy = isJoin ? "Crew sbloccata" : "Richiesta approvata";
    } else if (isRejected) {
      cardClass = "card-rejected";
      badgeClass = "badge-rejected";
      badgeText = "Non approvata";
      statusCopy = isJoin ? "Richiesta non approvata" : "Richiesta generale non approvata";
    }

    const driverName = isJoin ? (ride ? ride.driver : 'Cosmic Driver') : '';
    const dateFascia = isJoin 
      ? (ride ? `${ride.departureDate} (${ride.travelTime})` : (req.travelTime || ''))
      : (req.travelTime || '');

    const isExpanded = !!expandedIds[req.id];

    return (
      <div key={req.id || index} className={`ride-card ${cardClass}`} style={{ padding: '12px 14px', position: 'relative' }}>
        {isPending && <div className="ride-card-glow-gold" aria-hidden="true"></div>}
        {isApproved && <div className="ride-card-glow-approved" aria-hidden="true"></div>}

        {/* Card Header: Type badge + Status badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-soft)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>
            {isJoin ? '👥 Richiesta specifica' : '🌍 Richiesta generale'}
          </span>
          <span className={`ride-badge ${badgeClass}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
            {badgeText}
          </span>
        </div>

        {/* Title: Route */}
        <div className="wao-display" style={{ fontSize: '15px', color: 'var(--text-main)', textTransform: 'none', margin: '4px 0 2px 0' }}>
          {routeTitle}
        </div>

        {/* Status Copy */}
        <div style={{ fontSize: '12.5px', color: isApproved ? 'var(--turquoise)' : (isRejected ? 'var(--solar-orange)' : 'var(--amber-gold)'), fontWeight: 'bold', margin: '4px 0 6px 0' }}>
          {statusCopy}
        </div>

        {/* Telegram button - Only for approved JOIN requests with rideId */}
        {isApproved && isJoin && (
          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-start' }}>
            <a 
              href={ride?.telegramUrl || '#'} 
              target={ride?.telegramUrl && ride.telegramUrl !== '#' ? "_blank" : undefined}
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!ride?.telegramUrl || ride.telegramUrl === '#') {
                  e.preventDefault();
                }
              }}
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#0088cc',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '999px',
                textDecoration: 'none',
                fontSize: '11px',
                fontWeight: 'bold',
                border: 'none',
                boxShadow: '0 4px 10px rgba(0, 136, 204, 0.3)'
              }}
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.38-.49 1.04-.75 4.08-1.77 6.8-2.94 8.16-3.5 3.88-1.61 4.68-1.89 5.21-1.9.12 0 .38.03.55.17.14.12.18.28.19.4z" />
              </svg>
              Apri Telegram Crew
            </a>
          </div>
        )}

        {/* Collapsible details wrapper */}
        {isExpanded && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--text-soft)', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '4px', 
              background: 'rgba(0, 0, 0, 0.25)', 
              padding: '8px 10px', 
              borderRadius: '8px' 
            }}>
              {isJoin ? (
                <>
                  <div>Driver: <strong>{driverName}</strong></div>
                  <div>Data / Fascia: <strong>{dateFascia}</strong></div>
                  <div>Persone: <strong>{req.passengers || req.peopleCount || '1'}</strong></div>
                  {req.tripType && <div>Tipo viaggio: <strong>{req.tripType}</strong></div>}
                  {req.luggageNeed && <div>Bagaglio: <strong>{req.luggageNeed}</strong></div>}
                  {req.luggageDetails && <div>Cosa porta: <strong>{req.luggageDetails}</strong></div>}
                  {req.nearbyFlexible && <div>Flessibile città vicine: <strong>{req.nearbyFlexible}</strong></div>}
                </>
              ) : (
                <>
                  <div>Città: <strong>{departure}</strong></div>
                  <div>Fascia oraria: <strong>{req.travelTime}</strong></div>
                  {req.tripType && <div>Tipo viaggio: <strong>{req.tripType}</strong></div>}
                  {req.luggageNeed && <div>Bagaglio: <strong>{req.luggageNeed}</strong></div>}
                  {req.luggageDetails && <div>Cosa porta: <strong>{req.luggageDetails}</strong></div>}
                  <div>Persone: <strong>{req.passengers || req.peopleCount || '1'}</strong></div>
                  {req.nearbyFlexible && <div>Flessibile città vicine: <strong>{req.nearbyFlexible}</strong></div>}
                </>
              )}
            </div>

            {req.message && (
              <div className="request-message-quote" style={{ 
                padding: '8px 10px', 
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

            {/* Kind notice for rejection */}
            {isRejected && (
              <div className="rejection-notice-card" style={{
                padding: '10px 12px',
                background: 'rgba(255, 106, 0, 0.05)',
                border: '1px solid rgba(255, 106, 0, 0.15)',
                borderRadius: '8px',
                fontSize: '11.5px',
                color: 'var(--text-soft)',
                lineHeight: '1.4'
              }}>
                <div style={{ fontWeight: 'bold', color: 'var(--solar-orange)', marginBottom: '4px' }}>
                  {isJoin ? "Richiesta non approvata" : "Richiesta generale non approvata"}
                </div>
                {isJoin 
                  ? "Questa crew non è disponibile per ora. Puoi provare un’altra crew dalla Bacheca."
                  : "Non è stato possibile trovare una crew compatibile. Puoi lasciare una nuova richiesta."
                }
              </div>
            )}

            {/* Mini Timeline Visiva (solo per Join Requests specifiche) */}
            {isJoin && (() => {
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
                    
                    <div className="mini-timeline-step active">
                      <div className="mini-timeline-dot">✓</div>
                      <span className="mini-timeline-label">Richiesta inviata</span>
                    </div>

                    <div className={`mini-timeline-step active ${isPending ? 'active-pulse' : ''}`}>
                      <div className="mini-timeline-dot">{isPending ? '•' : '✓'}</div>
                      <span className="mini-timeline-label">In review</span>
                    </div>

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

                    <div className={`mini-timeline-step ${isApproved ? 'active' : ''}`}>
                      <div className="mini-timeline-dot">{isApproved ? '✓' : '4'}</div>
                      <span className="mini-timeline-label">Crew sbloccata</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Action Button for Rejected (Archivia) */}
            {isRejected && !req.archived && (
              <button
                type="button"
                className="wao-secondary-button wao-display"
                onClick={() => onArchiveRequest(req.id)}
                style={{ 
                  marginTop: '4px', 
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
          </div>
        )}

        {/* Footer Toggle Button */}
        <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '6px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => toggleExpand(req.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '11px',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '2px 6px'
            }}
          >
            {isExpanded ? '▲ Riduci dettagli' : '▼ Apri dettagli'}
          </button>
        </div>
      </div>
    );
  };

  // Legacy Card Renderer (maintains backward compatibility with requests)
  const renderLegacyCard = (req, index) => {
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

    const isExpanded = !!expandedIds[req.id];

    return (
      <div key={getEntryKey(req, index)} className={`ride-card ${cardClass}`} style={{ padding: '12px 14px', position: 'relative' }}>
        {isPending && <div className="ride-card-glow-gold" aria-hidden="true"></div>}
        {isApproved && <div className="ride-card-glow-approved" aria-hidden="true"></div>}
        
        {/* Header: Stato + Badge */}
        <div className="ride-card-header" style={{ marginBottom: '6px' }}>
          <div className="ride-status-info">
            <span className="ride-status-title wao-display" style={{ fontSize: '10px', color: 'var(--text-soft)', letterSpacing: '0.08em', fontWeight: 'bold' }}>
              {isOffer ? "Offerta passaggio inviata" : "Richiesta inviata"}
            </span>
          </div>
          <span className={`ride-badge ${badgeClass}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
            {badgeText}
          </span>
        </div>

        {/* Title / Route */}
        <div className="ride-route wao-display" style={{ fontSize: '15px', margin: '4px 0 6px 0', textTransform: 'none' }}>
          {req.route}
        </div>

        {/* Telegram unlocked card (only for approved non-offer) */}
        {isApproved && !isOffer && (
          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-start' }}>
            <a 
              href="#telegram-mock" 
              onClick={(e) => e.preventDefault()}
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#0088cc',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '999px',
                textDecoration: 'none',
                fontSize: '11px',
                fontWeight: 'bold',
                border: 'none',
                boxShadow: '0 4px 10px rgba(0, 136, 204, 0.3)'
              }}
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.38-.49 1.04-.75 4.08-1.77 6.8-2.94 8.16-3.5 3.88-1.61 4.68-1.89 5.21-1.9.12 0 .38.03.55.17.14.12.18.28.19.4z" />
              </svg>
              Apri Telegram Crew
            </a>
          </div>
        )}

        {/* Collapsible Details */}
        {isExpanded && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--text-soft)', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '4px', 
              background: 'rgba(0, 0, 0, 0.25)', 
              padding: '8px 10px', 
              borderRadius: '8px' 
            }}>
              <div>Partenza da: <strong>{req.departure}</strong></div>
              <div>Tu come: <strong>{req.nickname}</strong></div>
              {isOffer ? (
                <>
                  <div>Posti disponibili: <strong>{req.spots}</strong></div>
                  {req.date && <div>Quando: <strong>{req.date}</strong></div>}
                  {req.tripType && <div>Tipo viaggio: <strong>{req.tripType}</strong></div>}
                  {req.travelTime && <div>Fascia oraria: <strong>{req.travelTime}</strong></div>}
                  {req.luggageCapacity && <div>Spazio bagagli: <strong>{req.luggageCapacity}</strong></div>}
                  {req.luggageDetails && <div>Cosa può caricare: <strong>{req.luggageDetails}</strong></div>}
                  {req.stops && <div>Tappe possibili: <strong>{req.stops}</strong></div>}
                </>
              ) : (
                <>
                  <div>Persone: <strong>{req.passengers} {req.passengers === '1' ? 'persona' : 'persone'}</strong></div>
                  {req.tripType && <div>Tipo viaggio: <strong>{req.tripType}</strong></div>}
                  {req.travelTime && <div>Fascia oraria: <strong>{req.travelTime}</strong></div>}
                  {req.luggageNeed && <div>Bagaglio: <strong>{req.luggageNeed}</strong></div>}
                  {req.luggageDetails && <div>Cosa porta: <strong>{req.luggageDetails}</strong></div>}
                  {req.nearbyFlexible && <div>Flessibile città vicine: <strong>{req.nearbyFlexible}</strong></div>}
                </>
              )}
            </div>

            {req.message && (
              <div className="request-message-quote" style={{ 
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

            {isRejected && (
              <div className="rejection-notice-card" style={{
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
                  marginTop: '4px', 
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
          </div>
        )}

        {/* Footer Toggle Button */}
        <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '6px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => toggleExpand(req.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '11px',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '2px 6px'
            }}
          >
            {isExpanded ? '▲ Riduci dettagli' : '▼ Apri dettagli'}
          </button>
        </div>
      </div>
    );
  };

  // Determine lists based on mode
  const activeList = hasNewModelData ? activeNewRequests : activeLegacyRequests;
  const toArchiveList = hasNewModelData ? rejectedNewToArchive : rejectedLegacyToArchive;
  const archivedList = hasNewModelData ? archivedNewRequests : archivedLegacyRequests;
  const totalCount = hasNewModelData ? sortedNewRequests.length : sortedLegacyRequests.length;

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

      {totalCount === 0 ? (
        <div className="placeholder-card">
          <div className="placeholder-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--amber-gold)" strokeWidth="1.5" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="placeholder-title wao-display">Non hai ancora richieste attive</h2>
          <p className="placeholder-text">
            Vai in Bacheca per chiedere un passaggio o lasciare una richiesta generale.
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
          {activeList.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeList.map((req, index) => hasNewModelData ? renderNewCard(req, index) : renderLegacyCard(req, index))}
            </div>
          )}

          {/* Section: Da archiviare (rejected requests not yet archived) */}
          {toArchiveList.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <h3 className="wao-display" style={{ fontSize: '13px', color: 'var(--solar-orange)', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>
                Da archiviare
              </h3>
              {toArchiveList.map((req, index) => hasNewModelData ? renderNewCard(req, index) : renderLegacyCard(req, index))}
            </div>
          )}

          {/* Empty state if there are archived but no active or pending requests */}
          {activeList.length === 0 && toArchiveList.length === 0 && (
            <div className="placeholder-card" style={{ padding: '24px', textAlign: 'center' }}>
              <h2 className="placeholder-title wao-display" style={{ fontSize: '16px' }}>Non hai ancora richieste attive</h2>
              <p className="placeholder-text" style={{ fontSize: '13px', margin: '8px 0 16px 0' }}>
                Vai in Bacheca per chiedere un passaggio o lasciare una richiesta generale.
              </p>
              <button 
                type="button" 
                className="wao-primary-button wao-display"
                onClick={onFindRide}
                style={{ padding: '8px 16px', fontSize: '11px', width: 'auto', margin: '0 auto' }}
              >
                Esplora la Bacheca
              </button>
            </div>
          )}

          {/* Archive toggle and archived section */}
          {archivedList.length > 0 && (
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
                {showArchived ? 'Nascondi archiviate' : 'Mostra archiviate'} ({archivedList.length})
              </button>

              {showArchived && (
                <div className="archived-section" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                  <h3 className="wao-display" style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Attività Archiviate
                  </h3>
                  {archivedList.map((req, index) => hasNewModelData ? renderNewCard(req, index) : renderLegacyCard(req, index))}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
