import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/api"
import type { Subscription } from "@/lib/api"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

interface DeleteSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: Subscription | null
}

export function DeleteSubscriptionDialog({
  open,
  onOpenChange,
  subscription,
}: DeleteSubscriptionDialogProps) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await client.api.subscriptions[":id"].$delete({ param: { id } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
      onOpenChange(false)
    },
  })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete subscription</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{subscription?.name}"? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() =>
              subscription && deleteMutation.mutate(subscription.id)
            }
            disabled={deleteMutation.isPending}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
