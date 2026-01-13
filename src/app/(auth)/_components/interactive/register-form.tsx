"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/types"
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Shield,
  ShoppingBag,
  Truck,
  User
} from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"

const ROLES = [
    {
        value: "CUSTOMER" as UserRole,
        label: "Customer",
        description: "Order coffee and track deliveries",
        icon: ShoppingBag,
    },
    {
        value: "DELIVERY" as UserRole,
        label: "Delivery Agent",
        description: "Deliver orders to customers",
        icon: Truck,
    },
    {
        value: "MANAGER" as UserRole,
        label: "Manager",
        description: "Manage branch and staff",
        icon: Shield,
    },
] as const

export function RegisterForm() {
    const router = useRouter()
    const { register } = useAuth()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [role, setRole] = useState<UserRole>("CUSTOMER")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Validate passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        // Validate password strength
        if (password.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }

        setIsLoading(true)

        try {
            const result = await register({ name, email, password, role, phoneNo: phone })
            if (result.success) {
                // Redirect to verify email page
                router.push("/verify-email")
            } else {
                setError(result.message || "Registration failed. Please try again.")
            }
        } catch {
            setError("An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Role Selection */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">I want to join as</Label>
                <RadioGroup
                    value={role}
                    onValueChange={(value) => setRole(value as UserRole)}
                    className="grid grid-cols-3 gap-3"
                >
                    {ROLES.map((r) => {
                        const Icon = r.icon
                        return (
                            <Label
                                key={r.value}
                                htmlFor={r.value}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                                    "hover:border-primary/50 hover:bg-muted/50",
                                    role === r.value
                                        ? "border-primary bg-primary/5"
                                        : "border-border"
                                )}
                            >
                                <RadioGroupItem
                                    value={r.value}
                                    id={r.value}
                                    className="sr-only"
                                />
                                <Icon className={cn(
                                    "h-5 w-5",
                                    role === r.value ? "text-primary" : "text-muted-foreground"
                                )} />
                                <span className={cn(
                                    "text-xs font-medium text-center",
                                    role === r.value ? "text-primary" : "text-foreground"
                                )}>
                                    {r.label}
                                </span>
                            </Label>
                        )
                    })}
                </RadioGroup>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                    Full Name
                </Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-11 pl-10"
                    />
                </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-11 pl-10"
                    />
                </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number <span className="text-muted-foreground">(optional)</span>
                </Label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isLoading}
                        className="h-11 pl-10"
                    />
                </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                    Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        disabled={isLoading}
                        className="h-11 pl-10 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters
                </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-11 pl-10"
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                    </>
                ) : (
                    <>
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                )}
            </Button>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                        Already have an account?
                    </span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={() => router.push("/login")}
            >
                Sign In Instead
            </Button>

            <p className="text-xs text-center text-muted-foreground px-4">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
        </form>
    )
}
