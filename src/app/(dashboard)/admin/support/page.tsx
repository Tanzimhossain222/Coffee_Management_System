"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { AlertCircle, CheckCircle, Clock, Eye, MessageSquare, RefreshCw, Ticket, Trash2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

interface SupportTicket {
    id: string
    customerId: string
    customerName: string
    customerEmail: string
    orderId: string | null
    subject: string
    description: string
    status: string
    priority: string
    assignedToName: string | null
    createdAt: string
    resolvedAt: string | null
}

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "all"

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<TicketStatus>("all")

    const fetchTickets = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const url = statusFilter === "all"
                ? "/api/admin/support"
                : `/api/admin/support?status=${statusFilter}`
            const response = await fetch(url)
            const result = await response.json()

            if (result.success) {
                setTickets(result.data)
            } else {
                setError(result.message || "Failed to fetch support tickets")
            }
        } catch (err) {
            setError("An error occurred while fetching support tickets")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }, [statusFilter])

    useEffect(() => {
        fetchTickets()
    }, [fetchTickets])

    const handleStatusChange = async (ticketId: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/admin/support/${ticketId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            })
            const result = await response.json()

            if (result.success) {
                await fetchTickets()
                toast.success("Ticket status updated")
            } else {
                toast.error(result.message || "Failed to update ticket")
            }
        } catch (err) {
            toast.error("An error occurred")
            console.error(err)
        }
    }

    const handleDeleteTicket = async (ticketId: string) => {
        if (!confirm("Are you sure you want to delete this ticket?")) return

        try {
            const response = await fetch(`/api/admin/support/${ticketId}`, {
                method: "DELETE",
            })
            const result = await response.json()

            if (result.success) {
                setTickets(tickets.filter(t => t.id !== ticketId))
                toast.success("Ticket deleted")
            } else {
                toast.error(result.message || "Failed to delete ticket")
            }
        } catch (err) {
            toast.error("An error occurred")
            console.error(err)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "OPEN":
                return "bg-red-500/10 text-red-600"
            case "IN_PROGRESS":
                return "bg-yellow-500/10 text-yellow-600"
            case "RESOLVED":
                return "bg-green-500/10 text-green-600"
            case "CLOSED":
                return "bg-gray-500/10 text-gray-600"
            default:
                return "bg-gray-500/10 text-gray-600"
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "HIGH":
                return "bg-red-500/10 text-red-600"
            case "MEDIUM":
                return "bg-yellow-500/10 text-yellow-600"
            case "LOW":
                return "bg-green-500/10 text-green-600"
            default:
                return "bg-gray-500/10 text-gray-600"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "OPEN":
                return <AlertCircle className="h-4 w-4" />
            case "IN_PROGRESS":
                return <Clock className="h-4 w-4" />
            case "RESOLVED":
                return <CheckCircle className="h-4 w-4" />
            default:
                return <Ticket className="h-4 w-4" />
        }
    }

    // Stats
    const stats = {
        total: tickets.length,
        open: tickets.filter((t) => t.status === "OPEN").length,
        inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
        resolved: tickets.filter((t) => t.status === "RESOLVED").length,
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-5 w-64 mt-2" />
                </div>
                <div className="grid sm:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
                    <p className="text-muted-foreground">
                        Manage customer support requests
                    </p>
                </div>
                <Button onClick={fetchTickets} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Tickets
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            Open
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.open}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            In Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Resolved
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground ml-1">Filter by Status</span>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus)}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {error && (
                <div className="text-center py-8 text-destructive">{error}</div>
            )}

            {!error && tickets.length === 0 && (
                <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No support tickets found.</p>
                </div>
            )}

            {!error && tickets.length > 0 && (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ticket</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell className="font-mono text-sm">
                                        #{ticket.id.slice(-6)}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{ticket.customerName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {ticket.customerEmail}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs">
                                        <p className="font-medium truncate">{ticket.subject}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {ticket.description}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getPriorityColor(ticket.priority)}>
                                            {ticket.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(ticket.status)}>
                                            <span className="flex items-center gap-1">
                                                {getStatusIcon(ticket.status)}
                                                {ticket.status.replace("_", " ")}
                                            </span>
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <Badge className={getStatusColor(ticket.status)}>
                                                                {ticket.status}
                                                            </Badge>
                                                            <Badge className={getPriorityColor(ticket.priority)}>
                                                                {ticket.priority}
                                                            </Badge>
                                                        </div>
                                                        <DialogTitle className="text-2xl">{ticket.subject}</DialogTitle>
                                                        <DialogDescription className="flex items-center gap-4 text-sm mt-2">
                                                            <span>Customer: <strong>{ticket.customerName}</strong></span>
                                                            {ticket.orderId && <span>Order ID: <strong>{ticket.orderId}</strong></span>}
                                                            <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="mt-6 p-4 bg-muted rounded-lg whitespace-pre-wrap">
                                                        {ticket.description}
                                                    </div>
                                                    <div className="mt-6 grid grid-cols-2 gap-4 bg-card p-4 border rounded-lg">
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium">Status</p>
                                                            <Select
                                                                value={ticket.status}
                                                                onValueChange={(v) => handleStatusChange(ticket.id, v)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="OPEN">Open</SelectItem>
                                                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                                                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium">Priority</p>
                                                            <Select
                                                                value={ticket.priority}
                                                                onValueChange={async (v) => {
                                                                    try {
                                                                        const response = await fetch(`/api/admin/support/${ticket.id}`, {
                                                                            method: "PATCH",
                                                                            headers: { "Content-Type": "application/json" },
                                                                            body: JSON.stringify({ priority: v }),
                                                                        })
                                                                        const result = await response.json()
                                                                        if (result.success) {
                                                                            await fetchTickets()
                                                                            toast.success("Priority updated")
                                                                        }
                                                                    } catch (err) {
                                                                        toast.error("Failed to update priority")
                                                                    }
                                                                }}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="LOW">Low</SelectItem>
                                                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                                                    <SelectItem value="HIGH">High</SelectItem>
                                                                    <SelectItem value="URGENT">Urgent</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="col-span-2 pt-2 flex justify-between items-center border-t mt-2">
                                                            <span className="text-xs text-muted-foreground">ID: {ticket.id}</span>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDeleteTicket(ticket.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete Ticket
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            <Select
                                                value={ticket.status}
                                                onValueChange={(v) => handleStatusChange(ticket.id, v)}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="OPEN">Open</SelectItem>
                                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDeleteTicket(ticket.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    )
}
