"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"

export function ForgotPasswordForm() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (data.success) {
                setSuccess(true)
            } else {
                setError(data.message || "Failed to send reset email")
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
                        <h3 className="text-lg font-semibold">Check your email</h3>
                        <p className="text-sm text-muted-foreground">
                            We sent a password reset link to
                        </p>
                        <p className="text-sm font-medium">{email}</p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    className="w-full h-11"
                    onClick={() => router.push("/reset-password")}
                >
                    Enter Reset Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    className="w-full h-11"
                    onClick={() => router.push("/login")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
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
                <p className="text-xs text-muted-foreground">
                    {"Enter the email address associated with your account"}
                </p>
            </div>

            <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                    </>
                ) : (
                    <>
                        Send Reset Link
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
