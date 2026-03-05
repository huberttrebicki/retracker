import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { CurrencyProvider } from "@/lib/currency-context"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession()
    if (!session) {
      throw redirect({ to: "/login" })
    }
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
