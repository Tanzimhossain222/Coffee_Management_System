"use client"

import { useAuth } from "@/contexts/auth-context"
import type { UserRole } from "@/types"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (user) {
        const redirectMap: Record<UserRole, string> = {
          CUSTOMER: "/customer",
          ADMIN: "/admin",
          MANAGER: "/admin",
          STAFF: "/staff",
          DELIVERY: "/delivery",
        }
        router.push(redirectMap[user.role])
      }
    }
  }, [user, isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
