/**
 * Coffee [id] API Routes
 * GET /api/coffees/[id] - Get single coffee
 * PUT /api/coffees/[id] - Update coffee (ADMIN only)
 * DELETE /api/coffees/[id] - Delete coffee (ADMIN only)
 */

import { authService, coffeeService, reviewService } from "@/backend/services"
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
 * GET /api/coffees/[id]
 * Get single coffee by ID with optional related products and review summary
 * Query params:
 *   - includeRelated=true - include related products
 *   - includeReviews=true - include review summary
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const { searchParams } = new URL(request.url)

        const includeRelated = searchParams.get("includeRelated") === "true"
        const includeReviews = searchParams.get("includeReviews") === "true"

        const coffee = await coffeeService.findById(id)

        if (!coffee) {
            return NextResponse.json(
                { success: false, message: "Coffee not found" },
                { status: 404 }
            )
        }

        // Build response
        const response: Record<string, unknown> = {
            success: true,
            data: coffee,
        }

        // Add related products if requested
        if (includeRelated) {
            response.relatedProducts = await coffeeService.findRelated(id, 4)
        }

        // Add review summary if requested
        if (includeReviews) {
            const summary = await reviewService.getSummary(id)
            response.reviewSummary = {
                averageRating: parseFloat(String(summary.averageRating)),
                totalReviews: summary.totalReviews,
            }
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("Get coffee error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch coffee" },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/coffees/[id]
 * Update coffee (ADMIN only)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const user = await getCurrentUser(request)

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        if (user.role !== "ADMIN" && user.role !== "MANAGER") {
            return NextResponse.json(
                { success: false, message: "Not authorized" },
                { status: 403 }
            )
        }

        const body = await request.json()

        const coffee = await coffeeService.update(id, {
            name: body.name,
            description: body.description,
            price: body.price ? parseFloat(body.price) : undefined,
            imageUrl: body.imageUrl,
            categoryId: body.categoryId,
            available: body.available,
        })

        if (!coffee) {
            return NextResponse.json(
                { success: false, message: "Coffee not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: coffee,
        })
    } catch (error) {
        console.error("Update coffee error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to update coffee" },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/coffees/[id]
 * Delete coffee (ADMIN only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const user = await getCurrentUser(request)

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        if (user.role !== "ADMIN") {
            return NextResponse.json(
                { success: false, message: "Not authorized" },
                { status: 403 }
            )
        }

        const deleted = await coffeeService.delete(id)

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: "Coffee not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "Coffee deleted successfully",
        })
    } catch (error) {
        console.error("Delete coffee error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to delete coffee" },
            { status: 500 }
        )
    }
}
