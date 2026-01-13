"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"
import { Minus, Plus, Trash2 } from "lucide-react"
import Image from "next/image"

export function CartList() {
  const { items, updateQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">Your cart is empty. Start adding some coffee!</div>
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.coffee.id}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={item.coffee.image || "/placeholder.svg"}
                alt={item.coffee.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{item.coffee.name}</h3>
              <p className="text-sm text-muted-foreground">${item.coffee.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={() => updateQuantity(item.coffee.id, item.quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={() => updateQuantity(item.coffee.id, item.quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-right min-w-20">
              <p className="font-semibold">${(item.coffee.price * item.quantity).toFixed(2)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => removeItem(item.coffee.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
