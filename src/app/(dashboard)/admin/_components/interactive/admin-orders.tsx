"use client"

import { OrderStatusBadge } from "@/app/(dashboard)/_components/ui/order-status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Check, Package, RefreshCw, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

interface OrderItem {
  coffeeName: string
  quantity: number
  unitPrice: string
}

interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  branchName: string
  totalAmount: string
  status: string
  deliveryAddress: string | null
  deliveryAgentName: string | null
  items: OrderItem[]
  createdAt: string
}

interface DeliveryAgent {
  id: string
  authUserId: string
  name: string
  email: string
  phoneNo: string | null
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/orders")
      const result = await response.json()

      if (result.success) {
        setOrders(result.data)
      } else {
        setError(result.message || "Failed to fetch orders")
      }
    } catch (err) {
      setError("An error occurred while fetching orders")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchDeliveryAgents = useCallback(async () => {
    try {
      const response = await fetch("/api/delivery-agents")
      const result = await response.json()

      if (result.success) {
        setDeliveryAgents(result.data)
      }
    } catch (err) {
      console.error("Failed to fetch delivery agents:", err)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    fetchDeliveryAgents()
  }, [fetchOrders, fetchDeliveryAgents])

  const handleAction = async (orderId: string, action: string, agentId?: string) => {
    try {
      setActionLoading(orderId)
      const body: { action: string; deliveryAgentId?: string } = { action }
      if (agentId) {
        body.deliveryAgentId = agentId
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const result = await response.json()
      if (result.success) {
        await fetchOrders()
      } else {
        setError(result.message || "Failed to update order")
      }
    } catch (err) {
      setError("An error occurred")
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Spinner className="h-8 w-8" />
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchOrders} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No orders yet.</p>
        <Button onClick={fetchOrders} variant="outline" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={fetchOrders} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Order #{order.id.slice(-6)}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">{order.branchName}</p>
              </div>
              <OrderStatusBadge status={order.status as any} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">{order.customerName}</p>
                <p className="text-muted-foreground">{order.customerEmail}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${parseFloat(order.totalAmount).toFixed(2)}</p>
                <p className="text-muted-foreground">{order.items.length} items</p>
              </div>
            </div>

            <div className="space-y-1 text-sm">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {item.coffeeName} x{item.quantity}
                  </span>
                  <span>${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Delivery: {order.deliveryAddress || "No address provided"}</p>
              {order.deliveryAgentName && (
                <p className="text-primary">Agent: {order.deliveryAgentName}</p>
              )}
            </div>

            {order.status === "CREATED" && (
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleAction(order.id, "accept")}
                  className="flex-1"
                  disabled={actionLoading === order.id}
                >
                  {actionLoading === order.id ? (
                    <Spinner className="h-4 w-4 mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Accept
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction(order.id, "cancel")}
                  className="flex-1"
                  disabled={actionLoading === order.id}
                >
                  {actionLoading === order.id ? (
                    <Spinner className="h-4 w-4 mr-2" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  Reject
                </Button>
              </div>
            )}

            {order.status === "ACCEPTED" && (
              <div className="pt-2">
                <Select
                  onValueChange={(value) => handleAction(order.id, "assign", value)}
                  disabled={actionLoading === order.id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign delivery agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.authUserId}>
                        {agent.name} {agent.phoneNo ? `(${agent.phoneNo})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {deliveryAgents.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">No delivery agents available.</p>
                )}
              </div>
            )}

            {order.status === "ASSIGNED" && (
              <div className="text-center text-sm text-blue-600 font-medium">
                Assigned to {order.deliveryAgentName}
              </div>
            )}

            {order.status === "PICKED_UP" && (
              <div className="text-center text-sm text-orange-600 font-medium">
                Out for delivery
              </div>
            )}

            {order.status === "DELIVERED" && (
              <div className="text-center text-sm text-green-600 font-medium">
                ✓ Delivered
              </div>
            )}

            {order.status === "CANCELLED" && (
              <div className="text-center text-sm text-destructive font-medium">
                ✗ Cancelled
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
