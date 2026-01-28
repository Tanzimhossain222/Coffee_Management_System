"use client"

import { CoffeeCard } from "@/app/(dashboard)/_components/ui/coffee-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Spinner } from "@/components/ui/spinner"
import { useDebounce } from "@/hooks/use-debounce"
import type { Coffee } from "@/types"
import { Search } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
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

  // Search & Pagination state
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const limit = 8

  const fetchCoffees = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        available: "true",
        page: page.toString(),
        limit: limit.toString(),
      })

      if (debouncedSearch) {
        params.append("search", debouncedSearch)
      }

      const response = await fetch(`/api/coffees?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        // Map API response to Coffee type
        setCoffees(result.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description || "",
          price: typeof c.price === 'string' ? parseFloat(c.price) : c.price,
          image: c.imageUrl || "/placeholder.svg",
          available: c.available,
          category: mapCategory(c.categoryName)
        })))
        setTotalPages(result.totalPages || 1)
        setTotalItems(result.total || 0)
      } else {
        setError(result.message || "Failed to fetch coffees")
      }
    } catch (err) {
      setError("An error occurred while fetching coffees")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, page])

  useEffect(() => {
    fetchCoffees()
  }, [fetchCoffees])

  // Reset page when search changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  // Still keep category filtering on client for now as it's easier
  // without knowing exact category IDs here, but combined with server pagination
  // it might be slightly incorrect (only filters current page).
  // Ideally we should pass category to server.
  const filteredCoffees = coffees.filter((c) => {
    if (category === "all") return true
    return c.category === category
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-2 border-primary/5 pb-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            <Search className="h-3 w-3" /> Explore Selection
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-foreground leading-none">
            Coffee <span className="text-primary italic">Menu</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium italic">Discover our carefully crafted beverages, roasted for perfection.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search by roast or origin..."
              className="pl-11 h-14 rounded-2xl bg-white border-2 border-muted focus:border-primary transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CategoryFilter value={category} onChange={setCategory} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <div className="relative">
            <Spinner className="h-16 w-16 text-primary" />
            <div className="absolute inset-0 m-auto h-8 w-8 bg-primary/20 rounded-full animate-ping" />
          </div>
          <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] animate-pulse">Brewing your menu experience...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-destructive/5 rounded-[3rem] border-4 border-dashed border-destructive/20 text-destructive font-black uppercase tracking-widest mx-auto max-w-2xl px-10">
          <div className="mb-4 text-4xl font-black">!</div>
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCoffees.map((coffee) => (
              <div key={coffee.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${coffees.indexOf(coffee) * 50}ms` }}>
                <CoffeeCard coffee={coffee} />
              </div>
            ))}
          </div>

          {filteredCoffees.length === 0 && (
            <div className="text-center py-32 bg-secondary/10 rounded-[4rem] border-4 border-dashed border-muted/50 max-w-4xl mx-auto px-10">
              <div className="h-24 w-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Search className="h-12 w-12 text-muted-foreground opacity-30" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-foreground/70">No Grounds Found</h3>
              <p className="text-muted-foreground font-medium italic mb-10 text-lg">We couldn't find any coffee matching your current filters.</p>
              <Button
                variant="outline"
                onClick={() => {setSearch(""); setCategory("all")}}
                className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest border-2 hover:bg-primary hover:text-white transition-all shadow-xl"
              >
                Clear All Filters
              </Button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pt-8 flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {Math.min(filteredCoffees.length, limit)} of {totalItems} items
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (page > 1) setPage(page - 1)
                      }}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        href="#"
                        isActive={page === i + 1}
                        onClick={(e) => {
                          e.preventDefault()
                          setPage(i + 1)
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (page < totalPages) setPage(page + 1)
                      }}
                      className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  )
}
