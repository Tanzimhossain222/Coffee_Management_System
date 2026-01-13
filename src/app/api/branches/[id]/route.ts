/**
 * Branches [id] API Routes
 * GET /api/branches/[id] - Get single branch
 * PUT /api/branches/[id] - Update branch (ADMIN only)
 * DELETE /api/branches/[id] - Deactivate branch (ADMIN only)
 */

import { authService, branchService } from "@/backend/services"
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
 * GET /api/branches/[id]
 * Get single branch by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const branch = await branchService.findById(id)

        if (!branch) {
            return NextResponse.json(
                { success: false, message: "Branch not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: branch,
        })
    } catch (error) {
        console.error("Get branch error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch branch" },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/branches/[id]
 * Update branch (ADMIN only)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
                { success: false, message: "Admin access required" },
                { status: 403 }
            )
        }

        const { id } = await params
        const body = await request.json()

        const branch = await branchService.update(id, {
            name: body.name,
            address: body.address,
            city: body.city,
            phoneNo: body.phoneNo,
            email: body.email,
            managerId: body.managerId,
            isActive: body.isActive,
            openingTime: body.openingTime,
            closingTime: body.closingTime,
        })

        if (!branch) {
            return NextResponse.json(
                { success: false, message: "Branch not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: branch,
        })
    } catch (error) {
        console.error("Update branch error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to update branch" },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/branches/[id]
 * Deactivate branch (ADMIN only)
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
                { success: false, message: "Admin access required" },
                { status: 403 }
            )
        }

        const { id } = await params
        const deleted = await branchService.delete(id)

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: "Branch not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "Branch deactivated successfully",
        })
    } catch (error) {
        console.error("Delete branch error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to delete branch" },
            { status: 500 }
        )
    }
}
