"use client"

import { Button } from "@/components/ui/button"

type Category = "all" | "hot" | "cold" | "specialty"

interface CategoryFilterProps {
  value: Category
  onChange: (category: Category) => void
}

const categories: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hot", label: "Hot" },
  { value: "cold", label: "Cold" },
  { value: "specialty", label: "Specialty" },
]

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-1">
      {categories.map((cat) => (
        <Button
          key={cat.value}
          variant={value === cat.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(cat.value)}
        >
          {cat.label}
        </Button>
      ))}
    </div>
  )
}
