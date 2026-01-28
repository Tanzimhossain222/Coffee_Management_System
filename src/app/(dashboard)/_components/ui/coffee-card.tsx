import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Coffee } from "@/types"
import { Flame } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { AddToCartButton } from "../interactive/add-to-cart-button"

interface CoffeeCardProps {
  coffee: Coffee
}

export function CoffeeCard({ coffee }: CoffeeCardProps) {
  const categoryColors = {
    hot: "bg-orange-500/10 text-orange-600 border-orange-200/50",
    cold: "bg-blue-500/10 text-blue-600 border-blue-200/50",
    specialty: "bg-purple-500/10 text-purple-600 border-purple-200/50",
  }

  return (
    <Card className="overflow-hidden group border-none bg-white transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 rounded-[2.5rem]">
      <Link href={`/customer/menu/${coffee.id}`}>
        <div className="relative aspect-4/5 bg-muted cursor-pointer overflow-hidden">
          <Image
            src={coffee.image || "/placeholder.svg"}
            alt={coffee.name}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          {!coffee.available ? (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center">
              <Badge variant="secondary" className="px-6 py-2 rounded-xl font-black uppercase tracking-tighter shadow-xl">
                Sold Out
              </Badge>
            </div>
          ) : (
            coffee.price > 5 && (
              <div className="absolute top-4 left-4">
                 <Badge className="bg-orange-500/90 text-white border-none px-3 py-1 text-[10px] font-black rounded-full italic uppercase tracking-wider backdrop-blur-sm">
                    <Flame className="h-3 w-3 mr-1 fill-white" /> Popular
                </Badge>
              </div>
            )
          )}
        </div>
      </Link>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <Badge variant="outline" className={cn("px-3 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full border-2", categoryColors[coffee.category])}>
              {coffee.category}
            </Badge>
            <Link href={`/customer/menu/${coffee.id}`}>
              <h3 className="text-xl font-black tracking-tight hover:text-primary transition-colors cursor-pointer leading-none pt-1">
                {coffee.name}
              </h3>
            </Link>
          </div>
        </div>
        <p className="text-xs text-muted-foreground/80 font-medium italic line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {coffee.description}
        </p>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Price</span>
          <span className="text-2xl font-black text-foreground tracking-tighter">${coffee.price.toFixed(2)}</span>
        </div>
        <AddToCartButton
            coffee={coffee}
            className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        />
      </CardFooter>
    </Card>
  )
}
