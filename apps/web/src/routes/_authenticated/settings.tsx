import { useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import { LoaderIcon } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const [profileSuccess, setProfileSuccess] = useState("")
  const [profileError, setProfileError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const profileForm = useForm({
    defaultValues: {
      name: session?.user?.name ?? "",
    },
    onSubmit: async ({ value }) => {
      setProfileError("")
      setProfileSuccess("")
      const { error } = await authClient.updateUser({
        name: value.name,
      })
      if (error) {
        setProfileError(error.message ?? "Failed to update profile")
        return
      }
      setProfileSuccess("Profile updated")
    },
  })

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      setPasswordError("")
      setPasswordSuccess("")
      if (value.newPassword !== value.confirmPassword) {
        setPasswordError("Passwords do not match")
        return
      }
      const { error } = await authClient.changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
      })
      if (error) {
        setPasswordError(error.message ?? "Failed to change password")
        return
      }
      setPasswordSuccess("Password changed")
      passwordForm.reset()
    },
  })

  async function handleDeleteAccount() {
    setDeleting(true)
    await authClient.deleteUser()
    navigate({ to: "/login" })
  }

  return (
    <div className="flex h-svh flex-col">
      <header className="flex h-12 shrink-0 items-center border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <span className="ml-2 text-sm font-medium">Settings</span>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  profileForm.handleSubmit()
                }}
                className="flex flex-col gap-4"
              >
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    value={session?.user?.email ?? ""}
                    disabled
                  />
                </Field>

                <profileForm.Field
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
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>{field.state.meta.errors[0]}</FieldError>
                      )}
                    </Field>
                  )}
                </profileForm.Field>

                {profileError && <FieldError>{profileError}</FieldError>}
                {profileSuccess && (
                  <p className="text-sm text-green-600">{profileSuccess}</p>
                )}

                <profileForm.Subscribe selector={(s) => s.isSubmitting}>
                  {(isSubmitting) => (
                    <Button type="submit" disabled={isSubmitting} className="w-fit">
                      {isSubmitting && <LoaderIcon className="animate-spin" />}
                      Save
                    </Button>
                  )}
                </profileForm.Subscribe>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  passwordForm.handleSubmit()
                }}
                className="flex flex-col gap-4"
              >
                <passwordForm.Field
                  name="currentPassword"
                  validators={{
                    onBlur: ({ value }) =>
                      !value ? "Current password is required" : undefined,
                  }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel>Current Password</FieldLabel>
                      <Input
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>{field.state.meta.errors[0]}</FieldError>
                      )}
                    </Field>
                  )}
                </passwordForm.Field>

                <passwordForm.Field
                  name="newPassword"
                  validators={{
                    onBlur: ({ value }) =>
                      value && value.length < 8
                        ? "Password must be at least 8 characters"
                        : undefined,
                  }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel>New Password</FieldLabel>
                      <Input
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>{field.state.meta.errors[0]}</FieldError>
                      )}
                    </Field>
                  )}
                </passwordForm.Field>

                <passwordForm.Field
                  name="confirmPassword"
                  validators={{
                    onBlur: ({ value, fieldApi }) => {
                      const newPw = fieldApi.form.getFieldValue("newPassword")
                      if (value && newPw && value !== newPw)
                        return "Passwords do not match"
                      return undefined
                    },
                  }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel>Confirm New Password</FieldLabel>
                      <Input
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>{field.state.meta.errors[0]}</FieldError>
                      )}
                    </Field>
                  )}
                </passwordForm.Field>

                {passwordError && <FieldError>{passwordError}</FieldError>}
                {passwordSuccess && (
                  <p className="text-sm text-green-600">{passwordSuccess}</p>
                )}

                <passwordForm.Subscribe selector={(s) => s.isSubmitting}>
                  {(isSubmitting) => (
                    <Button type="submit" disabled={isSubmitting} className="w-fit">
                      {isSubmitting && <LoaderIcon className="animate-spin" />}
                      Change Password
                    </Button>
                  )}
                </passwordForm.Subscribe>
              </form>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>
              This action is irreversible. All your data including subscriptions and providers will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting && <LoaderIcon className="animate-spin" />}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
