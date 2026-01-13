/**
 * Deliveries API Routes
 * GET /api/deliveries - Get deliveries based on user role
 */

import type { DeliveryFilters, DeliveryStatus } from "@/backend/services"
import { authService, deliveryService } from "@/backend/services"
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
 * GET /api/deliveries
 * Get deliveries based on user role
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
        const status = searchParams.get("status") as DeliveryStatus | null
        const branchId = searchParams.get("branchId")

        // Build filters based on role
        const filters: DeliveryFilters = {}

        if (status) {
            filters.status = status
        }

        if (user.role === "DELIVERY") {
            // Delivery agents see only their assigned deliveries
            filters.agentId = user.id
        } else if (user.role === "MANAGER") {
            // Managers see deliveries for their branch
            if (branchId) {
                filters.branchId = branchId
            }
        } else if (user.role !== "ADMIN") {
            // Only ADMIN, MANAGER, and DELIVERY can access deliveries
            return NextResponse.json(
                { success: false, message: "Access denied" },
                { status: 403 }
            )
        }

        const deliveries = await deliveryService.findAll(filters)

        return NextResponse.json({
            success: true,
            data: deliveries,
        })
    } catch (error) {
        console.error("Get deliveries error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch deliveries" },
            { status: 500 }
        )
    }
}
