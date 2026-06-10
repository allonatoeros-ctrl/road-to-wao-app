import { useState } from 'react';
import CosmicAppShell from './components/CosmicAppShell';
import SolarHeroBackground from './components/SolarHeroBackground';
import BottomNav from './components/BottomNav';
import RoadBoard from './components/RoadBoard';
import JoinRequestModal from './components/JoinRequestModal';
import MessagesPanel from './components/MessagesPanel';
import ProfilePanel from './components/ProfilePanel';
import AdminPanel from './components/AdminPanel';
import './road-to-wao.css';

const DEFAULT_PROFILE = {
  nickname: 'Cosmic Rider',
  departureCity: 'Milano',
  vibe: 'music-first / tranquillo',
  badge: 'Crew seeker',
  status: 'Sto cercando passaggio'
};

function App() {
  const [currentTab, setCurrentTab] = useState('casa');
  const [selectedRide, setSelectedRide] = useState(null);
  const [requests, setRequests] = useState([]);

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('wao_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            nickname: parsed.nickname || DEFAULT_PROFILE.nickname,
            departureCity: parsed.departureCity || DEFAULT_PROFILE.departureCity,
            vibe: parsed.vibe || DEFAULT_PROFILE.vibe,
            badge: parsed.badge || DEFAULT_PROFILE.badge,
            status: parsed.status || DEFAULT_PROFILE.status
          };
        }
      } catch (e) {
        console.error('Error parsing profile from localStorage', e);
      }
    }
    return DEFAULT_PROFILE;
  });

  const handleUpdateProfile = (updated) => {
    setUserProfile(prev => {
      const next = { ...prev, ...updated };
      localStorage.setItem('wao_profile', JSON.stringify(next));
      return next;
    });
  };

  return (
    <CosmicAppShell>
      <div className="road-to-wao-root">
        {currentTab === 'casa' && (
          <>
            {/* Sfondo con Eclissi e Glow Solare Avanzato */}
            <SolarHeroBackground />

            {/* Contenuto principale dell'App */}
            <div className="app-content">

              {/* Header del Brand */}
              <header className="app-header">
                <h1 className="app-brand wao-display">Road to WAO</h1>
                <span className="app-badge-demo">Demo community · Non ufficiale</span>
              </header>

              {/* Hero Section */}
              <section className="hero-section">
                <p className="hero-subtitle-top wao-display">Benvenuto a casa</p>
                <h2 className="hero-title wao-display">
                  WAO Ti Aspetta
                  <span className="hero-title-sub">Viaggiamo Insieme</span>
                </h2>

                {/* Bussola / Mandala Ornamentale Centro (Asset Reale) */}
                <div className="wao-mandala-container" aria-hidden="true">
                  <img
                    src="/assets/road-to-wao/home/ornaments/wao-home-compass-mandala-centerpiece.png"
                    className="wao-mandala-centerpiece"
                    alt=""
                  />
                </div>

                <p className="hero-subtitle-bottom">
                  Trova il tuo passaggio. Trova la tua crew.
                </p>
              </section>

              {/* Cards con le Azioni Principali - Compatte */}
              <section className="actions-section">
                {/* Card Cerco un passaggio */}
                <div className="wao-card card-primary">
                  <div className="card-label">
                    <span className="card-label-dot"></span>
                    Cerco un passaggio
                  </div>
                  <p className="card-desc">
                    Trova la tua crew per il festival
                  </p>
                  <button
                    type="button"
                    className="wao-primary-button wao-display"
                    onClick={() => setCurrentTab('bacheca')}
                  >
                    Trova un posto
                  </button>
                </div>

                {/* Card Offro posti */}
                <div className="wao-card card-secondary">
                  <div className="card-label">
                    <span className="card-label-dot"></span>
                    Offro posti
                  </div>
                  <p className="card-desc">
                    Condividi la strada e dividi le spese
                  </p>
                  <button
                    type="button"
                    className="wao-secondary-button wao-display"
                    onClick={() => setCurrentTab('bacheca')}
                  >
                    Offri un posto
                  </button>
                </div>
              </section>

              {/* Sezione Sicurezza e Disclaimer */}
              <section className="info-section">
                <div className="disclaimer-card">
                  <p className="disclaimer-text">
                    Road to WAO è una demo community non ufficiale. Non organizza viaggi, non gestisce pagamenti e non garantisce passaggi. La crew decide in autonomia.
                  </p>
                </div>
                <p className="footer-line wao-display">Più di un passaggio. È la Road to WAO.</p>
              </section>

            </div>
          </>
        )}

        {currentTab === 'bacheca' && (
          <RoadBoard onJoinRide={setSelectedRide} />
        )}

        {currentTab === 'messaggi' && (
          <div className="app-content">
            <MessagesPanel 
              requests={requests} 
              onFindRide={() => setCurrentTab('bacheca')} 
              onOpenControlRoom={() => setCurrentTab('control-room')}
            />
          </div>
        )}

        {currentTab === 'profilo' && (
          <div className="app-content">
            <ProfilePanel 
              requests={requests} 
              userProfile={userProfile}
              onUpdateProfile={handleUpdateProfile}
              onNavigateToBacheca={() => setCurrentTab('bacheca')} 
              onOpenControlRoom={() => setCurrentTab('control-room')}
            />
          </div>
        )}

        {currentTab === 'control-room' && (
          <div className="app-content">
            <AdminPanel
              requests={requests}
              onUpdateStatus={(index, newStatus) => {
                setRequests(prev => {
                  const updated = [...prev];
                  updated[index] = {
                    ...updated[index],
                    status: newStatus
                  };
                  return updated;
                });
              }}
              onClose={() => setCurrentTab('messaggi')}
            />
          </div>
        )}

        {/* Barra di Navigazione Fissa in Basso */}
        <BottomNav activeTab={currentTab} setActiveTab={setCurrentTab} />

        {/* Modal di richiesta unione */}
        {selectedRide && (
          <JoinRequestModal
            ride={selectedRide}
            userProfile={userProfile}
            onClose={() => setSelectedRide(null)}
            onSubmitRequest={(newReq) => {
              setRequests(prev => [newReq, ...prev]);
              handleUpdateProfile({
                nickname: newReq.nickname,
                departureCity: newReq.departure
              });
            }}
            onGoToMessages={() => setCurrentTab('messaggi')}
          />
        )}
      </div>
    </CosmicAppShell>
  );
}

export default App;
