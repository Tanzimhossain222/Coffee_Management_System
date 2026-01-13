/**
 * Cart Item [id] API Routes
 * PUT /api/cart/[id] - Update cart item quantity
 * DELETE /api/cart/[id] - Remove item from cart
 */

import { authService, cartService } from "@/backend/services"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

interface RouteParams {
    params: Promise<{ id: string }>
}

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
 * PUT /api/cart/[id]
 * Update cart item quantity
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
                { success: false, message: "Only customers can update cart" },
                { status: 403 }
            )
        }

        const { id } = await params
        const body = await request.json()
        const { quantity } = body

        if (quantity === undefined) {
            return NextResponse.json(
                { success: false, message: "Quantity is required" },
                { status: 400 }
            )
        }

        await cartService.updateQuantity(id, user.id, quantity)

        // Get updated cart
        const cart = await cartService.getCart(user.id)

        return NextResponse.json({
            success: true,
            data: cart,
        })
    } catch (error) {
        console.error("Update cart item error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to update cart item" },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/cart/[id]
 * Remove item from cart
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
                { success: false, message: "Only customers can remove from cart" },
                { status: 403 }
            )
        }

        const { id } = await params
        await cartService.removeItem(id, user.id)

        // Get updated cart
        const cart = await cartService.getCart(user.id)

        return NextResponse.json({
            success: true,
            data: cart,
        })
    } catch (error) {
        console.error("Remove cart item error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to remove cart item" },
            { status: 500 }
        )
    }
}
