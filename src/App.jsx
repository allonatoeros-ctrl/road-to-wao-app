import { useState, useEffect } from 'react';
import CosmicAppShell from './components/CosmicAppShell';
import { fetchRides, createRide, getCurrentUser, getCurrentProfile } from './services/roadToWaoDb';
import { supabase } from './services/supabaseClient';
import SolarHeroBackground from './components/SolarHeroBackground';
import BottomNav from './components/BottomNav';
import RoadBoard from './components/RoadBoard';
import JoinRequestModal from './components/JoinRequestModal';
import OfferRideModal from './components/OfferRideModal';
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

const INITIAL_RIDES = [
  {
    id: 'ride-1',
    driver: 'CosmicDriver',
    departureCity: 'Milano',
    destination: 'WAO',
    departureDate: '14 Agosto',
    travelTime: 'mattina',
    tripType: 'solo andata',
    seatsTotal: 4,
    seatsAvailable: 2,
    luggageCapacity: 'medio',
    luggageDetails: 'Zaino e tenda',
    stops: 'Bologna',
    status: 'open',
    telegramUrl: '#telegram-demo'
  },
  {
    id: 'ride-2',
    driver: 'AstroRider',
    departureCity: 'Torino',
    destination: 'WAO',
    departureDate: '13 Agosto',
    travelTime: 'pomeriggio',
    tripType: 'andata e ritorno',
    seatsTotal: 3,
    seatsAvailable: 0,
    luggageCapacity: 'poco',
    luggageDetails: 'Solo zaino leggero',
    stops: '',
    status: 'full',
    telegramUrl: '#telegram-demo'
  },
  {
    id: 'ride-3',
    driver: 'SolarWave',
    departureCity: 'Bologna',
    destination: 'WAO',
    departureDate: '14 Agosto',
    travelTime: 'sera',
    tripType: 'solo andata',
    seatsTotal: 3,
    seatsAvailable: 3,
    luggageCapacity: 'tanto',
    luggageDetails: 'Tenda, sacchi a pelo, attrezzatura',
    stops: 'Firenze',
    status: 'open',
    telegramUrl: '#telegram-demo'
  }
];

function normalizeDepartureDate(dateStr) {
  if (!dateStr) return null;
  const clean = dateStr.trim().toLowerCase();
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return dateStr.trim();
  }
  
  if (clean.includes('14 agosto')) {
    return '2026-08-14';
  }
  if (clean.includes('13 agosto')) {
    return '2026-08-13';
  }
  
  return null;
}

