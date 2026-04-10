const nodemailer = require('nodemailer');

/**
 * Email Service
 *
 * Strategy:
 *  - Development : Logs email to console instead of sending (no real SMTP needed)
 *  - Production  : Sends via SMTP (Nodemailer) — swap transporter for SendGrid if preferred
 *
 * All public methods accept plain data objects — no HTML knowledge required in callers.
 * Templates are private to this module.
 *
 * Available methods:
 *  - sendLeadNotification(lead)        → Admin alert on new lead
 *  - sendLeadConfirmation(lead)        → User acknowledgement after submitting enquiry
 *  - sendContactNotification(contact)  → Admin alert on contact form submission
 *  - sendWelcome(user)                 → Welcome email after first login
 *  - sendOtp(phone, otp)              → OTP delivery (falls back to email if phone not email)
 */

// ── Transporter ──────────────────────────────────────────────────────────────

let transporter = null;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  if (process.env.NODE_ENV === 'development') {
    // In dev, use a no-op transporter that logs instead of sending
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    pool: true,           // reuse connections
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 10,        // max 10 emails/second
  });

  return transporter;
};

// ── Core Send Function ───────────────────────────────────────────────────────

/**
 * @param {{ to, subject, html, text? }} options
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (process.env.NODE_ENV === 'development') {
    console.info('\n📧 [EMAIL — DEV MODE, not sent]');
    console.info(`   To:      ${to}`);
    console.info(`   Subject: ${subject}`);
    console.info(`   Body:    ${text || '(HTML only)'}\n`);
    return { messageId: 'dev-mode' };
  }

  const mail = getTransporter();

  const info = await mail.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text: text || htmlToPlainText(html),
  });

  return info;
};

// ── HTML → Plain Text fallback ───────────────────────────────────────────────

const htmlToPlainText = (html) =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();

// ── Shared Template Wrapper ──────────────────────────────────────────────────

const baseTemplate = (title, bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#b80049;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                Mumbai Editorial
              </h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">
                Premium Real Estate
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:20px 32px;border-top:1px solid #eeeeee;">
              <p style="margin:0;color:#999999;font-size:12px;text-align:center;">
                © ${new Date().getFullYear()} Mumbai Editorial. All rights reserved.<br/>
                This is an automated message — please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Templates ────────────────────────────────────────────────────────────────

const leadNotificationTemplate = (lead) => {
  const typeLabels = {
    buy: 'Buy Property',
    rent: 'Rent Property',
    loan: 'Home Loan',
    agreement: 'Rent Agreement',
    list_property: 'List Property',
  };

  return baseTemplate(
    'New Lead — Mumbai Editorial',
    `
    <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:20px;">🔔 New Lead Received</h2>
    <p style="margin:0 0 24px;color:#666666;font-size:14px;">
      A new enquiry has been submitted on Mumbai Editorial.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eeeeee;border-radius:6px;overflow:hidden;">
      ${row('Lead Type', `<span style="background:#b80049;color:#fff;padding:2px 10px;border-radius:20px;font-size:12px;">${typeLabels[lead.leadType] || lead.leadType}</span>`)}
      ${row('Name', lead.name)}
      ${row('Phone', lead.phone)}
      ${lead.email ? row('Email', lead.email) : ''}
      ${lead.message ? row('Message', lead.message) : ''}
      ${lead.budgetMin || lead.budgetMax ? row('Budget', `₹${(lead.budgetMin || 0).toLocaleString('en-IN')} — ₹${(lead.budgetMax || 0).toLocaleString('en-IN')}`) : ''}
      ${lead.propertyTitle ? row('Property', lead.propertyTitle) : ''}
      ${row('Submitted At', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }))}
    </table>

    <p style="margin:24px 0 0;font-size:13px;color:#888888;">
      Log in to the admin panel to update the lead status and add notes.
    </p>
    `
  );
};

const leadConfirmationTemplate = (lead) =>
  baseTemplate(
    'We received your enquiry — Mumbai Editorial',
    `
    <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:20px;">Thank you, ${lead.name}!</h2>
    <p style="margin:0 0 24px;color:#555555;font-size:15px;line-height:1.6;">
      We've received your enquiry and our team will get back to you within
      <strong>24 hours</strong>. Here's a summary of what you submitted:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eeeeee;border-radius:6px;overflow:hidden;margin-bottom:24px;">
      ${row('Enquiry Type', lead.leadType)}
      ${row('Your Phone', lead.phone)}
      ${lead.message ? row('Your Message', lead.message) : ''}
    </table>

    <p style="margin:0;color:#555555;font-size:14px;line-height:1.6;">
      In the meantime, explore more properties at
      <a href="https://mumbaieditorial.com" style="color:#b80049;">mumbaieditorial.com</a>.
    </p>
    `
  );

const contactNotificationTemplate = (contact) =>
  baseTemplate(
    'New Contact Message — Mumbai Editorial',
    `
    <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:20px;">📩 New Contact Form Submission</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eeeeee;border-radius:6px;overflow:hidden;">
      ${row('Name', contact.name)}
      ${row('Phone', contact.phone)}
      ${contact.email ? row('Email', contact.email) : ''}
      ${row('Message', contact.message)}
      ${row('Submitted At', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }))}
    </table>
    `
  );

const welcomeTemplate = (user) =>
  baseTemplate(
    'Welcome to Mumbai Editorial',
    `
    <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:20px;">Welcome, ${user.name || 'there'}! 🎉</h2>
    <p style="margin:0 0 24px;color:#555555;font-size:15px;line-height:1.6;">
      Your account has been created successfully. You can now:
    </p>
    <ul style="color:#555555;font-size:14px;line-height:2;padding-left:20px;margin:0 0 24px;">
      <li>Save properties to your wishlist</li>
      <li>Compare up to 3 properties side-by-side</li>
      <li>Track your enquiries</li>
      <li>Download property brochures</li>
    </ul>
    <a href="https://mumbaieditorial.com"
       style="display:inline-block;background:#b80049;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
      Explore Properties
    </a>
    `
  );

const otpTemplate = (otp) =>
  baseTemplate(
    'Your OTP — Mumbai Editorial',
    `
    <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:20px;">Your One-Time Password</h2>
    <p style="margin:0 0 24px;color:#555555;font-size:15px;">
      Use the OTP below to verify your identity. It expires in <strong>10 minutes</strong>.
    </p>
    <div style="background:#f9f0f4;border:2px dashed #b80049;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
      <span style="font-size:42px;font-weight:700;color:#b80049;letter-spacing:12px;">${otp}</span>
    </div>
    <p style="margin:0;color:#888888;font-size:13px;">
      If you did not request this OTP, please ignore this email.
    </p>
    `
  );

// ── Table Row Helper ─────────────────────────────────────────────────────────

const row = (label, value) => `
  <tr>
    <td style="padding:10px 16px;background:#f9f9f9;color:#888888;font-size:13px;font-weight:600;width:35%;border-bottom:1px solid #eeeeee;vertical-align:top;">
      ${label}
    </td>
    <td style="padding:10px 16px;color:#333333;font-size:14px;border-bottom:1px solid #eeeeee;vertical-align:top;">
      ${value}
    </td>
  </tr>
`;

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Notify admin of a new lead submission.
 * @param {{ name, phone, email?, leadType, message?, propertyTitle?, budgetMin?, budgetMax? }} lead
 */
