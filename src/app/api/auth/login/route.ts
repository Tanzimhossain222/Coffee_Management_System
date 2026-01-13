import { authService } from "@/backend/services"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: "Email and password are required" },
                { status: 400 }
            )
        }

        // Get request metadata for login history
        const headersList = await headers()
        const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"
        const userAgent = headersList.get("user-agent") || "unknown"

        const result = await authService.login({
            email,
            password,
            ipAddress,
            userAgent,
        })

        if (!result.success) {
            return NextResponse.json(result, { status: 401 })
        }

        // Set token in cookie
        const response = NextResponse.json(result)
        if (result.token) {
            response.cookies.set("auth_token", result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60, // 7 days
            })
        }

        return response
    } catch (error) {
        console.error("Login API error:", error)
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        )
    }
}
