import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ReceiptIcon,
	ArrowRightIcon,
	CreditCardIcon,
	CoinsIcon,
	CalendarIcon,
	CircleXIcon,
} from "lucide-react";

export const Route = createFileRoute("/")({
	component: LandingPage,
});

const features = [
	{
		icon: CreditCardIcon,
		label: "track",
		title: "Subscription Tracking",
		description:
			"Monitor all your recurring payments in one place. Never lose track of what you're paying for.",
	},
	{
		icon: CoinsIcon,
		label: "convert",
		title: "Multi-Currency",
		description:
			"Adjust currency to your needs and location based on a real-time rates.",
	},
	{
		icon: CalendarIcon,
		label: "schedule",
		title: "Payment Calendar",
		description:
			"Visual calendar showing upcoming charges. Know exactly when money leaves your account.",
	},
	{
		icon: CircleXIcon,
		label: "cancel",
		title: "Cancellation Tracking",
		description:
			"Keep a record of what you've cancelled and when the access expires.",
	},
];

function LandingPage() {
	return (
		<div className="relative min-h-svh bg-black text-white overflow-hidden">
			{/* Grid background */}
			<div
				className="pointer-events-none fixed inset-0 opacity-[0.25]"
				style={{
					backgroundImage:
						"linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)",
					backgroundSize: "60px 60px",
				}}
			/>

			{/* Floating orbs */}
			<div className="pointer-events-none fixed top-1/4 -left-32 h-96 w-96 rounded-full bg-purple-600/20 blur-[128px] animate-pulse" />
			<div
				className="pointer-events-none fixed bottom-1/4 right-0 h-80 w-80 rounded-full bg-purple-500/15 blur-[100px]"
				style={{ animation: "pulse 4s ease-in-out infinite 1s" }}
			/>
			<div
				className="pointer-events-none fixed top-2/3 left-1/2 h-64 w-64 rounded-full bg-purple-700/10 blur-[80px]"
				style={{ animation: "pulse 5s ease-in-out infinite 2s" }}
			/>

			{/* Content */}
			<div className="relative z-10 flex min-h-svh flex-col">
				{/* Nav */}
				<nav
					className="flex items-center justify-between px-8 py-6 sm:px-12 lg:px-20"
					style={{ animation: "fadeSlideUp 0.6s ease-out both" }}
				>
					<div className="flex items-center gap-3">
						<div className="flex size-8 items-center justify-center bg-purple-600 text-white">
							<ReceiptIcon className="size-4" />
						</div>
						<span className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">
							Retracker
						</span>
					</div>
					<div className="flex items-center gap-4">
						<Link
							to="/login"
							className="text-xs font-bold uppercase tracking-widest text-white/40 transition-colors hover:text-white"
						>
							Sign In
						</Link>
						<Link
							to="/register"
							className="bg-purple-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
						>
							Get Started
						</Link>
					</div>
				</nav>

				{/* Hero */}
				<section className="relative flex flex-1 flex-col items-center justify-center px-8 text-center">

					<p
						className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-purple-500/70"
						style={{ animation: "fadeSlideUp 0.6s ease-out 0.1s both" }}
					>
						{`> recurring payments tracking`}
					</p>

					<h1
						className="max-w-5xl text-5xl font-bold uppercase leading-[0.9] tracking-[0.03em] sm:text-7xl lg:text-8xl xl:text-9xl"
						style={{
							animation: "fadeSlideUp 0.8s ease-out 0.2s both",
							fontFamily: "'Figtree Variable', system-ui, sans-serif",
							fontStretch: "condensed",
						}}
					>
						<span className="block text-white/30">Stop Losing</span>
						<span className="block text-white/30">Money On</span>
						<span
							className="relative inline-block text-purple-500"
							style={{ animation: "textGlow 3s ease-in-out infinite" }}
						>
							Subscriptions
							<span className="absolute -inset-x-2 bottom-1 h-[3px] bg-purple-500 sm:bottom-2" />
						</span>
					</h1>

					<p
						className="mt-8 max-w-lg font-mono text-sm leading-relaxed text-white/30"
						style={{ animation: "fadeSlideUp 0.8s ease-out 0.4s both" }}
					>
						// One dashboard to track, convert, and manage
						<br />
						// every recurring payment you have.
					</p>

					<div
						className="mt-10 flex flex-col gap-3 sm:flex-row"
						style={{ animation: "fadeSlideUp 0.8s ease-out 0.6s both" }}
					>
						<Link
							to="/register"
							className="group flex items-center justify-center gap-2 bg-purple-600 px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-purple-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]"
						>
							Get Started
							<ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
						</Link>
						<Link
							to="/login"
							className="flex items-center justify-center border border-white/10 px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white/50 transition-all hover:border-purple-500/50 hover:text-white"
						>
							Sign In
						</Link>
					</div>
				</section>

				{/* Features */}
				<section className="mt-auto border-t border-white/5">
					<div className="grid grid-cols-2 lg:grid-cols-4">
						{features.map((feature, i) => (
							<div
								key={feature.label}
								className="group relative border-r border-white/5 bg-black/40 p-8 transition-colors last:border-r-0 hover:bg-black/60 lg:p-10"
								style={{
									animation: `fadeSlideUp 0.6s ease-out ${0.3 + i * 0.12}s both`,
								}}
							>
								<div className="absolute left-0 top-0 h-0 w-[3px] bg-purple-600 transition-all duration-300 group-hover:h-full" />

								<div className="flex size-10 items-center justify-center border border-white/10 text-purple-500 transition-colors group-hover:border-purple-500/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
									<feature.icon className="size-5" />
								</div>
								<div className="mt-5 font-mono text-[10px] uppercase tracking-[0.3em] text-purple-500/60">
									{`> ${feature.label}`}
								</div>
								<h3 className="mt-2 text-base font-bold uppercase tracking-wide text-white/90">
									{feature.title}
								</h3>
								<p className="mt-3 text-sm leading-relaxed text-white/35">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</section>

				{/* Footer */}
				<footer
					className="border-t border-white/5 px-8 py-4 sm:px-12 lg:px-20"
					style={{ animation: "fadeSlideUp 0.6s ease-out 0.8s both" }}
				>
					<div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
						<span className="font-mono text-[11px] text-white/20">
							&copy; {new Date().getFullYear()} Retracker
						</span>
						<div className="flex gap-4">
							<Link
								to="/terms"
								className="font-mono text-[11px] text-white/20 transition-colors hover:text-white/50"
							>
								Terms of Service
							</Link>
							<Link
								to="/privacy"
								className="font-mono text-[11px] text-white/20 transition-colors hover:text-white/50"
							>
								Privacy Policy
							</Link>
						</div>
					</div>
				</footer>
			</div>

			<style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(168,85,247,0.1), 0 0 60px rgba(168,85,247,0); }
          50% { text-shadow: 0 0 30px rgba(168,85,247,0.4), 0 0 80px rgba(168,85,247,0.15); }
        }
      `}</style>
		</div>
	);
}
