import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import { ReceiptIcon, LoaderIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

export const Route = createFileRoute("/reset-password")({
	validateSearch: z.object({
		token: z.string().optional(),
	}),
	component: ResetPasswordPage,
});

function ResetPasswordPage() {
	const navigate = useNavigate();
	const { token } = Route.useSearch();
	const [error, setError] = useState("");

	const form = useForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			setError("");
			if (value.password !== value.confirmPassword) {
				setError("Passwords do not match");
				return;
			}
			const { error } = await authClient.resetPassword({
				newPassword: value.password,
				token: token ?? "",
			});
			if (error) {
				setError(error.message ?? "Failed to reset password");
				return;
			}
			navigate({ to: "/login" });
		},
	});

	if (!token) {
		return (
			<div className="flex min-h-svh items-center justify-center p-4">
				<Card className="w-full max-w-sm">
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Invalid link</CardTitle>
						<CardDescription>
							This password reset link is invalid or has expired.
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<Link
							to="/forgot-password"
							className="text-sm text-primary hover:underline"
						>
							Request a new reset link
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-svh items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader className="text-center">
					<div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<ReceiptIcon className="size-5" />
					</div>
					<CardTitle className="text-xl">Reset password</CardTitle>
					<CardDescription>Enter your new password</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="flex flex-col gap-4"
					>
						<form.Field
							name="password"
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
						</form.Field>

						<form.Field
							name="confirmPassword"
							validators={{
								onBlur: ({ value, fieldApi }) => {
									const newPw = fieldApi.form.getFieldValue("password");
									if (value && newPw && value !== newPw)
										return "Passwords do not match";
									return undefined;
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
								<Button
									type="submit"
									disabled={isSubmitting}
									className="w-full"
								>
									{isSubmitting && <LoaderIcon className="animate-spin" />}
									Reset password
								</Button>
							)}
						</form.Subscribe>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
