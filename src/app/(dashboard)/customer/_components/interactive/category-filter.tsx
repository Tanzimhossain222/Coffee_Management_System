"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
    <div className="flex bg-secondary/20 p-1.5 rounded-2xl gap-1 border-2 border-secondary/10">
      {categories.map((cat) => (
        <Button
          key={cat.value}
          variant={value === cat.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(cat.value)}
          className={cn(
            "rounded-xl px-6 h-10 font-black uppercase tracking-widest text-[10px] transition-all",
            value === cat.value
              ? "shadow-lg scale-100"
              : "text-muted-foreground hover:text-foreground hover:bg-white/50 scale-95 opacity-70"
          )}
        >
          {cat.label}
        </Button>
      ))}
    </div>
  )
}
