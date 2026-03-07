import { useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import { ReceiptIcon, LoaderIcon } from "lucide-react"
import { authClient } from "@/lib/auth-client"
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

export const Route = createFileRoute("/register")({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState("")

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      setError("")

      if (value.password !== value.confirmPassword) {
        setError("Passwords do not match")
        return
      }

      const { error } = await authClient.signUp.email({
        name: value.name,
        email: value.email,
        password: value.password,
      })

      if (error) {
        setError(error.message ?? "Failed to create account")
        return
      }

      navigate({ to: "/dashboard" })
    },
  })

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ReceiptIcon className="size-5" />
          </div>
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>Get started with Retracker</CardDescription>
        </CardHeader>
        <CardContent>
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
                    type="text"
                    placeholder="John Doe"
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
              name="email"
              validators={{
                onBlur: ({ value }) =>
                  !value ? "Email is required" : undefined,
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    placeholder="john@example.com"
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
              name="password"
              validators={{
                onBlur: ({ value }) =>
                  !value
                    ? "Password is required"
                    : value.length < 8
                      ? "Password must be at least 8 characters"
                      : undefined,
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel>Password</FieldLabel>
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
            </form.Field>

            <form.Field
              name="confirmPassword"
              validators={{
                onBlur: ({ value, fieldApi }) => {
                  const password = fieldApi.form.getFieldValue("password")
                  if (!value) return "Please confirm your password"
                  if (value !== password) return "Passwords do not match"
                  return undefined
                },
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel>Confirm Password</FieldLabel>
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
            </form.Field>

            {error && <FieldError>{error}</FieldError>}

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting && <LoaderIcon className="animate-spin" />}
                  Create account
                </Button>
              )}
            </form.Subscribe>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
