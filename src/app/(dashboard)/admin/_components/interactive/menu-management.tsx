"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useDebounce } from "@/hooks/use-debounce"
import { Coffee as CoffeeIcon, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useState } from "react"

interface Coffee {
  id: string
  name: string
  description: string
  price: number
  categoryId: string | null
  categoryName: string | null
  available: boolean
  image: string | null
}

interface Category {
  id: string
  name: string
  description: string | null
}

export function MenuManagement() {
  const [coffees, setCoffees] = useState<Coffee[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [editingCoffee, setEditingCoffee] = useState<Coffee | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Search & Pagination state
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const limit = 10

  const fetchCoffees = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (debouncedSearch) params.append("search", debouncedSearch)

      const response = await fetch(`/api/coffees?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setCoffees(result.data.map((c: {
          id: string
          name: string
          description: string | null
          price: string
          categoryId: string | null
          categoryName: string | null
          available: boolean
          imageUrl: string | null
        }) => ({
          id: c.id,
          name: c.name,
          description: c.description || "",
          price: parseFloat(c.price),
          categoryId: c.categoryId,
          categoryName: c.categoryName,
          available: c.available,
          image: c.imageUrl,
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

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/coffees?categories=true")
      const result = await response.json()
      if (result.success && result.categories) {
        setCategories(result.categories)
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err)
    }
  }, [])

  useEffect(() => {
    fetchCoffees()
    fetchCategories()
  }, [fetchCoffees, fetchCategories])

  // Reset page when search changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const handleToggleAvailability = async (id: string, available: boolean) => {
    try {
      setActionLoading(id)
      const response = await fetch(`/api/coffees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available }),
      })
      const result = await response.json()
      if (result.success) {
        await fetchCoffees()
      } else {
        setError(result.message || "Failed to update availability")
      }
    } catch (err) {
      setError("An error occurred")
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coffee?")) return

    try {
      setActionLoading(id)
      const response = await fetch(`/api/coffees/${id}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (result.success) {
        await fetchCoffees()
      } else {
        setError(result.message || "Failed to delete coffee")
      }
    } catch (err) {
      setError("An error occurred")
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSave = async (coffee: {
    name: string
    description: string
    price: number
    categoryId: string | null
    available: boolean
  }) => {
    try {
      setActionLoading("save")
      if (editingCoffee) {
        const response = await fetch(`/api/coffees/${editingCoffee.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(coffee),
        })
        const result = await response.json()
        if (!result.success) {
          setError(result.message || "Failed to update coffee")
          return
        }
      } else {
        const response = await fetch("/api/coffees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(coffee),
        })
        const result = await response.json()
        if (!result.success) {
          setError(result.message || "Failed to create coffee")
          return
        }
      }
      await fetchCoffees()
      setIsOpen(false)
      setEditingCoffee(null)
    } catch (err) {
      setError("An error occurred")
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const openEdit = (coffee: Coffee) => {
    setEditingCoffee(coffee)
    setIsOpen(true)
  }

  const openNew = () => {
    setEditingCoffee(null)
    setIsOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Spinner className="h-8 w-8" />
        <p className="text-muted-foreground">Loading menu...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchCoffees} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-end justify-between gap-4">
        <div className="flex items-end gap-4 w-full md:w-auto">
          <div className="flex flex-col gap-1.5 w-full md:w-80">
            <span className="text-xs font-medium text-muted-foreground ml-1">Search Coffee</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Find coffee by name..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={fetchCoffees} variant="outline" size="icon" className="h-10 w-10 shrink-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Coffee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCoffee ? "Edit Coffee" : "Add New Coffee"}</DialogTitle>
            </DialogHeader>
            <CoffeeForm
              coffee={editingCoffee}
              categories={categories}
              onSave={handleSave}
              onCancel={() => setIsOpen(false)}
              isLoading={actionLoading === "save"}
            />
          </DialogContent>
        </Dialog>
      </div>

      {coffees.length === 0 ? (
        <div className="text-center py-12">
          <CoffeeIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          {search ? (
            <>
              <p className="text-muted-foreground mb-2">No results found for &quot;{search}&quot;</p>
              <Button variant="link" onClick={() => setSearch("")}>Clear search</Button>
            </>
          ) : (
            <p className="text-muted-foreground">No coffee items yet. Add your first one!</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {coffees.map((coffee) => (
              <Card key={coffee.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                    <Image src={coffee.image || "/placeholder.svg"} alt={coffee.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{coffee.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{coffee.description}</p>
                    <div className="flex gap-2 text-sm">
                      <span className="font-medium">${coffee.price.toFixed(2)}</span>
                      {coffee.categoryName && (
                        <span className="text-muted-foreground">• {coffee.categoryName}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={coffee.available}
                        onCheckedChange={(checked) => handleToggleAvailability(coffee.id, checked)}
                        disabled={actionLoading === coffee.id}
                      />
                      <span className="text-sm text-muted-foreground">
                        {coffee.available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEdit(coffee)}
                      disabled={actionLoading === coffee.id}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(coffee.id)}
                      disabled={actionLoading === coffee.id}
                    >
                      {actionLoading === coffee.id ? (
                        <Spinner className="h-4 w-4" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pt-4 flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {coffees.length} of {totalItems} items
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

interface CoffeeFormProps {
  coffee: Coffee | null
  categories: Category[]
  onSave: (coffee: {
    name: string
    description: string
    price: number
    categoryId: string | null
    available: boolean
  }) => void
  onCancel: () => void
  isLoading: boolean
}

function CoffeeForm({ coffee, categories, onSave, onCancel, isLoading }: CoffeeFormProps) {
  const [name, setName] = useState(coffee?.name || "")
  const [description, setDescription] = useState(coffee?.description || "")
  const [price, setPrice] = useState(coffee?.price.toString() || "")
  const [categoryId, setCategoryId] = useState(coffee?.categoryId || "")
  const [available, setAvailable] = useState(coffee?.available ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      description,
      price: Number.parseFloat(price),
      categoryId: categoryId || null,
      available,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={available} onCheckedChange={setAvailable} />
        <Label>Available</Label>
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? <Spinner className="h-4 w-4 mr-2" /> : null}
          Save
        </Button>
      </div>
    </form>
  )
}
