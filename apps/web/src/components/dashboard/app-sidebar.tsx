import * as React from "react"
import {
  CalendarIcon,
  CreditCardIcon,
  BuildingIcon,
  SettingsIcon,
  ReceiptIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  ChevronsUpDownIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { mockSubscriptions } from "@/data/mock"
import { formatCurrency, isPaymentOnDate } from "@/lib/calendar"
import { useCurrency, currencies } from "@/lib/currency-context"

const navItems = [
  { title: "Dashboard", icon: CalendarIcon, active: true },
  { title: "Subscriptions", icon: CreditCardIcon, active: false },
  { title: "Providers", icon: BuildingIcon, active: false },
  { title: "Settings", icon: SettingsIcon, active: false },
]

const active = mockSubscriptions.filter((s) => s.status === "active")
const today = new Date()
const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
const todayPayments = active.filter((s) => isPaymentOnDate(s, today))
const tomorrowPayments = active.filter((s) => isPaymentOnDate(s, tomorrow))

type Theme = "light" | "dark" | "system"

function getTheme(): Theme {
  return (localStorage.getItem("theme") as Theme) ?? "system"
}

function applyTheme(theme: Theme) {
  if (theme === "system") {
    localStorage.removeItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    document.documentElement.classList.toggle("dark", prefersDark)
  } else {
    localStorage.setItem("theme", theme)
    document.documentElement.classList.toggle("dark", theme === "dark")
  }
}

const themes = [
  { value: "light" as const, icon: SunIcon, label: "Light" },
  { value: "dark" as const, icon: MoonIcon, label: "Dark" },
  { value: "system" as const, icon: MonitorIcon, label: "System" },
]

export function AppSidebar() {
  const [theme, setTheme] = React.useState<Theme>(getTheme)
  const { currency, setCurrency } = useCurrency()

  function handleTheme(t: Theme) {
    setTheme(t)
    applyTheme(t)
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ReceiptIcon className="size-4" />
              </div>
              <span className="text-base font-semibold">Retracker</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={item.active}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Today</SidebarGroupLabel>
          <SidebarGroupContent>
            {todayPayments.length === 0 ? (
              <p className="px-2 py-1 text-xs text-muted-foreground">
                No payments today
              </p>
            ) : (
              <div className="flex flex-col gap-2 px-2 py-1">
                {todayPayments.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarFallback>{sub.providerName[0]}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 truncate text-sm">{sub.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(sub.price, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tomorrow</SidebarGroupLabel>
          <SidebarGroupContent>
            {tomorrowPayments.length === 0 ? (
              <p className="px-2 py-1 text-xs text-muted-foreground">
                No payments tomorrow
              </p>
            ) : (
              <div className="flex flex-col gap-2 px-2 py-1">
                {tomorrowPayments.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarFallback>{sub.providerName[0]}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 truncate text-sm">{sub.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(sub.price, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
                <Avatar size="sm">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium">John Doe</span>
                  <span className="text-xs text-muted-foreground">
                    john@example.com
                  </span>
                </div>
                <ChevronsUpDownIcon className="size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Theme</DropdownMenuLabel>
                  <div className="flex gap-1 px-1.5 pb-1">
                    {themes.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => handleTheme(t.value)}
                        className={cn(
                          "flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-1.5 text-xs transition-colors",
                          theme === t.value
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <t.icon className="size-4" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Currency</DropdownMenuLabel>
                  <div className="flex flex-wrap gap-1 px-1.5 pb-1">
                    {currencies.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setCurrency(c.code)}
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs transition-colors",
                          currency === c.code
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <SettingsIcon />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
