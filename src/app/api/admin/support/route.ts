/**
 * Admin Support Tickets API
 * GET /api/admin/support - List all support tickets
 */

import { db } from "@/backend/database/client"
import { authUsers, supportTickets, userProfiles } from "@/backend/database/schema"
import { authService } from "@/backend/services"
import { and, desc, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from '../../_lib'



// Alias for assigned agent profile
const assignedAgentProfile = {
    ...userProfiles,
}

/**
 * GET /api/admin/support
 * List all support tickets with optional filters
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

        const conditions: ReturnType<typeof eq>[] = []

        if (status) {
            conditions.push(eq(supportTickets.status, status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"))
        }

        // Fetch tickets with customer info
        const tickets = await db
            .select({
                id: supportTickets.id,
                customerId: supportTickets.customerId,
                customerName: userProfiles.name,
                customerEmail: userProfiles.email,
                orderId: supportTickets.orderId,
                subject: supportTickets.subject,
                description: supportTickets.description,
                status: supportTickets.status,
                priority: supportTickets.priority,
                assignedTo: supportTickets.assignedTo,
                createdAt: supportTickets.createdAt,
                resolvedAt: supportTickets.resolvedAt,
            })
            .from(supportTickets)
            .innerJoin(authUsers, eq(supportTickets.customerId, authUsers.id))
            .innerJoin(userProfiles, eq(authUsers.id, userProfiles.authUserId))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(supportTickets.createdAt))

        // Get assigned agent names separately
        const ticketsWithAgents = await Promise.all(
            tickets.map(async (ticket) => {
                let assignedToName = null
                if (ticket.assignedTo) {
                    const agent = await db
                        .select({ name: userProfiles.name })
                        .from(userProfiles)
                        .where(eq(userProfiles.authUserId, ticket.assignedTo))
                        .limit(1)
                    assignedToName = agent[0]?.name || null
                }
                return {
                    ...ticket,
                    assignedToName,
                    createdAt: ticket.createdAt.toISOString(),
                    resolvedAt: ticket.resolvedAt?.toISOString() || null,
                }
            })
        )

        return NextResponse.json({
            success: true,
            data: ticketsWithAgents,
        })
    } catch (error) {
        console.error("Failed to fetch support tickets:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch support tickets" },
            { status: 500 }
        )
    }
}
