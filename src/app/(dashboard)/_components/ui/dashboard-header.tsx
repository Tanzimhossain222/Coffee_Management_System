"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import type { UserRole } from "@/types"
import { ClipboardList, Coffee, LogOut, Menu, Settings, ShoppingCart, Truck, UserCircle2 } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

export function DashboardHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { totalItems } = useCart()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getNavItems = () => {
    if (!user) return []

    switch (user.role) {
      case "CUSTOMER":
        return [
          { href: "/customer", label: "Menu", icon: Coffee },
          { href: "/customer/cart", label: "Cart", icon: ShoppingCart, badge: totalItems },
          { href: "/customer/orders", label: "My Orders", icon: ClipboardList },
        ]
      case "ADMIN":
        return [
          { href: "/admin", label: "Orders", icon: ClipboardList },
          { href: "/admin/menu", label: "Menu", icon: Settings },
        ]
      case "DELIVERY":
        return [{ href: "/delivery", label: "Deliveries", icon: Truck }]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  const getRoleBadge = () => {
    if (!user) return null
    const roleLabels: Record<UserRole, string> = {
      CUSTOMER: "Customer",
      ADMIN: "Shop Admin",
      MANAGER: "Manager",
      STAFF: "Staff",
      DELIVERY: "Delivery Agent",
    }
    return (
      <Badge variant="secondary" className="hidden sm:inline-flex">
        {roleLabels[user.role]}
      </Badge>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg hidden sm:inline">Coffee Hub</span>
          </Link>
          {getRoleBadge()}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant={pathname === item.href ? "secondary" : "ghost"} size="sm" className="relative">
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
                {item.badge && item.badge > 0 && (
                  <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">{item.badge}</Badge>
                )}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name}</span>

          {/* ✅ Customer Profile Dropdown (FIXED NAVIGATION) */}
          {user?.role === "CUSTOMER" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Customer profile">
                  <UserCircle2 className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="truncate">{user?.name || "My Account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    router.push("/customer/profile")
                  }}
                >
                  View profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    router.push("/customer/profile?edit=1")
                  }}
                >
                  Edit profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    router.push("/customer/orders")
                  }}
                >
                  Order history
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={(e) => e.preventDefault()}
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden md:flex">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                <div className="pb-4 border-b border-border">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>

                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button variant={pathname === item.href ? "secondary" : "ghost"} className="w-full justify-start">
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                      {item.badge && item.badge > 0 && <Badge className="ml-auto">{item.badge}</Badge>}
                    </Button>
                  </Link>
                ))}

                {/* Optional: Profile link in mobile panel */}
                {user?.role === "CUSTOMER" && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => router.push("/customer/profile")}
                  >
                    <UserCircle2 className="h-4 w-4 mr-2" />
                    My Profile
                  </Button>
                )}

                <Button variant="ghost" onClick={handleLogout} className="justify-start text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
