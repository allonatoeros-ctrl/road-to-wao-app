import { useState, useEffect, useRef } from 'react';
import CosmicAppShell from './components/CosmicAppShell';
import { fetchRides, createRide, getCurrentUser, getCurrentProfile, createJoinRequest, fetchJoinRequests, approveJoinRequest, rejectJoinRequest, getUnlockedCrewForRide } from './services/roadToWaoDb';
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

function isUuid(id) {
  if (typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(id);
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
  const [authBannerMessage, setAuthBannerMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [passwordRecoveryMode, setPasswordRecoveryMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const attemptedFetchRef = useRef(new Set());
  const lastUserRef = useRef(null);

  useEffect(() => {
    if (!supabase) return;

    const recoveryUrl = typeof window !== 'undefined'
      ? `${window.location.hash || ''} ${window.location.search || ''}`.includes('type=recovery')
      : false;

    if (recoveryUrl) {
      setCurrentTab('profilo');
      setPasswordRecoveryMode(true);
    }

    getCurrentUser().then(({ data }) => {
      setCurrentUser(data?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user || null);
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentTab('profilo');
        setPasswordRecoveryMode(true);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (currentUser?.id !== lastUserRef.current) {
      attemptedFetchRef.current.clear();
      lastUserRef.current = currentUser?.id || null;
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setIsAdmin(false);
      setUserProfile(DEFAULT_PROFILE);
      return;
    }
    let active = true;
    getCurrentProfile().then(({ data }) => {
      if (active) {
        setIsAdmin(!!data?.is_admin);
        if (data?.nickname) {
          setUserProfile(prev => ({
            ...prev,
            nickname: data.nickname,
            departureCity: data.departure_city || prev.departureCity || '',
            vibe: data.role || prev.vibe || '',
            badge: data.role || prev.badge || 'user',
            status: data.is_of_age ? 'Maggiorenne' : prev.status
          }));
        }
      }
    }).catch((err) => {
      console.error('Error checking admin status:', err);
      if (active) {
        setIsAdmin(false);
      }
    });
    return () => {
      active = false;
    };
  }, [currentUser]);

  useEffect(() => {
    if (currentTab === 'control-room' && !isAdmin) {
      setCurrentTab('casa');
    }
  }, [currentTab, isAdmin]);

  useEffect(() => {
    if (!currentUser) return;

    // 1. Current user driver rides
    const driverRideIds = rides
      .filter(r => r.driverId === currentUser.id && isUuid(r.id))
      .map(r => r.id);

    // 2. Approved join requests where current user is requester
    const passengerRideIds = joinRequests
      .filter(req => req.requesterId === currentUser.id && req.status === 'approved' && isUuid(req.rideId))
      .map(req => req.rideId);

    // 3. Approved legacy requests where current user is requester
    const legacyPassengerRideIds = requests
      .filter(req => req.requesterId === currentUser.id && req.status === 'approved' && isUuid(req.rideId))
      .map(req => req.rideId);

    // Combine and unique
    const allApprovedRideIds = Array.from(new Set([
      ...driverRideIds,
      ...passengerRideIds,
      ...legacyPassengerRideIds
    ]));

    allApprovedRideIds.forEach(rideId => {
      if (attemptedFetchRef.current.has(rideId)) return;

      attemptedFetchRef.current.add(rideId);

      getUnlockedCrewForRide(rideId).then(res => {
        if (res && res.data && res.data.telegram_group_link) {
          const link = res.data.telegram_group_link;

          // Update rides state
          setRides(prev => prev.map(r => r.id === rideId ? { ...r, telegramUrl: link } : r));

          // Update joinRequests state
          setJoinRequests(prev => prev.map(req => (req.rideId === rideId && req.requesterId === currentUser.id && req.status === 'approved') ? { ...req, telegramUrl: link } : req));

          // Update requests state
          setRequests(prev => prev.map(req => (req.rideId === rideId && req.requesterId === currentUser.id && req.status === 'approved') ? { ...req, telegramUrl: link } : req));
        }
      }).catch(err => {
        console.error(`Error unlocking crew for ride ${rideId}:`, err);
      });
    });
  }, [currentUser, rides, joinRequests, requests]);

  useEffect(() => {
    if (currentTab !== 'profilo') {
      setAuthBannerMessage('');
    }
  }, [currentTab]);

  const requireAuthForAction = async (actionName, callback) => {
    if (currentUser) {
      callback();
      return;
    }
    try {
      const { data: userData, error: userError } = await getCurrentUser();
      const user = userData?.user;
      if (user && !userError) {
        setCurrentUser(user);
        callback();
      } else {
        setCurrentTab('profilo');
        setAuthBannerMessage('Accedi o crea il tuo profilo per partecipare alla crew.');
      }
    } catch (err) {
      console.error(`Error in requireAuthForAction for ${actionName}:`, err);
      setCurrentTab('profilo');
      setAuthBannerMessage('Accedi o crea il tuo profilo per partecipare alla crew.');
    }
  };

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
            driverId: ride.driver_id,
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

  useEffect(() => {
    let active = true;
    async function loadSupabaseJoinRequests() {
      if (!supabase) return;
      try {
        const { data: userData } = await getCurrentUser();
        const user = userData?.user;
        if (!user) {
          return;
        }

        const { data: rawRequests, error } = await fetchJoinRequests();
        if (error) {
          console.error('Error fetching join requests from Supabase:', error);
          return;
        }

        if (!active) return;

        if (rawRequests && rawRequests.length > 0) {
          let profileMap = {};
          try {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, nickname');
            if (profiles) {
              profiles.forEach(p => {
                if (p.id && p.nickname) {
                  profileMap[p.id] = p.nickname;
                }
              });
            }
          } catch (err) {
            console.error('Error fetching profiles for join requests:', err);
          }

          const mappedJoins = rawRequests.map(req => {
            const ride = rides.find(r => String(r.id) === String(req.ride_id));
            const requesterName = profileMap[req.requester_id] || `Rider-${req.requester_id.substring(0, 5)}`;
            
            let luggageNeed = null;
            let cleanMessage = req.message || '';
            if (req.message && req.message.includes('Luggage:')) {
              const parts = req.message.split('Luggage:');
              cleanMessage = parts[0].trim();
              luggageNeed = parts[1].trim();
            }

            return {
              id: req.id,
              rideId: req.ride_id,
              requesterId: req.requester_id,
              rideSummary: ride 
                ? `${ride.departureCity}/${ride.departureDate}/${ride.travelTime}/${ride.driver}`
                : `Ride-${req.ride_id}`,
              type: 'join',
              status: req.status || 'pending',
              archived: false,
              nickname: requesterName,
              departureCity: ride?.departureCity || '',
              tripType: ride?.tripType || '',
              travelTime: ride?.travelTime || '',
              peopleCount: req.seats_requested || 1,
              passengers: req.seats_requested || 1,
              luggageNeed: luggageNeed,
              message: cleanMessage,
              createdAt: req.created_at || new Date().toISOString()
            };
          });

          const mappedLegacyRequests = rawRequests.map(req => {
            const ride = rides.find(r => String(r.id) === String(req.ride_id));
            const requesterName = profileMap[req.requester_id] || `Rider-${req.requester_id.substring(0, 5)}`;
            
            let luggageNeed = null;
            let cleanMessage = req.message || '';
            if (req.message && req.message.includes('Luggage:')) {
              const parts = req.message.split('Luggage:');
              cleanMessage = parts[0].trim();
              luggageNeed = parts[1].trim();
            }

            return {
              id: req.id,
              type: 'join',
              status: req.status || 'pending',
              archived: false,
              route: ride 
                ? `${ride.departureCity} → ${ride.destination || 'WAO'}`
                : `Ride → WAO`,
              departure: ride?.departureCity || '',
              departureCity: ride?.departureCity || '',
              nickname: requesterName,
              passengers: req.seats_requested || 1,
              peopleCount: req.seats_requested || 1,
              tripType: ride?.tripType || '',
              travelTime: ride?.travelTime || '',
              luggageNeed: luggageNeed,
              message: cleanMessage,
              rideId: req.ride_id,
              requesterId: req.requester_id,
              createdAt: req.created_at || new Date().toISOString()
            };
          });

          setJoinRequests(prev => {
            const updated = prev.map(r => {
              const match = mappedJoins.find(m => String(m.id) === String(r.id));
              return match ? match : r;
            });
            const existingIds = new Set(prev.map(r => String(r.id)));
            const newJoins = mappedJoins.filter(r => !existingIds.has(String(r.id)));
            return [...newJoins, ...updated];
          });
          setRequests(prev => {
            const updated = prev.map(r => {
              const match = mappedLegacyRequests.find(m => String(m.id) === String(r.id));
              return match ? match : r;
            });
            const existingIds = new Set(prev.map(r => String(r.id)));
            const newRequests = mappedLegacyRequests.filter(r => !existingIds.has(String(r.id)));
            return [...newRequests, ...updated];
          });
        }
      } catch (err) {
        console.error('Unexpected error in loadSupabaseJoinRequests:', err);
      }
    }

    loadSupabaseJoinRequests();

    return () => {
      active = false;
    };
  }, [currentTab, rides]);

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
    if (updated && updated.is_admin !== undefined) {
      setIsAdmin(updated.is_admin);
    }
  };

  const openJoinForRide = (ride) => {
    requireAuthForAction('join_ride', () => {
      setSelectedRideForJoin(ride);
      setJoinModalMode('ride');
    });
  };

  const openGeneralRequest = () => {
    requireAuthForAction('general_request', () => {
      setSelectedRideForJoin(null);
      setJoinModalMode('general');
    });
  };

  const handleOpenOfferModal = () => {
    requireAuthForAction('offer_ride', () => {
      setShowOfferModal(true);
    });
  };

  const closeJoinModal = () => {
    setSelectedRideForJoin(null);
    setJoinModalMode(null);
  };

  const handleSubmitJoinRequest = async (formData) => {
    const newId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    const runLocalFlow = () => {
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

    try {
      const { data: userData, error: userError } = await getCurrentUser();
      const user = userData?.user;

      if (userError || !user) {
        // Unauthenticated users should not create local/demo requests
        console.error('Unauthenticated request submission blocked');
        return;
      }

      if (!selectedRideForJoin || !selectedRideForJoin.id || !isUuid(selectedRideForJoin.id)) {
        runLocalFlow();
        return;
      }

      let profileNickname = null;
      try {
        const { data: profileData } = await getCurrentProfile();
        if (profileData && profileData.nickname) {
          profileNickname = profileData.nickname;
        }
      } catch (pErr) {
        console.error('Error fetching current profile:', pErr);
      }

      const requesterName = profileNickname || formData.nickname || 'Raver';

      const payload = {
        ride_id: selectedRideForJoin.id,
        rideId: selectedRideForJoin.id,
        passengers: parseInt(formData.passengers || formData.peopleCount, 10) || 1,
        seats_requested: parseInt(formData.passengers || formData.peopleCount, 10) || 1,
        luggage: formData.luggageNeed || '',
        luggage_details: formData.luggageDetails || '',
        luggageNeed: formData.luggageNeed || '',
        message: formData.message || '',
        notes: formData.message || ''
      };

      const { data: supabaseReq, error: createError } = await createJoinRequest(payload);

      if (createError || !supabaseReq) {
        if (createError) {
          console.error('Error creating join request in Supabase:', createError);
        }
        runLocalFlow();
        return;
      }

      const mappedJoin = {
        id: supabaseReq.id,
        rideId: supabaseReq.ride_id,
        requesterId: supabaseReq.requester_id || user.id,
        rideSummary: `${selectedRideForJoin.departureCity}/${selectedRideForJoin.departureDate}/${selectedRideForJoin.travelTime}/${selectedRideForJoin.driver}`,
        type: 'join',
        status: supabaseReq.status || 'pending',
        archived: false,
        nickname: requesterName,
        departureCity: formData.departureCity,
        tripType: formData.tripType,
        travelTime: formData.travelTime,
        peopleCount: supabaseReq.seats_requested || formData.passengers || formData.peopleCount,
        passengers: supabaseReq.seats_requested || formData.passengers || formData.peopleCount,
        luggageNeed: formData.luggageNeed,
        luggageDetails: formData.luggageDetails,
        nearbyFlexible: formData.nearbyFlexible,
        message: supabaseReq.message || formData.message,
        isOfAge: formData.isOfAge,
        createdAt: supabaseReq.created_at || new Date().toISOString()
      };

      const legacyReq = {
        id: supabaseReq.id,
        type: 'join',
        status: supabaseReq.status || 'pending',
        archived: false,
        route: `${selectedRideForJoin.departureCity || selectedRideForJoin.from} → ${selectedRideForJoin.destination || selectedRideForJoin.to || 'WAO'}`,
        departure: formData.departureCity,
        departureCity: formData.departureCity,
        nickname: requesterName,
        passengers: supabaseReq.seats_requested || formData.passengers || formData.peopleCount,
        peopleCount: supabaseReq.seats_requested || formData.passengers || formData.peopleCount,
        tripType: formData.tripType,
        travelTime: formData.travelTime,
        luggageNeed: formData.luggageNeed,
        luggageDetails: formData.luggageDetails,
        nearbyFlexible: formData.nearbyFlexible,
        message: supabaseReq.message || formData.message,
        isOfAge: formData.isOfAge,
        rideId: supabaseReq.ride_id,
        requesterId: supabaseReq.requester_id || user.id,
        createdAt: supabaseReq.created_at || new Date().toISOString()
      };

      setJoinRequests(prev => [mappedJoin, ...prev]);
      setRequests(prev => [legacyReq, ...prev]);

      handleUpdateProfile({
        nickname: requesterName,
        departureCity: formData.departureCity
      });

    } catch (e) {
      console.error('Unexpected error in handleSubmitJoinRequest:', e);
      runLocalFlow();
    }
  };

  // ── Shared AdminPanel props (used by both render paths) ───────
  const adminPanelProps = {
    rides,
    joinRequests,
    generalRequests,
    requests,
    onApproveJoin: async (joinId, rideId) => {
      if (isUuid(joinId)) {
        try {
          const { error } = await approveJoinRequest(joinId);
          if (error) {
            console.error('Error approving join request in Supabase:', error);
            return;
          }
          setJoinRequests(prev => prev.map(r => r.id === joinId ? { ...r, status: 'approved' } : r));
          setRequests(prev => prev.map(r => r.id === joinId ? { ...r, status: 'approved' } : r));

          if (!isUuid(rideId)) {
            const join = joinRequests.find(r => r.id === joinId);
            const pax = Number((join && (join.peopleCount || join.passengers)) || 1);
            setRides(prev => prev.map(r => {
              if (r.id !== rideId) return r;
              const newSeats = Math.max(0, (r.seatsAvailable || 0) - pax);
              return { ...r, seatsAvailable: newSeats, status: newSeats === 0 ? 'full' : r.status };
            }));
          }
        } catch (err) {
          console.error('Unexpected error during approveJoinRequest:', err);
        }
      } else {
        const join = joinRequests.find(r => r.id === joinId);
        const pax = Number((join && (join.peopleCount || join.passengers)) || 1);
        setJoinRequests(prev => prev.map(r => r.id === joinId ? { ...r, status: 'approved' } : r));
        setRides(prev => prev.map(r => {
          if (r.id !== rideId) return r;
          const newSeats = Math.max(0, (r.seatsAvailable || 0) - pax);
          return { ...r, seatsAvailable: newSeats, status: newSeats === 0 ? 'full' : r.status };
        }));
        setRequests(prev => prev.map(r => r.id === joinId ? { ...r, status: 'approved' } : r));
      }
    },
    onRejectJoin: async (joinId) => {
      if (isUuid(joinId)) {
        try {
          const { error } = await rejectJoinRequest(joinId);
          if (error) {
            console.error('Error rejecting join request in Supabase:', error);
            return;
          }
          setJoinRequests(prev => prev.map(r => r.id === joinId ? { ...r, status: 'rejected' } : r));
          setRequests(prev => prev.map(r => r.id === joinId ? { ...r, status: 'rejected' } : r));
        } catch (err) {
          console.error('Unexpected error during rejectJoinRequest:', err);
        }
      } else {
        setJoinRequests(prev => prev.map(r => r.id === joinId ? { ...r, status: 'rejected' } : r));
        setRequests(prev => prev.map(r => r.id === joinId ? { ...r, status: 'rejected' } : r));
      }
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
    if (!isAdmin) {
      return null;
    }
    return (
      <div className="desktop-admin-page">
        <AdminPanel {...adminPanelProps} />
      </div>
    );
  }

  return (
    <CosmicAppShell>
      <div className="road-to-wao-root">
        {authBannerMessage && (
          <div className="auth-banner" style={{
            background: 'linear-gradient(135deg, rgba(255, 106, 0, 0.25), rgba(255, 197, 71, 0.2))',
            border: '1px solid rgba(255, 197, 71, 0.4)',
            borderRadius: '12px',
            padding: '12px 16px',
            margin: '16px 16px 0 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.4', fontWeight: '500' }}>
                {authBannerMessage}
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => setAuthBannerMessage('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-soft)',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '4px',
                lineHeight: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>
        )}
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
                    onClick={handleOpenOfferModal}
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
            rides={rides.map(r => ({ ...r, telegramUrl: null }))}
            onJoinRide={openJoinForRide} 
            onGeneralRequest={openGeneralRequest}
            onOfferRide={handleOpenOfferModal} 
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
              isAdmin={isAdmin}
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
              isAdmin={isAdmin}
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
            userProfile={currentUser ? userProfile : null}
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
                  // Unauthenticated users should not create local/demo rides
                  console.error('Unauthenticated ride submission blocked');
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
                  driverId: supabaseRide.driver_id,
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
