import { GlobeIcon } from "lucide-react";
import type { Subscription } from "@/lib/api";
import { formatCurrency } from "@/lib/calendar";
import { useCurrency } from "@/lib/currency-context";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CATEGORY_METADATA_FIELDS } from "@/lib/metadata-fields";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	weekday: "long",
	month: "long",
	day: "numeric",
	year: "numeric",
});

export function DayDetailDialog({
	open,
	onOpenChange,
	date,
	subscriptions,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	date: Date | null;
	subscriptions: Subscription[];
}) {
	const { currency, convert } = useCurrency();
	const total = subscriptions.reduce(
		(sum, s) => sum + convert(Number(s.price), s.currency),
		0,
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{date ? dateFormatter.format(date) : ""}</DialogTitle>
					<DialogDescription>
						{subscriptions.length} subscription
						{subscriptions.length !== 1 ? "s" : ""} &middot;{" "}
						{formatCurrency(total, currency)} total
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col">
					{subscriptions.map((sub, i) => (
						<div key={sub.id}>
							{i > 0 && <Separator />}
							<div className="flex items-center gap-3 py-3">
								{sub.provider.logo ? (
									<img
										src={sub.provider.logo}
										alt={sub.provider.name}
										className="size-10 rounded object-contain"
									/>
								) : (
									<div className="flex size-10 items-center justify-center rounded bg-purple-100 text-sm font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-400">
										{sub.provider.name[0].toUpperCase()}
									</div>
								)}
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">{sub.name}</p>
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<span>{sub.provider.name}</span>
										{sub.provider.website && (
											<a
												href={
													sub.provider.website.includes("://")
														? sub.provider.website
														: `https://${sub.provider.website}`
												}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-0.5 hover:underline"
												onClick={(e) => e.stopPropagation()}
											>
												<GlobeIcon className="size-3" />
												{sub.provider.website}
											</a>
										)}
									</div>
									{sub.metadata &&
										(() => {
											const fields = (
												CATEGORY_METADATA_FIELDS[
													sub.provider.category as string
												] ?? []
											).filter(
												(def) =>
													(sub.metadata as Record<string, string>)?.[
														def.key
													],
											);
											if (fields.length === 0) return null;
											return (
												<div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
													{fields.map((def) => (
														<span key={def.key}>
															{def.label}:{" "}
															<span className="text-foreground">
																{
																	(
																		sub.metadata as Record<
																			string,
																			string
																		>
																	)[def.key]
																}
															</span>
														</span>
													))}
												</div>
											);
										})()}
								</div>
								<span className="text-sm font-medium shrink-0">
									{formatCurrency(
										convert(Number(sub.price), sub.currency),
										currency,
									)}
								</span>
							</div>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
