import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Subscription } from "@/lib/api";
import { formatTimeLeft } from "@/lib/format-time-left";

export function CancelledSubscriptions({
	subscriptions,
}: {
	subscriptions: Subscription[];
}) {
	const cancelled = useMemo(() => {
		return subscriptions
			.filter((s) => s.status === "cancelled" && s.endsAt)
			.sort(
				(a, b) => new Date(a.endsAt!).getTime() - new Date(b.endsAt!).getTime(),
			);
	}, [subscriptions]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Cancelled Subscriptions</CardTitle>
			</CardHeader>
			<CardContent>
				{cancelled.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No cancelled subscriptions
					</p>
				) : (
					<div className="flex flex-col gap-3">
						{cancelled.map((sub) => {
							const timeLeft = formatTimeLeft(sub.endsAt!);
							const isExpired = timeLeft === "Expired";
							return (
								<div key={sub.id} className="flex items-center gap-3">
									{sub.provider.logo ? (
										<img
											src={sub.provider.logo}
											alt={sub.provider.name}
											className="size-8 rounded object-contain"
										/>
									) : (
										<div className="flex size-8 items-center justify-center rounded bg-purple-100 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-400">
											{sub.provider.name[0].toUpperCase()}
										</div>
									)}
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium truncate">{sub.name}</p>
										<p className="text-xs text-muted-foreground">
											Ends{" "}
											{new Date(sub.endsAt!).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</p>
									</div>
									<Badge variant={isExpired ? "outline" : "secondary"}>
										{timeLeft}
									</Badge>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
