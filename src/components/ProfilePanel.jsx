import { useState, useEffect } from 'react';

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

  const latestRequest = requests && requests[0];
  const pendingRequestsCount = requests ? requests.filter(r => !r.status || r.status === 'pending').length : 0;

  let profileStatusText = 'Nessuna';
  let profileStatusColor = 'var(--text-soft)';
  let crewStatusText = 'Non conf.';
  let crewStatusColor = 'var(--text-soft)';

  if (latestRequest) {
    if (latestRequest.status === 'approved') {
      profileStatusText = 'Approvata';
      profileStatusColor = 'var(--turquoise)';
      crewStatusText = 'Sbloccata';
      crewStatusColor = 'var(--turquoise)';
    } else if (latestRequest.status === 'rejected') {
      profileStatusText = 'Rifiutata';
      profileStatusColor = 'var(--solar-orange)';
      crewStatusText = 'Rifiutata';
      crewStatusColor = 'var(--solar-orange)';
    } else {
      profileStatusText = 'In attesa';
      profileStatusColor = 'var(--amber-gold)';
    }
  }

  return (
    <div className="profile-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header */}
      <header className="board-header">
        <h1 className="board-title wao-display">Profilo viaggio</h1>
        <p className="board-subtitle">La tua identità leggera per trovare la crew giusta.</p>
      </header>

      {/* Card principale */}
      <div className="ride-card card-pending-gold" style={{ position: 'relative' }}>
        <div className="ride-card-glow-gold" aria-hidden="true"></div>

        {!isEditing ? (
          <>
            {/* View Mode */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
              {/* Avatar Icon / Orb */}
              <div className="profile-avatar-orb">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              <div>
                <h2 className="wao-display" style={{ fontSize: '18px', margin: 0, color: 'var(--text-main)', letterSpacing: '0.05em' }}>
                  {profile.nickname}
                </h2>
                <span className="ride-badge badge-pending-gold" style={{ marginTop: '4px', display: 'inline-block', fontSize: '9px' }}>
                  {profile.badge}
                </span>
              </div>
            </div>

            {/* Dettagli Profilo */}
            <div className="ride-details" style={{ marginTop: '8px', gap: '10px' }}>
              <div className="ride-detail-item">
                <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="detail-text">Partenza: <strong style={{ color: 'var(--text-main)' }}>{profile.departureCity}</strong></span>
              </div>

              <div className="ride-detail-item">
                <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span className="detail-text">Vibe viaggio: <strong style={{ color: 'var(--text-main)' }}>{profile.vibe}</strong></span>
              </div>

              <div className="ride-detail-item">
                <svg viewBox="0 0 24 24" className="detail-icon" stroke="currentColor" strokeWidth="2" fill="none">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="detail-text">Stato festival: <strong style={{ color: 'var(--text-main)' }}>{profile.status}</strong></span>
              </div>
            </div>

            {/* Modifica CTA & Control Room */}
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
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
          </>
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

      {/* Riepilogo Richieste */}
      <div className="profile-stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        <div className="profile-stat-card">
          <span className="stat-value" style={{ color: 'var(--text-main)' }}>{requests.length}</span>
          <span className="stat-label">Inviate totali</span>
        </div>
        <div className="profile-stat-card">
          <span className="stat-value" style={{ color: 'var(--turquoise)' }}>
            {requests.filter(r => r.status === 'approved').length}
          </span>
          <span className="stat-label">Approvate</span>
        </div>
        <div className="profile-stat-card">
          <span className="stat-value" style={{ color: 'var(--amber-gold)' }}>
            {requests.filter(r => !r.status || r.status === 'pending').length}
          </span>
          <span className="stat-label">In attesa</span>
        </div>
        <div className="profile-stat-card">
          <span className="stat-value" style={{ color: 'var(--solar-orange)' }}>
            {requests.filter(r => r.status === 'rejected').length}
          </span>
          <span className="stat-label">Rifiutate</span>
        </div>
      </div>

      {/* Sezione Richieste */}
      <div style={{ marginTop: '10px' }}>
        <h3 className="wao-display" style={{ fontSize: '12px', color: 'var(--text-soft)', marginBottom: '10px', letterSpacing: '0.06em' }}>
          Richiesta di viaggio
        </h3>

        {latestRequest ? (() => {
          const isApproved = latestRequest.status === 'approved';
          const isRejected = latestRequest.status === 'rejected';
          
          let borderLeftColor = 'var(--solar-orange)';
          let badgeText = 'In attesa';
          let badgeClass = 'badge-open';
          if (isApproved) {
            borderLeftColor = 'var(--turquoise)';
            badgeText = 'Approvata';
            badgeClass = 'badge-approved';
          } else if (isRejected) {
            borderLeftColor = 'var(--text-muted)';
            badgeText = 'Non approvata';
            badgeClass = 'badge-rejected';
          }

          return (
            <div className="ride-card card-open" style={{ padding: '14px', borderLeft: `3px solid ${borderLeftColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="wao-display" style={{ fontSize: '10px', color: borderLeftColor, fontWeight: 'bold' }}>
                  Ultima richiesta
                </span>
                <span className={`ride-badge ${badgeClass}`} style={{ fontSize: '8px', padding: '2px 6px' }}>
                  {badgeText}
                </span>
              </div>

              <div className="ride-route wao-display" style={{ fontSize: '14px', margin: '6px 0 4px 0', textTransform: 'none' }}>
                {latestRequest.route}
              </div>

              <div style={{ fontSize: '11.5px', color: 'var(--text-soft)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div>Partenza da: <strong>{latestRequest.departure}</strong></div>
                <div>Presentato come: <strong>{latestRequest.nickname}</strong></div>
              </div>

              {/* Blocco Stato Viaggio & Compact Timeline */}
              {(() => {
                const isPending = !latestRequest.status || latestRequest.status === 'pending';
                
                let progressWidth = '0%';
                let progressColor = 'var(--amber-gold)';
                let activeBg = 'var(--amber-gold)';
                let activeBorder = 'var(--amber-gold)';
                let activeShadow = 'rgba(255, 197, 71, 0.4)';
                let statusMessage = '';

                if (isApproved) {
                  progressWidth = '100%';
                  progressColor = 'var(--turquoise)';
                  activeBg = 'var(--turquoise)';
                  activeBorder = 'var(--turquoise)';
                  activeShadow = 'rgba(42, 242, 224, 0.4)';
                  statusMessage = 'Crew sbloccata';
                } else if (isRejected) {
                  progressWidth = '66.6%';
                  progressColor = 'rgba(255, 106, 0, 0.7)';
                  activeBg = 'rgba(255, 106, 0, 0.7)';
                  activeBorder = 'rgba(255, 106, 0, 0.7)';
                  activeShadow = 'rgba(255, 106, 0, 0.3)';
                  statusMessage = 'Questa crew non è disponibile, puoi provarne un’altra';
                } else {
                  progressWidth = '33.3%';
                  progressColor = 'var(--amber-gold)';
                  activeBg = 'var(--amber-gold)';
                  activeBorder = 'var(--amber-gold)';
                  activeShadow = 'rgba(255, 197, 71, 0.4)';
                  statusMessage = 'La crew sta valutando la tua richiesta';
                }

                const compactTimelineStyle = {
                  '--progress-color': progressColor,
                  '--active-bg': activeBg,
                  '--active-border': activeBorder,
                  '--active-shadow': activeShadow,
                };

                return (
                  <div className="profile-status-block">
                    <div className="profile-status-title wao-display">Stato viaggio</div>
                    
                    <div className="compact-timeline-container" style={compactTimelineStyle}>
                      <div className="compact-timeline">
                        <div className="compact-timeline-progress" style={{ width: progressWidth }} />
                        
                        {/* Step 1 */}
                        <div className="compact-timeline-step active" />

                        {/* Step 2 */}
                        <div className={`compact-timeline-step active ${isPending ? 'active-pulse' : ''}`} />

                        {/* Step 3 */}
                        <div className={`compact-timeline-step ${isApproved || isRejected ? 'active' : ''}`} />

                        {/* Step 4 */}
                        <div className={`compact-timeline-step ${isApproved ? 'active' : ''}`} />
                      </div>
                    </div>

                    <div className="profile-status-message">
                      {statusMessage}
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })() : (
          <div className="placeholder-card" style={{ padding: '18px', gap: '8px' }}>
            <p className="placeholder-text" style={{ fontSize: '12px', margin: 0 }}>
              Ancora nessuna richiesta. Vai in Bacheca e chiedi di unirti a una crew.
            </p>
            <button
              type="button"
              className="wao-primary-button wao-display"
              onClick={onNavigateToBacheca}
              style={{ marginTop: '6px', padding: '8px 16px', fontSize: '11.5px', width: 'auto' }}
            >
              Vai alla Bacheca
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
