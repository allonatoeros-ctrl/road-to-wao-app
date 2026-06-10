import { useState, useEffect } from 'react';

// Stable key helper function
function getEntryKey(entry, index) {
  if (entry && entry.id) return entry.id;
  if (entry && entry.createdAt) return entry.createdAt;
  return `${entry?.type || 'req'}-${entry?.route || ''}-${entry?.nickname || ''}-${index}`;
}

export default function ProfilePanel({ requests, userProfile, onUpdateProfile, onNavigateToBacheca, onOpenControlRoom }) {
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

  // Sort requests from newest to oldest by createdAt / id
  const sortedRequests = [...requests].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : a.id || 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : b.id || 0;
    return dateB - dateA;
  });

  const nonArchivedRequests = sortedRequests.filter(r => !r.archived);
  const latestRequest = nonArchivedRequests[0];
  const recentActivities = nonArchivedRequests.slice(0, 3);

  // Compute status counts
  const totalCount = requests.length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const pendingCount = requests.filter(r => !r.status || r.status === 'pending').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  // Travel status text
  let currentTravelStatusText = 'Nessuna attività';
  let travelStatusColor = 'var(--text-soft)';

  if (latestRequest) {
    const isPending = !latestRequest.status || latestRequest.status === 'pending';
    const isApproved = latestRequest.status === 'approved';
    const isRejected = latestRequest.status === 'rejected';
    const isOffer = latestRequest.type === 'offer';

    if (isPending) {
      currentTravelStatusText = 'In review';
      travelStatusColor = 'var(--amber-gold)';
    } else if (isApproved) {
      if (isOffer) {
        currentTravelStatusText = 'Offerta approvata';
      } else {
        currentTravelStatusText = 'Crew sbloccata';
      }
      travelStatusColor = 'var(--turquoise)';
    } else if (isRejected) {
      currentTravelStatusText = 'Da riprovare';
      travelStatusColor = 'var(--solar-orange)';
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

      {/* 2. Riepilogo 2x2 */}
      <div className="profile-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        <div className="profile-stat-card">
          <span className="stat-value" style={{ color: 'var(--text-main)' }}>{totalCount}</span>
          <span className="stat-label">Totali</span>
        </div>
        <div className="profile-stat-card">
          <span className="stat-value" style={{ color: 'var(--amber-gold)' }}>{pendingCount}</span>
          <span className="stat-label">In attesa</span>
        </div>
        <div className="profile-stat-card">
          <span className="stat-value" style={{ color: 'var(--turquoise)' }}>{approvedCount}</span>
          <span className="stat-label">Approvate</span>
        </div>
        <div className="profile-stat-card">
          <span className="stat-value" style={{ color: 'var(--solar-orange)' }}>{rejectedCount}</span>
          <span className="stat-label">Rifiutate</span>
        </div>
      </div>

      {/* 3. Stato viaggio attuale */}
      <div>
        <h3 className="wao-display" style={{ fontSize: '12px', color: 'var(--text-soft)', marginBottom: '8px', letterSpacing: '0.06em' }}>
          Stato viaggio attuale
        </h3>
        <div className="ride-card card-open" style={{ 
          padding: '12px 14px', 
          borderLeft: `3px solid ${travelStatusColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 'bold' }}>
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
            {latestRequest ? (latestRequest.status || 'pending') : 'nessuno'}
          </span>
        </div>
      </div>

      {/* 4. Ultima attività */}
      <div>
        <h3 className="wao-display" style={{ fontSize: '12px', color: 'var(--text-soft)', marginBottom: '8px', letterSpacing: '0.06em' }}>
          Ultima attività
        </h3>
        {latestRequest ? (
          <div className="ride-card card-open" style={{ padding: '14px', borderLeft: `3px solid ${travelStatusColor}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="wao-display" style={{ fontSize: '10px', color: travelStatusColor, fontWeight: 'bold' }}>
                {latestRequest.type === 'offer' ? "Offerta Passaggio" : "Richiesta Join"}
              </span>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                {latestRequest.createdAt ? new Date(latestRequest.createdAt).toLocaleDateString() : ''}
              </span>
            </div>

            <div className="ride-route wao-display" style={{ fontSize: '14.5px', margin: '4px 0 2px 0', textTransform: 'none' }}>
              {latestRequest.route}
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-soft)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>Città: <strong>{latestRequest.departure}</strong></div>
              <div>Tipo viaggio: <strong>{latestRequest.tripType || 'n/d'}</strong></div>
              <div>Fascia oraria: <strong>{latestRequest.travelTime || 'n/d'}</strong></div>
              <div>
                {latestRequest.type === 'offer' ? (
                  <>Spazio bagagli: <strong>{latestRequest.luggageCapacity || 'n/d'}</strong> (Posti: {latestRequest.spots})</>
                ) : (
                  <>Bagaglio: <strong>{latestRequest.luggageNeed || 'n/d'}</strong> (Persone: {latestRequest.passengers})</>
                )}
              </div>
              <div>
                Status: <strong style={{ color: travelStatusColor }}>{latestRequest.status || 'pending'}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="placeholder-card" style={{ padding: '18px', textAlign: 'center' }}>
            <p className="placeholder-text" style={{ fontSize: '12px', margin: 0 }}>
              {requests.length > 0 ? "Nessuna attività attiva al momento." : "Nessuna attività registrata."}
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
              const isOffer = req.type === 'offer';
              const status = req.status || 'pending';

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
                      {isOffer ? "🚗 Offerta Passaggio" : "👥 Richiesta Join"}
                    </span>
                    <strong style={{ color: 'var(--text-main)' }}>{req.route}</strong>
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
              {requests.length > 0 ? "Nessuna attività attiva al momento." : "Nessuna attività nello storico."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
