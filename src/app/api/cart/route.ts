/**
 * Cart API Routes
 * GET /api/cart - Get customer's cart
 * POST /api/cart - Add item to cart
 * DELETE /api/cart - Clear cart
 */

import { authService, cartService } from "@/backend/services"
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
 * GET /api/cart
 * Get customer's cart with all items
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

        if (user.role !== "CUSTOMER") {
            return NextResponse.json(
                { success: false, message: "Only customers can have carts" },
                { status: 403 }
            )
        }

        const cart = await cartService.getCart(user.id)

        return NextResponse.json({
            success: true,
            data: cart,
        })
    } catch (error) {
        console.error("Get cart error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch cart" },
            { status: 500 }
        )
    }
}

/**
 * POST /api/cart
 * Add item to cart
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

        if (user.role !== "CUSTOMER") {
            return NextResponse.json(
                { success: false, message: "Only customers can add to cart" },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { coffeeId, quantity } = body

        if (!coffeeId) {
            return NextResponse.json(
                { success: false, message: "Coffee ID is required" },
                { status: 400 }
            )
        }

        const item = await cartService.addItem({
            customerId: user.id,
            coffeeId,
            quantity: quantity || 1,
        })

        // Get updated cart
        const cart = await cartService.getCart(user.id)

        return NextResponse.json({
            success: true,
            data: cart,
        })
    } catch (error) {
        console.error("Add to cart error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to add to cart" },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/cart
 * Clear entire cart
 */
export async function DELETE(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        if (user.role !== "CUSTOMER") {
            return NextResponse.json(
                { success: false, message: "Only customers can clear cart" },
                { status: 403 }
            )
        }

        await cartService.clearCart(user.id)

        return NextResponse.json({
            success: true,
            message: "Cart cleared",
        })
    } catch (error) {
        console.error("Clear cart error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to clear cart" },
            { status: 500 }
        )
    }
}
