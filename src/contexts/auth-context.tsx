"use client"

import type { UserRole } from "@/types"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// User type from backend service
export interface AuthUser {
    id: string
    email: string
    username: string
    role: UserRole
    name: string
    verified: boolean
    phoneNo?: string | null
}

// Auth result from API calls
interface AuthResult {
    success: boolean
    message?: string
    requiresVerification?: boolean
}

// Auth context state
interface AuthState {
    user: AuthUser | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<AuthResult>
    register: (input: RegisterInput) => Promise<AuthResult>
    logout: () => Promise<void>
    verifyEmail: (code: string) => Promise<AuthResult>
    resendVerification: () => Promise<AuthResult>
}

interface RegisterInput {
    name: string
    email: string
    password: string
    role: UserRole
    phoneNo?: string
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch("/api/auth/me")
                const data = await response.json()

                if (data.success && data.user) {
                    setUser(data.user)
                    setIsAuthenticated(true)
                }
            } catch (error) {
                console.error("Auth check failed:", error)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [])

    const login = async (email: string, password: string): Promise<AuthResult> => {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (data.success && data.user) {
                setUser(data.user)
                setIsAuthenticated(true)
                return {
                    success: true,
                    requiresVerification: data.requiresVerification || !data.user.verified,
                }
            }

            return {
                success: false,
                message: data.message || "Invalid email or password",
            }
        } catch (error) {
            console.error("Login error:", error)
            return {
                success: false,
                message: "An error occurred. Please try again.",
            }
        }
    }

    const register = async (input: RegisterInput): Promise<AuthResult> => {
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            })

            const data = await response.json()

            if (data.success && data.user) {
                setUser(data.user)
                setIsAuthenticated(true)
                return {
                    success: true,
                    requiresVerification: true,
                }
            }

            return {
                success: false,
                message: data.message || "Registration failed",
            }
        } catch (error) {
            console.error("Registration error:", error)
            return {
                success: false,
                message: "An error occurred. Please try again.",
            }
        }
    }

    const verifyEmail = async (code: string): Promise<AuthResult> => {
        try {
            const response = await fetch("/api/auth/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            })

            const data = await response.json()

            if (data.success && data.user) {
                setUser(data.user)
                return { success: true }
            }

            return {
                success: false,
                message: data.message || "Verification failed",
            }
        } catch (error) {
            console.error("Verification error:", error)
            return {
                success: false,
                message: "An error occurred. Please try again.",
            }
        }
    }

    const resendVerification = async (): Promise<AuthResult> => {
        try {
            const response = await fetch("/api/auth/resend-verification", {
                method: "POST",
            })

            const data = await response.json()

            return {
                success: data.success,
                message: data.message,
            }
        } catch (error) {
            console.error("Resend verification error:", error)
            return {
                success: false,
                message: "Failed to resend verification email",
            }
        }
    }

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
        } catch (error) {
            console.error("Logout error:", error)
        } finally {
            setUser(null)
            setIsAuthenticated(false)
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                login,
                register,
                logout,
                isLoading,
                verifyEmail,
                resendVerification,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
