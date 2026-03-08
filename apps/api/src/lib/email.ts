import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAccountVerificationEmail(to: string, url: string) {
	await resend.emails.send({
		from: "Retracker <noreply@retracker.app>",
		to,
		subject: "Verify your email — Retracker",
		html: `<p>Click the link below to verify your email address:</p>
<p><a href="${url}">Verify Email</a></p>
<p>If you didn't create an account, you can ignore this email.</p>`,
	});
}

export async function sendResetPasswordEmail(to: string, url: string) {
	await resend.emails.send({
		from: "Retracker <noreply@retracker.app>",
		to,
		subject: "Reset your password — Retracker",
		html: `<p>Click the link below to reset your password:</p>
<p><a href="${url}">Reset Password</a></p>
<p>If you didn't request a password reset, you can ignore this email.</p>`,
	});
}
