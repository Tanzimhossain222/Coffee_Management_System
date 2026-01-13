import { authService } from "@/backend/services"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, name, role, phoneNo } = body

        // Validate required fields
        if (!email || !password || !name) {
            return NextResponse.json(
                { success: false, message: "Email, password, and name are required" },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: "Invalid email format" },
                { status: 400 }
            )
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                { success: false, message: "Password must be at least 8 characters" },
                { status: 400 }
            )
        }

        // Validate role if provided (ADMIN and STAFF roles cannot be registered publicly)
        const validRoles = ["CUSTOMER", "MANAGER", "DELIVERY"]
        if (role && !validRoles.includes(role)) {
            return NextResponse.json(
                { success: false, message: "Invalid role. ADMIN and STAFF roles must be created by administrators." },
                { status: 400 }
            )
        }

        const result = await authService.register({
            email,
            password,
            name,
            role: role || "CUSTOMER",
            phoneNo,
        })

        if (!result.success) {
            return NextResponse.json(result, { status: 400 })
        }

        // Set token in cookie
        const response = NextResponse.json(result, { status: 201 })
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
        console.error("Register API error:", error)
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        )
    }
}
