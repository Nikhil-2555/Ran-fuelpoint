import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD,
    },
});

// Verify SMTP connection on startup
transporter.verify()
    .then(() => console.log('✅ Gmail SMTP connected'))
    .catch((err) => console.error('⚠️  Gmail SMTP verification failed:', err.message));

/**
 * Send a password-reset email with a professional HTML template.
 * @param {string} to      – Admin's email address
 * @param {string} resetUrl – Full URL with the raw token as a query parameter
 */
export async function sendResetEmail(to, resetUrl) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your Admin Dashboard Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f9fc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f9fc;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#062A4D 0%,#0B4C8C 55%,#145A9E 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em;">
                ⛽ FuelPoint Admin
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#0B2A3F;font-size:20px;font-weight:700;">
                Reset your password
              </h2>
              <p style="margin:0 0 12px;color:#5C6B7A;font-size:15px;line-height:1.6;">
                Hello Admin,
              </p>
              <p style="margin:0 0 24px;color:#5C6B7A;font-size:15px;line-height:1.6;">
                We received a request to reset your Admin Dashboard password. Click the button below to create a new password.
              </p>
              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="border-radius:8px;background:#0B4C8C;">
                    <a href="${resetUrl}" target="_blank"
                       style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#5C6B7A;font-size:13px;line-height:1.6;">
                This link expires in <strong>30 minutes</strong>.
              </p>
              <p style="margin:0;color:#5C6B7A;font-size:13px;line-height:1.6;">
                If you did not request this password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #E2E8F0;text-align:center;">
              <p style="margin:0;color:#9FB3C4;font-size:12px;">
                © ${new Date().getFullYear()} FuelPoint Admin Console
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
        from: `"FuelPoint Admin" <${env.GMAIL_USER}>`,
        to,
        subject: 'Reset your Admin Dashboard Password',
        html,
    });
}
