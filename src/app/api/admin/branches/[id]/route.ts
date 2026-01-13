/**
 * Admin Branch Detail API
 * GET /api/admin/branches/[id] - Get branch by ID
 * PATCH /api/admin/branches/[id] - Update branch
 * DELETE /api/admin/branches/[id] - Delete branch
 */

import { authService, branchService } from "@/backend/services"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

type RouteParams = {
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

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser(request)

        if (!user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            )
        }

        if (user.role !== "ADMIN" && user.role !== "MANAGER") {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            )
        }

        const { id } = await params
        const branch = await branchService.findById(id)

        if (!branch) {
            return NextResponse.json(
                { error: "Branch not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            id: branch.id,
            name: branch.name,
            address: branch.address,
            city: branch.city,
            phoneNo: branch.phoneNo,
            email: branch.email,
            managerId: branch.managerId,
            managerName: branch.managerName,
            isActive: branch.isActive,
            openingTime: branch.openingTime,
            closingTime: branch.closingTime,
            createdAt: branch.createdAt?.toISOString(),
        })
    } catch (error) {
        console.error("Failed to fetch branch:", error)
        return NextResponse.json(
            { error: "Failed to fetch branch" },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser(request)

        if (!user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            )
        }

        if (user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            )
        }

        const { id } = await params
        const body = await request.json()

        const updatedBranch = await branchService.update(id, {
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

        if (!updatedBranch) {
            return NextResponse.json(
                { error: "Branch not found" },
                { status: 404 }
            )
        }

        // Get full branch with manager name
        const branch = await branchService.findById(id)

        return NextResponse.json({
            id: branch?.id,
            name: branch?.name,
            address: branch?.address,
            city: branch?.city,
            phoneNo: branch?.phoneNo,
            email: branch?.email,
            managerId: branch?.managerId,
            managerName: branch?.managerName,
            isActive: branch?.isActive,
            openingTime: branch?.openingTime,
            closingTime: branch?.closingTime,
            createdAt: branch?.createdAt?.toISOString(),
        })
    } catch (error) {
        console.error("Failed to update branch:", error)
        return NextResponse.json(
            { error: "Failed to update branch" },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser(request)

        if (!user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            )
        }

        if (user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            )
        }

        const { id } = await params
        const success = await branchService.delete(id)

        if (!success) {
            return NextResponse.json(
                { error: "Branch not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to delete branch:", error)
        return NextResponse.json(
            { error: "Failed to delete branch" },
            { status: 500 }
        )
    }
}
