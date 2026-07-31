import { useState, useEffect } from 'react';
import { isTestVercelRecord, getLastCleanupResult, fetchAdminRidesDetailed } from '../services/roadToWaoDb';
import { supabase } from '../services/supabaseClient';

function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
  } catch {
    return '';
  }
}

function splitStops(departureArea) {
  if (!departureArea) return '';
  const stops = departureArea.split(/[,;|/]+/).map(s => s.trim()).filter(Boolean);
  return stops.join(' · ');
}

function buildRouteLabel(ride) {
  const start = ride.departureCity || ride.departure_city || '';
  const dest = ride.destination || ride.to_event || 'WAO Festival';
  const depArea = ride.stops || ride.departure_area || '';
  const stops = depArea ? depArea.split(/[,;|/]+/).map(s => s.trim()).filter(Boolean) : [];
  
  const parts = [start, ...stops, dest].filter(Boolean);
  return parts.join(' → ');
}

function parseLuggage(notes) {
  if (!notes) return 'Non indicato';
  const parts = notes.split('|').map(p => p.trim());
  const found = parts.filter(p => /bagagl|luggage/i.test(p));
  if (found.length > 0) {
    return found.map(p => p.replace(/^(spazio bagagli|dettagli bagagli|bagagli|luggage|space luggage):\s*/i, '')).join(' · ');
  }
  return notes;
}

function hasTelegram(val) {
  return !!(val && typeof val === 'string' && val.trim() !== '' && val.trim() !== '-');
}

function normalizeTelegramHandle(val) {
  if (!hasTelegram(val)) return null;
  return val.trim().replace(/^@/, '');
}

function telegramDeepLink(val) {
  const handle = normalizeTelegramHandle(val);
  return handle ? `https://t.me/${handle}` : null;
}

function computeGroupReadiness(ride) {
  const crew = ride.approvedCrew || [];
  if (ride.telegramUrl) {
    return { code: 'GRUPPO CREATO', label: 'GRUPPO CREATO', tone: 'ready' };
  }
  if (crew.length === 0) {
    return { code: 'NESSUN PARTECIPANTE APPROVATO', label: 'NESSUN PARTECIPANTE APPROVATO', tone: 'idle' };
  }
  const people = [{ nickname: ride.driver, isDriver: true, telegram_username: ride.telegram_username }, ...crew];
  const missing = people.filter(p => !hasTelegram(p.telegram_username));
  if (missing.length === 0) {
    return { code: 'PRONTO PER IL GRUPPO', label: 'PRONTO PER IL GRUPPO', tone: 'ready' };
  }
  if (missing.length === 1 && missing[0].isDriver) {
    return { code: 'MANCA IL TELEGRAM DEL DRIVER', label: 'MANCA IL TELEGRAM DEL DRIVER', tone: 'blocked' };
  }
  if (missing.length === 1) {
    return { code: 'MANCA 1 CONTATTO', label: 'MANCA 1 CONTATTO', tone: 'warning' };
  }
  return { code: 'MANCANO N CONTATTI', label: `MANCANO ${missing.length} CONTATTI`, tone: 'warning' };
}

function buildContactsListText(ride) {
  const crew = ride.approvedCrew || [];
  const driverLine = hasTelegram(ride.telegram_username)
    ? `${ride.driver} — @${normalizeTelegramHandle(ride.telegram_username)}`
    : `${ride.driver} — contatto Telegram mancante`;
  const crewLines = crew.length === 0
    ? ['Nessun partecipante approvato']
    : crew.map(p => hasTelegram(p.telegram_username)
        ? `${p.nickname} — @${normalizeTelegramHandle(p.telegram_username)}`
        : `${p.nickname} — contatto Telegram mancante`);
  return [
    `Ride ${ride.departureCity || ride.departure_city || ''}`.trim(),
    '',
    'Driver:',
    driverLine,
    '',
    'Partecipanti:',
    ...crewLines
  ].join('\n');
}

function buildContactRequestMessage(nickname, city) {
  return `Ciao ${nickname}!\nCi sono persone approvate per la tua ride da ${city}. Per creare il gruppo ci manca il tuo username Telegram. Puoi mandarci il tuo contatto, per esempio @nomeutente?`;
}

function hasEmail(val) {
  return !!(val && typeof val === 'string' && val.trim() !== '');
}

