import { authService } from "@/backend/services"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { code, userId } = body

        // Get user ID from token if not provided
        let userIdToVerify = userId

        if (!userIdToVerify) {
            const cookieStore = await cookies()
            const token = cookieStore.get("auth_token")?.value

            if (token) {
                const user = await authService.getUserFromToken(token)
                userIdToVerify = user?.id
            }
        }

        if (!userIdToVerify) {
            return NextResponse.json(
                { success: false, message: "User not authenticated" },
                { status: 401 }
            )
        }

        if (!code) {
            return NextResponse.json(
                { success: false, message: "Verification code is required" },
                { status: 400 }
            )
        }

        const result = await authService.verifyEmail(userIdToVerify, code)

        if (!result.success) {
            return NextResponse.json(result, { status: 400 })
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error("Verify email API error:", error)
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        )
    }
}
