"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Mail, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"
import { useEffect, useState } from "react"

export function VerifyEmailForm() {
    const router = useRouter()
    const { user, verifyEmail, resendVerification } = useAuth()
    const [code, setCode] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)

    // Redirect if not logged in or already verified
    useEffect(() => {
        if (!user) {
            router.push("/login")
        } else if (user.verified) {
            router.push("/dashboard")
        }
    }, [user, router])

    // Cooldown timer for resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [resendCooldown])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        setIsLoading(true)

        try {
            const result = await verifyEmail(code)
            if (result.success) {
                setSuccess("Email verified successfully! Redirecting...")
                setTimeout(() => router.push("/dashboard"), 1500)
            } else {
                setError(result.message || "Invalid verification code")
            }
        } catch {
            setError("An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleResend = async () => {
        setError("")
        setSuccess("")
        setIsResending(true)

        try {
            const result = await resendVerification()
            if (result.success) {
                setSuccess("Verification code sent! Check your email.")
                setResendCooldown(60) // 60 second cooldown
            } else {
                setError(result.message || "Failed to resend code")
            }
        } catch {
            setError("Failed to resend verification code")
        } finally {
            setIsResending(false)
        }
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email indicator */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                        Verification code sent to
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                    </p>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="border-green-500/50 bg-green-500/10 text-green-600 animate-in fade-in-0 slide-in-from-top-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">
                    Verification Code
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
                    className="h-12 text-center text-lg tracking-widest font-mono uppercase"
                />
                <p className="text-xs text-muted-foreground">
                    Enter the code we sent to your email. Code expires in 24 hours.
                </p>
            </div>

            <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={isLoading || code.length < 6}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                    </>
                ) : (
                    <>
                        Verify Email
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
                        {"Didn't receive the code?"}
                    </span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
            >
                {isResending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                    </>
                ) : resendCooldown > 0 ? (
                    <>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Resend in {resendCooldown}s
                    </>
                ) : (
                    <>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Resend Code
                    </>
                )}
            </Button>
        </form>
    )
}
