import { authService } from "@/backend/services"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        // Get token from cookie or Authorization header
        const cookieStore = await cookies()
        let token = cookieStore.get("auth_token")?.value

        // Check Authorization header as fallback
        if (!token) {
            const authHeader = request.headers.get("authorization")
            if (authHeader?.startsWith("Bearer ")) {
                token = authHeader.substring(7)
            }
        }

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        const user = await authService.getUserFromToken(token)

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired token" },
                { status: 401 }
            )
        }

        return NextResponse.json({
            success: true,
            user,
        })
    } catch (error) {
        console.error("Auth me API error:", error)
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        )
    }
}