const sendLeadNotification = async (lead) => {
  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `🔔 New ${lead.leadType} Lead — ${lead.name}`,
    html: leadNotificationTemplate(lead),
    text: `New lead from ${lead.name} (${lead.phone}). Type: ${lead.leadType}. Message: ${lead.message || 'N/A'}`,
  });
};

/**
 * Confirm to the user that their enquiry was received.
 * Only sent if the user provided an email.
 * @param {{ name, phone, email?, leadType, message? }} lead
 */
const sendLeadConfirmation = async (lead) => {
  if (!lead.email) {
    return; // No email provided — skip silently
  }
  return sendEmail({
    to: lead.email,
    subject: 'We received your enquiry — Mumbai Editorial',
    html: leadConfirmationTemplate(lead),
    text: `Hi ${lead.name}, we received your enquiry and will contact you within 24 hours.`,
  });
};

/**
 * Notify admin of a contact form submission.
 * @param {{ name, phone, email?, message }} contact
 */
const sendContactNotification = async (contact) => {
  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `📩 Contact Form — ${contact.name}`,
    html: contactNotificationTemplate(contact),
    text: `Contact from ${contact.name} (${contact.phone}): ${contact.message}`,
  });
};

/**
 * Send welcome email after first login.
 * @param {{ name?, email }} user
 */
const sendWelcome = async (user) => {
  if (!user.email) {
    return;
  }
  return sendEmail({
    to: user.email,
    subject: 'Welcome to Mumbai Editorial 🎉',
    html: welcomeTemplate(user),
    text: `Welcome to Mumbai Editorial! Your account is ready.`,
  });
};

/**
 * Send OTP to user's email.
 * Note: For phone OTP delivery, integrate an SMS provider (MSG91, Twilio, etc.).
 * @param {string} email
 * @param {string} otp
 */
const sendOtpEmail = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: `${otp} is your Mumbai Editorial OTP`,
    html: otpTemplate(otp),
    text: `Your OTP is ${otp}. It expires in 10 minutes. Do not share it with anyone.`,
  });
};

module.exports = {
  sendLeadNotification,
  sendLeadConfirmation,
  sendContactNotification,
  sendWelcome,
  sendOtpEmail,
};
