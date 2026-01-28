/**
 * Coffee API Routes
 * GET /api/coffees - List all coffees
 * POST /api/coffees - Create new coffee (ADMIN only)
 */

import { authService, coffeeService } from "@/backend/services"
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
 * GET /api/coffees
 * List all coffees with optional filters
 * Add ?categories=true to also get categories
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        const filters = {
            categoryId: searchParams.get("categoryId") || undefined,
            available: searchParams.get("available") === "true" ? true :
                       searchParams.get("available") === "false" ? false : undefined,
            search: searchParams.get("search") || undefined,
            page: parseInt(searchParams.get("page") || "1"),
            limit: parseInt(searchParams.get("limit") || "12"),
        }

        const { coffees, total } = await coffeeService.findAll(filters)

        // Optionally include categories
        const includeCategories = searchParams.get("categories") === "true"
        let categories = null
        if (includeCategories) {
            categories = await coffeeService.findAllCategories()
        }

        return NextResponse.json({
            success: true,
            data: coffees,
            total,
            page: filters.page,
            limit: filters.limit,
            totalPages: Math.ceil(total / filters.limit),
            ...(categories && { categories }),
        })
    } catch (error) {
        console.error("Get coffees error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch coffees" },
            { status: 500 }
        )
    }
}

/**
 * POST /api/coffees
 * Create new coffee (ADMIN only)
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

        if (user.role !== "ADMIN" && user.role !== "MANAGER") {
            return NextResponse.json(
                { success: false, message: "Not authorized" },
                { status: 403 }
            )
        }

        const body = await request.json()

        // Validate required fields
        if (!body.name || !body.price) {
            return NextResponse.json(
                { success: false, message: "Name and price are required" },
                { status: 400 }
            )
        }

        const coffee = await coffeeService.create({
            name: body.name,
            description: body.description,
            price: parseFloat(body.price),
            imageUrl: body.imageUrl,
            categoryId: body.categoryId,
            available: body.available ?? true,
        })

        return NextResponse.json({
            success: true,
            data: coffee,
        }, { status: 201 })
    } catch (error) {
        console.error("Create coffee error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to create coffee" },
            { status: 500 }
        )
    }
}
