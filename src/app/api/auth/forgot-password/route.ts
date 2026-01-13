import { authService } from "@/backend/services"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email) {
            return NextResponse.json(
                { success: false, message: "Email is required" },
                { status: 400 }
            )
        }

        const result = await authService.requestPasswordReset(email)

        // Always return success to prevent email enumeration
        return NextResponse.json(result)
    } catch (error) {
        console.error("Forgot password API error:", error)
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        )
    }
}
