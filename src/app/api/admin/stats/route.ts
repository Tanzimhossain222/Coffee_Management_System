/**
 * Admin Stats API Routes
 * GET /api/admin/stats - Get admin dashboard statistics
 */

import { db } from "@/backend/database/client"
import { authUsers, branches, coffees, orderItems, orders, userProfiles } from "@/backend/database/schema"
import { and, desc, eq, gte, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from '../../_lib'



export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)

        if (!user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            )
        }

        if (user.role !== "ADMIN" && user.role !== "MANAGER") {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            )
        }

        // Get overview stats
        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        // Total orders and revenue
        const orderStats = await db
            .select({
                totalOrders: sql<number>`count(*)::int`,
                totalRevenue: sql<number>`coalesce(sum(${orders.totalAmount}), 0)::numeric(10,2)`,
                pendingOrders: sql<number>`count(*) filter (where ${orders.status} = 'CREATED')::int`,
                completedToday: sql<number>`count(*) filter (where ${orders.status} = 'DELIVERED' and ${orders.updatedAt} >= ${startOfDay})::int`,
            })
            .from(orders)

        // Total customers
        const customerStats = await db
            .select({
                totalCustomers: sql<number>`count(*)::int`,
            })
            .from(authUsers)
            .where(eq(authUsers.role, "CUSTOMER"))

        // Total products
        const productStats = await db
            .select({
                totalProducts: sql<number>`count(*)::int`,
            })
            .from(coffees)
            .where(eq(coffees.available, true))

        // Orders by status
        const ordersByStatus = await db
            .select({
                status: orders.status,
                count: sql<number>`count(*)::int`,
            })
            .from(orders)
            .groupBy(orders.status)

        const statusColors: Record<string, string> = {
            CREATED: "hsl(var(--chart-3))",
            ACCEPTED: "hsl(var(--chart-2))",
            ASSIGNED: "hsl(var(--chart-5))",
            PICKED_UP: "hsl(var(--chart-4))",
            DELIVERED: "hsl(var(--chart-1))",
            CANCELLED: "hsl(var(--muted))",
        }

        const statusLabels: Record<string, string> = {
            CREATED: "Pending",
            ACCEPTED: "Accepted",
            ASSIGNED: "Assigned",
            PICKED_UP: "In Progress",
            DELIVERED: "Completed",
            CANCELLED: "Cancelled",
        }

        // Top products by sales
        const topProducts = await db
            .select({
                name: coffees.name,
                sales: sql<number>`sum(${orderItems.quantity})::int`,
                revenue: sql<number>`sum(${orderItems.quantity} * ${orderItems.unitPrice})::numeric(10,2)`,
            })
            .from(orderItems)
            .innerJoin(coffees, eq(orderItems.coffeeId, coffees.id))
            .groupBy(coffees.id, coffees.name)
            .orderBy(sql`sum(${orderItems.quantity}) desc`)
            .limit(5)

        // Recent orders with customer info
        const recentOrders = await db
            .select({
                id: orders.id,
                customer: userProfiles.name,
                items: sql<number>`(select count(*) from order_items where order_id = ${orders.id})::int`,
                total: orders.totalAmount,
                status: orders.status,
                createdAt: orders.createdAt,
            })
            .from(orders)
            .leftJoin(userProfiles, eq(orders.customerId, userProfiles.authUserId))
            .orderBy(desc(orders.createdAt))
            .limit(5)

        // Orders by branch
        const ordersByBranch = await db
            .select({
                branch: branches.name,
                orders: sql<number>`count(*)::int`,
                revenue: sql<number>`coalesce(sum(${orders.totalAmount}), 0)::numeric(10,2)`,
            })
            .from(orders)
            .innerJoin(branches, eq(orders.branchId, branches.id))
            .groupBy(branches.id, branches.name)

        // Revenue by month (simplified - current year)
        const revenueByMonth = await db
            .select({
                month: sql<string>`to_char(${orders.createdAt}, 'Mon')`,
                monthNum: sql<number>`extract(month from ${orders.createdAt})::int`,
                revenue: sql<number>`coalesce(sum(${orders.totalAmount}), 0)::numeric(10,2)`,
                orders: sql<number>`count(*)::int`,
            })
            .from(orders)
            .where(
                and(
                    gte(orders.createdAt, new Date(now.getFullYear(), 0, 1)),
                    eq(orders.status, "DELIVERED")
                )
            )
            .groupBy(sql`to_char(${orders.createdAt}, 'Mon')`, sql`extract(month from ${orders.createdAt})`)
            .orderBy(sql`extract(month from ${orders.createdAt})`)

        const stats = {
            overview: {
                totalOrders: orderStats[0]?.totalOrders || 0,
                totalRevenue: parseFloat(String(orderStats[0]?.totalRevenue || 0)),
                totalCustomers: customerStats[0]?.totalCustomers || 0,
                totalProducts: productStats[0]?.totalProducts || 0,
                pendingOrders: orderStats[0]?.pendingOrders || 0,
                completedToday: orderStats[0]?.completedToday || 0,
            },
            revenueChange: 0, // Would need historical data to calculate
            ordersChange: 0,
            customersChange: 0,
            revenueByMonth: revenueByMonth.map(r => ({
                month: r.month,
                revenue: parseFloat(String(r.revenue)),
                orders: r.orders,
            })),
            ordersByStatus: ordersByStatus.map(s => ({
                status: statusLabels[s.status] || s.status,
                count: s.count,
                color: statusColors[s.status] || "hsl(var(--chart-1))",
            })),
            topProducts: topProducts.map(p => ({
                name: p.name,
                sales: p.sales || 0,
                revenue: parseFloat(String(p.revenue || 0)),
            })),
            recentOrders: recentOrders.map(o => ({
                id: o.id.slice(-8).toUpperCase(),
                customer: o.customer || "Unknown",
                items: o.items,
                total: parseFloat(String(o.total)),
                status: o.status,
                createdAt: o.createdAt?.toISOString() || new Date().toISOString(),
            })),
            ordersByBranch: ordersByBranch.map(b => ({
                branch: b.branch,
                orders: b.orders,
                revenue: parseFloat(String(b.revenue)),
            })),
        }

        return NextResponse.json(stats)
    } catch (error) {
        console.error("Failed to fetch admin stats:", error)
        return NextResponse.json(
            { error: "Failed to fetch statistics" },
            { status: 500 }
        )
    }
}
