import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calendar";
import { useCurrency } from "@/lib/currency-context";
import type { Subscription } from "@/lib/api";

export function CategoryBreakdown({
	subscriptions,
}: {
	subscriptions: Subscription[];
}) {
	const { currency, convert } = useCurrency();

	const categories = useMemo(() => {
		const active = subscriptions.filter((s) => s.status === "active");

		const entries = Object.entries(
			active.reduce<Record<string, { total: number; count: number }>>(
				(acc, sub) => {
					const cat = sub.provider.category;
					if (!acc[cat]) acc[cat] = { total: 0, count: 0 };
					acc[cat].total += convert(Number(sub.price), sub.currency);
					acc[cat].count += 1;
					return acc;
				},
				{},
			),
		).sort((a, b) => b[1].total - a[1].total);

		return entries;
	}, [subscriptions, convert]);

	const maxTotal = categories[0]?.[1].total ?? 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Spending by Category</CardTitle>
			</CardHeader>
			<CardContent>
				{categories.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No active subscriptions
					</p>
				) : (
					<div className="flex flex-col gap-3">
						{categories.map(([name, { total, count }]) => (
							<div key={name} className="flex flex-col gap-1.5">
								<div className="flex items-center justify-between text-sm">
									<span className="font-medium">{name}</span>
									<span className="text-muted-foreground">
										{formatCurrency(total, currency)}/mo
										<span className="ml-1.5 text-xs">
											({count} sub{count !== 1 ? "s" : ""})
										</span>
									</span>
								</div>
								<div className="h-2 rounded-full bg-muted">
									<div
										className="h-full rounded-full bg-primary transition-all"
										style={{ width: `${(total / maxTotal) * 100}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
