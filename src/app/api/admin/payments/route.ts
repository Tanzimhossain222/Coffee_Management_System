/**
 * Admin Payments API
 * GET /api/admin/payments - List all payments with filters
 */

import { authService, paymentService } from "@/backend/services"
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
 * GET /api/admin/payments
 * List all payments with optional filters
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

        if (user.role !== "ADMIN" && user.role !== "MANAGER") {
            return NextResponse.json(
                { success: false, message: "Access denied" },
                { status: 403 }
            )
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status")

        // Get all payments (payment service should have a findAll method)
        const payments = await paymentService.findAll(
            status ? { status: status as "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" } : undefined
        )

        // Get payment stats
        const stats = await paymentService.getStats()

        return NextResponse.json({
            success: true,
            data: payments,
            stats,
        })
    } catch (error) {
        console.error("Failed to fetch payments:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch payments" },
            { status: 500 }
        )
    }
}
