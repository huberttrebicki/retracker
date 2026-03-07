import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { LoaderIcon } from "lucide-react"
import { client } from "@/lib/api"
import type { Provider, ProviderCategory } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"

interface ProviderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider?: Provider | null
  categories: ProviderCategory[]
}

export function ProviderDialog({
  open,
  onOpenChange,
  provider,
  categories,
}: ProviderDialogProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState("")
  const isEdit = !!provider

  const categoryItems = categories.map((c) => ({ label: c.name, value: c.id }))

  const form = useForm({
    defaultValues: {
      name: provider?.name ?? "",
      providerCategoryId: provider?.providerCategoryId ?? "",
      website: provider?.website ?? "",
      mail: provider?.mail ?? "",
      phone: provider?.phone ?? "",
    },
    onSubmit: async ({ value }) => {
      setError("")
      try {
        if (isEdit && provider) {
          await client.api.providers[":id"].$patch({
            param: { id: provider.id },
            json: {
              name: value.name,
              providerCategoryId: value.providerCategoryId,
              website: value.website || null,
              mail: value.mail || null,
              phone: value.phone || null,
            },
          })
        } else {
          await client.api.providers.$post({
            json: {
              name: value.name,
              providerCategoryId: value.providerCategoryId,
              website: value.website || null,
              mail: value.mail || null,
              phone: value.phone || null,
            },
          })
        }
        queryClient.invalidateQueries({ queryKey: ["user-providers"] })
        onOpenChange(false)
      } catch {
        setError("Failed to save provider")
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={provider?.id ?? "create"} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Provider" : "Add Provider"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the provider details."
              : "Add a new provider to track subscriptions."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="flex flex-col gap-4"
        >
          <form.Field
            name="name"
            validators={{
              onBlur: ({ value }) =>
                !value ? "Name is required" : undefined,
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input
                  placeholder="e.g. Netflix"
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
            name="providerCategoryId"
            validators={{
              onBlur: ({ value }) =>
                !value ? "Category is required" : undefined,
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel>Category</FieldLabel>
                <Combobox
                  items={categoryItems}
                  value={categoryItems.find((c) => c.value === field.state.value) ?? null}
                  onValueChange={(val: any) => field.handleChange(val?.value ?? "")}
                  itemToStringValue={(item: any) => item?.label ?? ""}
                >
                  <ComboboxInput placeholder="Search categories..." />
                  <ComboboxContent>
                    <ComboboxEmpty>No categories found</ComboboxEmpty>
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
            name="website"
            validators={{
              onBlur: ({ value }) =>
                value && !/^(https?:\/\/)?[\w.-]+\.\w{2,}(\/.*)?$/.test(value)
                  ? "Enter a valid website (e.g. example.com)"
                  : undefined,
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel>Website <span className="text-muted-foreground font-normal">(optional)</span></FieldLabel>
                <Input
                  type="text"
                  placeholder="example.com"
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

          <form.Field name="mail">
            {(field) => (
              <Field>
                <FieldLabel>Email <span className="text-muted-foreground font-normal">(optional)</span></FieldLabel>
                <Input
                  type="email"
                  placeholder="support@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="phone">
            {(field) => (
              <Field>
                <FieldLabel>Phone <span className="text-muted-foreground font-normal">(optional)</span></FieldLabel>
                <Input
                  type="tel"
                  placeholder="+1 234 567 890"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>

          {error && <FieldError>{error}</FieldError>}

          <DialogFooter>
            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <LoaderIcon className="animate-spin" />}
                  {isEdit ? "Save Changes" : "Create Provider"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
