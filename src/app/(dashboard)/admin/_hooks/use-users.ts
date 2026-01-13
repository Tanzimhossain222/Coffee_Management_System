"use client"

import type { User, UserRole } from "@/types"
import { useCallback, useEffect, useState } from "react"

interface ExtendedUser extends User {
    isActive?: boolean
}

interface UseUsersOptions {
    role?: UserRole
    branchId?: string
}

interface UseUsersResult {
    users: ExtendedUser[]
    isLoading: boolean
    error: string | null
    refetch: () => Promise<void>
    createUser: (data: Partial<ExtendedUser>) => Promise<ExtendedUser | null>
    updateUser: (id: string, data: Partial<ExtendedUser>) => Promise<ExtendedUser | null>
    deleteUser: (id: string) => Promise<boolean>
}

export function useUsers(options?: UseUsersOptions): UseUsersResult {
    const [users, setUsers] = useState<ExtendedUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const params = new URLSearchParams()
            if (options?.role) params.set("role", options.role)
            if (options?.branchId) params.set("branchId", options.branchId)

            const url = `/api/admin/users${params.toString() ? `?${params.toString()}` : ""}`
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error("Failed to fetch users")
            }

            const data = await response.json()
            setUsers(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }, [options?.role, options?.branchId])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const createUser = async (data: Partial<ExtendedUser>): Promise<ExtendedUser | null> => {
        try {
            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error("Failed to create user")
            }

            const newUser = await response.json()
            setUsers((prev) => [...prev, newUser])
            return newUser
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            return null
        }
    }

    const updateUser = async (id: string, data: Partial<ExtendedUser>): Promise<ExtendedUser | null> => {
        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error("Failed to update user")
            }

            const updatedUser = await response.json()
            setUsers((prev) =>
                prev.map((user) => (user.id === id ? updatedUser : user))
            )
            return updatedUser
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            return null
        }
    }

    const deleteUser = async (id: string): Promise<boolean> => {
        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete user")
            }

            setUsers((prev) => prev.filter((user) => user.id !== id))
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            return false
        }
    }

    return {
        users,
        isLoading,
        error,
        refetch: fetchUsers,
        createUser,
        updateUser,
        deleteUser,
    }
}
