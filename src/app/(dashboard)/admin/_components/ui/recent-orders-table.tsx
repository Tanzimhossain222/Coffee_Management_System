"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"

interface RecentOrder {
    id: string
    customer: string
    items: number
    total: number
    status: string
    createdAt: string
}

interface RecentOrdersProps {
    orders: RecentOrder[]
}

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DELIVERED: "default",
    IN_PROGRESS: "secondary",
    PENDING: "outline",
    CANCELLED: "destructive",
}

const statusLabels: Record<string, string> = {
    DELIVERED: "Delivered",
    IN_PROGRESS: "In Progress",
    PENDING: "Pending",
    CANCELLED: "Cancelled",
}

export function RecentOrdersTable({ orders }: RecentOrdersProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead className="text-center">Items</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>{order.customer}</TableCell>
                                <TableCell className="text-center">{order.items}</TableCell>
                                <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariants[order.status] || "outline"}>
                                        {statusLabels[order.status] || order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
