/**
 * Dashboard Stats API Routes
 * GET /api/dashboard/stats - Get dashboard statistics
 */

import { db } from "@/backend/database/client"
import { authUsers, branches, coffees } from "@/backend/database/schema"
import { deliveryService, orderService } from "@/backend/services"
import { sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from '../../_lib'


/**
 * GET /api/dashboard/stats
 * Get dashboard statistics based on user role
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

        const { searchParams } = new URL(request.url)
        const branchId = searchParams.get("branchId") || undefined

        let stats: Record<string, unknown> = {}

        if (user.role === "ADMIN") {
            // Admin sees global stats
            const orderStats = await orderService.getStats()

            // Count users
            const userCounts = await db
                .select({
                    total: sql<number>`count(*)::int`,
                    customers: sql<number>`count(*) filter (where ${authUsers.role} = 'CUSTOMER')::int`,
                    staff: sql<number>`count(*) filter (where ${authUsers.role} in ('ADMIN', 'MANAGER', 'STAFF', 'DELIVERY'))::int`,
                })
                .from(authUsers)

            // Count branches
            const branchCounts = await db
                .select({
                    total: sql<number>`count(*)::int`,
                    active: sql<number>`count(*) filter (where ${branches.isActive} = true)::int`,
                })
                .from(branches)

            // Count coffees
            const coffeeCounts = await db
                .select({
                    total: sql<number>`count(*)::int`,
                    available: sql<number>`count(*) filter (where ${coffees.available} = true)::int`,
                })
                .from(coffees)

            stats = {
                orders: orderStats,
                users: userCounts[0],
                branches: branchCounts[0],
                coffees: coffeeCounts[0],
            }
        } else if (user.role === "MANAGER" || user.role === "STAFF") {
            // Manager and Staff see branch-specific stats
            const orderStats = await orderService.getStats(branchId)

            stats = {
                orders: orderStats,
            }
        } else if (user.role === "DELIVERY") {
            // Delivery agent sees their delivery stats
            const deliveryStats = await deliveryService.getAgentStats(user.id)

            stats = {
                deliveries: deliveryStats,
            }
        } else if (user.role === "CUSTOMER") {
            // Customer sees their order stats
            const orders = await orderService.findAll({ customerId: user.id })

            stats = {
                totalOrders: orders.length,
                pendingOrders: orders.filter(o => !["DELIVERED", "CANCELLED"].includes(o.status)).length,
                completedOrders: orders.filter(o => o.status === "DELIVERED").length,
            }
        }

        return NextResponse.json({
            success: true,
            data: stats,
        })
    } catch (error) {
        console.error("Get dashboard stats error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch dashboard stats" },
            { status: 500 }
        )
    }
}
