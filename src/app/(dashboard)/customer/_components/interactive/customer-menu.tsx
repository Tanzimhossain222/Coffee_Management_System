"use client"

import { CoffeeCard } from "@/app/(dashboard)/_components/ui/coffee-card"
import { Spinner } from "@/components/ui/spinner"
import type { Coffee } from "@/types"
import { useEffect, useMemo, useState } from "react"
import { CategoryFilter } from "./category-filter"

type Category = "all" | "hot" | "cold" | "specialty"

// Map category name to category type
function mapCategory(categoryName: string | null): "hot" | "cold" | "specialty" {
  if (!categoryName) return "hot"
  const lower = categoryName.toLowerCase()
  if (lower.includes("cold") || lower.includes("iced")) return "cold"
  if (lower.includes("special")) return "specialty"
  return "hot"
}

export function CustomerMenu() {
  const [category, setCategory] = useState<Category>("all")
  const [coffees, setCoffees] = useState<Coffee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCoffees() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/coffees?available=true")
        const result = await response.json()
        if (result.success) {
          // Map API response to Coffee type
          setCoffees(result.data.map((c: {
            id: string
            name: string
            description: string | null
            price: string
            imageUrl: string | null
            available: boolean
            categoryName: string | null
          }) => ({
            id: c.id,
            name: c.name,
            description: c.description || "",
            price: typeof c.price === 'string' ? parseFloat(c.price) : c.price,
            image: c.imageUrl || "/placeholder.svg",
            available: c.available,
            category: mapCategory(c.categoryName)
          })))
        } else {
          setError(result.message || "Failed to fetch coffees")
        }
      } catch (err) {
        setError("An error occurred while fetching coffees")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCoffees()
  }, [])

  const filteredCoffees = useMemo(() => {
    if (category === "all") return coffees
    return coffees.filter((c) => c.category === category)
  }, [coffees, category])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Spinner className="h-8 w-8" />
        <p className="text-muted-foreground">Loading coffee menu...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coffee Menu</h1>
        <CategoryFilter value={category} onChange={setCategory} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCoffees.map((coffee) => (
          <CoffeeCard key={coffee.id} coffee={coffee} />
        ))}
      </div>

      {filteredCoffees.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No coffees found in this category.</div>
      )}
    </div>
  )
}
