const https = require('https');
const AppError = require('../utils/AppError');

/**
 * SMS Service
 *
 * Supports two providers — configure whichever one the client picks:
 *
 *   Provider 1 — MSG91 (recommended for India)
 *     Set: MSG91_AUTH_KEY, MSG91_TEMPLATE_ID
 *     Required plan: OTP (Basic plan works)
 *
 *   Provider 2 — Twilio (international)
 *     Set: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE
 *
 * Selection: If MSG91_AUTH_KEY is set, MSG91 is used. Otherwise Twilio.
 * Dev mode: OTP is logged to console — no actual SMS sent.
 *
 * Zero external dependencies — uses Node.js built-in `https` module.
 */

// ── Internal HTTP helper ──────────────────────────────────────────────────────

/**
 * Make an HTTPS request and return the response body as parsed JSON.
 */
const httpsRequest = (options, body) =>
  new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }

    req.end();
  });

// ── Provider: MSG91 ───────────────────────────────────────────────────────────

/**
 * Send OTP via MSG91.
 *
 * MSG91 OTP API docs: https://docs.msg91.com/reference/send-otp
 *
 * Phone format: MSG91 expects country code + number, no leading `+`.
 * e.g. "+919876543210" → "919876543210"
 *
 * Template must be pre-created in MSG91 dashboard with {{OTP}} variable.
 */
const sendViaMSG91 = async (phone, otp) => {
  const authKey    = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  if (!authKey || !templateId) {
    throw new AppError(
      'MSG91 credentials not configured. Set MSG91_AUTH_KEY and MSG91_TEMPLATE_ID in .env',
      500
    );
  }

  // Strip the leading '+' — MSG91 requires "919876543210" not "+919876543210"
  const mobile = phone.replace(/^\+/, '');

  const requestBody = {
    template_id: templateId,
    mobile,
    otp: String(otp),
  };

  const response = await httpsRequest(
    {
      hostname: 'control.msg91.com',
      path: '/api/v5/otp',
      method: 'POST',
      headers: {
        authkey: authKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
    requestBody
  );

  // MSG91 returns { type: 'success', message: '...' } on success
  if (response.statusCode !== 200 || response.body?.type !== 'success') {
    console.error('[SMS/MSG91] Failed:', response.body);
    throw new AppError('Failed to send OTP via SMS. Please try again.', 502);
  }
};

// ── Provider: Twilio ──────────────────────────────────────────────────────────

/**
 * Send OTP via Twilio SMS.
 *
 * Twilio docs: https://www.twilio.com/docs/sms/api/message-resource
 * Uses Basic Auth (SID:AUTH_TOKEN) — no Twilio SDK needed.
 */
const sendViaTwilio = async (phone, otp) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const from       = process.env.TWILIO_PHONE;

  if (!accountSid || !authToken || !from) {
    throw new AppError(
      'Twilio credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE in .env',
      500
    );
  }

  // Twilio requires form-encoded body, not JSON
  const messageBody = `Your Grihavastu OTP is ${otp}. Valid for 10 minutes. Do not share this with anyone.`;
  const formBody    = new URLSearchParams({ From: from, To: phone, Body: messageBody }).toString();

  // Basic Auth: base64 encode "accountSid:authToken"
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const response = await httpsRequest(
    {
      hostname: 'api.twilio.com',
      path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formBody),
      },
    },
    formBody
  );

  // Twilio returns 201 on success with { sid, status, ... }
  if (response.statusCode !== 201) {
    console.error('[SMS/Twilio] Failed:', response.body);
    throw new AppError('Failed to send OTP via SMS. Please try again.', 502);
  }
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Send an OTP to the given phone number.
 *
 * In development: logs the OTP to the console and skips the actual SMS.
 * In production: routes to MSG91 (if configured) or Twilio.
 *
 * @param {string} phone - Phone in E.164 format (+91XXXXXXXXXX)
 * @param {string} otp   - 6-digit OTP to send
 * @throws {AppError}    - On gateway failure or missing credentials
 */
const sendOtp = async (phone, otp) => {
  // Dev mode — just log, no SMS sent
  if (process.env.NODE_ENV !== 'production') {
    console.info(`\n📱 [SMS — DEV MODE, not sent]\n   Phone : ${phone}\n   OTP   : ${otp}\n`);
    return;
  }

  // Production — pick gateway based on what's configured
  if (process.env.MSG91_AUTH_KEY) {
    return sendViaMSG91(phone, otp);
  }

  if (process.env.TWILIO_ACCOUNT_SID) {
    return sendViaTwilio(phone, otp);
  }

  // No provider configured — fail loudly in production
  throw new AppError(
    'No SMS gateway configured. Set MSG91_AUTH_KEY or TWILIO_ACCOUNT_SID in production .env',
    500
  );
};

module.exports = { sendOtp };
