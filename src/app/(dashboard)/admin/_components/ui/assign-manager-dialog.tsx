"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import type { Branch } from "@/types"
import { useEffect, useState } from "react"

interface StaffMember {
    id: string
    authUserId: string
    name: string
    email: string
    phoneNo: string | null
    role: string
    branchId: string | null
    branchName: string | null
}

interface AssignManagerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    branch: Branch | null
    onAssign: (managerId: string) => Promise<void>
    isLoading?: boolean
}

export function AssignManagerDialog({
    open,
    onOpenChange,
    branch,
    onAssign,
    isLoading,
}: AssignManagerDialogProps) {
    const [managers, setManagers] = useState<StaffMember[]>([])
    const [selectedManagerId, setSelectedManagerId] = useState<string>("")
    const [isLoadingManagers, setIsLoadingManagers] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (open && branch) {
            fetchManagers()
        }
    }, [open, branch])

    const fetchManagers = async () => {
        try {
            setIsLoadingManagers(true)
            setError(null)
            const response = await fetch("/api/users?role=MANAGER&available=true")
            const result = await response.json()

            if (result.success) {
                setManagers(result.data)
            } else {
                setError(result.message || "Failed to fetch managers")
            }
        } catch (err) {
            setError("Failed to fetch managers")
            console.error(err)
        } finally {
            setIsLoadingManagers(false)
        }
    }

    const handleAssign = async () => {
        if (!selectedManagerId) {
            setError("Please select a manager")
            return
        }

        try {
            await onAssign(selectedManagerId)
            setSelectedManagerId("")
            onOpenChange(false)
        } catch (err) {
            setError("Failed to assign manager")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Assign Manager</DialogTitle>
                    <DialogDescription>
                        Select a manager to assign to {branch?.name}
                    </DialogDescription>
                </DialogHeader>

                {isLoadingManagers ? (
                    <div className="flex items-center justify-center py-8">
                        <Spinner className="h-6 w-6" />
                    </div>
                ) : error ? (
                    <div className="text-center text-destructive py-4">
                        <p>{error}</p>
                    </div>
                ) : managers.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                        <p>No available managers found</p>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <Select value={selectedManagerId} onValueChange={setSelectedManagerId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a manager" />
                            </SelectTrigger>
                            <SelectContent>
                                {managers.map((manager) => (
                                    <SelectItem key={manager.authUserId} value={manager.authUserId}>
                                        <div className="flex flex-col">
                                            <span>{manager.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {manager.email}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={isLoading || !selectedManagerId || isLoadingManagers}
                    >
                        {isLoading ? <Spinner className="h-4 w-4 mr-2" /> : null}
                        {isLoading ? "Assigning..." : "Assign"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
