import { createFileRoute } from "@tanstack/react-router";
import { CalendarGrid } from "@/components/dashboard/calendar-grid";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { UpcomingPayments } from "@/components/dashboard/upcoming-payments";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="flex h-svh flex-col">
      <header className="flex h-12 shrink-0 items-center border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <h1 className="ml-2 text-sm font-medium">Dashboard</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-6">
          <StatsCards />
          <CalendarGrid />
          <div className="grid gap-6 lg:grid-cols-2">
            <CategoryBreakdown />
            <UpcomingPayments />
          </div>
        </div>
      </div>
    </div>
  );
}
