/**
 * Admin Users API
 * GET /api/admin/users - List all users with filters
 * POST /api/admin/users - Create a new user (admin only)
 */

import { authService, userService } from "@/backend/services"
import type { UserFilters, UserRole, UserStatus } from "@/backend/services/user.service"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from '../../_lib'


/**
 * GET /api/admin/users
 * List all users with optional filters
 * Supports: role, branchId, search, status
 */
export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url)
        const role = searchParams.get("role") as UserRole | null
        const branchId = searchParams.get("branchId")
        const search = searchParams.get("search")
        const status = searchParams.get("status")

        // Build filters
        const filters: UserFilters = {}

        if (role) filters.role = role as UserRole
        if (branchId) filters.branchId = branchId
        if (search) filters.search = search
        if (status) filters.status = status as UserStatus

        // Managers can only see users from their branch
        // For now, we allow managers to see all users
        // In production, uncomment below to restrict:
        // if (user.role === "MANAGER" && user.branchId) {
        //     filters.branchId = user.branchId
        // }

        const users = await userService.findAll(filters)

        // Transform to expected format
        const result = users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            branchId: u.branchId,
            branchName: u.branchName,
            phoneNo: u.phoneNo,
            isActive: u.status === "ACTIVE",
            verified: u.verified,
            createdAt: u.createdAt.toISOString(),
        }))

        return NextResponse.json(result)
    } catch (error) {
        console.error("Failed to fetch users:", error)
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        )
    }
}

/**
 * POST /api/admin/users
 * Create a new user (admin only)
 */
export async function POST(request: NextRequest) {
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
                { error: "Only admins can create users" },
                { status: 403 }
            )
        }

        const body = await request.json()

        // Validate required fields
        if (!body.name || !body.email || !body.role) {
            return NextResponse.json(
                { error: "Missing required fields: name, email, role" },
                { status: 400 }
            )
        }

        // For creating users, use the auth service register function
        // Or create directly using userService if password is provided
        const result = await authService.register({
            email: body.email,
            password: body.password || "TempPassword123!", // In production, generate and email temp password
            name: body.name,
            role: body.role as UserRole,
            phoneNo: body.phoneNo,
        })

        if (!result.success) {
            return NextResponse.json(
                { error: result.message },
                { status: 400 }
            )
        }

        // If branchId provided, update the user's profile
        if (body.branchId && result.user) {
            await userService.update(result.user.id, {
                branchId: body.branchId,
            })
        }

        // Fetch the created user with full details
        const newUser = result.user
            ? await userService.findById(result.user.id)
            : null

        if (!newUser) {
            return NextResponse.json(
                { error: "User created but failed to fetch details" },
                { status: 500 }
            )
        }

        return NextResponse.json(
            {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                branchId: newUser.branchId,
                branchName: newUser.branchName,
                isActive: newUser.status === "ACTIVE",
                createdAt: newUser.createdAt.toISOString(),
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Failed to create user:", error)
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        )
    }
}
