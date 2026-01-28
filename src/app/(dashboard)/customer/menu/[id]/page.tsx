"use client"

import { AddToCartButton } from "@/app/(dashboard)/_components/interactive/add-to-cart-button"
import { CoffeeCard } from "@/app/(dashboard)/_components/ui/coffee-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { Coffee } from "@/types"
import { ArrowLeft, Check, Clock, Flame, Heart, Info, MessageSquare, Share2, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

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
    const router = useRouter()
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
    const [isFavorite, setIsFavorite] = useState(false)

    const fetchData = useCallback(async () => {
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
    }, [coffeeId])

    useEffect(() => {
        if (coffeeId) {
            fetchData()
        }
    }, [coffeeId, fetchData])

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
                await fetchData()
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
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <Spinner className="h-10 w-10 text-primary" />
                <p className="text-muted-foreground font-medium animate-pulse">Brewing details...</p>
            </div>
        )
    }

    if (error || !coffee) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                    <Info className="h-10 w-10 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                <p className="text-muted-foreground mb-8 max-w-md">{error || "Coffee not found"}</p>
                <Link href="/customer">
                    <Button variant="outline" className="rounded-xl border-2 px-8">
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
        hot: "bg-orange-500/10 text-orange-600 border-orange-200",
        cold: "bg-blue-500/10 text-blue-600 border-blue-200",
        specialty: "bg-purple-500/10 text-purple-600 border-purple-200",
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in duration-700">
            {/* Breadcrumb & Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="hover:bg-secondary/80 -ml-2 rounded-lg"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="flex gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    <span>Menu</span>
                    <span className="opacity-30">/</span>
                    <span className="text-primary">{coffee.categoryName || "Coffee"}</span>
                </div>
            </div>

            {/* Product Hero Section */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                {/* Image Gallery Mockup */}
                <div className="space-y-6 sticky top-24">
                    <div className="relative aspect-4/5 sm:aspect-square bg-muted rounded-4xl overflow-hidden shadow-2xl group border border-muted/50">
                        <Image
                            src={coffee.imageUrl || "/placeholder.svg"}
                            alt={coffee.name}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            priority
                        />
                        {!coffee.available && (
                            <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center">
                                <Badge variant="secondary" className="text-xl px-8 py-4 font-black uppercase tracking-tighter rounded-2xl transform rotate-[-5deg] shadow-2xl">
                                    Sold Out
                                </Badge>
                            </div>
                        )}
                        <div className="absolute top-6 right-6 flex flex-col gap-3">
                            <Button
                                variant="secondary"
                                size="icon"
                                className={cn("rounded-2xl h-12 w-12 shadow-xl backdrop-blur-md bg-background/60 border border-white/20 transition-all hover:scale-110", isFavorite && "text-red-500 fill-red-500")}
                                onClick={() => setIsFavorite(!isFavorite)}
                            >
                                <Heart className="h-5 w-5" />
                            </Button>
                            <Button variant="secondary" size="icon" className="rounded-2xl h-12 w-12 shadow-xl backdrop-blur-md bg-background/60 border border-white/20 transition-all hover:scale-110">
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Product Configuration */}
                <div className="space-y-10 py-4">
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="outline" className={cn("px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border-2", categoryColors[coffeeMapped.category])}>
                                {coffeeMapped.category}
                            </Badge>
                            {coffee.available && (
                                <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-2 border-orange-200/50 px-4 py-1 text-[10px] font-black rounded-full italic uppercase tracking-wider">
                                    <Flame className="h-3 w-3 mr-1" /> Best Seller
                                </Badge>
                            )}
                        </div>

                        <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.1] text-foreground">
                            {coffee.name}
                        </h1>

                        {/* Rating Summary */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center bg-yellow-400/10 border-2 border-yellow-400/20 px-4 py-2 rounded-2xl">
                                <div className="flex items-center mr-3 gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={cn("h-4 w-4",
                                                star <= Math.round(reviewSummary.averageRating)
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-muted"
                                            )}
                                        />
                                    ))}
                                </div>
                                <span className="font-black text-base text-yellow-700">
                                    {reviewSummary.averageRating.toFixed(1)}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-foreground hover:underline cursor-pointer">
                                    {reviewSummary.totalReviews} Reviews
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Customer feedback</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-baseline gap-4">
                            <span className="text-6xl font-black text-primary drop-shadow-sm">${parseFloat(coffee.price).toFixed(2)}</span>
                            <span className="text-xl text-muted-foreground line-through decoration-muted-foreground/40 opacity-40">$7.50</span>
                        </div>
                        <p className="text-muted-foreground text-xl leading-relaxed max-w-prose font-medium italic">
                            {coffee.description || "Our signature blend roasted to perfection, delivering a rich and balanced flavor profile that lingers on your palate."}
                        </p>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-6 border-y-2 border-muted/30 py-8">
                        <div className="flex items-center gap-4 group">
                            <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center transition-colors group-hover:bg-primary/10 border border-primary/10">
                                <Clock className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-sm">
                                <p className="font-black uppercase tracking-widest text-[10px] text-muted-foreground mb-1">Wait Time</p>
                                <p className="font-black text-lg">5-7 MINS</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="h-14 w-14 rounded-2xl bg-orange-500/5 flex items-center justify-center transition-colors group-hover:bg-orange-500/10 border border-orange-500/10">
                                <Flame className="h-6 w-6 text-orange-500" />
                            </div>
                            <div className="text-sm">
                                <p className="font-black uppercase tracking-widest text-[10px] text-muted-foreground mb-1">Energy</p>
                                <p className="font-black text-lg">120 KCAL</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <AddToCartButton coffee={coffeeMapped} size="lg" className="w-full sm:flex-2 h-20 text-xl font-black rounded-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest" />
                        <Button variant="outline" size="lg" className="h-20 sm:flex-1 rounded-2xl font-black uppercase tracking-widest bg-transparent border-4 border-primary/10 hover:border-primary/30 hover:text-primary transition-all active:scale-95">
                            Extra Shot
                        </Button>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-secondary/20 p-4 rounded-2xl border-2 border-dashed border-secondary">
                        <Info className="h-4 w-4 text-primary" />
                        Free delivery on orders above $30 • Pickup ready in 10m
                    </div>
                </div>
            </div>

            {/* Detailed Content Tabs Mockup */}
            <div className="space-y-16 pt-12">
                <div className="flex gap-10 border-b-2 border-muted/30 overflow-x-auto scrollbar-none">
                    <button className="pb-6 text-xs font-black uppercase tracking-[0.2em] border-b-4 border-primary text-primary transition-all whitespace-nowrap">Feedback</button>
                    <button className="pb-6 text-xs font-black uppercase tracking-[0.2em] border-b-4 border-transparent text-muted-foreground hover:text-foreground transition-all whitespace-nowrap opacity-40 cursor-not-allowed">Ingredients</button>
                    <button className="pb-6 text-xs font-black uppercase tracking-[0.2em] border-b-4 border-transparent text-muted-foreground hover:text-foreground transition-all whitespace-nowrap opacity-40 cursor-not-allowed">Artisan Story</button>
                </div>

                {/* Reviews Section Implementation */}
                <div className="grid lg:grid-cols-3 gap-16 xxl:gap-24">
                    {/* Write Review & Summary */}
                    <div className="space-y-12 lg:col-span-1">
                        <div className="bg-primary/5 p-8 rounded-4xl border-2 border-primary/10 space-y-6">
                            <h3 className="font-black text-2xl uppercase tracking-tighter">Overall Score</h3>
                            <div className="flex items-end gap-3">
                                <span className="text-7xl font-black leading-none">{reviewSummary.averageRating.toFixed(1)}</span>
                                <div className="flex flex-col pb-1">
                                    <span className="text-muted-foreground font-black text-xl">/ 5.0</span>
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Card className="rounded-4xl border-4 border-muted/30 overflow-hidden shadow-xl">
                            <CardHeader className="bg-muted/30 border-b pb-6 text-center">
                                <CardTitle className="text-xl font-black uppercase tracking-widest">Rate this Blend</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8 pt-10 px-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 block text-center">Experience Rating</label>
                                    <div className="flex justify-center gap-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setNewRating(star)}
                                                className="transition-all active:scale-95 hover:scale-125 duration-300"
                                            >
                                                <Star
                                                    className={cn("h-10 w-10",
                                                        star <= newRating
                                                            ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                                                            : "text-muted stroke-[1.5]"
                                                    )}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block text-center">Your Thoughts</label>
                                    <Textarea
                                        placeholder="Roast profile, aroma, aftertaste..."
                                        value={newReviewContent}
                                        onChange={(e) => setNewReviewContent(e.target.value)}
                                        className="min-h-30 rounded-2xl bg-muted/20 border-2 border-muted focus:border-primary transition-all resize-none font-medium p-4"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="px-8 pb-10">
                                <Button
                                    onClick={handleSubmitReview}
                                    disabled={isSubmittingReview}
                                    className="w-full font-black uppercase tracking-[0.2em] h-16 rounded-2xl transition-all shadow-xl hover:shadow-primary/20"
                                >
                                    {isSubmittingReview ? (
                                        <Spinner className="h-6 w-6" />
                                    ) : (
                                        "Post Review"
                                    )}
                                </Button>
                                {reviewError && (
                                    <p className="text-xs text-destructive text-center mt-3 font-bold uppercase tracking-widest">{reviewError}</p>
                                )}
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Feed */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="flex items-center justify-between border-b-4 border-muted/20 pb-6">
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Tasting Notes</h2>
                            <Select defaultValue="newest">
                                <SelectTrigger className="w-40 h-10 text-[10px] font-black uppercase tracking-widest rounded-full border-2 bg-transparent shadow-sm">
                                    <SelectValue placeholder="Sort" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-2">
                                    <SelectItem value="newest">Latest First</SelectItem>
                                    <SelectItem value="highest">Most Loved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {reviews.length === 0 ? (
                            <div className="bg-primary/5 rounded-[3rem] border-4 border-dashed border-primary/10 p-24 text-center">
                                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <MessageSquare className="h-10 w-10 text-primary opacity-40" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-widest mb-2">Virgin Grounds</h3>
                                <p className="text-muted-foreground font-bold italic opacity-60">Be the first artisan to review this blend.</p>
                            </div>
                        ) : (
                            <div className="grid gap-8">
                                {reviews.map((review) => (
                                    <Card key={review.id} className="rounded-[2.5rem] border-none bg-secondary/10 hover:bg-secondary/20 transition-all duration-500 shadow-sm overflow-hidden group">
                                        <CardContent className="p-8 pb-10">
                                            <div className="flex items-start gap-6">
                                                <div className="h-16 w-16 rounded-2xl bg-background shadow-xl flex items-center justify-center font-black text-xl text-primary border-4 border-primary/5 shrink-0 transition-transform group-hover:rotate-6">
                                                    {review.customerName.charAt(0)}
                                                </div>
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-black text-xl tracking-tight leading-none">{review.customerName}</span>
                                                                <Badge className="bg-emerald-500/10 text-emerald-600 text-[9px] h-5 px-2 border-none font-bold uppercase tracking-widest rounded-full">Artisan verified</Badge>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 pt-1">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={cn("h-3 w-3",
                                                                            star <= review.rating
                                                                                ? "fill-yellow-400 text-yellow-400"
                                                                                : "text-muted"
                                                                        )}
                                                                    />
                                                                ))}
                                                                <span className="text-[10px] text-muted-foreground ml-3 font-black uppercase tracking-widest opacity-60">
                                                                    {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="h-10 w-10 rounded-2xl border-2 border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-sm bg-emerald-500/5 transition-all hover:scale-110">
                                                            <Check className="h-5 w-5" />
                                                        </div>
                                                    </div>
                                                    {review.content && (
                                                        <div className="relative">
                                                            <p className="text-foreground/80 leading-relaxed font-medium italic text-lg pl-6 border-l-4 border-primary/20">&quot;{review.content}&quot;</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {reviews.length >= 5 && (
                                    <Button variant="outline" className="w-full rounded-3xl border-4 border-primary/10 font-black h-16 hover:bg-primary/5 uppercase tracking-[0.3em] transition-all">
                                        View Full Critique Book
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div className="space-y-12 pt-16 border-t-2 border-muted/30 pb-12">
                    <div className="flex items-end justify-between">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black uppercase tracking-tighter">Artisan Pairings</h2>
                            <p className="text-muted-foreground font-bold italic">Chosen to complement the unique profile of {coffee.name}</p>
                        </div>
                        <Link href="/customer" className="font-black text-xs text-primary hover:underline transition-all uppercase tracking-widest bg-primary/5 px-6 py-3 rounded-full border-2 border-primary/10 hover:bg-primary/10">
                            See Full Gallery
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedProducts.slice(0, 4).map((item) => {
                            const mappedItem: Coffee = {
                                id: item.id,
                                name: item.name,
                                description: item.description || "",
                                price: parseFloat(item.price),
                                image: item.imageUrl || "/placeholder.svg",
                                available: item.available,
                                category: mapCategory(item.categoryName),
                            }
                            return (
                                <div key={item.id} className="transition-all hover:-translate-y-2">
                                    <CoffeeCard coffee={mappedItem} />
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
