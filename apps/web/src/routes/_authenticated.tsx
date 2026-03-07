import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { queryOptions } from "@tanstack/react-query"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { CurrencyProvider } from "@/lib/currency-context"
import { authClient } from "@/lib/auth-client"
import { client } from "@/lib/api"

const currenciesQuery = queryOptions({
  queryKey: ["currencies"],
  queryFn: async () => {
    const res = await client.api.currencies.$get()
    return await res.json()
  },
})

const defaultRatesQuery = queryOptions({
  queryKey: ["exchange-rates", localStorage.getItem("currency") ?? "USD"],
  queryFn: async () => {
    const base = localStorage.getItem("currency") ?? "USD"
    const res = await client.api.currencies.rates.$get({ query: { base } })
    return (await res.json()) as Record<string, number>
  },
  staleTime: 3 * 60 * 60 * 1000,
})

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession()
    if (!session) {
      throw redirect({ to: "/login" })
    }
  },
  loader: ({ context: { queryClient } }) => {
    return Promise.all([
      queryClient.ensureQueryData(currenciesQuery),
      queryClient.ensureQueryData(defaultRatesQuery),
    ])
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <CurrencyProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </CurrencyProvider>
  )
}
