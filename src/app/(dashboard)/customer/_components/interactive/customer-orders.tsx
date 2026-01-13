"use client"

import { OrderStatusBadge } from "@/app/(dashboard)/_components/ui/order-status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ChevronLeft, ChevronRight, Package, RefreshCw } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

interface OrderItem {
  coffeeName: string
  quantity: number
  unitPrice: string
}

interface Order {
  id: string
  branchName: string
  totalAmount: string
  status: string
  deliveryAddress: string | null
  deliveryAgentName: string | null
  orderType: string
  items: OrderItem[]
  createdAt: string
}

interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [page, setPage] = useState(1)
  const limit = 10

  const fetchOrders = useCallback(async (pageNum: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/orders?page=${pageNum}&limit=${limit}`)
      const result = await response.json()

      if (result.success) {
        setOrders(result.data)
        setMeta(result.meta)
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

  useEffect(() => {
    fetchOrders(page)
  }, [fetchOrders, page])

  const handlePrevPage = () => {
    if (meta?.hasPrevPage) {
      setPage((p) => p - 1)
    }
  }

  const handleNextPage = () => {
    if (meta?.hasNextPage) {
      setPage((p) => p + 1)
    }
  }

  if (isLoading && orders.length === 0) {
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
        <Button onClick={() => fetchOrders(page)} variant="outline">
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
        <p className="text-muted-foreground">You have no orders yet. Start ordering some coffee!</p>
        <Button onClick={() => fetchOrders(page)} variant="outline" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh and pagination info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {meta && `Showing ${orders.length} of ${meta.totalItems} orders`}
        </div>
        <Button onClick={() => fetchOrders(page)} variant="outline" size="sm" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Orders List */}
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
          <CardContent className="space-y-3">
            <div className="space-y-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.coffeeName} x{item.quantity}
                  </span>
                  <span>${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t flex justify-between font-medium">
              <span>Total</span>
              <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="capitalize">Type: {order.orderType.toLowerCase()}</p>
              {order.deliveryAddress && (
                <p>Delivery to: {order.deliveryAddress}</p>
              )}
              {order.deliveryAgentName && (
                <p className="text-primary">Agent: {order.deliveryAgentName}</p>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Ordered: {new Date(order.createdAt).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={!meta.hasPrevPage || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Page {meta.currentPage} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!meta.hasNextPage || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