function buildTelegramRequestEmailBody(nickname, city) {
  const cityLabel = city ? ` da ${city}` : '';
  return `Ciao ${nickname}!\n\nDue persone hanno chiesto di unirsi alla tua ride${cityLabel} per il festival.\n\nPer creare il gruppo ci manca soltanto il tuo username Telegram.\n\nTi basta rispondere a questa email scrivendoci il tuo username, per esempio @nomeutente. Appena ce lo mandi, creeremo il gruppo con gli altri partecipanti.\n\nA presto,\nTeam Road to WAO`;
}

const TELEGRAM_REQUEST_SUBJECT = 'Due persone vorrebbero unirsi alla tua ride 🚗';

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

function maskEmail(email) {
  const [local = '', domain = ''] = String(email || '').split('@');
  if (!local || !domain) return 'email disponibile';
  return `${local.slice(0, 1)}***@${domain.slice(0, 1)}***`;
}

async function sendContactEmail({ rideId, userId, role }) {
  const sessionResult = await supabase.auth.getSession();
  const accessToken = sessionResult.data?.session?.access_token;
  if (!accessToken) throw new Error('Sessione non valida. Accedi di nuovo.');

  const response = await fetch('/api/admin/send-contact-email', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ rideId, userId, role })
  });
  const raw = await response.text();
  let result;
  try {
    result = raw ? JSON.parse(raw) : {};
  } catch {
    result = {};
  }
  if (!response.ok) throw new Error(result.error || 'Invio email non riuscito');
  return result;
}

