import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { ReceiptIcon, LoaderIcon } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa";
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

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const [error, setError] = useState("");

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			setError("");
			const { error } = await authClient.signIn.email({
				email: value.email,
				password: value.password,
			});

			if (error) {
				setError(error.message ?? "Failed to sign in");
				return;
			}

			navigate({ to: "/dashboard" });
		},
	});

	return (
		<div className="flex min-h-svh items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader className="text-center">
					<div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<ReceiptIcon className="size-5" />
					</div>
					<CardTitle className="text-xl">Welcome back</CardTitle>
					<CardDescription>Sign in to your account</CardDescription>
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
									!value ? "Password is required" : undefined,
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

						{error && <FieldError>{error}</FieldError>}

						<div className="text-right">
							<Link
								to="/forgot-password"
								className="text-xs text-muted-foreground hover:text-primary hover:underline"
							>
								Forgot password?
							</Link>
						</div>

						<form.Subscribe selector={(s) => s.isSubmitting}>
							{(isSubmitting) => (
								<Button
									type="submit"
									disabled={isSubmitting}
									className="w-full"
								>
									{isSubmitting && <LoaderIcon className="animate-spin" />}
									Sign in
								</Button>
							)}
						</form.Subscribe>

						<div className="relative my-2">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-card px-2 text-muted-foreground">
									or continue with
								</span>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-2">
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={() =>
									authClient.signIn.social({
										provider: "google",
										callbackURL: `${import.meta.env.VITE_APP_URL}/dashboard`,
									})
								}
							>
								<FaGoogle />
								Google
							</Button>
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={() =>
									authClient.signIn.social({
										provider: "github",
										callbackURL: `${import.meta.env.VITE_APP_URL}/dashboard`,
									})
								}
							>
								<FaGithub />
								GitHub
							</Button>
						</div>

						<p className="text-center text-sm text-muted-foreground">
							Don't have an account?{" "}
							<Link to="/register" className="text-primary hover:underline">
								Sign up
							</Link>
						</p>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
