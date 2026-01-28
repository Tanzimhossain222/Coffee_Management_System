"use client"

import type { Coffee } from "@/types"
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

interface CartItem {
  id: string // Cart item ID from database
  coffee: Coffee
  quantity: number
}

interface CartState {
  items: CartItem[]
  isLoading: boolean
  addItem: (coffee: Coffee) => Promise<void>
  removeItem: (coffeeId: string) => Promise<void>
  updateQuantity: (coffeeId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  totalItems: number
  totalAmount: number
}

const CartContext = createContext<CartState | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/cart")
      const result = await response.json()

      if (result.success) {
        // Map API response to CartItem format
        const cartItems: CartItem[] = result.data.items.map((item: {
          id: string
          coffeeId: string
          coffeeName: string
          coffeePrice: string
          coffeeImageUrl: string | null
          categoryName: string | null
          quantity: number
        }) => ({
          id: item.id,
          coffee: {
            id: item.coffeeId,
            name: item.coffeeName,
            price: parseFloat(item.coffeePrice),
            image: item.coffeeImageUrl || "/placeholder.svg",
            category: mapCategory(item.categoryName),
            description: "",
            available: true,
          },
          quantity: item.quantity,
        }))
        setItems(cartItems)
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Helper function to map category name to type
  function mapCategory(categoryName: string | null): "hot" | "cold" | "specialty" {
    if (!categoryName) return "hot"
    const name = categoryName.toLowerCase()
    if (name.includes("cold") || name.includes("iced")) return "cold"
    if (name.includes("special") || name.includes("premium")) return "specialty"
    return "hot"
  }

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addItem = async (coffee: Coffee) => {
    try {
      // Optimistic update
      setItems((prev) => {
        const existing = prev.find((item) => item.coffee.id === coffee.id)
        if (existing) {
          return prev.map((item) =>
            item.coffee.id === coffee.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        }
        return [...prev, { id: `temp-${coffee.id}`, coffee, quantity: 1 }]
      })

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coffeeId: coffee.id, quantity: 1 }),
      })

      const result = await response.json()
      if (!result.success) {
        // Rollback on failure
        await fetchCart()
      } else {
        // Update with real ID from server
        await fetchCart()
      }
    } catch (error) {
      console.error("Failed to add item:", error)
      await fetchCart()
    }
  }

  const removeItem = async (coffeeId: string) => {
    try {
      const item = items.find((i) => i.coffee.id === coffeeId)
      if (!item) return

      // Optimistic update
      setItems((prev) => prev.filter((i) => i.coffee.id !== coffeeId))

      const response = await fetch(`/api/cart/${item.id}`, {
        method: "DELETE",
      })

      const result = await response.json()
      if (!result.success) {
        await fetchCart()
      }
    } catch (error) {
      console.error("Failed to remove item:", error)
      await fetchCart()
    }
  }

  const updateQuantity = async (coffeeId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(coffeeId)
      return
    }

    try {
      const item = items.find((i) => i.coffee.id === coffeeId)
      if (!item) return

      // Optimistic update
      setItems((prev) => prev.map((i) =>
        i.coffee.id === coffeeId ? { ...i, quantity } : i
      ))

      const response = await fetch(`/api/cart/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      })

      const result = await response.json()
      if (!result.success) {
        await fetchCart()
      }
    } catch (error) {
      console.error("Failed to update quantity:", error)
      await fetchCart()
    }
  }

  const clearCart = async () => {
    try {
      // Optimistic update
      setItems([])

      const response = await fetch("/api/cart", {
        method: "DELETE",
      })

      const result = await response.json()
      if (!result.success) {
        await fetchCart()
      }
    } catch (error) {
      console.error("Failed to clear cart:", error)
      await fetchCart()
    }
  }

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + item.coffee.price * item.quantity, 0), [items])

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        refreshCart: fetchCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
