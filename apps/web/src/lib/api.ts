import { hc } from "hono/client"
import type { InferResponseType } from "hono/client"
import type { AppType } from "api/src/index"

export const client = hc<AppType>("/")

export type Subscription = InferResponseType<typeof client.api.subscriptions.$get>[number]
