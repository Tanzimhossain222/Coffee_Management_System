import { authService } from "@/backend/services"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, code, newPassword } = body

        if (!email || !code || !newPassword) {
            return NextResponse.json(
                { success: false, message: "Email, code, and new password are required" },
                { status: 400 }
            )
        }

        // Validate password strength
        if (newPassword.length < 8) {
            return NextResponse.json(
                { success: false, message: "Password must be at least 8 characters" },
                { status: 400 }
            )
        }

        const result = await authService.resetPassword(email, code, newPassword)

        if (!result.success) {
            return NextResponse.json(result, { status: 400 })
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error("Reset password API error:", error)
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        )
    }
}
