import { authService } from "@/backend/services"
import { cookies } from "next/headers"
import { NextRequest } from "next/server"

export async function getCurrentUser(request: NextRequest) {
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
