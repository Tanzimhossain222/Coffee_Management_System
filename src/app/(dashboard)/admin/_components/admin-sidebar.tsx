"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import {
    BarChart3,
    Building2,
    ChevronUp,
    Coffee,
    CreditCard,
    LayoutDashboard,
    LogOut,
    Settings,
    ShoppingCart,
    Star,
    Ticket,
    Truck,
    Users
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

const mainNavItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
    },
    {
        title: "Branches",
        href: "/admin/branches",
        icon: Building2,
    },
    {
        title: "Menu",
        href: "/admin/menu",
        icon: Coffee,
    },
]

const managementNavItems = [
    {
        title: "Users",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "Deliveries",
        href: "/admin/deliveries",
        icon: Truck,
    },
    {
        title: "Payments",
        href: "/admin/payments",
        icon: CreditCard,
    },
]

const analyticsNavItems = [
    {
        title: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
    },
    {
        title: "Reviews",
        href: "/admin/reviews",
        icon: Star,
    },
    {
        title: "Support",
        href: "/admin/support",
        icon: Ticket,
    },
]

interface AdminSidebarProps {
    children: React.ReactNode
}

function SidebarNavItem({ item, isActive }: { item: typeof mainNavItems[0]; isActive: boolean }) {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
                <Link href={item.href}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}

function SidebarNav() {
    const pathname = usePathname()

    return (
        <SidebarContent>
            <ScrollArea className="h-full">
                <SidebarGroup>
                    <SidebarGroupLabel>Main</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNavItems.map((item) => (
                                <SidebarNavItem
                                    key={item.href}
                                    item={item}
                                    isActive={pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))}
                                />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {managementNavItems.map((item) => (
                                <SidebarNavItem
                                    key={item.href}
                                    item={item}
                                    isActive={pathname === item.href || pathname.startsWith(item.href)}
                                />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Analytics & Support</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {analyticsNavItems.map((item) => (
                                <SidebarNavItem
                                    key={item.href}
                                    item={item}
                                    isActive={pathname === item.href || pathname.startsWith(item.href)}
                                />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </ScrollArea>
        </SidebarContent>
    )
}

function UserMenu() {
    const router = useRouter()
    const { user, logout } = useAuth()

    const handleLogout = () => {
        logout()
        router.push("/")
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="" alt={user?.name || "User"} />
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {user?.name ? getInitials(user.name) : "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user?.name}</span>
                                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                                </div>
                                <ChevronUp className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            side="top"
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="" alt={user?.name || "User"} />
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            {user?.name ? getInitials(user.name) : "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{user?.name}</span>
                                        <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                                    </div>
                                    <Badge variant="secondary" className="ml-auto">
                                        Admin
                                    </Badge>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link href="/admin/settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} variant="destructive">
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    )
}

export function AdminSidebar({ children }: AdminSidebarProps) {
    return (
        <SidebarProvider>
            <Sidebar variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/admin">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                        <Coffee className="size-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">Coffee Hub</span>
                                        <span className="truncate text-xs text-muted-foreground">Admin Panel</span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <Separator />
                <SidebarNav />
                <UserMenu />
                <SidebarRail />
            </Sidebar>
            <SidebarInset>
                <header className="flex h-14 items-center gap-2 border-b px-4 lg:h-[60px]">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="flex-1" />
                </header>
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
