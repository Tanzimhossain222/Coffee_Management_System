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
import { MapPin, RefreshCw, Truck, User } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

interface Delivery {
    id: string
    orderId: string
    branchName: string
    branchAddress: string
    customerName: string
    customerPhone: string | null
    deliveryAddress: string | null
    orderTotal: string
    status: string
    deliveryAgentName: string | null
    createdAt: string
}

type DeliveryStatus = "PENDING" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "FAILED" | "all"

export default function AdminDeliveriesPage() {
    const [deliveries, setDeliveries] = useState<Delivery[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<DeliveryStatus>("all")

    const fetchDeliveries = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const url = statusFilter === "all"
                ? "/api/deliveries"
                : `/api/deliveries?status=${statusFilter}`
            const response = await fetch(url)
            const result = await response.json()

            if (result.success) {
                setDeliveries(result.data)
            } else {
                setError(result.message || "Failed to fetch deliveries")
            }
        } catch (err) {
            setError("An error occurred while fetching deliveries")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }, [statusFilter])

    useEffect(() => {
        fetchDeliveries()
    }, [fetchDeliveries])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-500/10 text-yellow-600"
            case "PICKED_UP":
                return "bg-blue-500/10 text-blue-600"
            case "IN_TRANSIT":
                return "bg-purple-500/10 text-purple-600"
            case "DELIVERED":
                return "bg-green-500/10 text-green-600"
            case "FAILED":
                return "bg-red-500/10 text-red-600"
            default:
                return "bg-gray-500/10 text-gray-600"
        }
    }

    // Stats
    const stats = {
        total: deliveries.length,
        pending: deliveries.filter((d) => d.status === "PENDING").length,
        inTransit: deliveries.filter((d) => ["PICKED_UP", "IN_TRANSIT"].includes(d.status)).length,
        delivered: deliveries.filter((d) => d.status === "DELIVERED").length,
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
                    <h1 className="text-3xl font-bold tracking-tight">Deliveries</h1>
                    <p className="text-muted-foreground">
                        Track and manage all delivery orders
                    </p>
                </div>
                <Button onClick={fetchDeliveries} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Deliveries
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            In Transit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{stats.inTransit}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Delivered
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DeliveryStatus)}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                        <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {error && (
                <div className="text-center py-8 text-destructive">{error}</div>
            )}

            {!error && deliveries.length === 0 && (
                <div className="text-center py-12">
                    <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No deliveries found.</p>
                </div>
            )}

            {!error && deliveries.length > 0 && (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Delivery Address</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Agent</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deliveries.map((delivery) => (
                                <TableRow key={delivery.id}>
                                    <TableCell className="font-medium">
                                        #{delivery.orderId.slice(-6)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{delivery.customerName}</p>
                                                {delivery.customerPhone && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {delivery.customerPhone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-start gap-2 max-w-xs">
                                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                            <span className="text-sm truncate">
                                                {delivery.deliveryAddress || "No address"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{delivery.branchName}</TableCell>
                                    <TableCell>
                                        {delivery.deliveryAgentName || (
                                            <span className="text-muted-foreground">Unassigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(delivery.status)}>
                                            {delivery.status.replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        ${parseFloat(delivery.orderTotal).toFixed(2)}
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
