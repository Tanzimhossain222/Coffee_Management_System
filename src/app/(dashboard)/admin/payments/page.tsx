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
import { CreditCard, DollarSign, RefreshCw, TrendingUp } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

interface Payment {
    id: string
    orderId: string
    amount: string
    method: string
    status: string
    transactionId: string | null
    customerName: string
    customerEmail: string
    createdAt: string
}

interface PaymentStats {
    totalAmount: number
    totalPayments: number
    completedPayments: number
    pendingPayments: number
    failedPayments: number
}

type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | "all"

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [stats, setStats] = useState<PaymentStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<PaymentStatus>("all")

    const fetchPayments = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            // Fetch payments list
            const url = statusFilter === "all"
                ? "/api/admin/payments"
                : `/api/admin/payments?status=${statusFilter}`
            const response = await fetch(url)
            const result = await response.json()

            if (result.success) {
                setPayments(result.data)
                setStats(result.stats)
            } else {
                setError(result.message || "Failed to fetch payments")
            }
        } catch (err) {
            setError("An error occurred while fetching payments")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }, [statusFilter])

    useEffect(() => {
        fetchPayments()
    }, [fetchPayments])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-500/10 text-yellow-600"
            case "COMPLETED":
                return "bg-green-500/10 text-green-600"
            case "FAILED":
                return "bg-red-500/10 text-red-600"
            case "REFUNDED":
                return "bg-purple-500/10 text-purple-600"
            default:
                return "bg-gray-500/10 text-gray-600"
        }
    }

    const getMethodIcon = (method: string) => {
        switch (method) {
            case "CARD":
                return <CreditCard className="h-4 w-4" />
            case "CASH":
                return <DollarSign className="h-4 w-4" />
            default:
                return <CreditCard className="h-4 w-4" />
        }
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
                    <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                    <p className="text-muted-foreground">
                        Track and manage all payment transactions
                    </p>
                </div>
                <Button onClick={fetchPayments} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${stats ? Number(stats.totalAmount).toFixed(2) : "0.00"}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Payments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalPayments || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {stats?.completedPayments || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {stats?.pendingPayments || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground ml-1">Filter by Status</span>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PaymentStatus)}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>

            {error && (
                <div className="text-center py-8 text-destructive">{error}</div>
            )}

            {!error && payments.length === 0 && (
                <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No payments found.</p>
                </div>
            )}

            {!error && payments.length > 0 && (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell className="font-mono text-sm">
                                        {payment.transactionId?.slice(0, 12) || "-"}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        #{payment.orderId.slice(-6)}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{payment.customerName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {payment.customerEmail}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getMethodIcon(payment.method)}
                                            <span className="text-sm">{payment.method}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(payment.status)}>
                                            {payment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        ${parseFloat(payment.amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(payment.createdAt).toLocaleDateString()}
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
