"use client"

import { Button } from "@/components/ui/button"
import { Coffee, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"

export function AuthNavbar() {
    const { theme, setTheme } = useTheme()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <Coffee className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        Coffee Hub
                    </span>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="h-9 w-9"
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>
            </div>
        </header>
    )
}
