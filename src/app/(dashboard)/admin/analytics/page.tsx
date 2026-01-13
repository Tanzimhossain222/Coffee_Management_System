"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
    BarChart3,
    Coffee,
    DollarSign,
    RefreshCw,
    ShoppingCart,
    Star,
    TrendingUp,
    Truck,
    Users
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"

interface Analytics {
    orders: {
        total: number
        pending: number
        completed: number
        cancelled: number
        todayOrders: number
        totalRevenue: number
    }
    users: {
        total: number
        customers: number
        managers: number
        deliveryAgents: number
        staff: number
    }
    coffees: {
        total: number
        available: number
        outOfStock: number
    }
    deliveries: {
        total: number
        pending: number
        inTransit: number
        delivered: number
    }
    reviews: {
        total: number
        averageRating: number
    }
    branches: {
        total: number
        active: number
    }
}

export default function AdminAnalyticsPage() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchAnalytics = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await fetch("/api/admin/analytics")
            const result = await response.json()

            if (result.success) {
                setAnalytics(result.data)
            } else {
                setError(result.message || "Failed to fetch analytics")
            }
        } catch (err) {
            setError("An error occurred while fetching analytics")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAnalytics()
    }, [fetchAnalytics])

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-5 w-64 mt-2" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={fetchAnalytics} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                </Button>
            </div>
        )
    }

    if (!analytics) return null

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-muted-foreground">
                        Overview of your coffee shop performance
                    </p>
                </div>
                <Button onClick={fetchAnalytics} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Revenue Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${Number(analytics.orders.totalRevenue).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            From completed orders
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.orders.todayOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            New orders today
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.users.total}</div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.users.customers} customers
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics.reviews.averageRating.toFixed(1)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            From {analytics.reviews.total} reviews
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Orders & Deliveries */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Orders Overview
                        </CardTitle>
                        <CardDescription>Order status breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Total Orders</span>
                            <Badge variant="outline">{analytics.orders.total}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Pending</span>
                            <Badge className="bg-yellow-500/10 text-yellow-600">
                                {analytics.orders.pending}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Completed</span>
                            <Badge className="bg-green-500/10 text-green-600">
                                {analytics.orders.completed}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Cancelled</span>
                            <Badge className="bg-red-500/10 text-red-600">
                                {analytics.orders.cancelled}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Deliveries Overview
                        </CardTitle>
                        <CardDescription>Delivery status breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Total Deliveries</span>
                            <Badge variant="outline">{analytics.deliveries.total}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Pending</span>
                            <Badge className="bg-yellow-500/10 text-yellow-600">
                                {analytics.deliveries.pending}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">In Transit</span>
                            <Badge className="bg-purple-500/10 text-purple-600">
                                {analytics.deliveries.inTransit}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Delivered</span>
                            <Badge className="bg-green-500/10 text-green-600">
                                {analytics.deliveries.delivered}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Products & Team */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Coffee className="h-5 w-5" />
                            Products
                        </CardTitle>
                        <CardDescription>Coffee menu status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Total Products</span>
                            <Badge variant="outline">{analytics.coffees.total}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Available</span>
                            <Badge className="bg-green-500/10 text-green-600">
                                {analytics.coffees.available}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Out of Stock</span>
                            <Badge className="bg-red-500/10 text-red-600">
                                {analytics.coffees.outOfStock}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Team
                        </CardTitle>
                        <CardDescription>Staff breakdown by role</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Managers</span>
                            <Badge variant="outline">{analytics.users.managers}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Staff</span>
                            <Badge variant="outline">{analytics.users.staff}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Delivery Agents</span>
                            <Badge variant="outline">{analytics.users.deliveryAgents}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Branches</span>
                            <Badge className="bg-blue-500/10 text-blue-600">
                                {analytics.branches.active}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
