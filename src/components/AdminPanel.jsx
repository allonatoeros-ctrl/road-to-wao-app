import React, { useState } from 'react';

function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
  } catch {
    return '';
  }
}

export default function AdminPanel({
  rides = [],
  joinRequests = [],
  generalRequests = [],
  requests = [],
  onApproveJoin,
  onRejectJoin,
  onArchiveGeneralRequest,
  onUpdateStatus,
  onClose,
  isAdmin = false,
  onCleanDemoBoard,
}) {
  const [expandedRides, setExpandedRides] = useState({});
  const [showHistory, setShowHistory] = useState(false);

  const toggleRide = (id) =>
    setExpandedRides((prev) => ({ ...prev, [id]: !prev[id] }));

  // ── KPI ──────────────────────────────────────────────────────
  const openRides = rides.filter((r) => r.status !== 'full' && r.status !== 'closed');
  const totalSeats = openRides.reduce((acc, r) => acc + (r.seatsAvailable || 0), 0);
  const pendingJoins = joinRequests.filter((r) => r.status === 'pending' && !r.archived);
  const activeGenerals = generalRequests.filter((r) => !r.archived && r.status !== 'rejected');

  // ── LEFT — rides + their pending joins ──────────────────────
  const sortedRides = [...rides].sort((a, b) => {
    // open rides first, then by id (newest last added = first in INITIAL_RIDES order)
    if (a.status === 'full' && b.status !== 'full') return 1;
    if (a.status !== 'full' && b.status === 'full') return -1;
    return 0;
  });

  const pendingJoinsByRide = (rideId) =>
    joinRequests.filter((j) => j.rideId === rideId && j.status === 'pending' && !j.archived);

  // ── HISTORY — approved + rejected joins ─────────────────────
  const historyJoins = [...joinRequests]
    .filter((j) => j.status === 'approved' || j.status === 'rejected')
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  // legacy offers from requests that are not joins
  const legacyOffers = requests.filter(
    (r) => r.type === 'offer' && (r.status === 'approved' || r.status === 'rejected'),
  );

  // ── RIGHT — general requests ─────────────────────────────────
  const activeGenReqs = generalRequests.filter((r) => !r.archived);
  const archivedGenReqs = generalRequests.filter((r) => r.archived);

  // ── RIGHT — crew candidates (read-only) ──────────────────────
  // Match open rides against their pending joins + any compatible general request
  const crewCandidates = openRides
    .map((ride) => {
      const joins = pendingJoinsByRide(ride.id);
      const compatGenerals = generalRequests.filter((g) => {
        if (g.archived) return false;
        const sameCity =
          (g.departureCity || '').toLowerCase() === (ride.departureCity || '').toLowerCase();
        const sameTrip =
          !g.tripType ||
          !ride.tripType ||
          g.tripType.toLowerCase() === ride.tripType.toLowerCase();
        return sameCity && sameTrip;
      });
      if (joins.length === 0 && compatGenerals.length === 0) return null;
      return { ride, joins, compatGenerals };
    })
    .filter(Boolean);

  // ── Empty state: no data at all ──────────────────────────────
  const totalItems =
    joinRequests.length + generalRequests.length + requests.length + rides.length;

  return (
    <div className="cr-root">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="cr-header">
        <div className="cr-header-top">
          <button
            type="button"
            className="wao-cancel-button wao-display"
            onClick={onClose}
            style={{ width: 'auto', padding: '5px 12px', fontSize: '11px' }}
          >
            ← Indietro
          </button>
          <h1 className="cr-title">Control Room</h1>
          <span className="cr-demo-badge">Demo · non ufficiale</span>
          {isAdmin && onCleanDemoBoard && (
            <button
              type="button"
              className="wao-secondary-button wao-display"
              onClick={onCleanDemoBoard}
              style={{
                width: 'auto',
                padding: '6px 14px',
                fontSize: '11px',
                marginLeft: 'auto',
                background: 'linear-gradient(135deg, rgba(255, 60, 0, 0.4), rgba(255, 106, 0, 0.2))',
                borderColor: 'rgba(255, 106, 0, 0.4)'
              }}
            >
              🧹 Pulisci bacheca demo
            </button>
          )}
        </div>
        <p className="cr-subtitle">
          Panoramica passaggi · Approva richieste join · Gestisci richieste generali.
        </p>
      </div>

      {/* ── KPI STRIP ──────────────────────────────────────── */}
      <div className="cr-kpi-strip">
        <div className="cr-kpi-tile cr-kpi-tile--open">
          <span className="cr-kpi-value">{openRides.length}</span>
          <span className="cr-kpi-label">Ride Aperte</span>
        </div>
        <div className="cr-kpi-tile cr-kpi-tile--seats">
          <span className="cr-kpi-value">{totalSeats}</span>
          <span className="cr-kpi-label">Posti disponibili</span>
        </div>
        <div className="cr-kpi-tile cr-kpi-tile--join">
          <span className="cr-kpi-value">{pendingJoins.length}</span>
          <span className="cr-kpi-label">Join Pendenti</span>
        </div>
        <div className="cr-kpi-tile cr-kpi-tile--gen">
          <span className="cr-kpi-value">{activeGenerals.length}</span>
          <span className="cr-kpi-label">Generali Attive</span>
        </div>
      </div>

      {/* ── MAIN 2-COL GRID ────────────────────────────────── */}
      <div className="cr-main-grid">

        {/* ════ LEFT COLUMN ════════════════════════════════════ */}
        <div className="cr-left">

          {/* ─ Rides + grouped join requests ─ */}
          <div>
            <p className="cr-section-title">Passaggi ({rides.length})</p>

            {rides.length === 0 && (
              <p className="cr-empty">
                Nessun passaggio disponibile. Crea un'offerta dalla home.
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sortedRides.map((ride) => {
                const isFull = ride.status === 'full' || ride.seatsAvailable === 0;
                const isOpen = expandedRides[ride.id];
                const rideJoins = pendingJoinsByRide(ride.id);

                return (
                  <div
                    key={ride.id}
                    className={`cr-ride-card${isFull ? ' cr-ride-card--full' : ''}`}
                  >
                    {/* Ride header row — click to expand */}
                    <div
                      className="cr-ride-header"
                      onClick={() => toggleRide(ride.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && toggleRide(ride.id)}
                      aria-expanded={isOpen}
                    >
                      <span className="cr-ride-route">
                        {ride.departureCity} → {ride.destination || 'WAO'}
                      </span>
                      <span className="cr-ride-meta">
                        {ride.driver} · {ride.departureDate} · {ride.travelTime}
                      </span>
                      <span className={`cr-seat-pill ${isFull ? 'cr-seat-pill--full' : 'cr-seat-pill--ok'}`}>
                        {isFull
                          ? 'Completo'
                          : `${ride.seatsAvailable}/${ride.seatsTotal} posti`}
                      </span>
                      {rideJoins.length > 0 && (
                        <span
                          style={{
                            fontSize: '10px',
                            background: 'rgba(255,197,71,0.12)',
                            color: 'var(--amber-gold)',
                            border: '1px solid rgba(255,197,71,0.25)',
                            borderRadius: '20px',
                            padding: '1px 7px',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {rideJoins.length} in attesa
                        </span>
                      )}
                      <span className="cr-expand-toggle">{isOpen ? '▲' : '▼'}</span>
                    </div>

                    {/* Expandable join request list */}
                    {isOpen && (
                      <div className="cr-join-list">
                        {rideJoins.length === 0 ? (
                          <div className="cr-join-row">
                            <span className="cr-join-detail" style={{ fontStyle: 'italic' }}>
                              Nessuna richiesta pending per questo passaggio.
                            </span>
                          </div>
                        ) : (
                          rideJoins.map((jr) => {
                            const pax = jr.peopleCount || jr.passengers || '1';
                            const luggage = jr.luggageNeed || '—';
                            const msg = jr.message ? `"${jr.message.slice(0, 50)}${jr.message.length > 50 ? '…' : ''}"` : '';
                            return (
                              <div key={jr.id} className="cr-join-row">
                                <span className="cr-join-name">{jr.nickname}</span>
                                <span className="cr-join-detail">
                                  {pax} {pax === '1' ? 'persona' : 'persone'} ·{' '}
                                  bagaglio: {luggage}
                                  {jr.tripType ? ` · ${jr.tripType}` : ''}
                                  {msg ? ` · ${msg}` : ''}
                                </span>
                                <span className="cr-join-detail" style={{ flexShrink: 0, flex: 'none', width: 'auto', color: 'var(--text-muted)', fontSize: '10px' }}>
                                  {fmtDate(jr.createdAt)}
                                </span>
                                <div className="cr-join-actions">
                                  <button
                                    type="button"
                                    className="cr-btn-approve"
                                    onClick={() => onApproveJoin && onApproveJoin(jr.id, ride.id)}
                                  >
                                    Approva
                                  </button>
                                  <button
                                    type="button"
                                    className="cr-btn-reject"
                                    onClick={() => onRejectJoin && onRejectJoin(jr.id)}
                                  >
                                    Rifiuta
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─ Moderation history ─ */}
          <div>
            <button
              type="button"
              className="cr-history-toggle"
              onClick={() => setShowHistory((v) => !v)}
            >
              {showHistory ? '▲ Nascondi' : '▼ Mostra'} storico moderazione
              ({historyJoins.length + legacyOffers.length})
            </button>

            {showHistory && (
              <>
                {historyJoins.length === 0 && legacyOffers.length === 0 ? (
                  <p className="cr-empty">Nessuna moderazione effettuata.</p>
                ) : (
                  <div className="cr-history-list">
                    {historyJoins.map((j, i) => {
                      const ride = rides.find((r) => r.id === j.rideId);
                      const route = ride
                        ? `${ride.departureCity} → ${ride.destination || 'WAO'}`
                        : (j.rideSummary || 'Ride non trovato');
                      return (
                        <div key={j.id || i} className="cr-history-row">
                          <span className="cr-history-name">{j.nickname}</span>
                          <span className="cr-history-route">{route}</span>
                          <span className="cr-history-date">{fmtDate(j.createdAt)}</span>
                          <span className={`cr-status-badge cr-status-badge--${j.status}`}>
                            {j.status}
                          </span>
                        </div>
                      );
                    })}

                    {legacyOffers.length > 0 && (
                      <>
                        <div
                          className="cr-history-row"
                          style={{ background: 'rgba(177,43,255,0.04)', fontStyle: 'italic' }}
                        >
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            — Offerte passaggio (legacy) —
                          </span>
                        </div>
                        {legacyOffers.map((r, i) => (
                          <div key={r.id || i} className="cr-history-row">
                            <span className="cr-history-name">{r.nickname}</span>
                            <span className="cr-history-route">{r.route || r.departure}</span>
                            <span className="cr-history-date">{fmtDate(r.createdAt)}</span>
                            <span className={`cr-status-badge cr-status-badge--${r.status}`}>
                              {r.status}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ════ RIGHT SIDEBAR ══════════════════════════════════ */}
        <div className="cr-sidebar">

          {/* ─ General Requests ─ */}
          <div>
            <p className="cr-section-title">Richieste generali ({activeGenReqs.length})</p>

            {activeGenReqs.length === 0 ? (
              <p className="cr-empty">Nessuna richiesta generale attiva.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeGenReqs.map((g) => (
                  <div key={g.id} className="cr-gen-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <span className="cr-gen-name">{g.nickname}</span>
                      <span className="cr-status-badge cr-status-badge--active">
                        {g.status || 'active'}
                      </span>
                    </div>
                    <div className="cr-gen-meta">
                      <span>📍 {g.departureCity}</span>
                      {g.travelTime && <span>🕐 {g.travelTime}</span>}
                      {g.tripType && <span>↔ {g.tripType}</span>}
                      {(g.passengers || g.peopleCount) && (
                        <span>👥 {g.passengers || g.peopleCount}</span>
                      )}
                      {g.luggageNeed && <span>🎒 {g.luggageNeed}</span>}
                    </div>
                    {g.message && (
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          fontStyle: 'italic',
                          borderLeft: '2px solid rgba(177,43,255,0.3)',
                          paddingLeft: '8px',
                        }}
                      >
                        "{g.message.slice(0, 80)}{g.message.length > 80 ? '…' : ''}"
                      </div>
                    )}
                    <div className="cr-gen-actions">
                      <button
                        type="button"
                        className="cr-btn-archive"
                        onClick={() => onArchiveGeneralRequest && onArchiveGeneralRequest(g.id)}
                      >
                        Archivia
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Archived general requests count */}
            {archivedGenReqs.length > 0 && (
              <p
                style={{
                  fontSize: '10.5px',
                  color: 'var(--text-muted)',
                  marginTop: '8px',
                  fontStyle: 'italic',
                }}
              >
                +{archivedGenReqs.length} archiviate
              </p>
            )}
          </div>

          {/* ─ Crew Candidates (read-only) ─ */}
          <div>
            <p className="cr-section-title">Crew candidate ({crewCandidates.length})</p>
            <p
              style={{
                fontSize: '9.5px',
                color: 'var(--text-muted)',
                marginBottom: '8px',
                fontStyle: 'italic',
              }}
            >
              Match demo · conferma manuale dalla sezione passaggi
            </p>

            {crewCandidates.length === 0 ? (
              <p className="cr-empty">
                Nessun match al momento. Servono ride aperte con join pending.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {crewCandidates.slice(0, 5).map(({ ride, joins, compatGenerals }) => (
                  <div key={ride.id} className="cr-candidate-card">
                    <span className="cr-candidate-ride">
                      🚗 {ride.departureCity} → {ride.destination || 'WAO'} · {ride.driver}
                    </span>

                    {joins.slice(0, 3).map((j) => (
                      <div key={j.id} className="cr-candidate-rider-row">
                        <span>{j.nickname}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                          👥 {j.peopleCount || j.passengers || 1}
                        </span>
                      </div>
                    ))}

                    {compatGenerals.length > 0 && (
                      <div
                        style={{
                          fontSize: '10.5px',
                          color: '#d18eff',
                          marginTop: '2px',
                          opacity: 0.8,
                        }}
                      >
                        + {compatGenerals.length} richiesta generale compatibile
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
        {/* ════ END SIDEBAR ════════════════════════════════════ */}
      </div>
      {/* ════ END MAIN GRID ═══════════════════════════════════ */}
    </div>
  );
}
