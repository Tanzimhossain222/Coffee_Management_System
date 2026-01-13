"use client"

import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { OrderProvider } from "@/contexts/order-context"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>{children}</OrderProvider>
      </CartProvider>
    </AuthProvider>
  )
}
