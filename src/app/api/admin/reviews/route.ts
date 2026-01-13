/**
 * Admin Reviews API
 * GET /api/admin/reviews - List all reviews
 */

import { authService, reviewService } from "@/backend/services"
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
 * GET /api/admin/reviews
 * List all reviews with optional filters
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
        const minRating = searchParams.get("minRating")

        // Get all reviews
        const reviews = await reviewService.findAll(
            minRating ? { minRating: parseInt(minRating) } : undefined
        )

        return NextResponse.json({
            success: true,
            data: reviews,
        })
    } catch (error) {
        console.error("Failed to fetch reviews:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch reviews" },
            { status: 500 }
        )
    }
}
