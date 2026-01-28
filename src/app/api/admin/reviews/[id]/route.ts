/**
 * Admin Review Detail API
 * DELETE /api/admin/reviews/[id] - Delete a review
 */

import { getCurrentUser } from '@/app/api/_lib'
import { reviewService } from "@/backend/services"
import { NextRequest, NextResponse } from "next/server"



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
