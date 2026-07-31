/* global Buffer, process */
import { createClient } from '@supabase/supabase-js';

const SUBJECT = 'Due persone vorrebbero unirsi alla tua ride 🚗';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function getBearerToken(req) {
  const auth = req.headers.authorization || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

function getRequiredEnv() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromName = process.env.RESEND_FROM_NAME || 'Road to WAO';
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const replyTo = process.env.RESEND_REPLY_TO;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !resendApiKey || !fromEmail || !replyTo) {
    return { error: 'Configurazione email incompleta' };
  }

  return { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey, resendApiKey, fromName, fromEmail, replyTo };
}

function maskEmail(email) {
  const [local = '', domain = ''] = String(email || '').split('@');
  if (!local || !domain) return 'email disponibile';
  return `${local.slice(0, 1)}***@${domain.slice(0, 1)}***`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildEmail({ nickname, city }) {
  const safeNickname = nickname || 'ciao';
  const safeCity = city || 'la tua citta';
  const text = [
    `Ciao ${safeNickname}!`,
    '',
    `Due persone hanno chiesto di unirsi alla tua ride in partenza da ${safeCity} per il festival.`,
    '',
    'Per creare il gruppo ci manca soltanto il tuo username Telegram.',
    '',
    'Ti basta rispondere a questa email scrivendoci il tuo username, per esempio @nomeutente. Appena ce lo mandi, creeremo il gruppo con gli altri partecipanti.',
    '',
    'A presto,',
    'Team Road to WAO'
  ].join('\n');

  const html = `<!doctype html>
<html lang="it">
  <body style="margin:0;padding:0;background:#f7f7f4;color:#151515;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:28px 18px;">
      <div style="background:#ffffff;border:1px solid #e8e4dc;border-radius:12px;padding:24px 22px;line-height:1.55;font-size:16px;">
        <p style="margin:0 0 18px;">Ciao ${escapeHtml(safeNickname)}!</p>
        <p style="margin:0 0 18px;">Due persone hanno chiesto di unirsi alla tua ride in partenza da ${escapeHtml(safeCity)} per il festival.</p>
        <p style="margin:0 0 18px;">Per creare il gruppo ci manca soltanto il tuo username Telegram.</p>
        <p style="margin:0 0 18px;">Ti basta rispondere a questa email scrivendoci il tuo username, per esempio @nomeutente. Appena ce lo mandi, creeremo il gruppo con gli altri partecipanti.</p>
        <p style="margin:0;">A presto,<br>Team Road to WAO</p>
      </div>
    </div>
  </body>
</html>`;

  return { text, html };
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Metodo non consentito' });
  }

  const env = getRequiredEnv();
  if (env.error) return json(res, 500, { error: env.error });

  const token = getBearerToken(req);
  if (!token) return json(res, 401, { error: 'Accesso richiesto' });

  let payload;
  try {
    payload = await readBody(req);
  } catch {
    return json(res, 400, { error: 'Richiesta non valida' });
  }

  const { rideId, userId, role } = payload || {};
  if (!rideId || !userId || !['driver', 'participant'].includes(role)) {
    return json(res, 400, { error: 'Dati email incompleti' });
  }

  const authClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false }
  });
  const serviceClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false }
  });

  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData?.user) return json(res, 401, { error: 'Sessione non valida' });

  const { data: adminProfile, error: adminError } = await serviceClient
    .from('profiles')
    .select('is_admin')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (adminError || adminProfile?.is_admin !== true) {
    return json(res, 403, { error: 'Solo gli admin possono inviare questa email' });
  }

  const { data: ride, error: rideError } = await serviceClient
    .from('rides')
    .select('id, driver_id, departure_city')
    .eq('id', rideId)
    .maybeSingle();

  if (rideError || !ride) return json(res, 404, { error: 'Ride non trovata' });

  if (role === 'driver' && ride.driver_id !== userId) {
    return json(res, 400, { error: 'Destinatario non coerente con la ride' });
  }

  if (role === 'participant') {
    const { data: join, error: joinError } = await serviceClient
      .from('join_requests')
      .select('id')
      .eq('ride_id', rideId)
      .eq('requester_id', userId)
      .eq('status', 'approved')
      .maybeSingle();
    if (joinError || !join) return json(res, 400, { error: 'Partecipante non approvato per questa ride' });
  }

  const [{ data: contact, error: contactError }, { data: profile, error: profileError }] = await Promise.all([
    serviceClient.from('profile_private_contacts').select('contact_email').eq('id', userId).maybeSingle(),
    serviceClient.from('profiles').select('nickname').eq('id', userId).maybeSingle()
  ]);

  if (contactError || profileError || !contact?.contact_email) {
    return json(res, 404, { error: 'Email del destinatario non disponibile' });
  }

  const email = buildEmail({
    nickname: profile?.nickname || 'ciao',
    city: ride.departure_city || 'la tua citta'
  });

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `${env.fromName} <${env.fromEmail}>`,
      to: [contact.contact_email],
      reply_to: env.replyTo,
      subject: SUBJECT,
      text: email.text,
      html: email.html
    })
  });

  if (!resendResponse.ok) {
    return json(res, 502, { error: 'Invio email non riuscito' });
  }

  return json(res, 200, { ok: true, maskedEmail: maskEmail(contact.contact_email) });
}
