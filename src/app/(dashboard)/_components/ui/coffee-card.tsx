import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Coffee } from "@/types"
import Image from "next/image"
import Link from "next/link"
import { AddToCartButton } from "../interactive/add-to-cart-button"

interface CoffeeCardProps {
  coffee: Coffee
}

export function CoffeeCard({ coffee }: CoffeeCardProps) {
  const categoryColors = {
    hot: "bg-orange-500/10 text-orange-600",
    cold: "bg-blue-500/10 text-blue-600",
    specialty: "bg-purple-500/10 text-purple-600",
  }

  return (
    <Card className="overflow-hidden group">
      <Link href={`/customer/menu/${coffee.id}`}>
        <div className="relative aspect-square bg-muted cursor-pointer">
          <Image
            src={coffee.image || "/placeholder.svg"}
            alt={coffee.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {!coffee.available && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/customer/menu/${coffee.id}`}>
            <h3 className="font-semibold hover:underline cursor-pointer">{coffee.name}</h3>
          </Link>
          <Badge variant="outline" className={categoryColors[coffee.category]}>
            {coffee.category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{coffee.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <span className="text-lg font-bold">${coffee.price.toFixed(2)}</span>
        <AddToCartButton coffee={coffee} />
      </CardFooter>
    </Card>
  )
}
