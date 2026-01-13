/**
 * Admin User Detail API
 * GET /api/admin/users/[id] - Get single user
 * PATCH /api/admin/users/[id] - Update user
 * DELETE /api/admin/users/[id] - Delete user
 */

import { authService, userService } from "@/backend/services"
import type { UpdateUserInput, UserRole, UserStatus } from "@/backend/services/user.service"
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
 * GET /api/admin/users/[id]
 * Get single user details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const currentUser = await getCurrentUser(request)

        if (!currentUser) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            )
        }

        if (currentUser.role !== "ADMIN" && currentUser.role !== "MANAGER") {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            )
        }

        const { id } = await params
        const user = await userService.findById(id)

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            branchId: user.branchId,
            branchName: user.branchName,
            phoneNo: user.phoneNo,
            address: user.address,
            isActive: user.status === "ACTIVE",
            verified: user.verified,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        })
    } catch (error) {
        console.error("Failed to fetch user:", error)
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        )
    }
}

/**
 * PATCH /api/admin/users/[id]
 * Update user
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const currentUser = await getCurrentUser(request)

        if (!currentUser) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            )
        }

        if (currentUser.role !== "ADMIN" && currentUser.role !== "MANAGER") {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            )
        }

        const { id } = await params
        const body = await request.json()

        // Check if user exists
        const existingUser = await userService.findById(id)
        if (!existingUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Only admins can change roles or update other admins
        if (currentUser.role === "MANAGER") {
            if (body.role || existingUser.role === "ADMIN") {
                return NextResponse.json(
                    { error: "Managers cannot modify admin users or change roles" },
                    { status: 403 }
                )
            }
        }

        // Build update data
        const updateData: UpdateUserInput = {}

        if (body.role) updateData.role = body.role as UserRole
        if (body.status) updateData.status = body.status as UserStatus
        if (body.verified !== undefined) updateData.verified = body.verified
        if (body.name) updateData.name = body.name
        if (body.phoneNo !== undefined) updateData.phoneNo = body.phoneNo
        if (body.address !== undefined) updateData.address = body.address
        if (body.branchId !== undefined) updateData.branchId = body.branchId

        // Handle isActive flag -> status conversion
        if (body.isActive !== undefined) {
            updateData.status = body.isActive ? "ACTIVE" : "SUSPENDED"
        }

        const updatedUser = await userService.update(id, updateData)

        if (!updatedUser) {
            return NextResponse.json(
                { error: "Failed to update user" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            branchId: updatedUser.branchId,
            branchName: updatedUser.branchName,
            phoneNo: updatedUser.phoneNo,
            isActive: updatedUser.status === "ACTIVE",
            verified: updatedUser.verified,
            createdAt: updatedUser.createdAt.toISOString(),
            updatedAt: updatedUser.updatedAt.toISOString(),
        })
    } catch (error) {
        console.error("Failed to update user:", error)
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete user (admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const currentUser = await getCurrentUser(request)

        if (!currentUser) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            )
        }

        if (currentUser.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Only admins can delete users" },
                { status: 403 }
            )
        }

        const { id } = await params

        // Prevent self-deletion
        if (id === currentUser.id) {
            return NextResponse.json(
                { error: "Cannot delete your own account" },
                { status: 400 }
            )
        }

        // Check if user exists
        const existingUser = await userService.findById(id)
        if (!existingUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        const success = await userService.delete(id)

        if (!success) {
            return NextResponse.json(
                { error: "Failed to delete user" },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to delete user:", error)
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        )
    }
}
