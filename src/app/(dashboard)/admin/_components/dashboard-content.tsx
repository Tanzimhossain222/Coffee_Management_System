"use client"

import { Skeleton } from "@/components/ui/skeleton"
import {
    Building2,
    Coffee,
    DollarSign,
    Package,
    ShoppingCart,
    Users,
} from "lucide-react"
import { useAdminStats } from "../_hooks/use-admin-stats"
import { OrdersStatusChart } from "./ui/orders-status-chart"
import { RecentOrdersTable } from "./ui/recent-orders-table"
import { RevenueChart } from "./ui/revenue-chart"
import { StatsCard } from "./ui/stats-card"
import { TopProductsChart } from "./ui/top-products-chart"

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-[380px]" />
                <Skeleton className="h-[380px]" />
            </div>
            <Skeleton className="h-[400px]" />
        </div>
    )
}

export function DashboardContent() {
    const { stats, isLoading, error } = useAdminStats()

    if (isLoading) {
        return <DashboardSkeleton />
    }

    if (error || !stats) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <p className="text-destructive text-lg font-medium">Failed to load dashboard data</p>
                <p className="text-muted-foreground">{error || "Please try again later"}</p>
            </div>
        )
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(value)
    }

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Revenue"
                    value={formatCurrency(stats.overview.totalRevenue)}
                    description="from last month"
                    icon={DollarSign}
                    trend={{
                        value: stats.revenueChange,
                        isPositive: stats.revenueChange > 0,
                    }}
                />
                <StatsCard
                    title="Total Orders"
                    value={stats.overview.totalOrders.toLocaleString()}
                    description="from last month"
                    icon={ShoppingCart}
                    trend={{
                        value: stats.ordersChange,
                        isPositive: stats.ordersChange > 0,
                    }}
                />
                <StatsCard
                    title="Total Customers"
                    value={stats.overview.totalCustomers.toLocaleString()}
                    description="from last month"
                    icon={Users}
                    trend={{
                        value: stats.customersChange,
                        isPositive: stats.customersChange > 0,
                    }}
                />
                <StatsCard
                    title="Menu Items"
                    value={stats.overview.totalProducts}
                    description="active products"
                    icon={Coffee}
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Pending Orders"
                    value={stats.overview.pendingOrders}
                    description="awaiting processing"
                    icon={Package}
                />
                <StatsCard
                    title="Completed Today"
                    value={stats.overview.completedToday}
                    description="orders fulfilled"
                    icon={ShoppingCart}
                />
                <StatsCard
                    title="Active Branches"
                    value={stats.ordersByBranch.length}
                    description="locations"
                    icon={Building2}
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 lg:grid-cols-2">
                <RevenueChart data={stats.revenueByMonth} />
                <OrdersStatusChart data={stats.ordersByStatus} />
            </div>

            {/* Top Products */}
            <TopProductsChart data={stats.topProducts} />

            {/* Recent Orders */}
            <RecentOrdersTable orders={stats.recentOrders} />
        </div>
    )
}
