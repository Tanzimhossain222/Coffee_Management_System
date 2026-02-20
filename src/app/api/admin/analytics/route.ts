/**
 * Admin Analytics API
 * GET /api/admin/analytics - Get comprehensive analytics
 */

import { db } from "@/backend/database/client"
import { authUsers, branches, coffees, deliveries, orders, reviews } from "@/backend/database/schema"
import { authService } from "@/backend/services"
import { count, eq, sql } from "drizzle-orm"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

// Helper to get current user
async function getCurrentUser(request: NextRequest) {
    const cookieStore = await cookies()
    let token = cookieStore.get("auth_token")?.value

    if (!token) {
        const authHeader = request.headers.get("authorization")
        if (authHeader?.startsWith("Bearer ")) {
            token = authHeader.substring(7)
        }
    }

    if (!token) return null

    try {
        return await authService.getUserFromToken(token)
    } catch {
        return null
    }
}

/**
 * GET /api/admin/analytics
 * Get comprehensive analytics data
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        if (user.role !== "ADMIN") {
            return NextResponse.json(
                { success: false, message: "Access denied - Analytics available for admins only" },
                { status: 403 }
            )
        }

        // Get order statistics
        const orderStats = await db
            .select({
                total: count(),
                pending: sql<number>`count(*) filter (where ${orders.status} in ('CREATED', 'ACCEPTED'))::int`,
                completed: sql<number>`count(*) filter (where ${orders.status} = 'DELIVERED')::int`,
                cancelled: sql<number>`count(*) filter (where ${orders.status} = 'CANCELLED')::int`,
                todayOrders: sql<number>`count(*) filter (where ${orders.createdAt}::date = current_date)::int`,
            })
            .from(orders)

        // Get total revenue from completed orders
        const revenueResult = await db
            .select({
                totalRevenue: sql<number>`coalesce(sum(${orders.totalAmount}::numeric), 0)`,
            })
            .from(orders)
            .where(eq(orders.status, "DELIVERED"))

        // Get user statistics by role
        const userStats = await db
            .select({
                total: count(),
                customers: sql<number>`count(*) filter (where ${authUsers.role} = 'CUSTOMER')::int`,
                managers: sql<number>`count(*) filter (where ${authUsers.role} = 'MANAGER')::int`,
                deliveryAgents: sql<number>`count(*) filter (where ${authUsers.role} = 'DELIVERY')::int`,
                staff: sql<number>`count(*) filter (where ${authUsers.role} = 'STAFF')::int`,
            })
            .from(authUsers)

        // Get coffee statistics
        const coffeeStats = await db
            .select({
                total: count(),
                available: sql<number>`count(*) filter (where ${coffees.available} = true)::int`,
                outOfStock: sql<number>`count(*) filter (where ${coffees.available} = false)::int`,
            })
            .from(coffees)

        // Get delivery statistics
        const deliveryStats = await db
            .select({
                total: count(),
                pending: sql<number>`count(*) filter (where ${deliveries.status} = 'PENDING')::int`,
                inTransit: sql<number>`count(*) filter (where ${deliveries.status} in ('PICKED_UP', 'IN_TRANSIT'))::int`,
                delivered: sql<number>`count(*) filter (where ${deliveries.status} = 'DELIVERED')::int`,
            })
            .from(deliveries)

        // Get review statistics
        const reviewStats = await db
            .select({
                total: count(),
                averageRating: sql<number>`coalesce(avg(${reviews.rating})::numeric(10,1), 0)`,
            })
            .from(reviews)

        // Get branch statistics
        const branchStats = await db
            .select({
                total: count(),
                active: sql<number>`count(*) filter (where ${branches.isActive} = true)::int`,
            })
            .from(branches)

        const analytics = {
            orders: {
                total: orderStats[0]?.total || 0,
                pending: orderStats[0]?.pending || 0,
                completed: orderStats[0]?.completed || 0,
                cancelled: orderStats[0]?.cancelled || 0,
                todayOrders: orderStats[0]?.todayOrders || 0,
                totalRevenue: parseFloat(String(revenueResult[0]?.totalRevenue || 0)),
            },
            users: {
                total: userStats[0]?.total || 0,
                customers: userStats[0]?.customers || 0,
                managers: userStats[0]?.managers || 0,
                deliveryAgents: userStats[0]?.deliveryAgents || 0,
                staff: userStats[0]?.staff || 0,
            },
            coffees: {
                total: coffeeStats[0]?.total || 0,
                available: coffeeStats[0]?.available || 0,
                outOfStock: coffeeStats[0]?.outOfStock || 0,
            },
            deliveries: {
                total: deliveryStats[0]?.total || 0,
                pending: deliveryStats[0]?.pending || 0,
                inTransit: deliveryStats[0]?.inTransit || 0,
                delivered: deliveryStats[0]?.delivered || 0,
            },
            reviews: {
                total: reviewStats[0]?.total || 0,
                averageRating: parseFloat(String(reviewStats[0]?.averageRating || 0)),
            },
            branches: {
                total: branchStats[0]?.total || 0,
                active: branchStats[0]?.active || 0,
            },
        }

        return NextResponse.json({
            success: true,
            data: analytics,
        })
    } catch (error) {
        console.error("Failed to fetch analytics:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch analytics" },
            { status: 500 }
        )
    }
}
