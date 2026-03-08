import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { client } from "@/lib/api";
import type { Subscription, AllProviders, Currency } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Combobox,
	ComboboxInput,
	ComboboxContent,
	ComboboxList,
	ComboboxItem,
	ComboboxEmpty,
} from "@/components/ui/combobox";
import { CATEGORY_METADATA_FIELDS } from "@/lib/metadata-fields";

interface SubscriptionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	subscription?: Subscription | null;
	providers: AllProviders[];
	currencies: Currency[];
}

export function SubscriptionDialog({
	open,
	onOpenChange,
	subscription,
	providers,
	currencies,
}: SubscriptionDialogProps) {
	const queryClient = useQueryClient();
	const [error, setError] = useState("");
	const isEdit = !!subscription;

	const providerItems = providers.map((p) => ({
		label: p.name,
		value: p.id,
		logo: p.logo,
	}));
	const currencyItems = currencies.map((c) => ({
		label: `${c.code} - ${c.name}`,
		value: c.id,
	}));

	const form = useForm({
		defaultValues: {
			name: subscription?.name ?? "",
			providerId: (subscription as any)?.provider?.id ?? "",
			currencyId: subscription
				? (currencies.find((c) => c.code === subscription.currency)?.id ?? "")
				: "",
			description: subscription?.description ?? "",
			startedAt: subscription?.startedAt
				? new Date(subscription.startedAt).toISOString().split("T")[0]
				: "",
			intervalCount: subscription?.intervalCount ?? 1,
			interval: subscription?.interval ?? "month",
			price: subscription?.price ? Number(subscription.price) : 0,
			metadata: (subscription?.metadata ?? {}) as Record<string, string>,
		},
		onSubmit: async ({ value }) => {
			setError("");
			try {
				const payload = {
					name: value.name,
					providerId: value.providerId,
					currencyId: value.currencyId,
					description: value.description || null,
					startedAt: new Date(value.startedAt),
					intervalCount: value.intervalCount,
					interval: value.interval as "day" | "week" | "month" | "year",
					price: value.price,
					metadata: value.metadata,
				};

				if (isEdit && subscription) {
					await client.api.subscriptions[":id"].$patch({
						param: { id: subscription.id },
						json: payload,
					});
				} else {
					await client.api.subscriptions.$post({
						json: payload,
					});
				}
				queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
				onOpenChange(false);
			} catch {
				setError("Failed to save subscription");
			}
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Edit Subscription" : "Add Subscription"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the subscription details."
							: "Create a new subscription to track."}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="flex flex-col gap-4"
				>
					<form.Field
						name="name"
						validators={{
							onBlur: ({ value }) => (!value ? "Name is required" : undefined),
						}}
					>
						{(field) => (
							<Field>
								<FieldLabel>Name</FieldLabel>
								<Input
									placeholder="e.g. Netflix Premium"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors.length > 0 && (
									<FieldError>{field.state.meta.errors[0]}</FieldError>
								)}
							</Field>
						)}
					</form.Field>

					<form.Field
						name="providerId"
						validators={{
							onBlur: ({ value }) =>
								!value ? "Provider is required" : undefined,
						}}
					>
						{(field) => {
							const selectedProvider = providerItems.find(
								(p) => p.value === field.state.value,
							);
							return (
								<Field>
									<FieldLabel>Provider</FieldLabel>
									<Combobox
										items={providerItems}
										value={selectedProvider ?? null}
										onValueChange={(val: any) =>
											field.handleChange(val?.value ?? "")
										}
										itemToStringValue={(item: any) => item?.label ?? ""}
									>
										<div className="flex w-full items-center gap-2">
											{selectedProvider &&
												(selectedProvider.logo ? (
													<img
														src={selectedProvider.logo}
														alt={selectedProvider.label}
														className="size-8 shrink-0 rounded object-contain"
													/>
												) : (
													<div className="flex size-8 shrink-0 items-center justify-center rounded bg-purple-100 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-400">
														{selectedProvider.label.charAt(0).toUpperCase()}
													</div>
												))}
											<ComboboxInput
												className="flex-1"
												placeholder="Search providers..."
											/>
										</div>
										<ComboboxContent>
											<ComboboxEmpty>No providers found</ComboboxEmpty>
											<ComboboxList>
												{(item: any) => (
													<ComboboxItem key={item.value} value={item}>
														<div className="flex items-center gap-2">
															{item.logo ? (
																<img
																	src={item.logo}
																	alt={item.label}
																	className="size-6 rounded object-contain"
																/>
															) : (
																<div className="flex size-6 items-center justify-center rounded bg-purple-100 text-[10px] font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-400">
																	{item.label.charAt(0).toUpperCase()}
																</div>
															)}
															{item.label}
														</div>
													</ComboboxItem>
												)}
											</ComboboxList>
										</ComboboxContent>
									</Combobox>
									{field.state.meta.errors.length > 0 && (
										<FieldError>{field.state.meta.errors[0]}</FieldError>
									)}
								</Field>
							);
						}}
					</form.Field>

					<div className="grid grid-cols-2 gap-4">
						<form.Field
							name="currencyId"
							validators={{
								onBlur: ({ value }) =>
									!value ? "Currency is required" : undefined,
							}}
						>
							{(field) => (
								<Field>
									<FieldLabel>Currency</FieldLabel>
									<Combobox
										items={currencyItems}
										value={
											currencyItems.find(
												(c) => c.value === field.state.value,
											) ?? null
										}
										onValueChange={(val: any) =>
											field.handleChange(val?.value ?? "")
										}
										itemToStringValue={(item: any) => item?.label ?? ""}
									>
										<ComboboxInput placeholder="Search..." />
										<ComboboxContent>
											<ComboboxEmpty>No currencies found</ComboboxEmpty>
											<ComboboxList>
												{(item: any) => (
													<ComboboxItem key={item.value} value={item}>
														{item.label}
													</ComboboxItem>
												)}
											</ComboboxList>
										</ComboboxContent>
									</Combobox>
									{field.state.meta.errors.length > 0 && (
										<FieldError>{field.state.meta.errors[0]}</FieldError>
									)}
								</Field>
							)}
						</form.Field>

						<form.Field
							name="price"
							validators={{
								onBlur: ({ value }) =>
									!value || value <= 0 ? "Price must be positive" : undefined,
							}}
						>
							{(field) => (
								<Field>
									<FieldLabel>Price</FieldLabel>
									<Input
										type="number"
										step="0.01"
										min="0"
										placeholder="9.99"
										value={field.state.value || ""}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(parseFloat(e.target.value) || 0)
										}
									/>
									{field.state.meta.errors.length > 0 && (
										<FieldError>{field.state.meta.errors[0]}</FieldError>
									)}
								</Field>
							)}
						</form.Field>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<form.Field
							name="intervalCount"
							validators={{
								onBlur: ({ value }) =>
									!value || value < 1 ? "Must be at least 1" : undefined,
							}}
						>
							{(field) => (
								<Field>
									<FieldLabel>Every</FieldLabel>
									<Input
										type="number"
										min="1"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(parseInt(e.target.value) || 1)
										}
									/>
									{field.state.meta.errors.length > 0 && (
										<FieldError>{field.state.meta.errors[0]}</FieldError>
									)}
								</Field>
							)}
						</form.Field>

						<form.Field name="interval">
							{(field) => (
								<Field>
									<FieldLabel>Interval</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(val) => field.handleChange(val as string)}
									>
										<SelectTrigger className="w-full">
											<SelectValue>
												{field.state.value.charAt(0).toUpperCase() +
													field.state.value.slice(1)}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="day">Day</SelectItem>
											<SelectItem value="week">Week</SelectItem>
											<SelectItem value="month">Month</SelectItem>
											<SelectItem value="year">Year</SelectItem>
										</SelectContent>
									</Select>
								</Field>
							)}
						</form.Field>
					</div>

					<form.Field
						name="startedAt"
						validators={{
							onBlur: ({ value }) =>
								!value ? "Start date is required" : undefined,
						}}
					>
						{(field) => (
							<Field>
								<FieldLabel>Start Date</FieldLabel>
								<Input
									type="date"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors.length > 0 && (
									<FieldError>{field.state.meta.errors[0]}</FieldError>
								)}
							</Field>
						)}
					</form.Field>

					<form.Field name="description">
						{(field) => (
							<Field>
								<FieldLabel>
									Description{" "}
									<span className="font-normal text-muted-foreground">
										(optional)
									</span>
								</FieldLabel>
								<Textarea
									placeholder="Notes about this subscription..."
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									rows={2}
								/>
							</Field>
						)}
					</form.Field>

					<form.Subscribe selector={(s) => s.values.providerId}>
						{(providerId) => {
							const provider = providers.find(
								(p) => p.id === providerId,
							);
							const fields = provider?.category
								? (CATEGORY_METADATA_FIELDS[provider.category] ?? [])
								: [];
							if (fields.length === 0) return null;
							return (
								<form.Field name="metadata">
									{(field) => (
										<div className="flex flex-col gap-4">
											{fields.map((def) => (
												<Field key={def.key}>
													<FieldLabel>
														{def.label}{" "}
														<span className="font-normal text-muted-foreground">
															(optional)
														</span>
													</FieldLabel>
													<Input
														value={
															(
																field.state.value as Record<
																	string,
																	string
																>
															)?.[def.key] ?? ""
														}
														onChange={(e) =>
															field.handleChange({
																...(field.state
																	.value as Record<
																	string,
																	string
																>),
																[def.key]: e.target.value,
															})
														}
													/>
												</Field>
											))}
										</div>
									)}
								</form.Field>
							);
						}}
					</form.Subscribe>

					{error && <FieldError>{error}</FieldError>}

					<DialogFooter>
						<form.Subscribe selector={(s) => s.isSubmitting}>
							{(isSubmitting) => (
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting && <LoaderIcon className="animate-spin" />}
									{isEdit ? "Save Changes" : "Create Subscription"}
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
