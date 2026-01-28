/**
 * Admin Reviews API
 * GET /api/admin/reviews - List all reviews
 */

import { reviewService } from "@/backend/services"
import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from '../../_lib'



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