function App() {
  const [currentTab, setCurrentTab] = useState('casa');
  const [joinRequests, setJoinRequests] = useState([]);
  const [generalRequests, setGeneralRequests] = useState([]);
  const [selectedRideForJoin, setSelectedRideForJoin] = useState(null);
  const [joinModalMode, setJoinModalMode] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [requests, setRequests] = useState([]);
  const [rides, setRides] = useState(INITIAL_RIDES);

  useEffect(() => {
    let active = true;
    async function loadSupabaseRides() {
      try {
        const { data: rawRides, error: ridesError } = await fetchRides();
        if (ridesError) {
          console.error('Error fetching rides from Supabase:', ridesError);
          console.log('Fallback to local demo rides');
          return;
        }

        if (!active) return;

        if (rawRides && rawRides.length > 0) {
          let profileMap = {};
          if (supabase) {
            try {
              const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, nickname');
              
              if (!profilesError && profiles) {
                profiles.forEach(p => {
                  if (p.id && p.nickname) {
                    profileMap[p.id] = p.nickname;
                  }
                });
              }
            } catch (err) {
              console.error('Error fetching profiles from Supabase:', err);
            }
          }

          const mappedRides = rawRides.map(ride => ({
            id: ride.id,
            driver: profileMap[ride.driver_id] || `Rider-${ride.driver_id.substring(0, 5)}`,
            departureCity: ride.departure_city,
            from: ride.departure_city,
            destination: ride.to_event || 'WAO',
            to: ride.to_event || 'WAO',
            departureDate: ride.departure_date,
            departure: ride.departure_date,
            travelTime: ride.departure_time_label,
            tripType: ride.return_date ? 'andata e ritorno' : 'solo andata',
            seatsTotal: ride.seats_total,
            seatsAvailable: ride.seats_available,
            luggageCapacity: ride.vibe ? 'medio' : 'poco',
            luggageDetails: ride.notes || '',
            stops: ride.departure_area || '',
            status: ride.status,
            telegramUrl: null
          }));

          setRides((previousRides) => {
            const existingIds = new Set(previousRides.map((ride) => String(ride.id)));
            const newSupabaseRides = mappedRides.filter((ride) => !existingIds.has(String(ride.id)));
            return [...newSupabaseRides, ...previousRides];
          });
          console.log(`loaded Supabase rides count: ${mappedRides.length}`);
        } else {
          console.log('Fallback to local demo rides');
        }
      } catch (err) {
        console.error('Unexpected error in loadSupabaseRides:', err);
        console.log('Fallback to local demo rides');
      }
    }

    loadSupabaseRides();

    return () => {
      active = false;
    };
  }, []);

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

  const openJoinForRide = (ride) => {
    setSelectedRideForJoin(ride);
    setJoinModalMode('ride');
  };

  const openGeneralRequest = () => {
    setSelectedRideForJoin(null);
    setJoinModalMode('general');
  };

  const closeJoinModal = () => {
    setSelectedRideForJoin(null);
    setJoinModalMode(null);
  };

  const handleSubmitJoinRequest = (formData) => {
    const newId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    if (joinModalMode === 'ride') {
      const newJoin = {
        id: newId,
        rideId: selectedRideForJoin.id,
        rideSummary: `${selectedRideForJoin.departureCity}/${selectedRideForJoin.departureDate}/${selectedRideForJoin.travelTime}/${selectedRideForJoin.driver}`,
        type: 'join',
        status: 'pending',
        archived: false,
        nickname: formData.nickname,
        departureCity: formData.departureCity,
        tripType: formData.tripType,
        travelTime: formData.travelTime,
        peopleCount: formData.peopleCount || formData.passengers,
        passengers: formData.passengers || formData.peopleCount,
        luggageNeed: formData.luggageNeed,
        luggageDetails: formData.luggageDetails,
        nearbyFlexible: formData.nearbyFlexible,
        message: formData.message,
        isOfAge: formData.isOfAge,
        createdAt
      };
      setJoinRequests(prev => [newJoin, ...prev]);

      const legacyReq = {
        id: newId,
        type: 'join',
        status: 'pending',
        archived: false,
        route: `${selectedRideForJoin.departureCity || selectedRideForJoin.from} → ${selectedRideForJoin.destination || selectedRideForJoin.to || 'WAO'}`,
        departure: formData.departureCity,
        departureCity: formData.departureCity,
        nickname: formData.nickname,
        passengers: formData.passengers || formData.peopleCount,
        peopleCount: formData.peopleCount || formData.passengers,
        tripType: formData.tripType,
        travelTime: formData.travelTime,
        luggageNeed: formData.luggageNeed,
        luggageDetails: formData.luggageDetails,
        nearbyFlexible: formData.nearbyFlexible,
        message: formData.message,
        isOfAge: formData.isOfAge,
        rideId: selectedRideForJoin.id,
        createdAt
      };
      setRequests(prev => [legacyReq, ...prev]);

    } else if (joinModalMode === 'general') {
      const newGeneral = {
        id: newId,
        type: 'general',
        status: 'active',
        archived: false,
        nickname: formData.nickname,
        departureCity: formData.departureCity,
        tripType: formData.tripType,
        travelTime: formData.travelTime,
        peopleCount: formData.peopleCount || formData.passengers,
        passengers: formData.passengers || formData.peopleCount,
        luggageNeed: formData.luggageNeed,
        luggageDetails: formData.luggageDetails,
        nearbyFlexible: formData.nearbyFlexible,
        message: formData.message,
        isOfAge: formData.isOfAge,
        createdAt
      };
      setGeneralRequests(prev => [newGeneral, ...prev]);

      const legacyReq = {
        id: newId,
        type: 'join',
        status: 'pending',
        archived: false,
        route: `${formData.departureCity} → WAO (Generale)`,
        departure: formData.departureCity,
        departureCity: formData.departureCity,
        nickname: formData.nickname,
        passengers: formData.passengers || formData.peopleCount,
        peopleCount: formData.peopleCount || formData.passengers,
        tripType: formData.tripType,
        travelTime: formData.travelTime,
        luggageNeed: formData.luggageNeed,
        luggageDetails: formData.luggageDetails,
        nearbyFlexible: formData.nearbyFlexible,
        message: formData.message,
        isOfAge: formData.isOfAge,
        createdAt
      };
      setRequests(prev => [legacyReq, ...prev]);
    }

    handleUpdateProfile({
      nickname: formData.nickname,
      departureCity: formData.departureCity
    });
  };

  // ── Shared AdminPanel props (used by both render paths) ───────
  const adminPanelProps = {
    rides,
    joinRequests,
    generalRequests,
    requests,
    onApproveJoin: (joinId, rideId) => {
      const join = joinRequests.find(r => r.id === joinId);
      const pax = Number((join && (join.peopleCount || join.passengers)) || 1);
      setJoinRequests(prev => prev.map(r => r.id === joinId ? { ...r, status: 'approved' } : r));
      setRides(prev => prev.map(r => {
        if (r.id !== rideId) return r;
        const newSeats = Math.max(0, (r.seatsAvailable || 0) - pax);
        return { ...r, seatsAvailable: newSeats, status: newSeats === 0 ? 'full' : r.status };
      }));
      setRequests(prev => prev.map(r => r.id === joinId ? { ...r, status: 'approved' } : r));
    },
    onRejectJoin: (joinId) => {
      setJoinRequests(prev => prev.map(r => r.id === joinId ? { ...r, status: 'rejected' } : r));
      setRequests(prev => prev.map(r => r.id === joinId ? { ...r, status: 'rejected' } : r));
    },
    onArchiveGeneralRequest: (id) => {
      setGeneralRequests(prev => prev.map(r => r.id === id ? { ...r, archived: true } : r));
      setRequests(prev => prev.map(r => r.id === id ? { ...r, archived: true } : r));
    },
    onUpdateStatus: (idOrIndex, newStatus) => {
      setRequests(prev => {
        const hasId = prev.some(r => r.id === idOrIndex);
        if (hasId) return prev.map(r => r.id === idOrIndex ? { ...r, status: newStatus } : r);
        if (typeof idOrIndex === 'number' && idOrIndex >= 0 && idOrIndex < prev.length) {
          const updated = [...prev];
          updated[idOrIndex] = { ...updated[idOrIndex], status: newStatus };
          return updated;
        }
        return prev;
      });
    },
    onClose: () => setCurrentTab('messaggi'),
  };

  // ── Desktop Control Room — renders OUTSIDE the mobile phone shell ──
  if (currentTab === 'control-room') {
    return (
      <div className="desktop-admin-page">
        <AdminPanel {...adminPanelProps} />
      </div>
    );
  }

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
                    onClick={() => setShowOfferModal(true)}
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
          <RoadBoard 
            rides={rides}
            onJoinRide={openJoinForRide} 
            onGeneralRequest={openGeneralRequest}
            onOfferRide={() => setShowOfferModal(true)} 
          />
        )}

        {currentTab === 'messaggi' && (
          <div className="app-content">
            <MessagesPanel 
              requests={requests} 
              rides={rides}
              joinRequests={joinRequests}
              generalRequests={generalRequests}
              userProfile={userProfile}
              onFindRide={() => setCurrentTab('bacheca')} 
              onOpenControlRoom={() => setCurrentTab('control-room')}
              onArchiveRequest={(id) => {
                setRequests(prev => prev.map(r => r.id === id ? { ...r, archived: true } : r));
                setJoinRequests(prev => prev.map(r => r.id === id ? { ...r, archived: true } : r));
                setGeneralRequests(prev => prev.map(r => r.id === id ? { ...r, archived: true } : r));
              }}
            />
          </div>
        )}

        {currentTab === 'profilo' && (
          <div className="app-content">
            <ProfilePanel 
              requests={requests} 
              rides={rides}
              joinRequests={joinRequests}
              generalRequests={generalRequests}
              userProfile={userProfile}
              onUpdateProfile={handleUpdateProfile}
              onNavigateToBacheca={() => setCurrentTab('bacheca')} 
              onOpenControlRoom={() => setCurrentTab('control-room')}
            />
          </div>
        )}


        {/* Barra di Navigazione Fissa in Basso */}
        <BottomNav activeTab={currentTab} setActiveTab={setCurrentTab} />

        {/* Modal di richiesta unione */}
        {joinModalMode && (
          <JoinRequestModal
            selectedRide={selectedRideForJoin}
            mode={joinModalMode}
            userProfile={userProfile}
            onClose={closeJoinModal}
            onSubmit={handleSubmitJoinRequest}
            onGoToMessages={() => setCurrentTab('messaggi')}
          />
        )}

        {/* Modal di offerta passaggio */}
        {showOfferModal && (
          <OfferRideModal
            userProfile={userProfile}
            onClose={() => setShowOfferModal(false)}
            onSubmitOffer={async (newOffer) => {
              const runLocalFlow = () => {
                const offerWithId = {
                  ...newOffer,
                  id: newOffer.id || `offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  createdAt: newOffer.createdAt || new Date().toISOString()
                };
                setRequests(prev => [offerWithId, ...prev]);

                const seatsFromSpots = parseInt(newOffer.spots.charAt(0)) || 2;
                const newRide = {
                  id: `ride-${Date.now()}`,
                  driver: newOffer.nickname,
                  departureCity: newOffer.departure,
                  destination: 'WAO',
                  departureDate: newOffer.date,
                  travelTime: newOffer.travelTime,
                  tripType: newOffer.tripType,
                  seatsTotal: seatsFromSpots,
                  seatsAvailable: seatsFromSpots,
                  luggageCapacity: newOffer.luggageCapacity,
                  luggageDetails: newOffer.luggageDetails,
                  stops: newOffer.stops,
                  status: 'open',
                  telegramUrl: '#telegram-demo'
                };
                setRides(prev => [newRide, ...prev]);

                handleUpdateProfile({
                  nickname: newOffer.nickname,
                  departureCity: newOffer.departure
                });
              };

              try {
                const { data: userData, error: userError } = await getCurrentUser();
                const user = userData?.user;
                if (userError || !user) {
                  runLocalFlow();
                  return;
                }

                // Authenticated user exists
                let profileNickname = null;
                try {
                  const { data: profileData } = await getCurrentProfile();
                  if (profileData && profileData.nickname) {
                    profileNickname = profileData.nickname;
                  }
                } catch (pErr) {
                  console.error('Error fetching current profile:', pErr);
                }

                const driverName = profileNickname || newOffer.nickname || 'Driver';

                const normalizedDate = normalizeDepartureDate(newOffer.date);
                if (!normalizedDate) {
                  console.warn('Could not normalize departure date safely, falling back to local flow');
                  runLocalFlow();
                  return;
                }

                const seatsFromSpots = parseInt(newOffer.spots.charAt(0)) || 2;
                const notesList = [];
                if (newOffer.message) notesList.push(newOffer.message);
                if (newOffer.luggageCapacity) notesList.push(`Spazio bagagli: ${newOffer.luggageCapacity}`);
                if (newOffer.luggageDetails) notesList.push(`Dettagli bagagli: ${newOffer.luggageDetails}`);
                const notesCombined = notesList.join(' | ');

                const payload = {
                  departure_city: newOffer.departure,
                  departure_area: newOffer.stops || null,
                  to_event: 'WAO Festival',
                  departure_date: normalizedDate,
                  return_date: newOffer.return_date || null,
                  seats_total: seatsFromSpots,
                  seats_available: seatsFromSpots,
                  departure_time_label: newOffer.travelTime,
                  vibe: newOffer.vibe || null,
                  notes: notesCombined
                };

                const { data: supabaseRide, error: createError } = await createRide(payload);
                if (createError || !supabaseRide) {
                  if (createError) {
                    console.error('Error creating ride in Supabase:', createError);
                  }
                  runLocalFlow();
                  return;
                }

                // Map returned ride back into the UI ride shape expected by RoadBoard/Messages/Profile
                const mappedRide = {
                  id: supabaseRide.id,
                  driver: driverName,
                  departureCity: supabaseRide.departure_city,
                  from: supabaseRide.departure_city,
                  destination: supabaseRide.to_event || 'WAO',
                  to: supabaseRide.to_event || 'WAO',
                  departureDate: supabaseRide.departure_date,
                  departure: supabaseRide.departure_date,
                  travelTime: supabaseRide.departure_time_label,
                  tripType: supabaseRide.return_date ? 'andata e ritorno' : 'solo andata',
                  seatsTotal: supabaseRide.seats_total,
                  seatsAvailable: supabaseRide.seats_available,
                  luggageCapacity: newOffer.luggageCapacity || (supabaseRide.vibe ? 'medio' : 'poco'),
                  luggageDetails: supabaseRide.notes || '',
                  stops: supabaseRide.departure_area || '',
                  status: supabaseRide.status,
                  telegramUrl: null
                };

                setRides(prev => [mappedRide, ...prev]);

                handleUpdateProfile({
                  nickname: driverName,
                  departureCity: newOffer.departure
                });

              } catch (e) {
                console.error('Unexpected error in onSubmitOffer:', e);
                runLocalFlow();
              }
            }}
            onGoToMessages={() => setCurrentTab('messaggi')}
          />
        )}
      </div>
    </CosmicAppShell>
  );
}

export default App;
