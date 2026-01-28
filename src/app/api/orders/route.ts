/**
 * Orders API Routes
 * GET /api/orders - Get orders based on user role (with pagination)
 * POST /api/orders - Create new order (CUSTOMER only)
 */

import type { OrderFilters, OrderStatus } from "@/backend/services"
import { authService, orderService } from "@/backend/services"
import { buildPaginationLinks, buildPaginationMeta, parsePaginationParams } from "@/lib/pagination"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from '../_lib'



/**
 * GET /api/orders
 * Get orders based on user role with pagination
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
        const { page, limit, skip } = parsePaginationParams(request)
        const status = searchParams.get("status") as OrderStatus | null
        const branchId = searchParams.get("branchId")

        // Build filters based on role
        const filters: OrderFilters = {}

        if (status) {
            filters.status = status
        }

        if (user.role === "CUSTOMER") {
            // Customers see only their orders
            filters.customerId = user.id
        } else if (user.role === "MANAGER") {
            // Managers see orders for their branch
            if (branchId) {
                filters.branchId = branchId
            }
        } else if (user.role === "DELIVERY") {
            // Delivery agents see assigned orders
            filters.deliveryAgentId = user.id
        }
        // ADMIN sees all orders (no filters)

        // Get total count and orders in parallel
        const [totalItems, orders] = await Promise.all([
            orderService.count(filters),
            orderService.findAll(filters, limit, skip),
        ])

        const meta = buildPaginationMeta(totalItems, page, limit)
        const links = buildPaginationLinks(request, meta)

        return NextResponse.json({
            success: true,
            data: orders,
            meta,
            links,
        })
    } catch (error) {
        console.error("Get orders error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch orders" },
            { status: 500 }
        )
    }
}

/**
 * POST /api/orders
 * Create new order (CUSTOMER only)
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        if (user.role !== "CUSTOMER") {
            return NextResponse.json(
                { success: false, message: "Only customers can place orders" },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { items, deliveryAddress, notes, branchId, orderType, paymentMethod } = body

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { success: false, message: "Order must contain at least one item" },
                { status: 400 }
            )
        }

        if (!branchId) {
            return NextResponse.json(
                { success: false, message: "Branch is required" },
                { status: 400 }
            )
        }

        if (orderType === "DELIVERY" && !deliveryAddress) {
            return NextResponse.json(
                { success: false, message: "Delivery address is required for delivery orders" },
                { status: 400 }
            )
        }

        const order = await orderService.create({
            customerId: user.id,
            branchId,
            orderType: orderType || "DELIVERY",
            deliveryAddress,
            notes,
            items: items.map((item: { coffeeId: string; quantity: number }) => ({
                coffeeId: item.coffeeId,
                quantity: item.quantity,
            })),
            paymentMethod: paymentMethod || "CASH",
        })

        return NextResponse.json({
            success: true,
            data: order,
        }, { status: 201 })
    } catch (error) {
        console.error("Create order error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to create order" },
            { status: 500 }
        )
    }
}
