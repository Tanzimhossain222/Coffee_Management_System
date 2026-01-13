"use client"

import { OrderStatusBadge } from "@/app/(dashboard)/_components/ui/order-status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Package, RefreshCw, Truck } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

interface DeliveryOrder {
  id: string
  orderId: string
  branchName: string
  branchAddress: string
  customerName: string
  customerPhone: string | null
  deliveryAddress: string | null
  orderTotal: string
  status: string
  items: { coffeeName: string; quantity: number }[]
}

export function DeliveryOrders() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchDeliveries = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/deliveries")
      const result = await response.json()

      if (result.success) {
        setOrders(result.data)
      } else {
        setError(result.message || "Failed to fetch deliveries")
      }
    } catch (err) {
      setError("An error occurred while fetching deliveries")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDeliveries()
  }, [fetchDeliveries])

  const handleAction = async (deliveryId: string, action: string) => {
    try {
      setActionLoading(deliveryId)
      const response = await fetch(`/api/deliveries/${deliveryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      const result = await response.json()
      if (result.success) {
        await fetchDeliveries()
      } else {
        setError(result.message || "Failed to update delivery")
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
        <p className="text-muted-foreground">Loading deliveries...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchDeliveries} variant="outline">
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
        <p className="text-muted-foreground">No deliveries assigned to you yet.</p>
        <Button onClick={fetchDeliveries} variant="outline" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={fetchDeliveries} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Order #{order.orderId.slice(-6)}</CardTitle>
              <OrderStatusBadge status={order.status as any} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">{order.customerName}</p>
                {order.customerPhone && (
                  <p className="text-muted-foreground">{order.customerPhone}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${parseFloat(order.orderTotal).toFixed(2)}</p>
                <p className="text-muted-foreground">{order.items.length} items</p>
              </div>
            </div>

            <div className="space-y-1 text-sm">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.coffeeName} x{item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="text-sm bg-muted/50 rounded-lg p-3 space-y-2">
              <div>
                <p className="font-medium">Pickup from:</p>
                <p className="text-muted-foreground">{order.branchName}</p>
                <p className="text-muted-foreground text-xs">{order.branchAddress}</p>
              </div>
              <div>
                <p className="font-medium">Deliver to:</p>
                <p className="text-muted-foreground">{order.deliveryAddress || "No address provided"}</p>
              </div>
            </div>

            {order.status === "PENDING" && (
              <Button
                onClick={() => handleAction(order.id, "pickup")}
                className="w-full"
                disabled={actionLoading === order.id}
              >
                {actionLoading === order.id ? (
                  <Spinner className="h-4 w-4 mr-2" />
                ) : (
                  <Package className="h-4 w-4 mr-2" />
                )}
                Pick Up Order
              </Button>
            )}

            {order.status === "PICKED_UP" && (
              <Button
                onClick={() => handleAction(order.id, "complete")}
                className="w-full"
                disabled={actionLoading === order.id}
              >
                {actionLoading === order.id ? (
                  <Spinner className="h-4 w-4 mr-2" />
                ) : (
                  <Truck className="h-4 w-4 mr-2" />
                )}
                Mark as Delivered
              </Button>
            )}

            {order.status === "DELIVERED" && (
              <div className="text-center text-sm text-green-600 font-medium">
                ✓ Delivery Completed
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
