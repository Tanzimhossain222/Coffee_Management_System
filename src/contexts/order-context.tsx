"use client"

import type { Order, OrderItem, OrderStatus } from "@/types"
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { useAuth } from "./auth-context"

interface OrderContextType {
  orders: Order[]
  isLoading: boolean
  createOrder: (items: OrderItem[], deliveryAddress: string) => Promise<Order | null>
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>
  assignDeliveryAgent: (orderId: string, agentId: string) => Promise<boolean>
  getCustomerOrders: () => Order[]
  getAdminOrders: () => Order[]
  getDeliveryOrders: () => Order[]
  refreshOrders: () => Promise<void>
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refreshOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/orders")
      const data = await response.json()

      if (data.success && data.data) {
        // Transform API response to Order format
        const transformedOrders: Order[] = data.data.map((order: {
          id: string
          customerId: string
          customerName?: string
          customerEmail?: string
          items: Array<{
            coffeeId: string
            coffeeName: string
            quantity: number
            unitPrice: number
          }>
          totalAmount: number
          status: OrderStatus
          deliveryAddress: string
          areaName?: string
          notes?: string
          delivery?: {
            status: string
            agentId?: string
            agentName?: string
          }
          createdAt: string
          updatedAt: string
        }) => ({
          id: order.id,
          customerId: order.customerId,
          customerName: order.customerName || "Unknown",
          customerEmail: order.customerEmail || "",
          items: order.items.map(item => ({
            coffeeId: item.coffeeId,
            coffeeName: item.coffeeName,
            quantity: item.quantity,
            price: item.unitPrice,
          })),
          totalAmount: order.totalAmount,
          status: order.status as OrderStatus,
          deliveryAddress: order.deliveryAddress,
          area: order.areaName || "",
          deliveryAgentId: order.delivery?.agentId,
          deliveryAgentName: order.delivery?.agentName,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
        }))

        setOrders(transformedOrders)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // Refresh orders when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshOrders()
    } else {
      setOrders([])
    }
  }, [isAuthenticated, refreshOrders])

  const createOrder = useCallback(
    async (items: OrderItem[], deliveryAddress: string): Promise<Order | null> => {
      if (!user || user.role !== "CUSTOMER") return null

      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map(item => ({
              coffeeId: item.coffeeId,
              quantity: item.quantity,
            })),
            deliveryAddress,
          }),
        })

        const data = await response.json()

        if (data.success && data.order) {
          await refreshOrders()
          return {
            id: data.order.id,
            customerId: user.id,
            customerName: user.name,
            customerEmail: user.email,
            branchId: data.order.branchId || "",
            orderType: "DELIVERY",
            items: data.order.items,
            totalAmount: data.order.totalAmount,
            status: data.order.status as OrderStatus,
            deliveryAddress,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        }

        return null
      } catch (error) {
        console.error("Failed to create order:", error)
        return null
      }
    },
    [user, refreshOrders],
  )

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus): Promise<boolean> => {
      try {
        const actionMap: Record<string, string> = {
          ACCEPTED: "accept",
          CANCELLED: "cancel",
        }

        const action = actionMap[status]
        if (!action) return false

        const response = await fetch(`/api/orders/${orderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        })

        const data = await response.json()

        if (data.success) {
          await refreshOrders()
          return true
        }

        return false
      } catch (error) {
        console.error("Failed to update order status:", error)
        return false
      }
    },
    [refreshOrders],
  )

  const assignDeliveryAgent = useCallback(
    async (orderId: string, agentId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "assign", deliveryAgentId: agentId }),
        })

        const data = await response.json()

        if (data.success) {
          await refreshOrders()
          return true
        }

        return false
      } catch (error) {
        console.error("Failed to assign delivery agent:", error)
        return false
      }
    },
    [refreshOrders],
  )

  const getCustomerOrders = useCallback((): Order[] => {
    if (!user) return []
    return orders.filter(order => order.customerId === user.id)
  }, [user, orders])

  const getAdminOrders = useCallback((): Order[] => {
    if (!user || user.role !== "ADMIN") return []
    // Admin sees all orders in their area (or all orders if no area filter needed)
    return orders
  }, [user, orders])

  const getDeliveryOrders = useCallback((): Order[] => {
    if (!user || user.role !== "DELIVERY") return []
    return orders.filter(order => order.deliveryAgentId === user.id)
  }, [user, orders])

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        createOrder,
        updateOrderStatus,
        assignDeliveryAgent,
        getCustomerOrders,
        getAdminOrders,
        getDeliveryOrders,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider")
  }
  return context
}
