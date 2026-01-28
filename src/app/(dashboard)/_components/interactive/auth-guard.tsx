"use client"

import { useAuth } from "@/contexts/auth-context"
import type { UserRole } from "@/types"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useEffect } from "react"

interface AuthGuardProps {
  children: ReactNode
  allowedRoles?: UserRole[]
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      const redirectMap: Record<UserRole, string> = {
        CUSTOMER: "/customer",
        ADMIN: "/admin",
        MANAGER: "/admin",
        STAFF: "/staff",
        DELIVERY: "/delivery",
      }
      router.push(redirectMap[user.role])
    }
  }, [user, isAuthenticated, isLoading, allowedRoles, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
