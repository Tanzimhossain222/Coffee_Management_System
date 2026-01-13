/**
 * Orders [id] API Routes
 * GET /api/orders/[id] - Get single order
 * PUT /api/orders/[id] - Update order status
 */

import { authService, orderService } from "@/backend/services"
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

interface RouteParams {
    params: Promise<{ id: string }>
}

/**
 * GET /api/orders/[id]
 * Get single order by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser(request)

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        const { id } = await params
        const order = await orderService.findById(id)

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            )
        }

        // Check access: customer can only see their orders
        if (user.role === "CUSTOMER" && order.customerId !== user.id) {
            return NextResponse.json(
                { success: false, message: "Access denied" },
                { status: 403 }
            )
        }

        return NextResponse.json({
            success: true,
            data: order,
        })
    } catch (error) {
        console.error("Get order error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch order" },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/orders/[id]
 * Update order status
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser(request)

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        const { id } = await params
        const body = await request.json()
        const { action, deliveryAgentId } = body

        let success = false

        switch (action) {
            case "accept":
                if (user.role !== "ADMIN" && user.role !== "MANAGER") {
                    return NextResponse.json(
                        { success: false, message: "Admin or Manager access required" },
                        { status: 403 }
                    )
                }
                const acceptedOrder = await orderService.acceptOrder(id)
                success = acceptedOrder !== null
                break

            case "cancel":
                // Customer can cancel their own orders, admin/manager can cancel any
                if (user.role === "CUSTOMER") {
                    const order = await orderService.findById(id)
                    if (!order || order.customerId !== user.id) {
                        return NextResponse.json(
                            { success: false, message: "Access denied" },
                            { status: 403 }
                        )
                    }
                }
                const cancelledOrder = await orderService.cancelOrder(id)
                success = cancelledOrder !== null
                break

            case "assign":
                if (user.role !== "ADMIN" && user.role !== "MANAGER") {
                    return NextResponse.json(
                        { success: false, message: "Admin or Manager access required" },
                        { status: 403 }
                    )
                }
                if (!deliveryAgentId) {
                    return NextResponse.json(
                        { success: false, message: "Delivery agent ID required" },
                        { status: 400 }
                    )
                }
                success = await orderService.assignDeliveryAgent(id, deliveryAgentId)
                break

            default:
                return NextResponse.json(
                    { success: false, message: "Invalid action" },
                    { status: 400 }
                )
        }

        if (!success) {
            return NextResponse.json(
                { success: false, message: "Operation failed" },
                { status: 400 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Update order error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to update order" },
            { status: 500 }
        )
    }
}
