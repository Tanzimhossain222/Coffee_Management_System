/**
 * Payments API Routes
 * GET /api/payments/[orderId] - Get payment for order
 * POST /api/payments - Process payment
 */

import { authService, paymentService } from "@/backend/services"
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
 * POST /api/payments
 * Process a payment for an order
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

        const body = await request.json()
        const { orderId, paymentMethod } = body

        if (!orderId) {
            return NextResponse.json(
                { success: false, message: "Order ID is required" },
                { status: 400 }
            )
        }

        if (!paymentMethod) {
            return NextResponse.json(
                { success: false, message: "Payment method is required" },
                { status: 400 }
            )
        }

        const validMethods = ["CASH", "CARD", "MOBILE_BANKING", "WALLET"]
        if (!validMethods.includes(paymentMethod)) {
            return NextResponse.json(
                { success: false, message: "Invalid payment method" },
                { status: 400 }
            )
        }

        const result = await paymentService.processPayment({
            orderId,
            customerId: user.id,
            paymentMethod,
        })

        return NextResponse.json({
            success: result.success,
            data: {
                payment: result.payment,
                transactionId: result.transactionId,
            },
            message: result.success
                ? "Payment processed successfully"
                : "Payment failed. Please try again.",
        }, { status: result.success ? 200 : 402 })
    } catch (error) {
        console.error("Payment error:", error)
        const message = error instanceof Error ? error.message : "Failed to process payment"
        return NextResponse.json(
            { success: false, message },
            { status: 500 }
        )
    }
}

/**
 * GET /api/payments
 * Get payment status for an order
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

        const { searchParams } = new URL(request.url)
        const orderId = searchParams.get("orderId")

        if (!orderId) {
            return NextResponse.json(
                { success: false, message: "Order ID is required" },
                { status: 400 }
            )
        }

        const payment = await paymentService.findByOrderId(orderId)

        if (!payment) {
            return NextResponse.json(
                { success: false, message: "Payment not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: payment,
        })
    } catch (error) {
        console.error("Get payment error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch payment" },
            { status: 500 }
        )
    }
}
