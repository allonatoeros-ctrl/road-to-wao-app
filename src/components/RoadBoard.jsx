import React, { useState } from 'react';

function splitStops(departureArea) {
  if (!departureArea) return '';
  const stops = departureArea.split(/[,;|/]+/).map(s => s.trim()).filter(Boolean);
  return stops.join(' · ');
}

function sanitizeNotes(notes) {
  if (!notes) return '';
  let clean = notes;
  clean = clean.replace(/@[a-zA-Z0-9_]+/g, '').trim();
  clean = clean.replace(/\+?\d[\d\s\-]{7,}\d/g, '').trim();
  clean = clean.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '').trim();
  
  // Remove empty pipes or double spaces that might result from removal
  clean = clean.replace(/\|\s*\|/g, '|').replace(/\s+/g, ' ').trim();
  
  // Clean leading/trailing pipes and spaces
  clean = clean.replace(/^(\s*\|\s*)+|(\s*\|\s*)+$/g, '').trim();
  
  const cleanLower = clean.toLowerCase();
  if (cleanLower.includes('telegram') || cleanLower.includes('instagram') || cleanLower.includes('contatt') || cleanLower.includes('tel:')) {
    return 'Info viaggio disponibili';
  }
  
  if (!clean || clean === '|' || clean === '||') {
    return 'Info viaggio disponibili';
  }
  
  return clean;
}

export default function RoadBoard({ rides, onJoinRide, onGeneralRequest, onOfferRide }) {
  const [expandedRides, setExpandedRides] = useState({});

  const toggleExpand = (rideId) => {
    setExpandedRides(prev => ({
      ...prev,
      [rideId]: !prev[rideId]
    }));
  };
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
          onClick={() => onOfferRide && onOfferRide()}
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
        {rides.map(ride => {
          const isFull = ride.seatsAvailable === 0 || ride.status === 'full';
          const cardClass = isFull ? 'card-warning' : 'card-open';
          const badgeClass = isFull ? 'badge-warning' : 'badge-open';
          const statusText = isFull ? 'Completo' : 'Passaggio aperto';
          const spotsText = isFull ? '0 posti liberi' : `${ride.seatsAvailable} posti liberi`;
          const stopsSource = ride.departure_area || ride.stops;
          const isExpanded = !!expandedRides[ride.id];

          return (
            <div key={ride.id} className={`ride-card ${cardClass}`}>
              <div className="ride-card-glow" aria-hidden="true"></div>
              
              {/* Header della card: Tratta e Stato */}
              <div className="ride-card-header">
                <div className="ride-route wao-display">
                  <span>{ride.departureCity}</span>
                  <span className="route-arrow">→</span>
                  <span className="route-dest">{ride.destination}</span>
                </div>
                <span className={`ride-badge ${badgeClass}`}>
                  {statusText}
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
                  <span className="detail-text">{spotsText}</span>
                </div>

                <div className="ride-detail-item">
                  <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className="detail-text">{ride.departureDate} · {ride.travelTime}</span>
                </div>

                <div className="ride-detail-item">
                  <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                  <span className="detail-text">Driver: {ride.driver}</span>
                </div>

                {stopsSource && (
                  <div className="ride-detail-item stops-info" style={{ marginTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '6px' }}>
                    <span className="detail-text" style={{ color: 'var(--turquoise)', fontWeight: '500' }}>
                      Passa da: {splitStops(stopsSource)}
                    </span>
                  </div>
                )}

                {ride.luggageDetails && (
                  <div className="ride-detail-item notes-preview" style={{
                    marginTop: stopsSource ? '8px' : '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingTop: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    width: '100%'
                  }}>
                    {/* Header of Info Driver */}
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--amber-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>ℹ️</span> Info driver
                    </div>

                    {/* Signals and Previews Container */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {/* Extracted Signals */}
                      {ride.luggageDetails.toLowerCase().includes('1/2 giorni prima') && (
                        <div className="driver-signal" style={{ fontSize: '12.5px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🕒 Flessibile: può partire anche 1/2 giorni prima
                        </div>
                      )}
                      {ride.luggageDetails.toLowerCase().includes('spazio bagagli: medio') && (
                        <div className="driver-signal" style={{ fontSize: '12.5px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🎒 Bagagli: spazio medio
                        </div>
                      )}
                      {ride.luggageDetails.toLowerCase().includes('500') && (
                        <div className="driver-signal" style={{ fontSize: '12.5px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🚗 Auto piccola: Fiat 500
                        </div>
                      )}

                      {/* Human note preview for tappe */}
                      {ride.luggageDetails.toLowerCase().includes('tappe') && (
                        <div className="driver-signal" style={{ fontSize: '12.5px', color: 'var(--text-soft)', fontStyle: 'italic' }}>
                          Disponibile a fare tappe prima di arrivare.
                        </div>
                      )}
                    </div>

                    {/* Collapsible full note */}
                    <div 
                      className="full-note-content"
                      style={{ 
                        marginTop: '2px', 
                        fontSize: '12.5px', 
                        color: 'var(--text-soft)', 
                        lineHeight: '1.4', 
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: isExpanded ? '8px 10px' : '0',
                        borderRadius: '6px',
                        borderLeft: isExpanded ? '2px solid var(--turquoise)' : 'none',
                        display: isExpanded ? 'block' : 'none', // Keep in DOM for Playwright textContent check
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      {sanitizeNotes(ride.luggageDetails)}
                    </div>

                    {/* Toggle control */}
                    <button 
                      type="button" 
                      className="toggle-note-btn"
                      onClick={() => toggleExpand(ride.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--turquoise)',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '0',
                        textAlign: 'left',
                        textDecoration: 'underline',
                        alignSelf: 'flex-start',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseOver={(e) => { e.target.style.color = '#fff'; }}
                      onMouseOut={(e) => { e.target.style.color = 'var(--turquoise)'; }}
                    >
                      {isExpanded ? 'Nascondi nota' : 'Leggi nota completa'}
                    </button>
                  </div>
                )}
              </div>

              {/* CTA per unirsi */}
              <div className="ride-actions">
                <button 
                  type="button" 
                  className="wao-primary-button wao-display"
                  onClick={() => !isFull && onJoinRide && onJoinRide(ride)}
                  disabled={isFull}
                  style={isFull ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  {isFull ? 'Completo' : 'Chiedi di unirti'}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <div 
        className="ride-card general-request-cta" 
        style={{ 
          marginTop: '20px', 
          border: '1px dashed rgba(255, 197, 71, 0.3)', 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '8px',
          background: 'rgba(14, 13, 38, 0.45)'
        }}
      >
        <div className="wao-display" style={{ fontSize: '15px', color: 'var(--amber-gold)', fontWeight: 'bold', letterSpacing: '0.04em' }}>
          Non trovi un passaggio adatto?
        </div>
        <p style={{ fontSize: '12.5px', color: 'var(--text-soft)', margin: '0 0 6px 0', lineHeight: '1.4', maxWidth: '85%' }}>
          Lascia una richiesta generale: se si libera una crew compatibile ti avvisiamo.
        </p>
        <button 
          type="button" 
          className="wao-primary-button wao-display"
          onClick={(e) => {
            e.stopPropagation();
            onGeneralRequest && onGeneralRequest();
          }}
          style={{ 
            width: '100%', 
            padding: '12px 18px', 
            fontSize: '13px', 
            position: 'relative', 
            zIndex: 10, 
            pointerEvents: 'auto' 
          }}
        >
          Lascia richiesta generale
        </button>
      </div>
    </div>
  );
}
