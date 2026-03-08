import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
	PlusIcon,
	PencilIcon,
	TrashIcon,
	GlobeIcon,
	MailIcon,
	PhoneIcon,
} from "lucide-react";
import { client } from "@/lib/api";
import type { Provider } from "@/lib/api";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProviderDialog } from "@/components/providers/provider-dialog";
import { DeleteProviderDialog } from "@/components/providers/delete-provider-dialog";

const userProvidersQuery = queryOptions({
	queryKey: ["user-providers"],
	queryFn: async () => {
		const res = await client.api.providers["user-providers"].$get();
		return await res.json();
	},
});

const categoriesQuery = queryOptions({
	queryKey: ["provider-categories"],
	queryFn: async () => {
		const res = await client.api.providers.categories.$get();
		return await res.json();
	},
});

export const Route = createFileRoute("/_authenticated/providers")({
	loader: ({ context: { queryClient } }) => {
		return Promise.all([
			queryClient.ensureQueryData(userProvidersQuery),
			queryClient.ensureQueryData(categoriesQuery),
		]);
	},
	component: ProvidersPage,
});

function ProvidersPage() {
	const { data: providers } = useSuspenseQuery(userProvidersQuery);
	const { data: categories } = useSuspenseQuery(categoriesQuery);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
	const [deletingProvider, setDeletingProvider] = useState<Provider | null>(
		null,
	);

	function handleCreate() {
		setEditingProvider(null);
		setDialogOpen(true);
	}

	function handleEdit(provider: Provider) {
		setEditingProvider(provider);
		setDialogOpen(true);
	}

	return (
		<div className="flex h-svh flex-col">
			<header className="flex h-12 shrink-0 items-center border-b px-4">
				<SidebarTrigger className="-ml-1" />
			</header>

			<div className="flex-1 overflow-y-auto p-6">
				<div className="mx-auto w-full max-w-7xl">
					<div className="mb-6 flex items-center justify-between">
						<h1 className="text-sm font-medium">Providers</h1>
						<Button size="sm" onClick={handleCreate}>
							<PlusIcon />
							Add Provider
						</Button>
					</div>
					{providers.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<p className="text-sm text-muted-foreground">
								No providers yet. Create your first one.
							</p>
						</div>
					) : (
						<div className="flex flex-col gap-2">
							{providers.map((provider) => (
								<Card key={provider.id}>
									<CardContent className="flex items-center justify-between p-4">
										<div className="flex items-center gap-3">
											<div className="flex size-8 items-center justify-center rounded bg-purple-100 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-400">
												{provider.name.charAt(0).toUpperCase()}
											</div>
											<div className="flex flex-col gap-1">
												<div className="flex items-center gap-2">
													<span className="text-sm font-medium">
														{provider.name}
													</span>
													<Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400">
														{provider.category}
													</Badge>
												</div>
												<div className="flex items-center gap-3 text-xs text-muted-foreground">
													{provider.website && (
														<a
															href={
																provider.website.includes("://")
																	? provider.website
																	: `https://${provider.website}`
															}
															target="_blank"
															rel="noopener noreferrer"
															className="flex items-center gap-1 hover:underline"
														>
															<GlobeIcon className="size-3" />
															{provider.website}
														</a>
													)}
													{provider.mail && (
														<span className="flex items-center gap-1">
															<MailIcon className="size-3" />
															{provider.mail}
														</span>
													)}
													{provider.phone && (
														<span className="flex items-center gap-1">
															<PhoneIcon className="size-3" />
															{provider.phone}
														</span>
													)}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={() => handleEdit(provider)}
											>
												<PencilIcon />
											</Button>
											<Button
												variant="ghost"
												size="icon-sm"
												className="hover:bg-destructive/10 hover:text-destructive"
												onClick={() => setDeletingProvider(provider)}
											>
												<TrashIcon />
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			</div>

			<ProviderDialog
				key={editingProvider?.id ?? "create"}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				provider={editingProvider}
				categories={categories}
			/>

			<DeleteProviderDialog
				open={!!deletingProvider}
				onOpenChange={(open) => {
					if (!open) setDeletingProvider(null);
				}}
				provider={deletingProvider}
			/>
		</div>
	);
}
