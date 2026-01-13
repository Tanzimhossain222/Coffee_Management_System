"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/contexts/cart-context"
import { CheckCircle2, CreditCard, Loader2, Wallet, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"
import { useEffect, useState } from "react"

interface Branch {
  id: string
  name: string
  address: string
  city: string
}

type PaymentMethod = "CASH" | "CARD" | "MOBILE_BANKING" | "WALLET"

export function CheckoutForm() {
  const router = useRouter()
  const { items, totalAmount, clearCart } = useCart()
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchId, setBranchId] = useState("")
  const [address, setAddress] = useState("")
  const [orderType, setOrderType] = useState<"DELIVERY" | "PICKUP">("DELIVERY")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"processing" | "success" | "failed">("processing")
  const [orderId, setOrderId] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  // Fetch branches on mount
  useEffect(() => {
    async function fetchBranches() {
      try {
        const response = await fetch("/api/branches")
        const result = await response.json()
        if (result.success) {
          setBranches(result.data)
          if (result.data.length === 1) {
            setBranchId(result.data[0].id)
          }
        }
      } catch (err) {
        console.error("Failed to fetch branches:", err)
      }
    }
    fetchBranches()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (items.length === 0) {
      setError("Your cart is empty")
      return
    }

    if (!branchId) {
      setError("Please select a branch")
      return
    }

    if (orderType === "DELIVERY" && !address.trim()) {
      setError("Please enter a delivery address")
      return
    }

    setIsLoading(true)

    try {
      // Create order
      const orderItems = items.map((item) => ({
        coffeeId: item.coffee.id,
        quantity: item.quantity,
      }))

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          orderType,
          items: orderItems,
          deliveryAddress: orderType === "DELIVERY" ? address : undefined,
          paymentMethod,
        }),
      })

      const orderResult = await orderResponse.json()

      if (!orderResult.success) {
        setError(orderResult.message || "Failed to place order")
        setIsLoading(false)
        return
      }

      setOrderId(orderResult.data.id)

      // Show payment modal
      setShowPaymentModal(true)
      setPaymentStatus("processing")

      // Process payment
      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderResult.data.id,
          paymentMethod,
        }),
      })

      const paymentResult = await paymentResponse.json()

      if (paymentResult.success) {
        setPaymentStatus("success")
        setTransactionId(paymentResult.data.transactionId)
        await clearCart()
      } else {
        setPaymentStatus("failed")
      }
    } catch (err) {
      console.error("Failed to create order:", err)
      setError("An error occurred while placing your order")
      setShowPaymentModal(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false)
    if (paymentStatus === "success") {
      router.push("/customer/orders")
    }
  }

  const selectedBranch = branches.find((b) => b.id === branchId)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Branch Selection */}
            <div className="space-y-2">
              <Label htmlFor="branch">Select Branch</Label>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select nearest branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} - {branch.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBranch && (
                <p className="text-xs text-muted-foreground">
                  📍 {selectedBranch.address}
                </p>
              )}
            </div>

            {/* Order Type */}
            <div className="space-y-2">
              <Label htmlFor="orderType">Order Type</Label>
              <Select value={orderType} onValueChange={(v) => setOrderType(v as "DELIVERY" | "PICKUP")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DELIVERY">🚚 Delivery</SelectItem>
                  <SelectItem value="PICKUP">🏪 Pickup from Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Address */}
            {orderType === "DELIVERY" && (
              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your full delivery address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="CASH" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                    💵 Cash on Delivery/Pickup
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="CARD" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-4 w-4" /> Credit/Debit Card
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MOBILE_BANKING" id="mobile" />
                  <Label htmlFor="mobile" className="flex items-center gap-2 cursor-pointer">
                    📱 Mobile Banking
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="WALLET" id="wallet" />
                  <Label htmlFor="wallet" className="flex items-center gap-2 cursor-pointer">
                    <Wallet className="h-4 w-4" /> Digital Wallet
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}

            {/* Order Summary */}
            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span>Items ({items.length})</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Delivery Fee</span>
                <span>{orderType === "DELIVERY" ? "$2.00" : "Free"}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${(totalAmount + (orderType === "DELIVERY" ? 2 : 0)).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading || items.length === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Place Order - $${(totalAmount + (orderType === "DELIVERY" ? 2 : 0)).toFixed(2)}`
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={handlePaymentModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {paymentStatus === "processing" && "Processing Payment..."}
              {paymentStatus === "success" && "Payment Successful!"}
              {paymentStatus === "failed" && "Payment Failed"}
            </DialogTitle>
            <DialogDescription>
              {paymentStatus === "processing" && "Please wait while we process your payment."}
              {paymentStatus === "success" && "Your order has been placed successfully."}
              {paymentStatus === "failed" && "There was an issue processing your payment. Please try again."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            {paymentStatus === "processing" && (
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            )}
            {paymentStatus === "success" && (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <div className="text-center space-y-2">
                  <p className="font-medium">Order #{orderId?.slice(-6)}</p>
                  {transactionId && (
                    <p className="text-sm text-muted-foreground">
                      Transaction ID: {transactionId}
                    </p>
                  )}
                </div>
              </>
            )}
            {paymentStatus === "failed" && (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
          </div>
          {paymentStatus !== "processing" && (
            <Button onClick={handlePaymentModalClose} className="w-full">
              {paymentStatus === "success" ? "View My Orders" : "Try Again"}
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
