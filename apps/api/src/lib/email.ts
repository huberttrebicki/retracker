import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function emailLayout({
	title,
	body,
}: {
	title: string;
	body: string;
}) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
<tr>
<td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td style="background-color:#814EF5;padding:32px 40px;text-align:center;">
  <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.15em;text-transform:uppercase;">Retracker</span>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:40px;">
  <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#18181b;">${title}</h1>
  ${body}
</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:24px 40px;border-top:1px solid #e4e4e7;text-align:center;">
  <p style="margin:0;font-size:12px;color:#a1a1aa;">
    &copy; ${new Date().getFullYear()} Retracker &middot; Subscription Tracking
  </p>
  <p style="margin:8px 0 0;font-size:11px;color:#d4d4d8;">
    You received this email because of your Retracker account.
  </p>
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>`;
}

export async function sendAccountVerificationEmail(to: string, url: string) {
	await resend.emails.send({
		from: "Retracker <noreply@retracker.app>",
		to,
		subject: "Verify your email — Retracker",
		html: emailLayout({
			title: "Verify your email",
			body: `
  <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3f3f46;">
    Thanks for signing up! Please verify your email address by clicking the button below.
  </p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <a href="${url}" style="display:inline-block;padding:14px 32px;background-color:#814EF5;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:0.02em;">
          Verify Email Address
        </a>
      </td>
    </tr>
  </table>
  <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#71717a;">
    If you didn't create an account, you can safely ignore this email.
  </p>
  <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#a1a1aa;word-break:break-all;">
    Or copy this link: <a href="${url}" style="color:#814EF5;">${url}</a>
  </p>`,
		}),
	});
}

export async function sendResetPasswordEmail(to: string, url: string) {
	await resend.emails.send({
		from: "Retracker <noreply@retracker.app>",
		to,
		subject: "Reset your password — Retracker",
		html: emailLayout({
			title: "Reset your password",
			body: `
  <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3f3f46;">
    We received a request to reset the password for your account. Click the button below to set a new password.
  </p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <a href="${url}" style="display:inline-block;padding:14px 32px;background-color:#814EF5;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:0.02em;">
          Reset Password
        </a>
      </td>
    </tr>
  </table>
  <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#71717a;">
    If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
  </p>
  <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#a1a1aa;word-break:break-all;">
    Or copy this link: <a href="${url}" style="color:#814EF5;">${url}</a>
  </p>`,
		}),
	});
}
