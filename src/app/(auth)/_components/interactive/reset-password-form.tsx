"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"

export function ResetPasswordForm() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        // Validate password strength
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword }),
            })

            const data = await response.json()

            if (data.success) {
                setSuccess(true)
            } else {
                setError(data.message || "Failed to reset password")
            }
        } catch {
            setError("An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="space-y-5">
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-lg font-semibold">Password Reset!</h3>
                        <p className="text-sm text-muted-foreground">
                            Your password has been reset successfully.
                            You can now sign in with your new password.
                        </p>
                    </div>
                </div>

                <Button
                    className="w-full h-11"
                    onClick={() => router.push("/login")}
                >
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

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

            <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">
                    Reset Code
                </Label>
                <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-character code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                    maxLength={6}
                    disabled={isLoading}
                    className="h-11 text-center text-lg tracking-widest font-mono uppercase"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                    New Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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

            <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm New Password
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
                disabled={isLoading || code.length < 6}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                    </>
                ) : (
                    <>
                        Reset Password
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                )}
            </Button>

            <Button
                type="button"
                variant="ghost"
                className="w-full h-11"
                onClick={() => router.push("/login")}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
            </Button>
        </form>
    )
}
