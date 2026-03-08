import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarGrid } from "@/components/dashboard/calendar-grid";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { UpcomingPayments } from "@/components/dashboard/upcoming-payments";
import { TodayTomorrowPayments } from "@/components/dashboard/today-tomorrow-payments";
import { CancelledSubscriptions } from "@/components/dashboard/cancelled-subscriptions";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";

const subscriptionsQuery = queryOptions({
	queryKey: ["subscriptions"],
	queryFn: async () => {
		const res = await client.api.subscriptions.$get();
		const data = await res.json();
		return data;
	},
});

export const Route = createFileRoute("/_authenticated/dashboard")({
	loader: ({ context: { queryClient } }) => {
		return queryClient.ensureQueryData(subscriptionsQuery);
	},
	component: DashboardPage,
});

function DashboardPage() {
	const { data } = useSuspenseQuery(subscriptionsQuery);
	const navigate = useNavigate();
	return (
		<div className="flex h-svh flex-col">
			<header className="flex h-12 shrink-0 items-center border-b px-4">
				<SidebarTrigger className="-ml-1" />
				<h1 className="ml-2 text-sm font-medium">Dashboard</h1>
				<Button
					size="sm"
					className="ml-auto"
					onClick={() =>
						navigate({ to: "/subscriptions", search: { create: true } })
					}
				>
					<PlusIcon data-icon="inline-start" />
					<span className="hidden sm:inline">Add Subscription</span>
				</Button>
			</header>

			<div className="flex-1 overflow-y-auto p-4 sm:p-6">
				<div className="flex flex-col gap-4 sm:gap-6">
					<StatsCards subscriptions={data} />
					<TodayTomorrowPayments subscriptions={data} />
					<CalendarGrid subscriptions={data} />
					<div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
						<CategoryBreakdown subscriptions={data} />
						<UpcomingPayments subscriptions={data} />
						<CancelledSubscriptions subscriptions={data} />
					</div>
				</div>
			</div>
		</div>
	);
}
