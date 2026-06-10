import { useState } from 'react';

export default function JoinRequestModal({ ride, userProfile, onClose, onSubmitRequest, onGoToMessages }) {
  const [form, setForm] = useState({
    nickname: userProfile?.nickname || '',
    departureCity: userProfile?.departureCity || '',
    passengers: '1',
    tripType: 'solo andata',
    travelTime: 'mattina',
    luggageNeed: 'leggero',
    luggageDetails: '',
    nearbyFlexible: 'sì',
    message: '',
    isOfAge: false
  });

  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.nickname.trim()) newErrors.nickname = true;
    if (!form.departureCity.trim()) newErrors.departureCity = true;
    if (!form.message.trim()) newErrors.message = true;
    if (!form.isOfAge) newErrors.isOfAge = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSuccess(false);
    // Simulate API call and transition
    setIsSuccess(true);

    if (onSubmitRequest) {
      onSubmitRequest({
        route: `${ride.from} → ${ride.to}`,
        departure: form.departureCity,
        nickname: form.nickname,
        passengers: form.passengers,
        tripType: form.tripType,
        travelTime: form.travelTime,
        luggageNeed: form.luggageNeed,
        luggageDetails: form.luggageDetails,
        nearbyFlexible: form.nearbyFlexible,
        message: form.message,
        status: 'pending'
      });
    }
  };

  if (!ride) return null;

  return (
    <div className="wao-modal-overlay" onClick={onClose}>
      <div className="wao-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Glow decorativo superiore della modal */}
        <div className="wao-modal-glow" aria-hidden="true"></div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="wao-modal-form">
            {/* Header */}
            <div className="wao-modal-header">
              <h2 className="wao-modal-title wao-display">Unisciti al viaggio</h2>
              <p className="wao-modal-subtitle">
                Lascia una richiesta alla crew. Se approvata, sbloccherai il contatto privato.
              </p>
            </div>

            {/* Riepilogo Viaggio Card */}
            <div className="wao-modal-summary-card">
              <div className="summary-route wao-display">
                <span>{ride.from}</span>
                <span className="summary-arrow">→</span>
                <span className="summary-dest">{ride.to}</span>
              </div>
              <div className="summary-meta-grid">
                <div className="summary-meta-item">
                  <svg viewBox="0 0 24 24" className="summary-icon" stroke="currentColor" strokeWidth="2" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{ride.departure}</span>
                </div>
                <div className="summary-meta-item">
                  <svg viewBox="0 0 24 24" className="summary-icon" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  <span>{ride.spots}</span>
                </div>
              </div>
            </div>

            {/* Campi Form */}
            <div className="wao-modal-body" style={{ maxHeight: '55dvh', overflowY: 'auto', paddingRight: '4px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="nickname">Nickname</label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={form.nickname}
                  onChange={handleChange}
                  placeholder="Es. CosmoRider"
                  className={`form-input ${errors.nickname ? 'input-error' : ''}`}
                />
                {errors.nickname && <span className="error-text">Inserisci il tuo nickname</span>}
              </div>

              {/* Sezione Viaggio */}
              <div style={{ borderBottom: '1px solid rgba(255, 197, 71, 0.15)', paddingBottom: '4px', margin: '14px 0 8px 0' }}>
                <h4 className="wao-display" style={{ fontSize: '11px', margin: 0, color: 'var(--amber-gold)', letterSpacing: '0.08em' }}>
                  Viaggio
                </h4>
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="departureCity">Da dove parti?</label>
                  <input
                    type="text"
                    id="departureCity"
                    name="departureCity"
                    value={form.departureCity}
                    onChange={handleChange}
                    placeholder="Città o casello"
                    className={`form-input ${errors.departureCity ? 'input-error' : ''}`}
                  />
                  {errors.departureCity && <span className="error-text">Specifica da dove parti</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="tripType">Tipo viaggio</label>
                  <select
                    id="tripType"
                    name="tripType"
                    value={form.tripType}
                    onChange={handleChange}
                    className="form-input form-select"
                  >
                    <option value="solo andata">Solo andata</option>
                    <option value="solo ritorno">Solo ritorno</option>
                    <option value="andata e ritorno">Andata e ritorno</option>
                  </select>
                </div>
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="travelTime">Fascia oraria</label>
                  <select
                    id="travelTime"
                    name="travelTime"
                    value={form.travelTime}
                    onChange={handleChange}
                    className="form-input form-select"
                  >
                    <option value="mattina">Mattina</option>
                    <option value="pomeriggio">Pomeriggio</option>
                    <option value="sera">Sera</option>
                    <option value="flessibile">Flessibile</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="nearbyFlexible">Flessibile città vicine</label>
                  <select
                    id="nearbyFlexible"
                    name="nearbyFlexible"
                    value={form.nearbyFlexible}
                    onChange={handleChange}
                    className="form-input form-select"
                  >
                    <option value="sì">Sì</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              {/* Sezione Posti e bagagli */}
              <div style={{ borderBottom: '1px solid rgba(255, 197, 71, 0.15)', paddingBottom: '4px', margin: '14px 0 8px 0' }}>
                <h4 className="wao-display" style={{ fontSize: '11px', margin: 0, color: 'var(--amber-gold)', letterSpacing: '0.08em' }}>
                  Posti e bagagli
                </h4>
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="passengers">Persone</label>
                  <select
                    id="passengers"
                    name="passengers"
                    value={form.passengers}
                    onChange={handleChange}
                    className="form-input form-select"
                  >
                    <option value="1">1 persona</option>
                    <option value="2">2 persone</option>
                    <option value="3">3 persone</option>
                    <option value="4">4 persone</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="luggageNeed">Tipo bagaglio</label>
                  <select
                    id="luggageNeed"
                    name="luggageNeed"
                    value={form.luggageNeed}
                    onChange={handleChange}
                    className="form-input form-select"
                  >
                    <option value="leggero">Leggero</option>
                    <option value="medio">Medio</option>
                    <option value="camping">Camping</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="luggageDetails">Dettagli bagaglio</label>
                <input
                  type="text"
                  id="luggageDetails"
                  name="luggageDetails"
                  value={form.luggageDetails}
                  onChange={handleChange}
                  placeholder="Zaino, trolley, tenda, sacco a pelo..."
                  className="form-input"
                />
              </div>

              {/* Sezione Note */}
              <div style={{ borderBottom: '1px solid rgba(255, 197, 71, 0.15)', paddingBottom: '4px', margin: '14px 0 8px 0' }}>
                <h4 className="wao-display" style={{ fontSize: '11px', margin: 0, color: 'var(--amber-gold)', letterSpacing: '0.08em' }}>
                  Note
                </h4>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">Messaggio per la crew</label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Presentati brevemente e di' cosa porti con te..."
                  className={`form-input form-textarea ${errors.message ? 'input-error' : ''}`}
                  rows="3"
                />
                {errors.message && <span className="error-text">Lascia un breve messaggio per presentarti</span>}
              </div>

              <div className="form-group form-checkbox-group">
                <label className={`checkbox-container ${errors.isOfAge ? 'checkbox-error' : ''}`}>
                  <input
                    type="checkbox"
                    name="isOfAge"
                    checked={form.isOfAge}
                    onChange={handleChange}
                    className="form-checkbox-input"
                  />
                  <span className="checkbox-checkmark"></span>
                  <span className="checkbox-label-text">Confermo di avere almeno 18 anni</span>
                </label>
                {errors.isOfAge && <span className="error-text checkbox-error-text">Devi confermare di essere maggiorenne</span>}
              </div>
            </div>

            {/* Footer Azioni */}
            <div className="wao-modal-footer">
              <button type="submit" className="wao-primary-button wao-display">
                Invia richiesta
              </button>
              <button type="button" className="wao-cancel-button wao-display" onClick={onClose}>
                Annulla
              </button>
            </div>
          </form>
        ) : (
          <div className="wao-modal-success">
            {/* Icona di successo orbitale/cosmica */}
            <div className="success-icon-container">
              <div className="success-glow-ring"></div>
              <svg viewBox="0 0 24 24" className="success-icon" stroke="currentColor" strokeWidth="2.5" fill="none">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div className="success-content">
              <h2 className="success-title wao-display">Richiesta inviata</h2>
              <p className="success-subtitle">In attesa approvazione della crew</p>
              <p className="success-disclaimer">
                Nessun contatto viene mostrato prima dell’approvazione.
              </p>
            </div>

            <div className="success-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <button 
                type="button" 
                className="wao-primary-button wao-display" 
                onClick={() => {
                  onClose();
                  if (onGoToMessages) onGoToMessages();
                }}
              >
                Vai ai messaggi
              </button>
              <button 
                type="button" 
                className="wao-secondary-button wao-display" 
                onClick={onClose}
              >
                Torna alla bacheca
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
