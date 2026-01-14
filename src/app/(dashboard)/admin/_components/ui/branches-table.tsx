"use client"

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
import type { Branch } from "@/types"
import { format } from "date-fns"
import { Clock, Mail, MoreHorizontal, Pencil, Phone, Trash2, Users } from "lucide-react"

interface BranchesTableProps {
    branches: Branch[]
    onEdit: (branch: Branch) => void
    onDelete: (branch: Branch) => void
    onAssignManager: (branch: Branch) => void
}

export function BranchesTable({ branches, onEdit, onDelete, onAssignManager }: BranchesTableProps) {
    if (branches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-center border rounded-lg">
                <p className="text-muted-foreground">No branches found</p>
                <p className="text-sm text-muted-foreground">Create your first branch to get started</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Branch</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Manager</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {branches.map((branch) => (
                        <TableRow key={branch.id}>
                            <TableCell>
                                <div className="font-medium">{branch.name}</div>
                                <div className="text-sm text-muted-foreground">
                                    Created {format(new Date(branch.createdAt), "MMM d, yyyy")}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>{branch.address}</div>
                                <div className="text-sm text-muted-foreground">{branch.city}</div>
                            </TableCell>
                            <TableCell>
                                {branch.phoneNo && (
                                    <div className="flex items-center gap-1 text-sm">
                                        <Phone className="h-3 w-3" />
                                        {branch.phoneNo}
                                    </div>
                                )}
                                {branch.email && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        {branch.email}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                    <Clock className="h-3 w-3" />
                                    {branch.openingTime} - {branch.closingTime}
                                </div>
                            </TableCell>
                            <TableCell>
                                {branch.managerName ? (
                                    <span>{branch.managerName}</span>
                                ) : (
                                    <span className="text-muted-foreground">Unassigned</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant={branch.isActive ? "default" : "secondary"}>
                                    {branch.isActive ? "Active" : "Inactive"}
                                </Badge>
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
                                        <DropdownMenuItem onClick={() => onAssignManager(branch)}>
                                            <Users className="mr-2 h-4 w-4" />
                                            Assign Manager
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEdit(branch)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onDelete(branch)}
                                            className="text-destructive"
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
