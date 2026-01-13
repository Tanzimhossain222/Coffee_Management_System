"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Branch } from "@/types"
import { Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { BranchFormDialog } from "../_components/ui/branch-form-dialog"
import { BranchesTable } from "../_components/ui/branches-table"
import { useBranches } from "../_hooks/use-branches"

export default function BranchesPage() {
    const { branches, isLoading, error, createBranch, updateBranch, deleteBranch } = useBranches()
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleCreate = () => {
        setSelectedBranch(null)
        setIsFormOpen(true)
    }

    const handleEdit = (branch: Branch) => {
        setSelectedBranch(branch)
        setIsFormOpen(true)
    }

    const handleDelete = (branch: Branch) => {
        setSelectedBranch(branch)
        setIsDeleteOpen(true)
    }

    const handleFormSubmit = async (data: Partial<Branch>) => {
        setIsSubmitting(true)
        try {
            if (selectedBranch) {
                const result = await updateBranch(selectedBranch.id, data)
                if (result) {
                    toast.success("Branch updated successfully")
                    setIsFormOpen(false)
                } else {
                    toast.error("Failed to update branch")
                }
            } else {
                const result = await createBranch(data)
                if (result) {
                    toast.success("Branch created successfully")
                    setIsFormOpen(false)
                } else {
                    toast.error("Failed to create branch")
                }
            }
        } catch {
            toast.error("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteConfirm = async () => {
        if (!selectedBranch) return

        setIsSubmitting(true)
        try {
            const success = await deleteBranch(selectedBranch.id)
            if (success) {
                toast.success("Branch deleted successfully")
            } else {
                toast.error("Failed to delete branch")
            }
        } catch {
            toast.error("An error occurred")
        } finally {
            setIsSubmitting(false)
            setIsDeleteOpen(false)
            setSelectedBranch(null)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-9 w-48" />
                        <Skeleton className="h-5 w-64 mt-2" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-[400px]" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <p className="text-destructive text-lg font-medium">Failed to load branches</p>
                <p className="text-muted-foreground">{error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
                    <p className="text-muted-foreground">
                        Manage your coffee shop locations
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Branch
                </Button>
            </div>

            <BranchesTable
                branches={branches}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <BranchFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                branch={selectedBranch}
                onSubmit={handleFormSubmit}
                isLoading={isSubmitting}
            />

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Branch</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{selectedBranch?.name}&quot;? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isSubmitting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
