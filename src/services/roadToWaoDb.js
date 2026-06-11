import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Gets the current session details.
 * Table: None (handled by auth.getSession())
 */
export async function getCurrentSession() {
  if (!isSupabaseConfigured) {
    return { data: { session: null }, error: new Error('Supabase is not configured') };
  }
  try {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  } catch (error) {
    return { data: { session: null }, error };
  }
}

/**
 * Gets the current user profile.
 * Table: None (handled by auth.getUser())
 */
export async function getCurrentUser() {
  if (!isSupabaseConfigured) {
    return { data: { user: null }, error: new Error('Supabase is not configured') };
  }
  try {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  } catch (error) {
    return { data: { user: null }, error };
  }
}

/**
 * Signs up a new user with email and password.
 * Table: None (handled by auth.signUp())
 */
export async function signUpWithEmail(email, password) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  try {
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: redirectTo ? { emailRedirectTo: redirectTo } : undefined
    });
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Signs in an existing user with email and password.
 * Table: None (handled by auth.signInWithPassword())
 */
export async function signInWithEmail(email, password) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Signs out the current user.
 * Table: None (handled by auth.signOut())
 */
export async function signOut() {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  try {
    const { error } = await supabase.auth.signOut();
    return { data: null, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Sends a password reset email.
 * Table: None (handled by auth.resetPasswordForEmail())
 */
export async function resetPasswordForEmail(email) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  if (!email) {
    return { data: null, error: new Error('Email is required') };
  }
  try {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/?mode=password_recovery` : undefined;
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      email,
      redirectTo ? { redirectTo } : undefined
    );
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Updates the password for the current password recovery session.
 * Table: None (handled by auth.updateUser())
 */
export async function updatePasswordForCurrentUser(newPassword) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  if (!newPassword) {
    return { data: null, error: new Error('Password is required') };
  }
  try {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Exchanges a password recovery auth code for a Supabase session.
 * Table: None (handled by auth.exchangeCodeForSession())
 */
export async function exchangeRecoveryCodeForSession() {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  if (typeof window === 'undefined' || !window.location.href.includes('code=')) {
    return { data: null, error: null };
  }
  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Fetches the user profile linked to the authenticated user ID, merging public and private fields.
 * Table: profiles, profile_secrets
 */
export async function getCurrentProfile() {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  try {
    const { data, error: userError } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) {
      return { data: null, error: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      return { data: null, error: profileError };
    }

    if (!profile) {
      return { data: null, error: null };
    }

    const { data: secrets, error: secretsError } = await supabase
      .from('profile_secrets')
      .select('telegram_username, instagram_username')
      .eq('id', user.id)
      .maybeSingle();

    if (secretsError) {
      return { data: null, error: secretsError };
    }

    const merged = {
      ...profile,
      telegram_username: secrets?.telegram_username || null,
      instagram_username: secrets?.instagram_username || null,
    };

    return { data: merged, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Upserts user profile and private social/contact secrets.
 * Table: profiles, profile_secrets
 */
export async function upsertProfileLite(profilePayload) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  try {
    const { data, error: userError } = await supabase.auth.getUser();
    const user = data?.user;
    if (userError) return { data: null, error: userError };
    if (!user) return { data: null, error: new Error('No authenticated user') };

    // 1. Upsert public profile
    const profileFields = {
      id: user.id,
      nickname: profilePayload.nickname,
      departure_city: profilePayload.departure_city,
      role: profilePayload.role,
      is_of_age: profilePayload.is_of_age,
    };

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert(profileFields)
      .select()
      .single();

    if (profileError) {
      return { data: null, error: profileError };
    }

    // 2. Upsert profile secrets if provided
    let secretsData = null;
    const hasTelegram = profilePayload.telegram_username !== undefined;
    const hasInstagram = profilePayload.instagram_username !== undefined;

    if (hasTelegram || hasInstagram) {
      const secretsFields = { id: user.id };
      if (hasTelegram) {
        secretsFields.telegram_username = profilePayload.telegram_username;
      }
      if (hasInstagram) {
        secretsFields.instagram_username = profilePayload.instagram_username;
      }

      const { data: sData, error: secretsError } = await supabase
        .from('profile_secrets')
        .upsert(secretsFields)
        .select()
        .maybeSingle();

      if (secretsError) {
        return { data: null, error: secretsError };
      }
      secretsData = sData;
    } else {
      // Fetch existing secrets if any to return the merged object
      const { data: sData } = await supabase
        .from('profile_secrets')
        .select('telegram_username, instagram_username')
        .eq('id', user.id)
        .maybeSingle();
      secretsData = sData;
    }

    const merged = {
      ...profileData,
      telegram_username: secretsData?.telegram_username || null,
      instagram_username: secretsData?.instagram_username || null,
    };

    return { data: merged, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Fetches the list of active/visible rides.
 * Table: rides
 */
export async function fetchRides() {
  if (!isSupabaseConfigured) {
    return { data: [], error: new Error('Supabase is not configured') };
  }
  try {
    const { data, error } = await supabase
      .from('rides')
      .select('id, driver_id, departure_city, departure_area, to_event, departure_date, return_date, seats_total, seats_available, departure_time_label, vibe, notes, status, visibility, created_at')
      .eq('visibility', 'public')
      .in('status', ['open', 'full'])
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  } catch (error) {
    return { data: [], error };
  }
}

/**
 * Inserts a new ride record.
 * Table: rides
 */
export async function createRide(payload) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  try {
    const { data: userData, error: userError } = await getCurrentUser();
    if (userError) {
      return { data: null, error: userError };
    }
    const user = userData?.user;
    if (!user) {
      return { data: null, error: new Error('No authenticated user') };
    }

    const seatsTotal = payload.seats_total;
    const seatsAvailable = payload.seats_available !== undefined && payload.seats_available !== null
      ? payload.seats_available
      : seatsTotal;

    const rideToInsert = {
      driver_id: user.id,
      departure_city: payload.departure_city,
      departure_area: payload.departure_area,
      to_event: payload.to_event || 'WAO Festival',
      departure_date: payload.departure_date,
      return_date: payload.return_date,
      seats_total: seatsTotal,
      seats_available: seatsAvailable,
      departure_time_label: payload.departure_time_label,
      vibe: payload.vibe,
      notes: payload.notes,
      status: 'open',
      visibility: 'public'
    };

    const { data, error } = await supabase
      .from('rides')
      .insert([rideToInsert])
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Unlocks the private Telegram group link for a ride if the user is authorized.
 * Access rules:
 * 1. Require authenticated user.
 * 2. Require a valid rideId.
 * 3. User can unlock only if driver of the ride, approved passenger, or admin.
 */
export async function getUnlockedCrewForRide(rideId) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  if (!rideId) {
    return { data: null, error: new Error('Invalid ride ID') };
  }
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return { data: null, error: userError || new Error('User is not authenticated') };
    }
    const userId = userData.user.id;

    // Check permissions before querying ride_secrets
    const [rideRes, joinRes, profileRes] = await Promise.all([
      supabase.from('rides').select('driver_id').eq('id', rideId).maybeSingle(),
      supabase.from('join_requests').select('id').eq('ride_id', rideId).eq('requester_id', userId).eq('status', 'approved').maybeSingle(),
      supabase.from('profiles').select('is_admin').eq('id', userId).maybeSingle()
    ]);

    const isDriver = rideRes.data && rideRes.data.driver_id === userId;
    const isApprovedPassenger = !!joinRes.data;
    const isAdmin = profileRes.data && profileRes.data.is_admin === true;

    if (!isDriver && !isApprovedPassenger && !isAdmin) {
      return { data: null, error: new Error('Crew link not unlocked') };
    }

    // Since permission is granted, query ride_secrets
    const { data: secretData, error: secretError } = await supabase
      .from('ride_secrets')
      .select('telegram_group_link')
      .eq('ride_id', rideId)
      .maybeSingle();

    if (secretError) {
      return { data: null, error: secretError };
    }
    if (!secretData) {
      return { data: null, error: new Error('No crew link found for this ride') };
    }

    return {
      data: {
        ride_id: rideId,
        telegram_group_link: secretData.telegram_group_link
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Fetches all join requests (typically filtered by requester or driver).
 * Table: join_requests
 */
export async function fetchJoinRequests() {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return { data: null, error: userError || new Error('User is not authenticated') };
    }

    const { data, error } = await supabase
      .from('join_requests')
      .select('id, ride_id, requester_id, seats_requested, message, status, created_at')
      .order('created_at', { ascending: false });
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Submits a new join request for a specific ride.
 * Table: join_requests
 */
export async function createJoinRequest(payload) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  try {
    const { data: userData, error: userError } = await getCurrentUser();
    if (userError) {
      return { data: null, error: userError };
    }
    const user = userData?.user;
    if (!user) {
      return { data: null, error: new Error('No authenticated user') };
    }

    const rideId = payload.ride_id || payload.rideId;
    if (!rideId) {
      return { data: null, error: new Error('Missing ride_id in payload') };
    }

    const seatsRequested = payload.seats_requested !== undefined
      ? payload.seats_requested
      : (payload.seats !== undefined
        ? payload.seats
        : (payload.passengers !== undefined ? payload.passengers : 1));

    let message = payload.message || payload.notes || '';
    if (payload.luggage) {
      message = message ? `${message}\nLuggage: ${payload.luggage}` : `Luggage: ${payload.luggage}`;
    } else if (payload.luggage_details) {
      message = message ? `${message}\nLuggage: ${payload.luggage_details}` : `Luggage: ${payload.luggage_details}`;
    }

    const requestToInsert = {
      ride_id: rideId,
      requester_id: user.id,
      seats_requested: seatsRequested,
      message: message || null,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('join_requests')
      .insert([requestToInsert])
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Approves a join request.
 * Tables: join_requests (and handles/triggers seats adjustment in rides)
 */
export async function approveJoinRequest(requestId) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return { data: null, error: userError || new Error('User is not authenticated') };
    }

    const { data, error } = await supabase
      .from('join_requests')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Rejects a join request.
 * Table: join_requests
 */
export async function rejectJoinRequest(requestId) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return { data: null, error: userError || new Error('User is not authenticated') };
    }

    const { data, error } = await supabase
      .from('join_requests')
      .update({ status: 'rejected', rejected_at: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Fetches all general requests.
 * Table: general_requests
 */
export async function fetchGeneralRequests() {
  if (!isSupabaseConfigured) {
    return { data: [], error: new Error('Supabase is not configured') };
  }
  try {
    const { data, error } = await supabase
      .from('general_requests')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  } catch (error) {
    return { data: [], error };
  }
}

/**
 * Submits a new general travel request.
 * Table: general_requests
 */
export async function createGeneralRequest(payload) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  try {
    const { data, error } = await supabase
      .from('general_requests')
      .insert([payload])
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Archives a general request.
 * Table: general_requests
 */
export async function archiveGeneralRequest(requestId) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  try {
    const { data, error } = await supabase
      .from('general_requests')
      .update({ status: 'archived' })
      .eq('id', requestId)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Sets up PostgreSQL realtime subscription channel to watch for changes.
 * Tables: rides, join_requests, general_requests
 */
export function subscribeToRoadToWaoChanges(onChange) {
  if (!isSupabaseConfigured) {
    return {
      unsubscribe: () => {}
    };
  }
  try {
    const channel = supabase
      .channel('road-to-wao-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rides' },
        (payload) => onChange({ table: 'rides', ...payload })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'join_requests' },
        (payload) => onChange({ table: 'join_requests', ...payload })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'general_requests' },
        (payload) => onChange({ table: 'general_requests', ...payload })
      )
      .subscribe();

    return channel;
  } catch (error) {
    console.error('Failed to subscribe to realtime changes', error);
    return {
      unsubscribe: () => {}
    };
  }
}
