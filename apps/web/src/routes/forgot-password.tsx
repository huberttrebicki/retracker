import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
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

export const Route = createFileRoute("/forgot-password")({
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	const [error, setError] = useState("");
	const [sent, setSent] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
		},
		onSubmit: async ({ value }) => {
			setError("");
			const { error } = await authClient.requestPasswordReset({
				email: value.email,
				redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`,
			});
			if (error) {
				setError(error.message ?? "Failed to send reset email");
				return;
			}
			setSent(true);
		},
	});

	return (
		<div className="flex min-h-svh items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader className="text-center">
					<div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<ReceiptIcon className="size-5" />
					</div>
					<CardTitle className="text-xl">Forgot password</CardTitle>
					<CardDescription>
						{sent
							? "Check your email for a reset link"
							: "Enter your email to receive a password reset link"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{sent ? (
						<div className="flex flex-col gap-4 text-center">
							<p className="text-sm text-muted-foreground">
								If an account exists with that email, we've sent a reset link.
							</p>
							<Link
								to="/login"
								className="text-sm text-primary hover:underline"
							>
								Back to sign in
							</Link>
						</div>
					) : (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className="flex flex-col gap-4"
						>
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

							{error && <FieldError>{error}</FieldError>}

							<form.Subscribe selector={(s) => s.isSubmitting}>
								{(isSubmitting) => (
									<Button
										type="submit"
										disabled={isSubmitting}
										className="w-full"
									>
										{isSubmitting && <LoaderIcon className="animate-spin" />}
										Send reset link
									</Button>
								)}
							</form.Subscribe>

							<p className="text-center text-sm text-muted-foreground">
								<Link to="/login" className="text-primary hover:underline">
									Back to sign in
								</Link>
							</p>
						</form>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
