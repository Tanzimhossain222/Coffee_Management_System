"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { User, UserRole } from "@/types"
import { format } from "date-fns"
import { Building2, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

interface ExtendedUser extends User {
    isActive?: boolean
}

interface UsersTableProps {
    users: ExtendedUser[]
    onEdit: (user: ExtendedUser) => void
    onDelete: (user: ExtendedUser) => void
}

const roleColors: Record<UserRole, "default" | "secondary" | "destructive" | "outline"> = {
    ADMIN: "destructive",
    MANAGER: "default",
    STAFF: "secondary",
    DELIVERY: "outline",
    CUSTOMER: "secondary",
}

const roleLabels: Record<UserRole, string> = {
    ADMIN: "Admin",
    MANAGER: "Manager",
    STAFF: "Staff",
    DELIVERY: "Delivery",
    CUSTOMER: "Customer",
}

export function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-center border rounded-lg">
                <p className="text-muted-foreground">No users found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src="" alt={user.name} />
                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={roleColors[user.role]}>
                                    {roleLabels[user.role]}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {user.branchName ? (
                                    <div className="flex items-center gap-1 text-sm">
                                        <Building2 className="h-3 w-3 text-muted-foreground" />
                                        {user.branchName}
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground">—</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant={user.isActive ? "default" : "secondary"}>
                                    {user.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {format(new Date(user.createdAt), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Actions</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onEdit(user)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onDelete(user)}
                                            className="text-destructive"
                                            disabled={user.role === "ADMIN"}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