function EmailActions({ email, nickname, city, rideId, userId, role, prominent }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  if (!hasEmail(email)) return null;
  const cleanEmail = email.trim();
  const telegramRequestBody = buildTelegramRequestEmailBody(nickname, city);
  const isSending = status === 'sending';
  const btnStyle = {
    background: 'transparent',
    border: `1px solid ${prominent ? 'var(--solar-orange)' : 'var(--turquoise)'}`,
    color: prominent ? 'var(--solar-orange)' : 'var(--turquoise)',
    borderRadius: '6px',
    padding: '2px 8px',
    fontSize: '11px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block'
  };

  const handleSend = async () => {
    if (isSending || status === 'sent') return;
    const confirmed = window.confirm(`Inviare email a ${maskEmail(cleanEmail)}?`);
    if (!confirmed) return;
    setStatus('sending');
    setMessage('');
    try {
      await sendContactEmail({ rideId, userId, role });
      setStatus('sent');
      setMessage('Email inviata');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Invio email non riuscito');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: prominent ? '12px' : '11.5px', color: prominent ? 'var(--text-main)' : 'var(--text-soft)', fontWeight: prominent ? '700' : '400' }}>
        {prominent ? `Email: ${cleanEmail}` : `Email: ${cleanEmail}`}
      </span>
      <button type="button" onClick={() => copyToClipboard(cleanEmail)} style={btnStyle}>
        COPIA EMAIL
      </button>
      <button
        type="button"
        onClick={handleSend}
        disabled={isSending || status === 'sent'}
        style={{ ...btnStyle, opacity: isSending || status === 'sent' ? 0.6 : 1, cursor: isSending || status === 'sent' ? 'not-allowed' : 'pointer' }}
      >
        {isSending ? 'INVIO...' : role === 'participant' ? 'AVVISA GRUPPO' : 'INVIA EMAIL'}
      </button>
      <button
        type="button"
        onClick={() => copyToClipboard(`Oggetto: ${TELEGRAM_REQUEST_SUBJECT}\n\n${telegramRequestBody}`)}
        style={btnStyle}
      >
        COPIA MAIL PER TELEGRAM
      </button>
      {message && (
        <span style={{ fontSize: '11px', color: status === 'error' ? 'var(--solar-orange)' : 'var(--turquoise)', fontWeight: '700' }}>
          {message}
        </span>
      )}
    </div>
  );
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

  const [detailedRides, setDetailedRides] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminRidesDetailed().then(({ data }) => {
        setDetailedRides(data || []);
      }).catch(() => {
        // Keep the Control Room usable with the already-loaded admin data.
      });
    }
  }, [isAdmin, rides]);

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
  const displayRides = detailedRides.length > 0 ? detailedRides : rides;
  const filteredRides = showTestData ? displayRides : displayRides.filter(r => !isTestVercelRecord(r));
  const filteredJoinRequests = showTestData ? joinRequests : joinRequests.filter(jr => !isTestVercelRecord(jr));
  const filteredGeneralRequests = showTestData ? generalRequests : generalRequests.filter(gr => !isTestVercelRecord(gr));
  const filteredRequests = showTestData ? requests : requests.filter(r => !isTestVercelRecord(r));

  // ── KPI ──────────────────────────────────────────────────────
  const openRides = filteredRides.filter((r) => {
    const seatsLeft = r.seatsAvailable ?? r.seats_available;
    return r.status !== 'full' && r.status !== 'closed' && r.status !== 'archived' && seatsLeft !== 0;
  });
  const totalSeats = openRides.reduce((acc, r) => acc + (r.seatsAvailable || 0), 0);
  const pendingJoins = filteredJoinRequests.filter((r) => r.status === 'pending' && !r.archived);
  const activeGenerals = filteredGeneralRequests.filter((r) => !r.archived && r.status !== 'rejected');

  // ── LEFT — rides + their pending joins ──────────────────────
  const sortedRides = [...filteredRides]
    .filter((r) => r.status !== 'archived')
    .sort((a, b) => {
      // open rides first, then full/exhausted ones
      const aFull = a.status === 'full' || (a.seatsAvailable ?? a.seats_available) === 0;
      const bFull = b.status === 'full' || (b.seatsAvailable ?? b.seats_available) === 0;
      if (aFull && !bFull) return 1;
      if (!aFull && bFull) return -1;
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
  const activeGenReqs = filteredGeneralRequests
    .filter((r) => !r.archived)
    .sort((a, b) => {
      const dA = a.departureDate || a.departure_date;
      const dB = b.departureDate || b.departure_date;
      if (!dA && !dB) return 0;
      if (!dA) return 1;
      if (!dB) return -1;
      return new Date(dA) - new Date(dB);
    });
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
            <p className="cr-section-title">Passaggi ({displayRides.length})</p>

            {displayRides.length === 0 && (
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
                        {/* Admin details block */}
                        <div className="cr-admin-details" style={{
                          padding: '12px 14px',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          background: 'rgba(255, 255, 255, 0.02)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          marginBottom: '10px'
                        }}>
                          <label style={{ fontSize: '11px', color: 'var(--turquoise)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Dettagli di Amministrazione
                          </label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-soft)' }}>
                            {/* Percorso */}
                            <div>
                              <div style={{ fontWeight: '700', color: 'var(--turquoise)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Percorso</div>
                              <div style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: '500' }}>
                                {buildRouteLabel(ride)}
                              </div>
                            </div>

                            {/* Tappe possibili */}
                            {(ride.departure_area || ride.stops) && (
                              <div>
                                <div style={{ fontWeight: '700', color: 'var(--turquoise)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Tappe possibili</div>
                                <div style={{ color: 'var(--text-soft)' }}>
                                  {splitStops(ride.departure_area || ride.stops)}
                                </div>
                              </div>
                            )}

                            {/* Dettagli viaggio */}
                            <div>
                              <div style={{ fontWeight: '700', color: 'var(--turquoise)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Dettagli viaggio</div>
                              <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <li><strong>Partenza:</strong> {(() => {
                                  const dateStr = ride.departureDate || ride.departure_date;
                                  let formattedDate = dateStr;
                                  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                                    try {
                                      const d = new Date(dateStr);
                                      formattedDate = d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
                                    } catch {
                                      // Keep the raw date if browser formatting fails.
                                    }
                                  }
                                  const timeLabel = ride.travelTime || ride.departure_time_label;
                                  return timeLabel ? `${formattedDate} · ${timeLabel}` : formattedDate;
                                })()}</li>
                                <li><strong>Ritorno:</strong> {ride.return_date || ride.returnDate ? (() => {
                                  const rDate = ride.return_date || ride.returnDate;
                                  if (/^\d{4}-\d{2}-\d{2}$/.test(rDate)) {
                                    try {
                                      const d = new Date(rDate);
                                      return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
                                    } catch {
                                      // Keep the raw date if browser formatting fails.
                                    }
                                  }
                                  return rDate;
                                })() : 'Non indicato'}</li>
                                <li><strong>Posti:</strong> {ride.seatsAvailable ?? ride.seats_available} disponibili su {ride.seatsTotal ?? ride.seats_total}</li>
                                <li><strong>Bagagli:</strong> {parseLuggage(ride.notes || ride.luggageDetails)}</li>
                                {(() => {
                                  const notes = ride.notes || ride.luggageDetails || '';
                                  if (notes.toLowerCase().includes('1/2 giorni prima') || notes.toLowerCase().includes('1/2 days earlier')) {
                                    return <li><strong>Flessibilità:</strong> Possibile partenza 1/2 giorni prima</li>;
                                  }
                                  return null;
                                })()}
                              </ul>
                            </div>

                            {/* Driver Contacts (Preserve driver info for admin) */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                              <div><strong>Telegram Driver:</strong> {(() => {
                                const val = ride.telegram_username;
                                const isValid = val && typeof val === 'string' && val.trim() !== '' && val.trim() !== '-';
                                return isValid ? val : <span style={{ color: 'var(--solar-orange)', fontWeight: '500' }}>Contatto Telegram mancante</span>;
                              })()}</div>
                              <div><strong>Instagram Driver:</strong> {(() => {
                                const val = ride.instagram_username;
                                const isValid = val && typeof val === 'string' && val.trim() !== '' && val.trim() !== '-';
                                return isValid ? val : 'Non indicato';
                              })()}</div>
                              <div><strong>Stato:</strong> <span style={{ color: 'var(--amber-gold)' }}>{ride.status}</span></div>
                              <div><strong>Visibilità:</strong> {ride.visibility || 'public'}</div>
                            </div>

                            {/* Contact Warning */}
                            {(() => {
                              const tgVal = ride.telegram_username;
                              const igVal = ride.instagram_username;
                              const isTgValid = tgVal && typeof tgVal === 'string' && tgVal.trim() !== '' && tgVal.trim() !== '-';
                              const isIgValid = igVal && typeof igVal === 'string' && igVal.trim() !== '' && igVal.trim() !== '-';
                              if (!isTgValid && !isIgValid) {
                                return (
                                  <div className="contact-warning-msg" style={{ color: 'var(--solar-orange)', fontWeight: 'bold', fontSize: '11.5px', marginTop: '4px' }}>
                                    ⚠️ Contatto non valido: serve Telegram o Instagram prima di creare match.
                                  </div>
                                );
                              }
                              return null;
                            })()}

                            {/* Nota driver */}
                            <div style={{ marginTop: '4px' }}>
                              <div style={{ fontWeight: '700', color: 'var(--turquoise)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '6px' }}>Nota driver</div>
                              <div style={{
                                background: 'rgba(0, 0, 0, 0.25)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '8px',
                                padding: '10px 12px',
                                color: 'var(--text-soft)',
                                fontSize: '12.5px',
                                lineHeight: '1.4',
                                whiteSpace: 'pre-wrap'
                              }}>
                                {ride.notes || ride.luggageDetails || 'Nessuna nota aggiuntiva'}
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Persone della ride — operational crew card for Telegram group setup */}
                        {(() => {
                          const readiness = computeGroupReadiness(ride);
                          const crew = ride.approvedCrew || [];
                          const readinessColors = {
                            ready: '#3ddc97',
                            blocked: 'var(--solar-orange)',
                            warning: 'var(--amber-gold)',
                            idle: 'var(--text-soft)'
                          };
                          return (
                            <div className="cr-crew-card" style={{
                              padding: '12px 14px',
                              borderBottom: '1px solid rgba(255,255,255,0.06)',
                              background: 'rgba(255, 255, 255, 0.02)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                              marginBottom: '10px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                <label style={{ fontSize: '11px', color: 'var(--turquoise)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  Persone della ride
                                </label>
                                <span style={{
                                  fontSize: '10.5px',
                                  fontWeight: '800',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.03em',
                                  color: readinessColors[readiness.tone],
                                  border: `1px solid ${readinessColors[readiness.tone]}`,
                                  borderRadius: '999px',
                                  padding: '3px 10px'
                                }}>
                                  {readiness.label}
                                </span>
                              </div>
                              {readiness.tone === 'blocked' && (
                                <div style={{ fontSize: '11px', color: 'var(--text-soft)', marginTop: '-6px' }}>
                                  {hasEmail(ride.contact_email)
                                    ? 'Email disponibile per contattarlo'
                                    : 'Nessun contatto di recupero disponibile'}
                                </div>
                              )}

                              {/* Driver row */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px 10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '9.5px', fontWeight: '800', color: '#0b0c1e', background: 'var(--amber-gold)', borderRadius: '4px', padding: '2px 6px', letterSpacing: '0.03em' }}>DRIVER</span>
                                  <strong style={{ color: 'var(--text-main)' }}>{ride.driver}</strong>
                                  {ride.driverCity && <span style={{ color: 'var(--text-soft)', fontSize: '12px' }}>({ride.driverCity})</span>}
                                  {!hasTelegram(ride.telegram_username) && (
                                    <span style={{ fontSize: '9.5px', fontWeight: '800', color: 'var(--solar-orange)', border: '1px solid var(--solar-orange)', borderRadius: '4px', padding: '1px 6px' }}>CONTATTO MANCANTE</span>
                                  )}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-soft)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                  <span>Telegram: {hasTelegram(ride.telegram_username)
                                    ? <a href={telegramDeepLink(ride.telegram_username)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--turquoise)' }}>@{normalizeTelegramHandle(ride.telegram_username)}</a>
                                    : <span style={{ color: 'var(--solar-orange)' }}>mancante</span>}
                                  </span>
                                  <span>Instagram: {hasTelegram(ride.instagram_username) ? ride.instagram_username : 'non indicato'}</span>
                                  {!hasTelegram(ride.telegram_username) && (
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(buildContactRequestMessage(ride.driver, ride.departureCity || ride.departure_city || ''))}
                                      style={{ background: 'transparent', border: '1px solid var(--turquoise)', color: 'var(--turquoise)', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}
                                    >
                                      Copia messaggio di contatto
                                    </button>
                                  )}
                                </div>
                                <EmailActions
                                  email={ride.contact_email}
                                  nickname={ride.driver}
                                  city={ride.driverCity || ride.departureCity || ride.departure_city || ''}
                                  rideId={ride.id}
                                  userId={ride.driver_id}
                                  role="driver"
                                  prominent={!hasTelegram(ride.telegram_username)}
                                />
                              </div>

                              {/* Approved participants */}
                              {crew.length === 0 ? (
                                <div style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-soft)' }}>Nessun partecipante approvato per questa ride.</div>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {crew.map(p => (
                                    <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px 10px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '9.5px', fontWeight: '800', color: '#0b0c1e', background: 'var(--turquoise)', borderRadius: '4px', padding: '2px 6px', letterSpacing: '0.03em' }}>PARTECIPANTE</span>
                                        <strong style={{ color: 'var(--text-main)' }}>{p.nickname}</strong>
                                        {p.approvedAt && <span style={{ color: 'var(--text-soft)', fontSize: '11px' }}>approvato il {fmtDate(p.approvedAt)}</span>}
                                        <span style={{
                                          fontSize: '9.5px',
                                          fontWeight: '800',
                                          color: '#0b0c1e',
                                          background: 'var(--turquoise)',
                                          borderRadius: '4px',
                                          padding: '1px 6px',
                                          letterSpacing: '0.03em'
                                        }}>
                                          APPROVATO
                                        </span>
                                        {!hasTelegram(p.telegram_username) && (
                                          <span style={{ fontSize: '9.5px', fontWeight: '800', color: 'var(--solar-orange)', border: '1px solid var(--solar-orange)', borderRadius: '4px', padding: '1px 6px' }}>TELEGRAM MANCANTE</span>
                                        )}
                                      </div>
                                      <div style={{ fontSize: '12px', color: 'var(--text-soft)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        <span>Telegram: {hasTelegram(p.telegram_username)
                                          ? <a href={telegramDeepLink(p.telegram_username)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--turquoise)' }}>@{normalizeTelegramHandle(p.telegram_username)}</a>
                                          : <span style={{ color: 'var(--solar-orange)' }}>mancante</span>}
                                        </span>
                                        <span>Instagram: {hasTelegram(p.instagram_username) ? p.instagram_username : 'non indicato'}</span>
                                        {!hasTelegram(p.telegram_username) && (
                                          <button
                                            type="button"
                                            onClick={() => copyToClipboard(buildContactRequestMessage(p.nickname, ride.departureCity || ride.departure_city || ''))}
                                            style={{ background: 'transparent', border: '1px solid var(--turquoise)', color: 'var(--turquoise)', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}
                                          >
                                            Copia messaggio Telegram
                                          </button>
                                        )}
                                      </div>
                                      <EmailActions
                                        email={p.contact_email}
                                        nickname={p.nickname}
                                        city={ride.departureCity || ride.departure_city || ''}
                                        rideId={ride.id}
                                        userId={p.requesterId || p.id}
                                        role="participant"
                                        prominent={!hasTelegram(p.telegram_username)}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => copyToClipboard(buildContactsListText(ride))}
                                style={{
                                  alignSelf: 'flex-start',
                                  background: 'linear-gradient(135deg, var(--turquoise, #3ddc97), var(--amber-gold, #ffc547))',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '6px 14px',
                                  color: '#0b0c1e',
                                  fontSize: '11.5px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                Copia contatti Telegram
                              </button>
                            </div>
                          );
                        })()}
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
