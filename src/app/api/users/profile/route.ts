import { authService } from "@/backend/services"
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
        const user = await authService.getUserFromToken(token)
        return user
    } catch {
        return null
    }
}

/**
 * GET /api/users/profile
 * Get current user's profile
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

        // User profile is already included from authService
        return NextResponse.json({
            success: true,
            data: user,
        })
    } catch (error) {
        console.error("Get profile error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to get profile" },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/users/profile
 * Update current user's profile
 * TODO: Implement with database
 */
export async function PUT(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        const data = await request.json()
        console.log("Profile update data:", data)

        // TODO: Implement profile update in auth service
        return NextResponse.json(
            { success: false, message: "Profile update not yet implemented" },
            { status: 501 }
        )
    } catch (error) {
        console.error("Update profile error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to update profile" },
            { status: 500 }
        )
    }
}
