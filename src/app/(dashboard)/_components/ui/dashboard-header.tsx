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
import { ClipboardList, Coffee, LogOut, Menu, MessageSquare, Settings, ShoppingCart, Truck, UserCircle2 } from "lucide-react"
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
          { href: "/customer/support", label: "Support", icon: MessageSquare },
        ]
      case "ADMIN":
        return [
          { href: "/admin", label: "Orders", icon: ClipboardList },
          { href: "/admin/menu", label: "Menu", icon: Settings },
        ]
      case "DELIVERY":
        return [{ href: "/delivery", label: "Deliveries", icon: Truck }]
      case "STAFF":
        return [{ href: "/staff", label: "Branch Operations", icon: Coffee }]
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
          {/* Unified Profile & Logout Dropdown for all roles */}
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 pl-2">
                  <UserCircle2 className="h-5 w-5" />
                  <span className="max-w-25 truncate">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="pb-0">
                  <p className="font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground font-normal truncate">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2" />

                {user?.role === "CUSTOMER" && (
                  <>
                    <DropdownMenuItem onSelect={() => router.push("/customer/profile")}>
                      View profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => router.push("/customer/orders")}>
                      Order history
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
                  <>
                    <DropdownMenuItem onSelect={() => router.push("/admin/settings")}>
                      Admin settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  onSelect={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>

          {/* Simple Logout button for larger screens as fallback/alternative */}
          <Button variant="ghost" size="icon" onClick={handleLogout} className="md:hidden">
            <LogOut className="h-5 w-5" />
          </Button>

          {/* Mobile Navigation Sidebar */}
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
