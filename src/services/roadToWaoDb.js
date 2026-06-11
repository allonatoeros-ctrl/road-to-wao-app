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
 * Fetches the user profile linked to the authenticated user ID.
 * Table: profiles
 */
export async function getCurrentProfile() {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) return { data: null, error: userError };
    if (!user) return { data: null, error: new Error('No authenticated user') };

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    return { data, error };
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
      .select('*')
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
    const { data, error } = await supabase
      .from('rides')
      .insert([payload])
      .select()
      .single();
    return { data, error };
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
    return { data: [], error: new Error('Supabase is not configured') };
  }
  try {
    const { data, error } = await supabase
      .from('join_requests')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  } catch (error) {
    return { data: [], error };
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
    const { data, error } = await supabase
      .from('join_requests')
      .insert([payload])
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
