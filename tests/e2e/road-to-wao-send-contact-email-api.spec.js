/* global process */
import { test, expect } from '@playwright/test';

const ADMIN_ID = '3a83d67a-949f-4d6b-b50b-6ee71158cc9f';
const DRIVER_ID = '335786e8-09aa-474c-8c2e-bd7730ad3109';
const PARTICIPANT_ID = 'ccc00000-0000-0000-0000-000000000021';
const RIDE_ID = '75236fb6-9ff5-4fe8-b620-8f8955f0d5fb';

function makeReq({ token, body }) {
  return {
    method: 'POST',
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body,
  };
}

function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(payload) {
      this.body = payload;
    },
  };
}

async function runHandler(handler, req) {
  const res = makeRes();
  await handler(req, res);
  return { status: res.statusCode, body: JSON.parse(res.body || '{}') };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

test.describe('POST /api/admin/send-contact-email', () => {
  let handler;
  let resendPayloads;

  test.beforeEach(async () => {
    process.env.SUPABASE_URL = 'https://road-to-wao.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-test-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-test-key';
    process.env.RESEND_API_KEY = 're_test_key';
    process.env.RESEND_FROM_NAME = 'Road to WAO';
    process.env.RESEND_FROM_EMAIL = 'crew@example.com';
    process.env.RESEND_REPLY_TO = 'allonatoeros@example.com';
    process.env.RESEND_BCC = 'allonatoeros@example.com';
    resendPayloads = [];

    globalThis.fetch = async (url, options = {}) => {
      const href = String(url);
      const auth = options.headers?.Authorization || options.headers?.authorization || '';

      if (href.includes('/auth/v1/user')) {
        if (auth.includes('admin-token')) return jsonResponse({ id: ADMIN_ID, aud: 'authenticated', role: 'authenticated' });
        if (auth.includes('user-token')) return jsonResponse({ id: DRIVER_ID, aud: 'authenticated', role: 'authenticated' });
        return jsonResponse({ error: 'missing session' }, 401);
      }

      if (href.includes('/rest/v1/profiles') && href.includes(`id=eq.${ADMIN_ID}`)) {
        return jsonResponse({ is_admin: true, nickname: 'Admin' });
      }
      if (href.includes('/rest/v1/profiles') && href.includes(`id=eq.${DRIVER_ID}`)) {
        return jsonResponse({ is_admin: false, nickname: 'Auro' });
      }
      if (href.includes('/rest/v1/profiles') && href.includes(`id=eq.${PARTICIPANT_ID}`)) {
        return jsonResponse({ is_admin: false, nickname: 'Gloria' });
      }
      if (href.includes('/rest/v1/rides')) {
        return jsonResponse({ id: RIDE_ID, driver_id: DRIVER_ID, departure_city: 'Padova' });
      }
      if (href.includes('/rest/v1/profile_private_contacts')) {
        if (href.includes(`id=eq.${PARTICIPANT_ID}`)) return jsonResponse({ contact_email: 'participant-private@example.com' });
        return jsonResponse({ contact_email: 'driver-private@example.com' });
      }
      if (href.includes('https://api.resend.com/emails')) {
        const payload = JSON.parse(options.body);
        resendPayloads.push(payload);
        return jsonResponse({ id: 'email_123' });
      }
      return jsonResponse({});
    };

    handler = (await import('../../api/admin/send-contact-email.js')).default;
  });

  test('allows admin and sends to server-side private contact only', async () => {
    const res = await runHandler(handler, makeReq({
      token: 'admin-token',
      body: {
        rideId: RIDE_ID,
        userId: DRIVER_ID,
        role: 'driver',
        email: 'browser-chosen@example.com',
      },
    }));

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(resendPayloads).toHaveLength(1);
    expect(resendPayloads[0].to).toEqual(['driver-private@example.com']);
    expect(resendPayloads[0].to).not.toContain('browser-chosen@example.com');
    expect(resendPayloads[0].from).toBe('Road to WAO <crew@example.com>');
    expect(resendPayloads[0].reply_to).toBe('allonatoeros@example.com');
    expect(resendPayloads[0].bcc).toEqual(['allonatoeros@example.com']);
    expect(resendPayloads[0].subject).toBe('Due persone vorrebbero unirsi alla tua ride 🚗');
    expect(resendPayloads[0].text).toContain('Due persone hanno chiesto di unirsi alla tua ride in partenza da Padova');
    expect(resendPayloads[0].html).toContain('<p');
  });

  test('sends the group announcement template to approved participants', async () => {
    const res = await runHandler(handler, makeReq({
      token: 'admin-token',
      body: {
        rideId: RIDE_ID,
        userId: PARTICIPANT_ID,
        role: 'participant',
      },
    }));

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(resendPayloads).toHaveLength(1);
    expect(resendPayloads[0].to).toEqual(['participant-private@example.com']);
    expect(resendPayloads[0].subject).toBe('Tra poco apriamo il vostro canale Telegram 🚗');
    expect(resendPayloads[0].text).toContain('Abbiamo già i candidati per la ride');
    expect(resendPayloads[0].text).toContain('Se hai suggerimenti per migliorare l\'app');
    expect(resendPayloads[0].bcc).toEqual(['allonatoeros@example.com']);
  });

  test('rejects anonymous requests', async () => {
    const res = await runHandler(handler, makeReq({
      body: { rideId: RIDE_ID, userId: DRIVER_ID, role: 'driver' },
    }));

    expect(res.status).toBe(401);
    expect(resendPayloads).toHaveLength(0);
  });

  test('rejects non-admin users', async () => {
    const res = await runHandler(handler, makeReq({
      token: 'user-token',
      body: { rideId: RIDE_ID, userId: DRIVER_ID, role: 'driver' },
    }));

    expect(res.status).toBe(403);
    expect(resendPayloads).toHaveLength(0);
  });
});
