import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, isPaymentOnDate } from "@/lib/calendar";
import { useCurrency } from "@/lib/currency-context";
import type { Subscription } from "@/lib/api";

function PaymentList({
	label,
	payments,
	currency,
	convert,
}: {
	label: string;
	payments: Subscription[];
	currency: string;
	convert: (amount: number, from: string) => number;
}) {
	const total = payments.reduce(
		(sum, s) => sum + convert(Number(s.price), s.currency),
		0,
	);

	return (
		<div className="flex-1 min-w-0">
			<div className="mb-3 flex items-baseline justify-between">
				<p className="text-sm font-semibold text-purple-700 dark:text-purple-400">
					{label}
				</p>
				{payments.length > 0 && (
					<span className="text-xs font-medium text-purple-600/70 dark:text-purple-400/70">
						{formatCurrency(total, currency)}
					</span>
				)}
			</div>
			{payments.length === 0 ? (
				<p className="text-xs text-muted-foreground/60">No payments</p>
			) : (
				<div className="flex flex-col gap-2">
					{payments.map((sub) => (
						<div key={sub.id} className="flex items-center gap-2.5">
							{sub.provider.logo ? (
								<img
									src={sub.provider.logo}
									alt={sub.provider.name}
									className="size-7 shrink-0 rounded object-contain"
								/>
							) : (
								<div className="flex size-7 shrink-0 items-center justify-center rounded bg-purple-100 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-400">
									{sub.provider.name[0].toUpperCase()}
								</div>
							)}
							<span className="truncate text-sm font-medium">{sub.name}</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export function TodayTomorrowPayments({
	subscriptions,
}: {
	subscriptions: Subscription[];
}) {
	const { currency, convert } = useCurrency();

	const { todayPayments, tomorrowPayments } = useMemo(() => {
		const active = subscriptions.filter((s) => s.status === "active");
		const today = new Date();
		const tomorrow = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate() + 1,
		);
		return {
			todayPayments: active.filter((s) => isPaymentOnDate(s, today)),
			tomorrowPayments: active.filter((s) => isPaymentOnDate(s, tomorrow)),
		};
	}, [subscriptions]);

	return (
		<Card className="border-t-2 border-t-purple-400 dark:border-t-purple-600">
			<CardContent className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-5">
				<PaymentList
					label="Today"
					payments={todayPayments}
					currency={currency}
					convert={convert}
				/>
				<div className="border-t sm:hidden" />
				<div className="hidden sm:block w-px bg-border" />
				<PaymentList
					label="Tomorrow"
					payments={tomorrowPayments}
					currency={currency}
					convert={convert}
				/>
			</CardContent>
		</Card>
	);
}
