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
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import type { User } from "@/types"
import { Plus, Search, Shield, Truck, User as UserIcon, Users as UsersIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { UsersTable } from "../_components/ui/users-table"
import { useUsers } from "../_hooks/use-users"

interface ExtendedUser extends User {
    isActive?: boolean
}

export default function UsersPage() {
    const { users, isLoading, error, deleteUser } = useUsers()
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleEdit = (user: ExtendedUser) => {
        // For now, just show a toast - in a full implementation, open a dialog
        toast.info(`Edit user: ${user.name}`)
    }

    const handleDelete = (user: ExtendedUser) => {
        setSelectedUser(user)
        setIsDeleteOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedUser) return

        setIsDeleting(true)
        try {
            const success = await deleteUser(selectedUser.id)
            if (success) {
                toast.success("User deleted successfully")
            } else {
                toast.error("Failed to delete user")
            }
        } catch {
            toast.error("An error occurred")
        } finally {
            setIsDeleting(false)
            setIsDeleteOpen(false)
            setSelectedUser(null)
        }
    }

    // Filter users based on search and role
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = roleFilter === "all" || user.role === roleFilter
        return matchesSearch && matchesRole
    })

    // Get counts by role
    const roleCounts = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
    }, {} as Record<string, number>)

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
                <Skeleton className="h-100 w-full max-w-md" />
                <Skeleton className="h-100" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-100 text-center">
                <p className="text-destructive text-lg font-medium">Failed to load users</p>
                <p className="text-muted-foreground">{error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">
                        Manage staff, managers, and delivery personnel
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <UsersIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold">{users.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Shield className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Managers</p>
                        <p className="text-2xl font-bold">{roleCounts.MANAGER || 0}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                        <UserIcon className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Staff</p>
                        <p className="text-2xl font-bold">{roleCounts.STAFF || 0}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Truck className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Delivery</p>
                        <p className="text-2xl font-bold">{roleCounts.DELIVERY || 0}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex flex-col gap-1.5 flex-1 max-w-sm">
                    <span className="text-xs font-medium text-muted-foreground ml-1">Search Users</span>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground ml-1">Filter by Role</span>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-45">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="STAFF">Staff</SelectItem>
                            <SelectItem value="DELIVERY">Delivery</SelectItem>
                            <SelectItem value="CUSTOMER">Customer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Users Table */}
            <UsersTable
                users={filteredUsers}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{selectedUser?.name}&quot;? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
