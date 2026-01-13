"use client"

import type { Branch } from "@/types"
import { useCallback, useEffect, useState } from "react"

interface UseBranchesResult {
    branches: Branch[]
    isLoading: boolean
    error: string | null
    refetch: () => Promise<void>
    createBranch: (data: Partial<Branch>) => Promise<Branch | null>
    updateBranch: (id: string, data: Partial<Branch>) => Promise<Branch | null>
    deleteBranch: (id: string) => Promise<boolean>
}

export function useBranches(): UseBranchesResult {
    const [branches, setBranches] = useState<Branch[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchBranches = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await fetch("/api/admin/branches")

            if (!response.ok) {
                throw new Error("Failed to fetch branches")
            }

            const data = await response.json()
            setBranches(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchBranches()
    }, [fetchBranches])

    const createBranch = async (data: Partial<Branch>): Promise<Branch | null> => {
        try {
            const response = await fetch("/api/admin/branches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error("Failed to create branch")
            }

            const newBranch = await response.json()
            setBranches((prev) => [...prev, newBranch])
            return newBranch
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            return null
        }
    }

    const updateBranch = async (id: string, data: Partial<Branch>): Promise<Branch | null> => {
        try {
            const response = await fetch(`/api/admin/branches/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error("Failed to update branch")
            }

            const updatedBranch = await response.json()
            setBranches((prev) =>
                prev.map((branch) => (branch.id === id ? updatedBranch : branch))
            )
            return updatedBranch
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            return null
        }
    }

    const deleteBranch = async (id: string): Promise<boolean> => {
        try {
            const response = await fetch(`/api/admin/branches/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete branch")
            }

            setBranches((prev) => prev.filter((branch) => branch.id !== id))
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            return false
        }
    }

    return {
        branches,
        isLoading,
        error,
        refetch: fetchBranches,
        createBranch,
        updateBranch,
        deleteBranch,
    }
}
