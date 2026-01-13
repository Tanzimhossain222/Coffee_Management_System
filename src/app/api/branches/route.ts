/**
 * Branches API Routes
 * GET /api/branches - Get all branches (public)
 * POST /api/branches - Create new branch (ADMIN only)
 */

import { authService, branchService } from "@/backend/services"
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

/**
 * GET /api/branches
 * Get all active branches (public for branch selection)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const includeInactive = searchParams.get("includeInactive") === "true"

        // Only admin can see inactive branches
        if (includeInactive) {
            const user = await getCurrentUser(request)
            if (!user || user.role !== "ADMIN") {
                return NextResponse.json(
                    { success: false, message: "Admin access required" },
                    { status: 403 }
                )
            }
        }

        const branches = await branchService.findAll(includeInactive)

        return NextResponse.json({
            success: true,
            data: branches,
        })
    } catch (error) {
        console.error("Get branches error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch branches" },
            { status: 500 }
        )
    }
}

/**
 * POST /api/branches
 * Create new branch (ADMIN only)
 */
export async function POST(request: NextRequest) {
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

        const body = await request.json()

        // Validate required fields
        if (!body.name || !body.address || !body.city) {
            return NextResponse.json(
                { success: false, message: "Name, address, and city are required" },
                { status: 400 }
            )
        }

        const branch = await branchService.create({
            name: body.name,
            address: body.address,
            city: body.city,
            phoneNo: body.phoneNo,
            email: body.email,
            managerId: body.managerId,
            openingTime: body.openingTime,
            closingTime: body.closingTime,
        })

        return NextResponse.json({
            success: true,
            data: branch,
        }, { status: 201 })
    } catch (error) {
        console.error("Create branch error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to create branch" },
            { status: 500 }
        )
    }
}
