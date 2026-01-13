"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import type { Coffee } from "@/types"
import { Plus } from "lucide-react"

interface AddToCartButtonProps {
  coffee: Coffee
  size?: "sm" | "default" | "lg"
}

export function AddToCartButton({ coffee, size = "sm" }: AddToCartButtonProps) {
  const { addItem } = useCart()

  const handleClick = () => {
    addItem(coffee)
  }

  return (
    <Button size={size} onClick={handleClick} disabled={!coffee.available}>
      <Plus className="h-4 w-4 mr-1" />
      Add to Cart
    </Button>
  )
}
