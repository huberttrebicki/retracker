import { createFileRoute, Link } from "@tanstack/react-router";
import { ReceiptIcon } from "lucide-react";

export const Route = createFileRoute("/privacy")({
	component: PrivacyPage,
});

function PrivacyPage() {
	return (
		<div className="min-h-svh bg-black text-white">
			<nav className="flex items-center justify-between px-8 py-6 sm:px-12 lg:px-20">
				<Link to="/" className="flex items-center gap-3">
					<div className="flex size-8 items-center justify-center bg-purple-600 text-white">
						<ReceiptIcon className="size-4" />
					</div>
					<span className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">
						Retracker
					</span>
				</Link>
			</nav>

			<main className="mx-auto max-w-2xl px-8 py-12 sm:px-12">
				<h1 className="text-3xl font-bold uppercase tracking-wide">
					Privacy Policy
				</h1>
				<p className="mt-2 font-mono text-xs text-white/30">
					Last updated: March 7, 2026
				</p>

				<div className="mt-10 space-y-8 text-sm leading-relaxed text-white/50">
					<section>
						<h2 className="mb-3 text-base font-bold uppercase tracking-wide text-white/80">
							1. Information We Collect
						</h2>
						<p>
							We collect information you provide directly, including your name,
							email address, and subscription data you enter into the service.
							We also collect basic usage data such as login timestamps and
							feature usage.
						</p>
					</section>

					<section>
						<h2 className="mb-3 text-base font-bold uppercase tracking-wide text-white/80">
							2. How We Use Your Information
						</h2>
						<p>
							Your information is used solely to provide and improve the
							Retracker service. This includes managing your account, displaying
							your subscription data, performing currency conversions, and
							sending transactional emails (verification, password reset).
						</p>
					</section>

					<section>
						<h2 className="mb-3 text-base font-bold uppercase tracking-wide text-white/80">
							3. Data Storage
						</h2>
						<p>
							Your data is stored securely on our servers. Passwords are hashed
							and never stored in plain text. We implement industry-standard
							security measures to protect your information.
						</p>
					</section>

					<section>
						<h2 className="mb-3 text-base font-bold uppercase tracking-wide text-white/80">
							4. Data Sharing
						</h2>
						<p>
							We do not sell, trade, or share your personal information with
							third parties. We may use third-party services (such as email
							delivery) that process data on our behalf under strict
							confidentiality agreements.
						</p>
					</section>

					<section>
						<h2 className="mb-3 text-base font-bold uppercase tracking-wide text-white/80">
							5. Cookies
						</h2>
						<p>
							Retracker uses essential cookies for authentication and session
							management. We do not use tracking cookies or third-party
							analytics.
						</p>
					</section>

					<section>
						<h2 className="mb-3 text-base font-bold uppercase tracking-wide text-white/80">
							6. Account Deletion
						</h2>
						<p>
							You can delete your account at any time from the Settings page.
							Upon deletion, all your data including subscriptions, providers,
							and personal information will be permanently removed from our
							servers.
						</p>
					</section>

					<section>
						<h2 className="mb-3 text-base font-bold uppercase tracking-wide text-white/80">
							7. Contact
						</h2>
						<p>
							If you have any questions about this Privacy Policy, please
							contact us at privacy@retracker.app.
						</p>
					</section>
				</div>
			</main>
		</div>
	);
}
