/**
 * Admin Support Ticket Detail API
 * PATCH /api/admin/support/[id] - Update ticket status
 */

import { getCurrentUser } from '@/app/api/_lib'
import { db } from "@/backend/database/client"
import { supportTickets } from "@/backend/database/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"


interface RouteParams {
    params: Promise<{ id: string }>
}

/**
 * PATCH /api/admin/support/[id]
 * Update support ticket
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

        const { id } = await params
        const body = await request.json()

        const updateData: Partial<typeof supportTickets.$inferInsert> = {
            updatedAt: new Date(),
        }

        if (body.status) {
            updateData.status = body.status
            if (body.status === "RESOLVED" || body.status === "CLOSED") {
                updateData.resolvedAt = new Date()
            }
        }

        if (body.priority) {
            updateData.priority = body.priority
        }

        if (body.assignedTo !== undefined) {
            updateData.assignedTo = body.assignedTo
        }

        const [updated] = await db
            .update(supportTickets)
            .set(updateData)
            .where(eq(supportTickets.id, id))
            .returning()

        if (!updated) {
            return NextResponse.json(
                { success: false, message: "Ticket not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: updated,
        })
    } catch (error) {
        console.error("Failed to update support ticket:", error)
        return NextResponse.json(
            { success: false, message: "Failed to update support ticket" },
            { status: 500 }
        )
    }
}
/**
 * DELETE /api/admin/support/[id]
 * Delete support ticket
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

        if (user.role !== "ADMIN" && user.role !== "MANAGER") {
            return NextResponse.json(
                { success: false, message: "Access denied" },
                { status: 403 }
            )
        }

        const { id } = await params
        const [deleted] = await db
            .delete(supportTickets)
            .where(eq(supportTickets.id, id))
            .returning()

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: "Ticket not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "Ticket deleted successfully",
        })
    } catch (error) {
        console.error("Failed to delete support ticket:", error)
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        )
    }
}
