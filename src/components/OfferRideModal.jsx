import { useState } from 'react';

export default function OfferRideModal({ userProfile, onClose, onSubmitOffer, onGoToMessages }) {
  const [form, setForm] = useState({
    nickname: userProfile?.nickname || '',
    departureCity: userProfile?.departureCity || '',
    departureDate: '',
    spots: '2 posti liberi',
    tripType: 'solo andata',
    travelTime: 'mattina',
    luggageCapacity: 'poco',
    luggageDetails: '',
    stops: '',
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
    if (!form.departureDate.trim()) newErrors.departureDate = true;
    if (!form.spots.trim()) newErrors.spots = true;
    if (!form.message.trim()) newErrors.message = true;
    if (!form.isOfAge) newErrors.isOfAge = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSuccess(false);
    setIsSuccess(true);

    if (onSubmitOffer) {
      onSubmitOffer({
        type: 'offer',
        id: Date.now(),
        route: `${form.departureCity} → WAO`,
        departure: form.departureCity,
        date: form.departureDate,
        spots: form.spots,
        tripType: form.tripType,
        travelTime: form.travelTime,
        luggageCapacity: form.luggageCapacity,
        luggageDetails: form.luggageDetails,
        stops: form.stops,
        nickname: form.nickname,
        message: form.message,
        status: 'pending'
      });
    }
  };

  return (
    <div className="wao-modal-overlay" onClick={onClose}>
      <div className="wao-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Glow decorativo superiore della modal */}
        <div className="wao-modal-glow" aria-hidden="true"></div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="wao-modal-form">
            {/* Header */}
            <div className="wao-modal-header">
              <h2 className="wao-modal-title wao-display">Offri un passaggio</h2>
              <p className="wao-modal-subtitle">
                Proponi la tua auto per viaggiare in crew verso il WAO Festival.
              </p>
            </div>

            {/* Campi Form */}
            <div className="wao-modal-body" style={{ maxHeight: '60dvh', overflowY: 'auto', paddingRight: '4px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="offer-nickname">Nickname</label>
                <input
                  type="text"
                  id="offer-nickname"
                  name="nickname"
                  value={form.nickname}
                  onChange={handleChange}
                  placeholder="Es. CosmicDriver"
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
                  <label className="form-label" htmlFor="offer-departureCity">Da dove parti?</label>
                  <input
                    type="text"
                    id="offer-departureCity"
                    name="departureCity"
                    value={form.departureCity}
                    onChange={handleChange}
                    placeholder="Città o casello"
                    className={`form-input ${errors.departureCity ? 'input-error' : ''}`}
                  />
                  {errors.departureCity && <span className="error-text">Specifica la città di partenza</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="offer-departureDate">Quando parti?</label>
                  <input
                    type="text"
                    id="offer-departureDate"
                    name="departureDate"
                    value={form.departureDate}
                    onChange={handleChange}
                    placeholder="Es. 14 Agosto"
                    className={`form-input ${errors.departureDate ? 'input-error' : ''}`}
                  />
                  {errors.departureDate && <span className="error-text">Specifica data/ora di partenza</span>}
                </div>
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="offer-tripType">Tipo viaggio</label>
                  <select
                    id="offer-tripType"
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

                <div className="form-group">
                  <label className="form-label" htmlFor="offer-travelTime">Fascia oraria</label>
                  <select
                    id="offer-travelTime"
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
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="offer-stops">Tappe possibili / città lungo strada</label>
                <input
                  type="text"
                  id="offer-stops"
                  name="stops"
                  value={form.stops}
                  onChange={handleChange}
                  placeholder="Es. Bologna, Firenze"
                  className="form-input"
                />
              </div>

              {/* Sezione Posti e bagagli */}
              <div style={{ borderBottom: '1px solid rgba(255, 197, 71, 0.15)', paddingBottom: '4px', margin: '14px 0 8px 0' }}>
                <h4 className="wao-display" style={{ fontSize: '11px', margin: 0, color: 'var(--amber-gold)', letterSpacing: '0.08em' }}>
                  Posti e bagagli
                </h4>
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="offer-spots">Posti disponibili</label>
                  <select
                    id="offer-spots"
                    name="spots"
                    value={form.spots}
                    onChange={handleChange}
                    className="form-input form-select"
                  >
                    <option value="1 posto libero">1 posto</option>
                    <option value="2 posti liberi">2 posti</option>
                    <option value="3 posti liberi">3 posti</option>
                    <option value="4 posti liberi">4 posti</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="offer-luggageCapacity">Spazio bagagli</label>
                  <select
                    id="offer-luggageCapacity"
                    name="luggageCapacity"
                    value={form.luggageCapacity}
                    onChange={handleChange}
                    className="form-input form-select"
                  >
                    <option value="poco">Poco</option>
                    <option value="medio">Medio</option>
                    <option value="tanto">Tanto</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="offer-luggageDetails">Cosa puoi caricare?</label>
                <input
                  type="text"
                  id="offer-luggageDetails"
                  name="luggageDetails"
                  value={form.luggageDetails}
                  onChange={handleChange}
                  placeholder="Zaini, trolley, tenda, sacco a pelo..."
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
                <label className="form-label" htmlFor="offer-message">Messaggio / Note di viaggio</label>
                <textarea
                  id="offer-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Aggiungi info utili (es. orari, spese, flessibilità, se fumi...)"
                  className={`form-input form-textarea ${errors.message ? 'input-error' : ''}`}
                  rows="3"
                />
                {errors.message && <span className="error-text">Lascia un breve messaggio o nota per i passeggeri</span>}
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
                  <span className="checkbox-label-text" style={{ fontSize: '11px', color: 'var(--text-soft)' }}>
                    Confermo di essere maggiorenne e che la proposta rispetta i limiti demo
                  </span>
                </label>
                {errors.isOfAge && <span className="error-text checkbox-error-text">Devi confermare di essere maggiorenne</span>}
              </div>
            </div>

            {/* Footer Azioni */}
            <div className="wao-modal-footer">
              <button type="submit" className="wao-primary-button wao-display">
                Pubblica Offerta
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
              <h2 className="success-title wao-display">Offerta inviata</h2>
              <p className="success-subtitle">In attesa di moderazione demo</p>
              <p className="success-disclaimer">
                Nessuna informazione di contatto viene mostrata prima dell’approvazione.
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
