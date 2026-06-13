import { useState } from 'react';
import { isTestVercelRecord, getLastCleanupResult } from '../services/roadToWaoDb';

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
  onClose,
  isAdmin = false,
  onCleanDemoBoard,
  onSaveTelegramLink,
}) {
  const [expandedRides, setExpandedRides] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [editedLinks, setEditedLinks] = useState({});
  const [showTestData, setShowTestData] = useState(false);
  const [showCleanupPreview, setShowCleanupPreview] = useState(false);

  const testRides = rides.filter(isTestVercelRecord);
  const testJoins = joinRequests.filter(isTestVercelRecord);
  const testGenerals = generalRequests.filter(isTestVercelRecord);


  const executeCleanDemoBoard = async () => {
    setShowCleanupPreview(false);
    if (onCleanDemoBoard) {
      await onCleanDemoBoard();
      const lastResult = getLastCleanupResult();
      if (lastResult && !lastResult.error) {
        const ridesCount = lastResult.archivedRides?.length || 0;
        const joinsCount = lastResult.cancelledJoinRequests?.length || 0;
        const gensCount = lastResult.archivedGeneralRequests?.length || 0;
        alert(`PULIZIA COMPLETATA SELETTIVAMENTE (Solo record TEST VERCEL):\n- Passaggi archiviati: ${ridesCount}\n- Richieste join cancellate: ${joinsCount}\n- Richieste generali archiviate: ${gensCount}`);
      }
    }
  };

  const toggleRide = (id) =>
    setExpandedRides((prev) => ({ ...prev, [id]: !prev[id] }));

  // Filter input arrays based on test toggle
  const filteredRides = showTestData ? rides : rides.filter(r => !isTestVercelRecord(r));
  const filteredJoinRequests = showTestData ? joinRequests : joinRequests.filter(jr => !isTestVercelRecord(jr));
  const filteredGeneralRequests = showTestData ? generalRequests : generalRequests.filter(gr => !isTestVercelRecord(gr));
  const filteredRequests = showTestData ? requests : requests.filter(r => !isTestVercelRecord(r));

  // ── KPI ──────────────────────────────────────────────────────
  const openRides = filteredRides.filter((r) => r.status !== 'full' && r.status !== 'closed' && r.status !== 'archived');
  const totalSeats = openRides.reduce((acc, r) => acc + (r.seatsAvailable || 0), 0);
  const pendingJoins = filteredJoinRequests.filter((r) => r.status === 'pending' && !r.archived);
  const activeGenerals = filteredGeneralRequests.filter((r) => !r.archived && r.status !== 'rejected');

  // ── LEFT — rides + their pending joins ──────────────────────
  const sortedRides = [...filteredRides]
    .filter((r) => r.status !== 'archived')
    .sort((a, b) => {
      // open rides first, then by id (newest last added = first in INITIAL_RIDES order)
      if (a.status === 'full' && b.status !== 'full') return 1;
      if (a.status !== 'full' && b.status === 'full') return -1;
      return 0;
    });

  const pendingJoinsByRide = (rideId) =>
    filteredJoinRequests.filter((j) => j.rideId === rideId && j.status === 'pending' && !j.archived);

  // ── HISTORY — approved + rejected joins ─────────────────────
  const historyJoins = [
    ...filteredJoinRequests.filter((j) =>
      ['approved', 'rejected', 'cancelled', 'archived'].includes(j.status)
    ),
    ...filteredGeneralRequests
      .filter((g) => ['archived', 'rejected'].includes(g.status))
      .map((g) => ({
        ...g,
        rideSummary: `${g.departureCity} → WAO (Generale)`,
      })),
  ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));


  // legacy offers from requests that are not joins
  const legacyOffers = filteredRequests.filter(
    (r) => r.type === 'offer' && (r.status === 'approved' || r.status === 'rejected'),
  );

  // ── RIGHT — general requests ─────────────────────────────────
  const activeGenReqs = filteredGeneralRequests.filter((r) => !r.archived);
  const archivedGenReqs = filteredGeneralRequests.filter((r) => r.archived);

  // ── RIGHT — crew candidates (read-only) ──────────────────────
  // Match open rides against their pending joins + any compatible general request
  const crewCandidates = openRides
    .map((ride) => {
      const joins = pendingJoinsByRide(ride.id);
      const compatGenerals = filteredGeneralRequests.filter((g) => {
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


  return (
    <div className="cr-root">
      {showCleanupPreview && (
        <div className="cr-modal-overlay">
          <div className="cr-modal-card">
            <h2 className="cr-modal-title">Anteprima Pulizia</h2>
            <div className="cr-modal-body">
              <p>Rilevati i seguenti record di test nel database:</p>
              <div className="cr-modal-stats">
                <div className="cr-modal-stat-item">
                  <span className="cr-modal-stat-label">Passaggi TEST VERCEL:</span>
                  <span className="cr-modal-stat-value">{testRides.length}</span>
                </div>
                <div className="cr-modal-stat-item">
                  <span className="cr-modal-stat-label">Richieste Join TEST VERCEL:</span>
                  <span className="cr-modal-stat-value">{testJoins.length}</span>
                </div>
                <div className="cr-modal-stat-item">
                  <span className="cr-modal-stat-label">Richieste Generali TEST VERCEL:</span>
                  <span className="cr-modal-stat-value">{testGenerals.length}</span>
                </div>
              </div>
              <p className="cr-modal-warning">
                Verranno archiviati solo record TEST VERCEL. I dati reali non verranno toccati.
              </p>
            </div>
            <div className="cr-modal-actions">
              <button
                type="button"
                className="cr-modal-btn-cancel"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCleanupPreview(false);
                }}
              >
                Annulla
              </button>
              <button
                type="button"
                className="cr-modal-btn-confirm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  executeCleanDemoBoard();
                }}
              >
                Conferma pulizia TEST
              </button>
            </div>
          </div>
        </div>
      )}
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
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label className="cr-toggle-container">
              <input
                type="checkbox"
                checked={showTestData}
                onChange={(e) => setShowTestData(e.target.checked)}
                className="cr-toggle-input"
              />
              <span className="cr-toggle-slider" />
              <span className="cr-toggle-label">Mostra dati di test</span>
            </label>

            {isAdmin && onCleanDemoBoard && (
              <button
                type="button"
                className="wao-secondary-button wao-display"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCleanupPreview(true);
                }}
                style={{
                  width: 'auto',
                  padding: '6px 14px',
                  fontSize: '11px',
                  background: 'linear-gradient(135deg, rgba(255, 60, 0, 0.4), rgba(255, 106, 0, 0.2))',
                  borderColor: 'rgba(255, 106, 0, 0.4)'
                }}
              >
                🧹 Pulisci bacheca demo
              </button>
            )}
          </div>
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
                      <span className="cr-ride-route" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {isTestVercelRecord(ride) && <span className="cr-test-badge">TEST</span>}
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
                        <div className="cr-telegram-link-section" style={{
                          padding: '10px 14px',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          background: 'rgba(255, 255, 255, 0.01)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          marginBottom: '10px'
                        }}>
                          <label style={{ fontSize: '11px', color: 'var(--amber-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Link gruppo Telegram
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              placeholder="Incolla il link invito Telegram..."
                              value={editedLinks[ride.id] !== undefined ? editedLinks[ride.id] : (ride.telegramUrl || '')}
                              onChange={(e) => setEditedLinks(prev => ({ ...prev, [ride.id]: e.target.value }))}
                              style={{
                                flex: 1,
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                color: 'var(--text-main, #ffffff)',
                                fontSize: '12.5px',
                                outline: 'none'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => onSaveTelegramLink && onSaveTelegramLink(ride.id, editedLinks[ride.id] !== undefined ? editedLinks[ride.id] : (ride.telegramUrl || ''))}
                              style={{
                                background: 'linear-gradient(135deg, var(--amber-gold, #ffc547), var(--solar-orange, #ff6a00))',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 14px',
                                color: '#0b0c1e',
                                fontSize: '11.5px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              Salva link
                            </button>
                          </div>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-soft)', opacity: 0.8, lineHeight: '1.4' }}>
                            Crea il gruppo su Telegram, poi incolla qui il link invito. Sarà visibile solo agli approvati.
                          </span>
                        </div>
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
                                <span className="cr-join-name" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  {isTestVercelRecord(jr) && <span className="cr-test-badge">TEST</span>}
                                  {jr.nickname}
                                </span>
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
                          <span className="cr-history-name" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {isTestVercelRecord(j) && <span className="cr-test-badge" style={{ marginRight: '4px' }}>TEST</span>}
                            {j.nickname}
                          </span>
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
                            <span className="cr-history-name" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              {isTestVercelRecord(r) && <span className="cr-test-badge" style={{ marginRight: '4px' }}>TEST</span>}
                              {r.nickname}
                            </span>
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
                      <span className="cr-gen-name" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {isTestVercelRecord(g) && <span className="cr-test-badge">TEST</span>}
                        {g.nickname}
                      </span>
                      <span className="cr-status-badge cr-status-badge--active">
                        {g.status || 'active'}
                      </span>
                    </div>
                    <div className="cr-gen-meta">
                      <span>📍 {g.departureCity}</span>
                      {g.departureDate && <span>📅 Partenza: {fmtDate(g.departureDate) || g.departureDate}</span>}
                      {g.returnDate && <span>📅 Ritorno: {fmtDate(g.returnDate) || g.returnDate}</span>}
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
                {crewCandidates.slice(0, 5).map(({ ride, joins, compatGenerals }) => {
                  const rideDate = ride.departureDate || ride.departure_date || 'data n/d';
                  const rideSeats = ride.seatsAvailable ?? ride.seats_available ?? ride.availableSeats ?? 0;
                  return (
                    <div key={ride.id} className="cr-candidate-card">
                      <span className="cr-candidate-ride">
                        🚗 {ride.departureCity} → {ride.destination || 'WAO'} · {ride.driver}
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '3px' }}>
                        <span style={{ fontSize: '10px', background: 'rgba(255,197,71,0.1)', color: 'var(--amber-gold)', border: '1px solid rgba(255,197,71,0.2)', borderRadius: '10px', padding: '1px 7px' }}>
                          📅 {rideDate}
                        </span>
                        <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '1px 7px' }}>
                          💺 {rideSeats} posti
                        </span>
                      </div>

                      {joins.slice(0, 3).map((j) => (
                        <div key={j.id} className="cr-candidate-rider-row">
                          <span>{j.nickname}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                            👥 {j.peopleCount || j.passengers || 1}
                          </span>
                        </div>
                      ))}

                      {compatGenerals.length > 0 && (
                        <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {compatGenerals.slice(0, 3).map((g) => {
                            const gDate = g.departureDate || g.departure_date || 'data n/d';
                            const gPeople = g.passengers ?? g.peopleCount ?? g.people_count ?? 1;
                            const dateMismatch = gDate !== 'data n/d' && rideDate !== 'data n/d' && gDate !== rideDate;
                            const seatsMismatch = gPeople > rideSeats;
                            return (
                              <div key={g.id} style={{ background: 'rgba(177,43,255,0.07)', borderRadius: '6px', padding: '4px 8px', fontSize: '10.5px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <span style={{ color: '#d18eff', fontWeight: 600 }}>{g.nickname || '—'}</span>
                                  <span style={{ background: 'rgba(177,43,255,0.15)', color: '#d18eff', border: '1px solid rgba(177,43,255,0.25)', borderRadius: '10px', padding: '1px 6px' }}>
                                    📅 {gDate}
                                  </span>
                                  <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '1px 6px' }}>
                                    👥 {gPeople}
                                  </span>
                                </div>
                                {(dateMismatch || seatsMismatch) && (
                                  <div style={{ marginTop: '3px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {dateMismatch && (
                                      <span style={{ fontSize: '9.5px', color: '#ffaa44' }}>
                                        ⚠️ Date diverse: ride {rideDate} · richiesta {gDate}
                                      </span>
                                    )}
                                    {seatsMismatch && (
                                      <span style={{ fontSize: '9.5px', color: '#ff6b6b' }}>
                                        ⚠️ {gPeople} persone richieste, solo {rideSeats} posti disponibili
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {compatGenerals.length > 3 && (
                            <div style={{ fontSize: '10px', color: '#d18eff', opacity: 0.7, paddingLeft: '4px' }}>
                              +{compatGenerals.length - 3} altre richieste compatibili
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
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
