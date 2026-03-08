import { useState } from "react";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { MailIcon, XIcon, LoaderIcon } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { CurrencyProvider } from "@/lib/currency-context";
import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/api";
import { Button } from "@/components/ui/button";

const currenciesQuery = queryOptions({
	queryKey: ["currencies"],
	queryFn: async () => {
		const res = await client.api.currencies.$get();
		return await res.json();
	},
});

const defaultRatesQuery = queryOptions({
	queryKey: ["exchange-rates", localStorage.getItem("currency") ?? "USD"],
	queryFn: async () => {
		const base = localStorage.getItem("currency") ?? "USD";
		const res = await client.api.currencies.rates.$get({ query: { base } });
		return (await res.json()) as Record<string, number>;
	},
	staleTime: 3 * 60 * 60 * 1000,
});

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async () => {
		const { data: session } = await authClient.getSession();
		if (!session) {
			throw redirect({ to: "/login" });
		}
	},
	loader: ({ context: { queryClient } }) => {
		return Promise.all([
			queryClient.ensureQueryData(currenciesQuery),
			queryClient.ensureQueryData(defaultRatesQuery),
		]);
	},
	component: AuthenticatedLayout,
});

function VerificationBanner() {
	const { data: session } = authClient.useSession();
	const [dismissed, setDismissed] = useState(false);
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);

	if (dismissed || !session || session.user.emailVerified) return null;

	async function handleResend() {
		setSending(true);
		await authClient.sendVerificationEmail({
			email: session!.user.email,
			callbackURL: `${import.meta.env.VITE_APP_URL}/dashboard`,
		});
		setSending(false);
		setSent(true);
	}

	return (
		<div className="flex items-center gap-3 border-b bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
			<MailIcon className="size-4 shrink-0" />
			<span className="flex-1">
				Please verify your email address to create providers and subscriptions.
				{sent
					? " Verification email sent!"
					: " Check your inbox or resend the verification email."}
			</span>
			{!sent && (
				<Button
					variant="outline"
					size="sm"
					className="h-7 border-amber-300 bg-transparent text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900"
					onClick={handleResend}
					disabled={sending}
				>
					{sending && <LoaderIcon className="animate-spin" />}
					Resend
				</Button>
			)}
			<button
				type="button"
				onClick={() => setDismissed(true)}
				className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200"
			>
				<XIcon className="size-4" />
			</button>
		</div>
	);
}

function AuthenticatedLayout() {
	return (
		<CurrencyProvider>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<VerificationBanner />
					<Outlet />
				</SidebarInset>
			</SidebarProvider>
		</CurrencyProvider>
	);
}
