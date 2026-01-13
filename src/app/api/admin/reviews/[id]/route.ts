/**
 * Admin Review Detail API
 * DELETE /api/admin/reviews/[id] - Delete a review
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

interface RouteParams {
    params: Promise<{ id: string }>
}

/**
 * DELETE /api/admin/reviews/[id]
 * Delete a review (admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser(request)

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        if (user.role !== "ADMIN") {
            return NextResponse.json(
                { success: false, message: "Only admins can delete reviews" },
                { status: 403 }
            )
        }

        const { id } = await params
        const success = await reviewService.adminDelete(id)

        if (!success) {
            return NextResponse.json(
                { success: false, message: "Failed to delete review" },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to delete review:", error)
        return NextResponse.json(
            { success: false, message: "Failed to delete review" },
            { status: 500 }
        )
    }
}
