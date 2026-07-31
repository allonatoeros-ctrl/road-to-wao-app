import { useState, useEffect, useRef } from 'react';
import CosmicAppShell from './components/CosmicAppShell';
import { fetchRides, createRide, getCurrentUser, getCurrentProfile, createJoinRequest, fetchJoinRequests, approveJoinRequest, rejectJoinRequest, getUnlockedCrewForRide, saveRideSecret, createGeneralRequest, fetchGeneralRequests, archiveGeneralRequest, archiveTestData, isTestVercelRecord, subscribeToRoadToWaoChanges } from './services/roadToWaoDb';
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

export function isUsableContact(value) {
  if (value === null || value === undefined) return false;
  const clean = String(value).trim();
  if (clean === '') return false;
  const lower = clean.toLowerCase();
  if (
    lower === '-' ||
    lower === '@' ||
    lower === 'null' ||
    lower === 'undefined'
  ) {
    return false;
  }
  return true;
}

export function hasUsableContact(profile) {
  if (!profile) return false;
  return isUsableContact(profile.telegram_username) || isUsableContact(profile.instagram_username);
}

function App() {
  const [currentTab, setCurrentTab] = useState('casa');
  const [joinRequests, setJoinRequests] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const seen = window.localStorage.getItem('road_to_wao_onboarding_seen');
        return seen !== 'true';
      }
    } catch (e) {
      console.error('Error reading localStorage onboarding state:', e);
    }
    return false;
  });

  const handleCloseOnboarding = () => {
    try {
      localStorage.setItem('road_to_wao_onboarding_seen', 'true');
    } catch (e) {
      console.error('Error saving localStorage onboarding state:', e);
    }
    setShowOnboarding(false);
  };

  const handleCloseOnboardingAndGoToBoard = () => {
    try {
      localStorage.setItem('road_to_wao_onboarding_seen', 'true');
    } catch (e) {
      console.error('Error saving localStorage onboarding state:', e);
    }
    setShowOnboarding(false);
    setCurrentTab('bacheca');
  };
  const [generalRequests, setGeneralRequests] = useState([]);
  const [selectedRideForJoin, setSelectedRideForJoin] = useState(null);
  const [joinModalMode, setJoinModalMode] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [requests, setRequests] = useState([]);
  const [rides, setRides] = useState([]);
  const [authBannerMessage, setAuthBannerMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [passwordRecoveryMode, setPasswordRecoveryMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Realtime trigger: refreshes Supabase-backed lists. Full ride replacement/update logic is handled in a later task.
  const [realtimeTick, setRealtimeTick] = useState(0);

  const attemptedFetchRef = useRef(new Set());
  const lastUserRef = useRef(null);

  useEffect(() => {
    if (!supabase) return;

    const recoveryUrl = typeof window !== 'undefined'
      ? `${window.location.hash || ''} ${window.location.search || ''}`
      : '';

    const hasRecoveryMode = recoveryUrl.includes('mode=password_recovery');
    const hasRecoveryType = recoveryUrl.includes('type=recovery');
    const hasAuthCode = recoveryUrl.includes('code=');
    const recoveryPending = typeof window !== 'undefined'
      ? window.localStorage.getItem('road_to_wao_password_recovery_pending') === 'true'
      : false;

    if (hasRecoveryMode || hasRecoveryType || (hasAuthCode && recoveryPending)) {
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
      setJoinRequests([]);
      setGeneralRequests([]);
      setRequests([]);
      return;
    }
    let active = true;
    getCurrentProfile().then(({ data }) => {
      if (active) {
        setIsAdmin(!!data?.is_admin);
        if (data) {
          setUserProfile(prev => ({
            ...prev,
            nickname: data.nickname || prev.nickname || '',
            departureCity: data.departure_city || prev.departureCity || '',
            vibe: data.role || prev.vibe || '',
            badge: data.role || prev.badge || 'user',
            status: data.is_of_age ? 'Maggiorenne' : prev.status,
            telegram_username: data.telegram_username || null,
            instagram_username: data.instagram_username || null
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
    const channel = subscribeToRoadToWaoChanges(() => {
      setRealtimeTick(t => t + 1);
    });
    return () => { supabase.removeChannel(channel); };
  }, [currentUser]);

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
    const allApprovedRideIds = isAdmin
      ? rides.filter(r => isUuid(r.id)).map(r => r.id)
      : Array.from(new Set([
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
  }, [currentUser, rides, joinRequests, requests, isAdmin]);

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
          console.log('Fallback to empty public board');
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
            const mappedById = new Map(mappedRides.map((ride) => [String(ride.id), ride]));
            const updatedExisting = previousRides.map((ride) => {
              const fresh = mappedById.get(String(ride.id));
              if (!fresh) return ride;
              mappedById.delete(String(ride.id));
              // Preserve any already-unlocked telegramUrl instead of clobbering it with null
              return { ...ride, ...fresh, telegramUrl: ride.telegramUrl || fresh.telegramUrl };
            });
            const newSupabaseRides = Array.from(mappedById.values());
            return [...newSupabaseRides, ...updatedExisting];
          });
          console.log(`loaded Supabase rides count: ${mappedRides.length}`);
        } else {
          console.log('Fallback to empty public board');
        }
      } catch (err) {
        console.error('Unexpected error in loadSupabaseRides:', err);
        console.log('Fallback to empty public board');
      }
    }

    loadSupabaseRides();

    return () => {
      active = false;
    };
  }, [realtimeTick]);

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

        if (!rawRequests || rawRequests.length === 0) {
          setJoinRequests([]);
          setRequests(prev => prev.filter(r => r.type !== 'join' || !r.rideId));
          return;
        }

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

        // Resolve driver_id directly from the DB for every referenced ride, so join
        // requests on rides not currently in the (open/full-only) public board list
        // — e.g. archived/cancelled — still surface for their driver in Messages.
        let rideDriverMap = {};
        try {
          const uniqueRideIds = Array.from(new Set(rawRequests.map(r => r.ride_id).filter(Boolean)));
          if (uniqueRideIds.length > 0) {
            const { data: rideRows } = await supabase
              .from('rides')
              .select('id, driver_id')
              .in('id', uniqueRideIds);
            if (rideRows) {
              rideRows.forEach(r => {
                rideDriverMap[r.id] = r.driver_id;
              });
            }
          }
        } catch (err) {
          console.error('Error fetching ride driver ids for join requests:', err);
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

          const isArchivedStatus = req.status === 'cancelled' || req.status === 'archived' || req.status === 'rejected';

          return {
            id: req.id,
            rideId: req.ride_id,
            requesterId: req.requester_id,
            driverId: ride?.driverId || ride?.driver_id || rideDriverMap[req.ride_id] || null,
            rideSummary: ride 
              ? `${ride.departureCity}/${ride.departureDate}/${ride.travelTime}/${ride.driver}`
              : `Ride-${req.ride_id}`,
            type: 'join',
            status: req.status || 'pending',
            archived: isArchivedStatus,
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

          const isArchivedStatus = req.status === 'cancelled' || req.status === 'archived' || req.status === 'rejected';

          return {
            id: req.id,
            type: 'join',
            status: req.status || 'pending',
            archived: isArchivedStatus,
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
            driverId: ride?.driverId || ride?.driver_id || rideDriverMap[req.ride_id] || null,
            createdAt: req.created_at || new Date().toISOString()
          };
        });

        setJoinRequests(mappedJoins);
        setRequests(prev => [
          ...mappedLegacyRequests,
          ...prev.filter(r => r.type !== 'join' || !r.rideId)
        ]);
      } catch (err) {
        console.error('Unexpected error in loadSupabaseJoinRequests:', err);
      }
    }

    loadSupabaseJoinRequests();

    return () => {
      active = false;
    };
  }, [currentTab, rides, realtimeTick]);

  useEffect(() => {
    let active = true;
    async function loadSupabaseGeneralRequests() {
      if (!supabase) return;
      try {
        const { data: userData } = await getCurrentUser();
        const user = userData?.user;
        if (!user) {
          return;
        }

        const { data: rawRequests, error } = await fetchGeneralRequests();
        if (error) {
          console.error('Error fetching general requests from Supabase:', error);
          return;
        }

        if (!active) return;

        if (!rawRequests || rawRequests.length === 0) {
          setGeneralRequests([]);
          setRequests(prev => prev.filter(r => r.type !== 'join' || r.rideId));
          return;
        }

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
          console.error('Error fetching profiles for general requests:', err);
        }

        const mappedGenerals = rawRequests.map(req => {
          const requesterName = profileMap[req.requester_id] || `Rider-${req.requester_id.substring(0, 5)}`;
          const isArchivedStatus = req.status === 'cancelled' || req.status === 'archived' || req.status === 'rejected';

          return {
            id: req.id,
            type: 'general',
            status: req.status || 'pending',
            archived: isArchivedStatus,
            nickname: requesterName,
            requesterId: req.requester_id,
            departureCity: req.from_city,
            tripType: req.return_date ? 'andata e ritorno' : 'solo andata',
            travelTime: req.departure_time_label,
            peopleCount: req.people_count || 1,
            passengers: req.people_count || 1,
            luggageNeed: 'medio',
            luggageDetails: '',
            nearbyFlexible: req.from_area ? 'sì' : 'no',
            message: req.message,
            departureDate: req.departure_date,
            returnDate: req.return_date,
            createdAt: req.created_at || new Date().toISOString()
          };
        });

        const mappedLegacyRequests = rawRequests.map(req => {
          const requesterName = profileMap[req.requester_id] || `Rider-${req.requester_id.substring(0, 5)}`;
          const isArchivedStatus = req.status === 'cancelled' || req.status === 'archived' || req.status === 'rejected';

          return {
            id: req.id,
            type: 'join',
            status: req.status || 'pending',
            archived: isArchivedStatus,
            route: `${req.from_city} → WAO (Generale)`,
            departure: req.from_city,
            departureCity: req.from_city,
            nickname: requesterName,
            requesterId: req.requester_id,
            passengers: req.people_count || 1,
            peopleCount: req.people_count || 1,
            tripType: req.return_date ? 'andata e ritorno' : 'solo andata',
            travelTime: req.departure_time_label,
            luggageNeed: 'medio',
            luggageDetails: '',
            nearbyFlexible: req.from_area ? 'sì' : 'no',
            message: req.message,
            departureDate: req.departure_date,
            returnDate: req.return_date,
            createdAt: req.created_at || new Date().toISOString()
          };
        });

        setGeneralRequests(mappedGenerals);
        setRequests(prev => [
          ...mappedLegacyRequests,
          ...prev.filter(r => r.type !== 'join' || r.rideId)
        ]);
      } catch (err) {
        console.error('Unexpected error in loadSupabaseGeneralRequests:', err);
      }
    }

    loadSupabaseGeneralRequests();

    return () => {
      active = false;
    };
  }, [currentTab, realtimeTick]);

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
            status: parsed.status || DEFAULT_PROFILE.status,
            telegram_username: parsed.telegram_username || null,
            instagram_username: parsed.instagram_username || null
          };
        }
      } catch (e) {
        console.error('Error parsing profile from localStorage', e);
      }
    }
    return {
      ...DEFAULT_PROFILE,
      telegram_username: null,
      instagram_username: null
    };
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
      if (!hasUsableContact(userProfile)) {
        setCurrentTab('profilo');
        setAuthBannerMessage('Per offrire o chiedere un passaggio devi inserire almeno un contatto valido: Telegram o Instagram.');
        return;
      }
      setSelectedRideForJoin(ride);
      setJoinModalMode('ride');
    });
  };

  const openGeneralRequest = () => {
    requireAuthForAction('general_request', () => {
      if (!hasUsableContact(userProfile)) {
        setCurrentTab('profilo');
        setAuthBannerMessage('Per offrire o chiedere un passaggio devi inserire almeno un contatto valido: Telegram o Instagram.');
        return;
      }
      setSelectedRideForJoin(null);
      setJoinModalMode('general');
    });
  };

  const handleOpenOfferModal = () => {
    requireAuthForAction('offer_ride', () => {
      if (!hasUsableContact(userProfile)) {
        setCurrentTab('profilo');
        setAuthBannerMessage('Per offrire o chiedere un passaggio devi inserire almeno un contatto valido: Telegram o Instagram.');
        return;
      }
      setShowOfferModal(true);
    });
  };

  const closeJoinModal = () => {
    setSelectedRideForJoin(null);
    setJoinModalMode(null);
  };

  const handleSubmitJoinRequest = async (formData) => {
    if (!hasUsableContact(userProfile)) {
      setCurrentTab('profilo');
      setAuthBannerMessage('Per offrire o chiedere un passaggio devi inserire almeno un contatto valido: Telegram o Instagram.');
      throw new Error('Per offrire o chiedere un passaggio devi inserire almeno un contatto valido: Telegram o Instagram.');
    }

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

      if (joinModalMode === 'general') {
        const payload = {
          requester_id: user.id,
          from_city: formData.departureCity,
          from_area: formData.nearbyFlexible === 'sì' ? 'Flessibile città vicine' : null,
          departure_date: formData.departureDate || null,
          return_date: formData.returnDate || null,
          departure_time_label: formData.travelTime,
          people_count: parseInt(formData.passengers || formData.peopleCount, 10) || 1,
          message: formData.message ? `[Tratta: ${formData.tripType}] ${formData.message}` : `[Tratta: ${formData.tripType}]`,
          status: 'pending'
        };

        const { data: supabaseReq, error: createError } = await createGeneralRequest(payload);

        if (createError || !supabaseReq) {
          console.error('Full Supabase Error (createGeneralRequest):', createError);
          setAuthBannerMessage(`Errore nel salvataggio su Supabase: ${createError?.message || 'Richiesta non salvata.'}`);
          throw new Error(createError?.message || 'Richiesta non salvata.');
        }

        const newGeneral = {
          id: supabaseReq.id,
          type: 'general',
          status: supabaseReq.status || 'pending',
          archived: false,
          nickname: requesterName,
          departureCity: formData.departureCity,
          tripType: formData.tripType,
          travelTime: formData.travelTime,
          peopleCount: supabaseReq.people_count || formData.passengers || formData.peopleCount,
          passengers: supabaseReq.people_count || formData.passengers || formData.peopleCount,
          luggageNeed: formData.luggageNeed,
          luggageDetails: formData.luggageDetails,
          nearbyFlexible: formData.nearbyFlexible,
          message: supabaseReq.message || formData.message,
          isOfAge: formData.isOfAge,
          departureDate: formData.departureDate || supabaseReq.departure_date,
          returnDate: formData.returnDate || supabaseReq.return_date,
          createdAt: supabaseReq.created_at || new Date().toISOString()
        };
        setGeneralRequests(prev => [newGeneral, ...prev]);

        const legacyReq = {
          id: supabaseReq.id,
          type: 'join',
          status: 'pending',
          archived: false,
          route: `${formData.departureCity} → WAO (Generale)`,
          departure: formData.departureCity,
          departureCity: formData.departureCity,
          nickname: requesterName,
          passengers: supabaseReq.people_count || formData.passengers || formData.peopleCount,
          peopleCount: supabaseReq.people_count || formData.passengers || formData.peopleCount,
          tripType: formData.tripType,
          travelTime: formData.travelTime,
          luggageNeed: formData.luggageNeed,
          luggageDetails: formData.luggageDetails,
          nearbyFlexible: formData.nearbyFlexible,
          message: supabaseReq.message || formData.message,
          isOfAge: formData.isOfAge,
          departureDate: formData.departureDate || supabaseReq.departure_date,
          returnDate: formData.returnDate || supabaseReq.return_date,
          createdAt: supabaseReq.created_at || new Date().toISOString()
        };
        setRequests(prev => [legacyReq, ...prev]);

        handleUpdateProfile({
          nickname: requesterName,
          departureCity: formData.departureCity
        });

      } else {
        // Mode 'ride' (Chiedi di unirti)
        if (!selectedRideForJoin || !selectedRideForJoin.id || !isUuid(selectedRideForJoin.id)) {
          runLocalFlow();
          return;
        }

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
          console.error('Full Supabase Error (createJoinRequest):', createError);
          setAuthBannerMessage(`Errore nel salvataggio su Supabase: ${createError?.message || 'Richiesta non salvata.'}`);
          throw new Error(createError?.message || 'Richiesta non salvata.');
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
      }

    } catch (e) {
      console.error('Unexpected error in handleSubmitJoinRequest:', e);
      setAuthBannerMessage(`Errore inaspettato: ${e.message}`);
      throw e instanceof Error ? e : new Error(String(e));
    }
  };

  // ── Shared AdminPanel props (used by both render paths) ───────
  const adminPanelProps = {
    rides,
    joinRequests,
    generalRequests,
    requests,
    onSaveTelegramLink: async (rideId, link) => {
      try {
        const { error } = await saveRideSecret(rideId, link);
        if (error) {
          console.error('Error saving Telegram link:', error);
          alert('Errore nel salvataggio del link: ' + error.message);
          return;
        }
        setRides(prev => prev.map(r => r.id === rideId ? { ...r, telegramUrl: link } : r));
        setJoinRequests(prev => prev.map(req => (req.rideId === rideId && req.status === 'approved') ? { ...req, telegramUrl: link } : req));
        setRequests(prev => prev.map(req => (req.rideId === rideId && req.status === 'approved') ? { ...req, telegramUrl: link } : req));
        alert('Link salvato con successo!');
      } catch (err) {
        console.error('Unexpected error in onSaveTelegramLink:', err);
      }
    },
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
    onArchiveGeneralRequest: async (id) => {
      if (isUuid(id)) {
        try {
          const { error } = await archiveGeneralRequest(id);
          if (error) {
            console.error('Error archiving general request in Supabase:', error);
            return;
          }
          setGeneralRequests(prev => prev.map(r => r.id === id ? { ...r, archived: true } : r));
          setRequests(prev => prev.map(r => r.id === id ? { ...r, archived: true } : r));
        } catch (err) {
          console.error('Unexpected error during archiveGeneralRequest:', err);
        }
      } else {
        setGeneralRequests(prev => prev.map(r => r.id === id ? { ...r, archived: true } : r));
        setRequests(prev => prev.map(r => r.id === id ? { ...r, archived: true } : r));
      }
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
    isAdmin,
    onCleanDemoBoard: async () => {
      try {
        const { error, context } = await archiveTestData();
        if (error) {
          console.error("Errore completo durante l'archiviazione demo:", error);
          alert(`Errore Supabase (${context || 'database'}): ${error.message || error}`);
          return;
        }

        // On success, update React local states
        setRides(prev => prev.map(r => {
          if (isTestVercelRecord(r)) {
            return { ...r, status: 'archived' };
          }
          return r;
        }));

        setJoinRequests(prev => prev.map(jr => {
          if (jr.status === 'pending' || jr.status === 'rejected') {
            return { ...jr, status: 'cancelled' };
          }
          return jr;
        }));

        setRequests(prev => prev.map(r => {
          if (r.status === 'pending' || r.status === 'rejected') {
            return { ...r, status: 'cancelled' };
          }
          return r;
        }));

        setGeneralRequests(prev => prev.map(gr => {
          if (gr.status === 'pending' || gr.status === 'new') {
            return { ...gr, status: 'archived', archived: true };
          }
          return gr;
        }));

      } catch (err) {
        console.error("Errore inatteso durante l'archiviazione demo:", err);
        alert(`Errore inatteso: ${err.message || err}`);
      }
    }
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
      <div className={`road-to-wao-root tab-${currentTab}`}>
        {currentTab !== 'casa' && (
          <div className="wao-internal-ambient-bg" aria-hidden="true">
            <div className="wao-ambient-glow solar"></div>
            <div className="wao-ambient-glow cosmic"></div>
            <div className="wao-ambient-glow turquoise"></div>
            <div className="wao-ambient-starfield"></div>
          </div>
        )}
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

        {(() => {
          const userFilteredJoinRequests = currentUser 
            ? joinRequests.filter(r => r.requesterId === currentUser.id || r.driverId === currentUser.id)
            : joinRequests;

          const userFilteredGeneralRequests = currentUser
            ? generalRequests.filter(r => r.requesterId === currentUser.id)
            : generalRequests;

          const userFilteredRequests = currentUser
            ? requests.filter(r => r.requesterId === currentUser.id || r.driverId === currentUser.id)
            : requests;

          if (currentTab === 'messaggi') {
            return (
              <div className="app-content">
                <MessagesPanel 
                  requests={userFilteredRequests} 
                  rides={rides}
                  joinRequests={userFilteredJoinRequests}
                  generalRequests={userFilteredGeneralRequests}
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
            );
          }

          if (currentTab === 'profilo') {
            return (
              <div className="app-content">
                <ProfilePanel 
                  requests={userFilteredRequests} 
                  rides={rides}
                  joinRequests={userFilteredJoinRequests}
                  generalRequests={userFilteredGeneralRequests}
                  userProfile={userProfile}
                  onUpdateProfile={handleUpdateProfile}
                  onNavigateToBacheca={() => setCurrentTab('bacheca')} 
                  onOpenControlRoom={() => setCurrentTab('control-room')}
                  isAdmin={isAdmin}
                />
              </div>
            );
          }

          return null;
        })()}


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
              if (!hasUsableContact(userProfile)) {
                setCurrentTab('profilo');
                setAuthBannerMessage('Per offrire o chiedere un passaggio devi inserire almeno un contatto valido: Telegram o Instagram.');
                return;
              }
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
                  console.error('Validation Error: Date normalization failed for:', newOffer.date);
                  setAuthBannerMessage('Errore di validazione: Formato data non valido (usa es. "14 Agosto" o "YYYY-MM-DD").');
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
                  console.error('Full Supabase Error (createRide):', createError);
                  setAuthBannerMessage(`Errore nel salvataggio su Supabase: ${createError?.message || 'Viaggio non salvato.'}`);
                  throw new Error(createError?.message || 'Viaggio non salvato.');
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
                setAuthBannerMessage(`Errore inaspettato: ${e.message}`);
                throw e instanceof Error ? e : new Error(String(e));
              }
            }}
            onGoToMessages={() => setCurrentTab('messaggi')}
          />
        )}

        {/* Onboarding Modal */}
        {showOnboarding && (
          <div className="wao-modal-overlay" style={{ zIndex: 10000 }}>
            <div className="wao-modal-container">
              <div className="wao-modal-glow" aria-hidden="true"></div>
              
              <div className="wao-modal-form">
                {/* Header */}
                <div className="wao-modal-header" style={{ marginBottom: '12px' }}>
                  <h2 className="wao-modal-title wao-display" style={{ color: 'var(--amber-gold)' }}>
                    Benvenuto su Road to WAO 🌞
                  </h2>
                </div>

                {/* Body Content */}
                <div className="wao-modal-body" style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-soft)', gap: '14px' }}>
                  <p style={{ margin: 0, textAlign: 'center', opacity: 0.95 }}>
                    Questa è una beta community non ufficiale per aiutarci a organizzarci meglio verso il festival: passaggi, crew e persone che partono da zone simili.
                  </p>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 197, 71, 0.12)',
                    borderRadius: '16px',
                    padding: '16px 18px',
                    boxShadow: 'inset 0 0 12px rgba(255, 197, 71, 0.03)'
                  }}>
                    <h4 className="wao-display" style={{ fontSize: '11px', margin: '0 0 10px 0', color: 'var(--amber-gold)', letterSpacing: '0.08em' }}>
                      Come funziona:
                    </h4>
                    <ol style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li style={{ paddingLeft: '2px' }}>Prima guarda la <strong>Bacheca Viaggi</strong>: se c’è già un viaggio aperto compatibile con te, chiedi di unirti a quello.</li>
                      <li style={{ paddingLeft: '2px' }}>Se hai posti in macchina, clicca <strong>“Offro posti”</strong>: creerai un viaggio in bacheca e diventerai il punto di riferimento per quella tratta.</li>
                      <li style={{ paddingLeft: '2px' }}>Se cerchi passaggio e non trovi ancora un viaggio adatto, clicca <strong>“Cerco passaggio”</strong>.</li>
                      <li style={{ paddingLeft: '2px' }}>Compila più dettagli possibili: città di partenza, orari, possibili tappe, posti, vibe, esigenze, budget e contatti.</li>
                      <li style={{ paddingLeft: '2px' }}>Più informazioni lasci, più è facile aggiustare il tiro e creare match sensati.</li>
                      <li style={{ paddingLeft: '2px' }}>Inserire più tappe o zone dove potresti farti trovare aumenta le possibilità di matchare con persone sulla strada e dividere meglio le spese.</li>
                      <li style={{ paddingLeft: '2px' }}>Dopo la moderazione, se il match ha senso, viene creata o sbloccata una crew Telegram per organizzarvi meglio.</li>
                      <li style={{ paddingLeft: '2px' }}>Lascia contatti corretti: servono per creare davvero il gruppo e non perdere persone per strada.</li>
                    </ol>
                  </div>

                  <p style={{ margin: 0, fontSize: '12.5px', textAlign: 'center', opacity: 0.8, fontStyle: 'italic' }}>
                    È una prima beta: più la usate, più capiamo come migliorarla.
                  </p>

                  <p style={{ margin: 0, fontSize: '11px', textAlign: 'center', opacity: 0.6, fontStyle: 'italic' }}>
                    Road to WAO non organizza viaggi, non gestisce pagamenti e non garantisce passaggi: aiuta solo la community a trovarsi meglio.
                  </p>
                </div>

                {/* Actions / Footer */}
                <div className="wao-modal-footer" style={{ marginTop: '16px' }}>
                  <button
                    type="button"
                    className="wao-primary-button wao-display"
                    onClick={handleCloseOnboardingAndGoToBoard}
                  >
                    Vai alla bacheca
                  </button>
                  <button
                    type="button"
                    className="wao-secondary-button wao-display"
                    onClick={handleCloseOnboarding}
                  >
                    Ho capito
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </CosmicAppShell>
  );
}

export default App;
