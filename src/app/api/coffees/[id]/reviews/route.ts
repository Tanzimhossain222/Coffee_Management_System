/**
 * Coffee Reviews API Routes
 * GET /api/coffees/[id]/reviews - Get reviews for a coffee
 * POST /api/coffees/[id]/reviews - Create a review (CUSTOMER only)
 */

import { authService, reviewService } from "@/backend/services"
import { buildPaginationLinks, buildPaginationMeta, parsePaginationParams } from "@/lib/pagination"
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
 * GET /api/coffees/[id]/reviews
 * Get reviews for a coffee with pagination
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: coffeeId } = await params
        const { page, limit, skip } = parsePaginationParams(request)

        // Get total count and reviews in parallel
        const [totalItems, reviews] = await Promise.all([
            reviewService.countByCoffeeId(coffeeId),
            reviewService.findByCoffeeId(coffeeId, limit, skip),
        ])

        const meta = buildPaginationMeta(totalItems, page, limit)
        const links = buildPaginationLinks(request, meta)

        // Get summary
        const summary = await reviewService.getSummary(coffeeId)

        return NextResponse.json({
            success: true,
            data: reviews,
            summary: {
                averageRating: parseFloat(String(summary.averageRating)),
                totalReviews: summary.totalReviews,
            },
            meta,
            links,
        })
    } catch (error) {
        console.error("Get reviews error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch reviews" },
            { status: 500 }
        )
    }
}

/**
 * POST /api/coffees/[id]/reviews
 * Create a new review (CUSTOMER only)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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
                { success: false, message: "Only customers can write reviews" },
                { status: 403 }
            )
        }

        const { id: coffeeId } = await params
        const body = await request.json()

        const { rating, content } = body

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { success: false, message: "Rating is required and must be between 1 and 5" },
                { status: 400 }
            )
        }

        const review = await reviewService.create({
            customerId: user.id,
            coffeeId,
            rating,
            content,
        })

        return NextResponse.json({
            success: true,
            data: review,
        }, { status: 201 })
    } catch (error) {
        console.error("Create review error:", error)
        const message = error instanceof Error ? error.message : "Failed to create review"
        return NextResponse.json(
            { success: false, message },
            { status: 500 }
        )
    }
}
