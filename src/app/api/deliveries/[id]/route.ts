/**
 * Deliveries [id] API Routes
 * GET /api/deliveries/[id] - Get single delivery
 * PUT /api/deliveries/[id] - Update delivery status
 */

import { authService, deliveryService } from "@/backend/services"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

interface RouteParams {
    params: Promise<{ id: string }>
}

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
 * GET /api/deliveries/[id]
 * Get single delivery by ID
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
        const delivery = await deliveryService.findById(id)

        if (!delivery) {
            return NextResponse.json(
                { success: false, message: "Delivery not found" },
                { status: 404 }
            )
        }

        // Check access: delivery agent can only see their assigned deliveries
        if (user.role === "DELIVERY" && delivery.deliveryAgentId !== user.id) {
            return NextResponse.json(
                { success: false, message: "Access denied" },
                { status: 403 }
            )
        }

        return NextResponse.json({
            success: true,
            data: delivery,
        })
    } catch (error) {
        console.error("Get delivery error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch delivery" },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/deliveries/[id]
 * Update delivery status
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

        // Only delivery agents, managers, and admins can update delivery status
        if (!["DELIVERY", "MANAGER", "ADMIN"].includes(user.role)) {
            return NextResponse.json(
                { success: false, message: "Access denied" },
                { status: 403 }
            )
        }

        const { id } = await params
        const body = await request.json()
        const { action } = body

        // Delivery agents can only update their own deliveries
        if (user.role === "DELIVERY") {
            const delivery = await deliveryService.findById(id)
            if (!delivery || delivery.deliveryAgentId !== user.id) {
                return NextResponse.json(
                    { success: false, message: "Access denied" },
                    { status: 403 }
                )
            }
        }

        let result

        switch (action) {
            case "pickup":
                result = await deliveryService.pickUp(id)
                break

            case "in_transit":
                result = await deliveryService.inTransit(id)
                break

            case "complete":
            case "deliver":
                result = await deliveryService.complete(id)
                break

            default:
                return NextResponse.json(
                    { success: false, message: "Invalid action. Use: pickup, in_transit, complete" },
                    { status: 400 }
                )
        }

        if (!result) {
            return NextResponse.json(
                { success: false, message: "Failed to update delivery" },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error("Update delivery error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to update delivery" },
            { status: 500 }
        )
    }
}
