import { authService } from "@/backend/services"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
    try {
        // Get user ID from token
        const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        const user = await authService.getUserFromToken(token)

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid token" },
                { status: 401 }
            )
        }

        const result = await authService.resendVerification(user.id)

        if (!result.success) {
            return NextResponse.json(result, { status: 400 })
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error("Resend verification API error:", error)
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        )
    }
}
