import { createFileRoute, Link } from "@tanstack/react-router";
import { ReceiptIcon } from "lucide-react";

export const Route = createFileRoute("/terms")({
	component: TermsPage,
});

function TermsPage() {
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
					Terms of Service
				</h1>
				<p className="mt-2 font-mono text-xs text-white/30">
					Last updated: March 7, 2026
				</p>

				<div className="mt-10 space-y-8 text-sm leading-relaxed text-white/50">
					<section>
						<h2 className="mb-3 text-base font-bold uppercase tracking-wide text-white/80">
							1. Acceptance of Terms
						</h2>
						<p>
							By accessing or using Retracker, you agree to be bound by these
							Terms of Service. If you do not agree to these terms, you may not
							use the service.
						</p>
					</section>

					<section>
						<h2 className="mb-3 text-base font-bold uppercase tracking-wide text-white/80">
							2. Description of Service
						</h2>
						<p>
							Retracker is a subscription management tool that allows users to
							track, manage, and monitor their recurring payments and
							subscriptions. The service is provided "as is" and may be updated
							or modified at any time.
						</p>
					</section>

					<section>
						<h2 className="mb-3 text-base font-bold uppercase tracking-wide text-white/80">
							3. User Accounts
						</h2>
						<p>
							You are responsible for maintaining the confidentiality of your
							account credentials. You agree to provide accurate information
							during registration and to keep your account information up to
							date.
						</p>
					</section>

					<section>
						<h2 className="mb-3 text-base font-bold uppercase tracking-wide text-white/80">
							4. User Data
						</h2>
						<p>
							You retain ownership of all data you submit to Retracker. We will
							not sell, share, or distribute your personal data to third parties
							except as required by law or as described in our Privacy Policy.
						</p>
					</section>

					<section>
						<h2 className="mb-3 text-base font-bold uppercase tracking-wide text-white/80">
							5. Limitation of Liability
						</h2>
						<p>
							Retracker is not liable for any indirect, incidental, or
							consequential damages arising from your use of the service. The
							service is provided without warranties of any kind.
						</p>
					</section>

					<section>
						<h2 className="mb-3 text-base font-bold uppercase tracking-wide text-white/80">
							6. Changes to Terms
						</h2>
						<p>
							We reserve the right to modify these terms at any time. Continued
							use of the service after changes constitutes acceptance of the
							updated terms.
						</p>
					</section>
				</div>
			</main>
		</div>
	);
}
