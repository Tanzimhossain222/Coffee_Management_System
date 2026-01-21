import { authService } from "@/backend/services"
import { db } from "@database/client"
import { authUsers, userProfiles } from "@database/schema"
import { eq } from "drizzle-orm"
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
    const user = await authService.getUserFromToken(token)
    return user
  } catch {
    return null
  }
}

/**
 * GET /api/users/profile
 * Get current user's profile (includes address from user_profiles)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.authUserId, user.id),
    })

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        phoneNo: profile?.phoneNo ?? user.phoneNo ?? "",
        address: profile?.address ?? "",
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ success: false, message: "Failed to get profile" }, { status: 500 })
  }
}

/**
 * PUT /api/users/profile
 * Update current user's profile (SAVES TO DATABASE)
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()

    const name = typeof body?.name === "string" ? body.name.trim() : undefined
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : undefined
    const phoneNo = typeof body?.phoneNo === "string" ? body.phoneNo.trim() : undefined
    const address = typeof body?.address === "string" ? body.address.trim() : undefined

    // basic validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email address" }, { status: 400 })
    }
    if (name !== undefined && name.length === 0) {
      return NextResponse.json({ success: false, message: "Name cannot be empty" }, { status: 400 })
    }

    await db.transaction(async (tx) => {
      // Keep auth_users.email synced if email changes
      if (email && email !== user.email) {
        await tx.update(authUsers).set({ email, updatedAt: new Date() }).where(eq(authUsers.id, user.id))
      }

      // Update user_profiles row
      const updateData: Partial<typeof userProfiles.$inferInsert> = {
        updatedAt: new Date(),
      }
      if (name !== undefined) updateData.name = name
      if (email !== undefined) updateData.email = email
      if (phoneNo !== undefined) updateData.phoneNo = phoneNo
      if (address !== undefined) updateData.address = address

      // If profile exists, update it; otherwise create it (safe upsert)
      const existing = await tx.query.userProfiles.findFirst({
        where: eq(userProfiles.authUserId, user.id),
      })

      if (existing) {
        await tx.update(userProfiles).set(updateData).where(eq(userProfiles.authUserId, user.id))
      } else {
        await tx.insert(userProfiles).values({
          authUserId: user.id,
          name: updateData.name ?? user.name ?? user.username ?? "User",
          email: updateData.email ?? user.email,
          phoneNo: updateData.phoneNo ?? user.phoneNo ?? null,
          address: updateData.address ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    })

    // Return updated data
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.authUserId, user.id),
    })

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        email: email ?? user.email,
        name: name ?? user.name,
        phoneNo: profile?.phoneNo ?? phoneNo ?? user.phoneNo ?? "",
        address: profile?.address ?? address ?? "",
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 })
  }
}
