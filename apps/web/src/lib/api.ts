import { hc } from "hono/client";
import type { InferResponseType } from "hono/client";
import type { AppType } from "api/src/index";

export const client = hc<AppType>(import.meta.env.VITE_API_URL ?? "/", {
  init: {
      credentials: 'include',
  },
});

export type Subscription = InferResponseType<
	typeof client.api.subscriptions.$get
>[number];
export type Provider = InferResponseType<
	(typeof client.api.providers)["user-providers"]["$get"]
>[number];
export type ProviderCategory = InferResponseType<
	typeof client.api.providers.categories.$get
>[number];
export type Currency = InferResponseType<
	typeof client.api.currencies.$get
>[number];
export type AllProviders = InferResponseType<
	typeof client.api.providers.$get
>[number];
