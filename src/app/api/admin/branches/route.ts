/**
 * Admin Branches API
 * GET /api/admin/branches - List all branches
 * POST /api/admin/branches - Create branch
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

        const branches = await branchService.findAll()

        // Transform to match expected format
        const result = branches.map((b) => ({
            id: b.id,
            name: b.name,
            address: b.address,
            city: b.city,
            phoneNo: b.phoneNo,
            email: b.email,
            managerId: b.managerId,
            managerName: b.managerName,
            isActive: b.isActive,
            openingTime: b.openingTime,
            closingTime: b.closingTime,
            createdAt: b.createdAt?.toISOString(),
        }))

        return NextResponse.json(result)
    } catch (error) {
        console.error("Failed to fetch branches:", error)
        return NextResponse.json(
            { error: "Failed to fetch branches" },
            { status: 500 }
        )
    }
}

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
                { error: "Admin access required" },
                { status: 403 }
            )
        }

        const body = await request.json()

        // Validate required fields
        if (!body.name || !body.address || !body.city) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        const newBranch = await branchService.create({
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
            id: newBranch.id,
            name: newBranch.name,
            address: newBranch.address,
            city: newBranch.city,
            phoneNo: newBranch.phoneNo,
            email: newBranch.email,
            managerId: newBranch.managerId,
            managerName: null,
            isActive: newBranch.isActive,
            openingTime: newBranch.openingTime,
            closingTime: newBranch.closingTime,
            createdAt: newBranch.createdAt?.toISOString(),
        }, { status: 201 })
    } catch (error) {
        console.error("Failed to create branch:", error)
        return NextResponse.json(
            { error: "Failed to create branch" },
            { status: 500 }
        )
    }
}
