"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { AlertCircle, CheckCircle, Clock, MessageSquare, RefreshCw, Ticket } from "lucide-react"
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
            <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus)}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
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
