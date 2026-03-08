import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api";
import type { Provider } from "@/lib/api";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogAction,
	AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface DeleteProviderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	provider: Provider | null;
}

export function DeleteProviderDialog({
	open,
	onOpenChange,
	provider,
}: DeleteProviderDialogProps) {
	const queryClient = useQueryClient();

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			await client.api.providers[":id"].$delete({ param: { id } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user-providers"] });
			onOpenChange(false);
		},
	});

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete provider</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete "{provider?.name}"? This action
						cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={() => provider && deleteMutation.mutate(provider.id)}
						disabled={deleteMutation.isPending}
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
