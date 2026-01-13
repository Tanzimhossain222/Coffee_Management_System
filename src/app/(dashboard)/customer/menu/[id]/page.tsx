"use client"

import { AddToCartButton } from "@/app/(dashboard)/_components/interactive/add-to-cart-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import type { Coffee } from "@/types"
import { ArrowLeft, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface ReviewData {
    id: string
    customerName: string
    rating: number
    content: string | null
    createdAt: string
}

interface CoffeeDetail {
    id: string
    name: string
    description: string | null
    price: string
    imageUrl: string | null
    available: boolean
    categoryName: string | null
}

// Map category name to category type
function mapCategory(categoryName: string | null): "hot" | "cold" | "specialty" {
    if (!categoryName) return "hot"
    const lower = categoryName.toLowerCase()
    if (lower.includes("cold") || lower.includes("iced")) return "cold"
    if (lower.includes("special")) return "specialty"
    return "hot"
}

export default function CoffeeDetailPage() {
    const params = useParams()
    const coffeeId = params.id as string

    const [coffee, setCoffee] = useState<CoffeeDetail | null>(null)
    const [relatedProducts, setRelatedProducts] = useState<CoffeeDetail[]>([])
    const [reviews, setReviews] = useState<ReviewData[]>([])
    const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, totalReviews: 0 })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Review form state
    const [newRating, setNewRating] = useState(5)
    const [newReviewContent, setNewReviewContent] = useState("")
    const [isSubmittingReview, setIsSubmittingReview] = useState(false)
    const [reviewError, setReviewError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true)
                setError(null)

                // Fetch coffee details with related products and review summary
                const coffeeRes = await fetch(`/api/coffees/${coffeeId}?includeRelated=true&includeReviews=true`)
                const coffeeResult = await coffeeRes.json()

                if (!coffeeResult.success) {
                    setError(coffeeResult.message || "Failed to fetch coffee")
                    return
                }

                setCoffee(coffeeResult.data)
                setRelatedProducts(coffeeResult.relatedProducts || [])
                setReviewSummary(coffeeResult.reviewSummary || { averageRating: 0, totalReviews: 0 })

                // Fetch reviews
                const reviewsRes = await fetch(`/api/coffees/${coffeeId}/reviews?limit=10`)
                const reviewsResult = await reviewsRes.json()

                if (reviewsResult.success) {
                    setReviews(reviewsResult.data)
                }
            } catch (err) {
                setError("An error occurred while fetching data")
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        if (coffeeId) {
            fetchData()
        }
    }, [coffeeId])

    const handleSubmitReview = async () => {
        setReviewError(null)
        setIsSubmittingReview(true)

        try {
            const res = await fetch(`/api/coffees/${coffeeId}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rating: newRating,
                    content: newReviewContent || undefined,
                }),
            })

            const result = await res.json()

            if (result.success) {
                // Refresh reviews
                const reviewsRes = await fetch(`/api/coffees/${coffeeId}/reviews?limit=10`)
                const reviewsResult = await reviewsRes.json()
                if (reviewsResult.success) {
                    setReviews(reviewsResult.data)
                    setReviewSummary(reviewsResult.summary)
                }
                setNewRating(5)
                setNewReviewContent("")
            } else {
                setReviewError(result.message || "Failed to submit review")
            }
        } catch (err) {
            setReviewError("An error occurred while submitting review")
            console.error(err)
        } finally {
            setIsSubmittingReview(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Spinner className="h-8 w-8" />
                <p className="text-muted-foreground">Loading coffee details...</p>
            </div>
        )
    }

    if (error || !coffee) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive mb-4">{error || "Coffee not found"}</p>
                <Link href="/customer">
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Menu
                    </Button>
                </Link>
            </div>
        )
    }

    const coffeeMapped: Coffee = {
        id: coffee.id,
        name: coffee.name,
        description: coffee.description || "",
        price: parseFloat(coffee.price),
        image: coffee.imageUrl || "/placeholder.svg",
        available: coffee.available,
        category: mapCategory(coffee.categoryName),
    }

    const categoryColors = {
        hot: "bg-orange-500/10 text-orange-600",
        cold: "bg-blue-500/10 text-blue-600",
        specialty: "bg-purple-500/10 text-purple-600",
    }

    return (
        <div className="space-y-8">
            {/* Back Button */}
            <Link href="/customer">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Menu
                </Button>
            </Link>

            {/* Product Details */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Image */}
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                    <Image
                        src={coffee.imageUrl || "/placeholder.svg"}
                        alt={coffee.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    {!coffee.available && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <Badge variant="secondary" className="text-lg px-4 py-2">
                                Out of Stock
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="space-y-6">
                    <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <h1 className="text-3xl font-bold">{coffee.name}</h1>
                            <Badge variant="outline" className={categoryColors[coffeeMapped.category]}>
                                {coffeeMapped.category}
                            </Badge>
                        </div>

                        {/* Rating Summary */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                            star <= Math.round(reviewSummary.averageRating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-muted"
                                        }`}
                                    />
                                ))}
                            </div>
                            <span>{reviewSummary.averageRating.toFixed(1)}</span>
                            <span>({reviewSummary.totalReviews} reviews)</span>
                        </div>
                    </div>

                    <p className="text-muted-foreground text-lg">{coffee.description}</p>

                    <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold">${parseFloat(coffee.price).toFixed(2)}</span>
                        <AddToCartButton coffee={coffeeMapped} size="lg" />
                    </div>
                </div>
            </div>

            <Separator />

            {/* Reviews Section */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Reviews List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Customer Reviews</h2>

                    {reviews.length === 0 ? (
                        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <Card key={review.id}>
                                    <CardContent className="pt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">{review.customerName}</span>
                                            <div className="flex items-center">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`h-3 w-3 ${
                                                            star <= review.rating
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-muted"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        {review.content && (
                                            <p className="text-sm text-muted-foreground">{review.content}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Write Review */}
                <Card>
                    <CardHeader>
                        <CardTitle>Write a Review</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Your Rating</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setNewRating(star)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            className={`h-6 w-6 cursor-pointer transition-colors ${
                                                star <= newRating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-muted hover:text-yellow-300"
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Your Review (optional)</label>
                            <Textarea
                                placeholder="Share your experience with this coffee..."
                                value={newReviewContent}
                                onChange={(e) => setNewReviewContent(e.target.value)}
                                rows={4}
                            />
                        </div>
                        {reviewError && (
                            <p className="text-sm text-destructive">{reviewError}</p>
                        )}
                        <Button
                            onClick={handleSubmitReview}
                            disabled={isSubmittingReview}
                            className="w-full"
                        >
                            {isSubmittingReview ? "Submitting..." : "Submit Review"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <>
                    <Separator />
                    <div>
                        <h2 className="text-xl font-semibold mb-4">You Might Also Like</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {relatedProducts.map((product) => {
                                const productMapped: Coffee = {
                                    id: product.id,
                                    name: product.name,
                                    description: product.description || "",
                                    price: parseFloat(product.price),
                                    image: product.imageUrl || "/placeholder.svg",
                                    available: product.available,
                                    category: mapCategory(product.categoryName),
                                }

                                return (
                                    <Link key={product.id} href={`/customer/menu/${product.id}`}>
                                        <Card className="overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
                                            <div className="relative aspect-square bg-muted">
                                                <Image
                                                    src={product.imageUrl || "/placeholder.svg"}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover transition-transform group-hover:scale-105"
                                                />
                                            </div>
                                            <CardContent className="p-3">
                                                <h3 className="font-medium truncate">{product.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    ${parseFloat(product.price).toFixed(2)}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
