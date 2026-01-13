"use client"

import { useCallback, useEffect, useState } from "react"

interface AdminStats {
    overview: {
        totalOrders: number
        totalRevenue: number
        totalCustomers: number
        totalProducts: number
        pendingOrders: number
        completedToday: number
    }
    revenueChange: number
    ordersChange: number
    customersChange: number
    revenueByMonth: Array<{
        month: string
        revenue: number
        orders: number
    }>
    ordersByStatus: Array<{
        status: string
        count: number
        color: string
    }>
    topProducts: Array<{
        name: string
        sales: number
        revenue: number
    }>
    recentOrders: Array<{
        id: string
        customer: string
        items: number
        total: number
        status: string
        createdAt: string
    }>
    ordersByBranch: Array<{
        branch: string
        orders: number
        revenue: number
    }>
}

interface UseAdminStatsResult {
    stats: AdminStats | null
    isLoading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useAdminStats(): UseAdminStatsResult {
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await fetch("/api/admin/stats")

            if (!response.ok) {
                throw new Error("Failed to fetch statistics")
            }

            const data = await response.json()
            setStats(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    return {
        stats,
        isLoading,
        error,
        refetch: fetchStats,
    }
}
