import { useState, useEffect } from 'react';

// Stable key helper function
function getEntryKey(entry, index) {
  if (entry && entry.id) return entry.id;
  if (entry && entry.createdAt) return entry.createdAt;
  return `${entry?.type || 'req'}-${entry?.route || ''}-${entry?.nickname || ''}-${index}`;
}

export default function ProfilePanel({ 
  requests = [], 
  rides = [], 
  joinRequests = [], 
  generalRequests = [], 
  userProfile, 
  onUpdateProfile, 
  onNavigateToBacheca, 
  onOpenControlRoom 
}) {
  const profile = userProfile;

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

  useEffect(() => {
    setEditForm({ ...profile });
  }, [profile]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editForm.nickname.trim()) return;
    onUpdateProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({ ...profile });
    setIsEditing(false);
  };

  const hasNewModelData = (joinRequests && joinRequests.length > 0) || (generalRequests && generalRequests.length > 0);

  // -------------------------------------------------------------
  // STATUS & COUNTS COMPUTATION
  // -------------------------------------------------------------
  let currentTravelStatusText = 'Nessuna crew attiva';
  let travelStatusSubtitleText = 'Vai in Bacheca per cercare o offrire un passaggio.';
  let travelStatusColor = 'var(--text-soft)';
  let travelStatusBadge = 'nessuno';
  let approvedJoinRequest = null;
  let pendingJoinRequest = null;
  let activeGeneralRequest = null;
  let matchedRide = null;

  // Count variables
  let statPending = 0;
  let statApproved = 0;
  let statGeneralActive = 0;
  let statRejectedArchived = 0;

  // Ultima attività variables
  let latestRequest = null;
  let recentActivities = [];

  // Compute user driver rides
  const userDriverRides = (rides || []).filter(ride => {
    if (!userProfile?.nickname) return false;
    const nick = userProfile.nickname;
    return ride.ownerNickname === nick || ride.createdBy === nick || ride.driver === nick;
  });

  const isDuplicateLegacyOffer = (req) => {
    if (req.type !== 'offer') return false;
    return userDriverRides.some(ride => {
      const driverMatches = ride.driver === req.nickname || 
                            ride.driver === userProfile?.nickname || 
                            ride.createdBy === req.nickname ||
                            ride.ownerNickname === req.nickname;
      const departureMatches = ride.departureCity === req.departure || 
                               ride.departureCity === req.departureCity;
      const dateMatches = ride.departureDate === req.date;
      const timeMatches = ride.travelTime === req.travelTime;
      return driverMatches && departureMatches && dateMatches && timeMatches;
    });
  };

  // 1. Compute counts and activities first
  if (hasNewModelData) {
    statPending = (joinRequests || []).filter(r => r.status === 'pending').length;
    statApproved = (joinRequests || []).filter(r => r.status === 'approved').length;
    statGeneralActive = (generalRequests || []).filter(r => r.status === 'active').length;
    statRejectedArchived = 
      (joinRequests || []).filter(r => r.status === 'rejected' || r.archived).length +
      (generalRequests || []).filter(r => r.status === 'rejected' || r.archived).length;

    const allNewRequests = [
      ...(joinRequests || []).map(r => ({ ...r, reqType: 'join' })),
      ...(generalRequests || []).map(r => ({ ...r, reqType: 'general' }))
    ];

    const sortedNew = [...allNewRequests].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    const nonArchivedNew = sortedNew.filter(r => !r.archived);
    latestRequest = nonArchivedNew[0];
    recentActivities = nonArchivedNew.slice(0, 3);
  } else {
    const filteredRequests = (requests || []).filter(r => !isDuplicateLegacyOffer(r));
    statPending = filteredRequests.filter(r => !r.status || r.status === 'pending').length;
    statApproved = filteredRequests.filter(r => r.status === 'approved').length;
    statGeneralActive = 0;
    statRejectedArchived = filteredRequests.filter(r => r.status === 'rejected' || r.archived).length;

    const sortedLegacy = [...filteredRequests].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : a.id || 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : b.id || 0;
      return dateB - dateA;
    });

    const nonArchivedLegacy = sortedLegacy.filter(r => !r.archived);
    latestRequest = nonArchivedLegacy[0];
    recentActivities = nonArchivedLegacy.slice(0, 3);
  }

  // 2. Set Travel Status based on unified priority logic
  const candidateApprovedJoin = hasNewModelData ? (joinRequests || []).find(r => r.status === 'approved' && !r.archived) : null;
  const candidatePendingJoin = hasNewModelData ? (joinRequests || []).find(r => r.status === 'pending' && !r.archived) : null;
  const candidateActiveGeneral = hasNewModelData ? (generalRequests || []).find(r => r.status === 'active' && !r.archived) : null;

  if (candidateApprovedJoin) {
    approvedJoinRequest = candidateApprovedJoin;
    matchedRide = rides.find(rd => rd.id === approvedJoinRequest.rideId);
    currentTravelStatusText = 'Crew attiva';
    travelStatusColor = 'var(--turquoise)';
    travelStatusBadge = 'approved';
    if (matchedRide) {
      travelStatusSubtitleText = `${matchedRide.departureCity} → ${matchedRide.destination || 'WAO'} (Driver: ${matchedRide.driver})`;
    } else {
      travelStatusSubtitleText = 'Crew sbloccata';
    }
  } else if (userDriverRides.length > 0) {
    const firstDriverRide = userDriverRides[0];
    const isStatusOpen = firstDriverRide.status === 'open' || (firstDriverRide.seatsAvailable !== undefined && firstDriverRide.seatsAvailable > 0);
    currentTravelStatusText = 'Viaggio aperto come driver';
    travelStatusColor = 'var(--turquoise)';
    travelStatusBadge = isStatusOpen ? 'APERTO' : 'COMPLETO';
    const route = `${firstDriverRide.departureCity} → ${firstDriverRide.destination || 'WAO'}`;
    const date = firstDriverRide.departureDate;
    const seats = `${firstDriverRide.seatsAvailable}/${firstDriverRide.seatsTotal}`;
    travelStatusSubtitleText = `${route} · ${date} · Posti: ${seats}`;
    approvedJoinRequest = null;
  } else if (hasNewModelData && (candidatePendingJoin || candidateActiveGeneral)) {
    if (candidatePendingJoin) {
      pendingJoinRequest = candidatePendingJoin;
      matchedRide = rides.find(rd => rd.id === pendingJoinRequest.rideId);
      currentTravelStatusText = 'Richiesta in approvazione';
      travelStatusColor = 'var(--amber-gold)';
      travelStatusBadge = 'pending';
      if (matchedRide) {
        travelStatusSubtitleText = `${matchedRide.departureCity} → ${matchedRide.destination || 'WAO'} (Driver: ${matchedRide.driver})`;
      } else {
        travelStatusSubtitleText = 'Richiesta in attesa';
      }
    } else if (candidateActiveGeneral) {
      activeGeneralRequest = candidateActiveGeneral;
      currentTravelStatusText = 'Richiesta generale attiva';
      travelStatusSubtitleText = 'Stiamo cercando una crew compatibile.';
      travelStatusColor = 'var(--amber-gold)';
      travelStatusBadge = 'active';
    }
  } else {
    // Legacy fallback status matching
    if (latestRequest) {
      const isPending = !latestRequest.status || latestRequest.status === 'pending';
      const isApproved = latestRequest.status === 'approved';
      const isRejected = latestRequest.status === 'rejected';
      const isOffer = latestRequest.type === 'offer';

      if (isPending) {
        currentTravelStatusText = 'In review';
        travelStatusSubtitleText = latestRequest.route || 'Richiesta di viaggio';
        travelStatusColor = 'var(--amber-gold)';
        travelStatusBadge = 'pending';
      } else if (isApproved) {
        currentTravelStatusText = isOffer ? 'Offerta approvata' : 'Crew sbloccata';
        travelStatusSubtitleText = latestRequest.route || 'Viaggio confermato';
        travelStatusColor = 'var(--turquoise)';
        travelStatusBadge = 'approved';
      } else if (isRejected) {
        currentTravelStatusText = 'Da riprovare';
        travelStatusSubtitleText = 'Richiesta non approvata';
        travelStatusColor = 'var(--solar-orange)';
        travelStatusBadge = 'rejected';
      }
    }
  }

  return (
    <div className="profile-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Title Header */}
      <header className="board-header">
        <h1 className="board-title wao-display">Profilo viaggio</h1>
        <p className="board-subtitle">La tua identità leggera per trovare la crew giusta.</p>
      </header>

      {/* Main Profile Info Card or Edit Form */}
      <div className="ride-card card-pending-gold" style={{ position: 'relative' }}>
        <div className="ride-card-glow-gold" aria-hidden="true"></div>

        {!isEditing ? (
          /* 1. Header profilo leggero */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="profile-avatar-orb" style={{ flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              <div style={{ flex: 1 }}>
                <h2 className="wao-display" style={{ fontSize: '18px', margin: 0, color: 'var(--text-main)', letterSpacing: '0.05em' }}>
                  {profile.nickname}
                </h2>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px', flexWrap: 'wrap' }}>
                  <span className="ride-badge badge-pending-gold" style={{ fontSize: '9px', padding: '1px 6px' }}>
                    {profile.badge}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• {profile.status}</span>
                </div>
              </div>
            </div>

            {/* Departure and Vibe */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '16px', 
              fontSize: '12.5px', 
              color: 'var(--text-soft)', 
              borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
              paddingTop: '10px' 
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                📍 Partenza: <strong style={{ color: 'var(--text-main)' }}>{profile.departureCity}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                ✨ Vibe: <strong style={{ color: 'var(--text-main)' }}>{profile.vibe}</strong>
              </span>
            </div>

            {/* Edit / Control Room CTAs */}
            <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '10px' }}>
              <button
                type="button"
                className="wao-secondary-button wao-display"
                onClick={onOpenControlRoom}
                style={{ padding: '6px 12px', fontSize: '10.5px', width: 'auto', background: 'linear-gradient(135deg, rgba(255, 106, 0, 0.4), rgba(255, 197, 71, 0.2))', borderColor: 'rgba(255, 197, 71, 0.3)' }}
              >
                ⚙️ Control Room demo
              </button>
              <button
                type="button"
                className="wao-secondary-button wao-display"
                onClick={() => setIsEditing(true)}
                style={{ padding: '6px 12px', fontSize: '10.5px', width: 'auto' }}
              >
                Modifica profilo demo
              </button>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
              <h3 className="wao-display" style={{ fontSize: '13px', margin: 0, color: 'var(--amber-gold)' }}>Modifica Profilo Demo</h3>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-nickname" style={{ fontSize: '9px' }}>Nickname</label>
              <input
                type="text"
                id="profile-nickname"
                name="nickname"
                value={editForm.nickname}
                onChange={handleEditChange}
                className="form-input"
                style={{ padding: '8px 10px', fontSize: '12px' }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-departureCity" style={{ fontSize: '9px' }}>Città di partenza</label>
              <input
                type="text"
                id="profile-departureCity"
                name="departureCity"
                value={editForm.departureCity}
                onChange={handleEditChange}
                className="form-input"
                style={{ padding: '8px 10px', fontSize: '12px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-vibe" style={{ fontSize: '9px' }}>Vibe viaggio</label>
              <input
                type="text"
                id="profile-vibe"
                name="vibe"
                value={editForm.vibe}
                onChange={handleEditChange}
                className="form-input"
                style={{ padding: '8px 10px', fontSize: '12px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-status" style={{ fontSize: '9px' }}>Stato festival</label>
              <input
                type="text"
                id="profile-status"
                name="status"
                value={editForm.status}
                onChange={handleEditChange}
                className="form-input"
                style={{ padding: '8px 10px', fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                type="submit"
                className="wao-primary-button wao-display"
                style={{ padding: '8px 14px', fontSize: '11px', flex: 1 }}
              >
                Salva
              </button>
              <button
                type="button"
                className="wao-cancel-button wao-display"
                onClick={handleCancel}
                style={{ padding: '8px 14px', fontSize: '11px', flex: 1 }}
              >
                Annulla
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Riepilogo Stats Grid */}
      <div className="profile-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        <div className="profile-stat-card">
          <span className="stat-value" style={{ color: 'var(--amber-gold)' }}>{statPending}</span>
          <span className="stat-label">{hasNewModelData ? "Join Pendenti" : "In attesa"}</span>
        </div>
        <div className="profile-stat-card">
          <span className="stat-value" style={{ color: 'var(--turquoise)' }}>{statApproved}</span>
          <span className="stat-label">{hasNewModelData ? "Join Approvate" : "Approvate"}</span>
        </div>
        <div className="profile-stat-card">
          <span className="stat-value" style={{ color: 'var(--turquoise)' }}>{statGeneralActive}</span>
          <span className="stat-label">{hasNewModelData ? "Generali Attive" : "Totali"}</span>
        </div>
        <div className="profile-stat-card">
          <span className="stat-value" style={{ color: 'var(--solar-orange)' }}>{statRejectedArchived}</span>
          <span className="stat-label">{hasNewModelData ? "Rifiutate/Arch." : "Rifiutate"}</span>
        </div>
      </div>

      {/* 3. Stato viaggio attuale */}
      <div>
        <h3 className="wao-display" style={{ fontSize: '12px', color: 'var(--text-soft)', marginBottom: '8px', letterSpacing: '0.06em' }}>
          Stato viaggio attuale
        </h3>
        <div className="ride-card card-open" style={{ 
          padding: '14px', 
          borderLeft: `3px solid ${travelStatusColor}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13.5px', color: 'var(--text-main)', fontWeight: 'bold' }}>
              {currentTravelStatusText}
            </span>
            <span className={`ride-badge`} style={{ 
              fontSize: '8.5px', 
              padding: '2px 8px',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              background: travelStatusColor === 'var(--turquoise)' ? 'rgba(42, 242, 224, 0.15)' : (travelStatusColor === 'var(--amber-gold)' ? 'rgba(255, 197, 71, 0.15)' : (travelStatusColor === 'var(--solar-orange)' ? 'rgba(255, 106, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)')),
              color: travelStatusColor,
              border: `1px solid ${travelStatusColor}`
            }}>
              {travelStatusBadge}
            </span>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
            {travelStatusSubtitleText}
          </div>

          {/* Telegram link (shown ONLY if approvedJoinRequest exists and matchedRide has telegramUrl) */}
          {approvedJoinRequest && matchedRide && (
            <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'flex-start' }}>
              <a 
                href={matchedRide.telegramUrl || '#'} 
                target={matchedRide.telegramUrl && matchedRide.telegramUrl !== '#' ? "_blank" : undefined}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!matchedRide.telegramUrl || matchedRide.telegramUrl === '#') {
                    e.preventDefault();
                  }
                }}
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
        </div>
      </div>

      {/* 4. Ultima attività */}
      <div>
        <h3 className="wao-display" style={{ fontSize: '12px', color: 'var(--text-soft)', marginBottom: '8px', letterSpacing: '0.06em' }}>
          Ultima attività
        </h3>
        {latestRequest ? (() => {
          const isJoin = latestRequest.reqType === 'join';
          const isLegacy = !latestRequest.reqType;
          const isOffer = isLegacy && latestRequest.type === 'offer';
          
          let title = "Richiesta generale";
          if (isJoin) {
            title = "Richiesta Join";
          } else if (isOffer) {
            title = "Offerta Passaggio";
          } else if (isLegacy) {
            title = "Richiesta Join (Legacy)";
          }

          let departure = latestRequest.departureCity || latestRequest.departure || 'WAO';
          let route = isJoin 
            ? `${departure} → WAO` 
            : (isLegacy ? latestRequest.route : `${departure} → WAO (Generale)`);

          let status = latestRequest.status || 'pending';
          if (latestRequest.reqType === 'general' && status === 'active') {
            status = 'attiva';
          }

          let actColor = 'var(--amber-gold)';
          if (status === 'approved') actColor = 'var(--turquoise)';
          if (status === 'rejected') actColor = 'var(--solar-orange)';

          return (
            <div className="ride-card card-open" style={{ padding: '14px', borderLeft: `3px solid ${actColor}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="wao-display" style={{ fontSize: '10px', color: actColor, fontWeight: 'bold' }}>
                  {title}
                </span>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  {latestRequest.createdAt ? new Date(latestRequest.createdAt).toLocaleDateString() : ''}
                </span>
              </div>

              <div className="ride-route wao-display" style={{ fontSize: '14.5px', margin: '4px 0 2px 0', textTransform: 'none' }}>
                {route}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-soft)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>Città: <strong>{departure}</strong></div>
                {latestRequest.tripType && <div>Tipo viaggio: <strong>{latestRequest.tripType}</strong></div>}
                {latestRequest.travelTime && <div>Fascia oraria: <strong>{latestRequest.travelTime}</strong></div>}
                <div>
                  {isOffer ? (
                    <>Spazio bagagli: <strong>{latestRequest.luggageCapacity || 'n/d'}</strong> (Posti: {latestRequest.spots})</>
                  ) : (
                    <>Bagaglio: <strong>{latestRequest.luggageNeed || 'n/d'}</strong> (Persone: {latestRequest.passengers || latestRequest.peopleCount || '1'})</>
                  )}
                </div>
                <div>
                  Status: <strong style={{ color: actColor }}>{status}</strong>
                </div>
              </div>
            </div>
          );
        })() : (
          <div className="placeholder-card" style={{ padding: '18px', textAlign: 'center' }}>
            <p className="placeholder-text" style={{ fontSize: '12px', margin: 0 }}>
              Nessuna attività registrata.
            </p>
          </div>
        )}
      </div>

      {/* 5. Mini storico recente */}
      <div>
        <h3 className="wao-display" style={{ fontSize: '12px', color: 'var(--text-soft)', marginBottom: '8px', letterSpacing: '0.06em' }}>
          Mini storico recente
        </h3>
        {recentActivities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentActivities.map((req, idx) => {
              const isJoin = req.reqType === 'join';
              const isLegacy = !req.reqType;
              const isOffer = isLegacy && req.type === 'offer';
              
              let title = "Richiesta generale";
              if (isJoin) {
                title = "Richiesta Join";
              } else if (isOffer) {
                title = "Offerta Passaggio";
              }

              let departure = req.departureCity || req.departure || 'WAO';
              let route = isJoin 
                ? `${departure} → WAO` 
                : (isLegacy ? req.route : `${departure} → WAO (Generale)`);

              let status = req.status || 'pending';
              if (req.reqType === 'general' && status === 'active') {
                status = 'attiva';
              }

              let statusBadgeColor = 'var(--amber-gold)';
              let statusBadgeBg = 'rgba(255, 197, 71, 0.1)';
              if (status === 'approved') {
                statusBadgeColor = 'var(--turquoise)';
                statusBadgeBg = 'rgba(42, 242, 224, 0.1)';
              } else if (status === 'rejected') {
                statusBadgeColor = 'var(--solar-orange)';
                statusBadgeBg = 'rgba(255, 106, 0, 0.1)';
              }

              return (
                <div 
                  key={getEntryKey(req, idx)} 
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(14, 13, 38, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {title}
                    </span>
                    <strong style={{ color: 'var(--text-main)', fontSize: '12.5px' }}>{route}</strong>
                  </div>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    color: statusBadgeColor,
                    background: statusBadgeBg,
                    border: `1px solid ${statusBadgeColor}`,
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="placeholder-card" style={{ padding: '18px', textAlign: 'center' }}>
            <p className="placeholder-text" style={{ fontSize: '11px', margin: 0 }}>
              Nessuna attività nello storico.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
