"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Coffee, RefreshCw, Star, Trash2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

interface Review {
    id: string
    coffeeId: string
    coffeeName: string
    customerId: string
    customerName: string
    rating: number
    content: string | null
    createdAt: string
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [ratingFilter, setRatingFilter] = useState<string>("all")

    const fetchReviews = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const url = ratingFilter === "all"
                ? "/api/admin/reviews"
                : `/api/admin/reviews?minRating=${ratingFilter}`
            const response = await fetch(url)
            const result = await response.json()

            if (result.success) {
                setReviews(result.data)
            } else {
                setError(result.message || "Failed to fetch reviews")
            }
        } catch (err) {
            setError("An error occurred while fetching reviews")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }, [ratingFilter])

    useEffect(() => {
        fetchReviews()
    }, [fetchReviews])

    const handleDelete = async (reviewId: string) => {
        try {
            const response = await fetch(`/api/admin/reviews/${reviewId}`, {
                method: "DELETE",
            })
            const result = await response.json()

            if (result.success) {
                setReviews((prev) => prev.filter((r) => r.id !== reviewId))
                toast.success("Review deleted successfully")
            } else {
                toast.error(result.message || "Failed to delete review")
            }
        } catch (err) {
            toast.error("An error occurred")
            console.error(err)
        }
    }

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`h-4 w-4 ${i < rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                            }`}
                    />
                ))}
            </div>
        )
    }

    // Stats
    const stats = {
        total: reviews.length,
        avgRating: reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : "0.0",
        fiveStars: reviews.filter((r) => r.rating === 5).length,
        oneToThree: reviews.filter((r) => r.rating <= 3).length,
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-5 w-64 mt-2" />
                </div>
                <div className="grid sm:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
                    <p className="text-muted-foreground">
                        Manage customer reviews and ratings
                    </p>
                </div>
                <Button onClick={fetchReviews} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Reviews
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Average Rating
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgRating}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            5-Star Reviews
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">{stats.fiveStars}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Low Ratings (1-3)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{stats.oneToThree}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by rating" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        <SelectItem value="5">5 Stars Only</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                        <SelectItem value="1">Low Ratings (1-2)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {error && (
                <div className="text-center py-8 text-destructive">{error}</div>
            )}

            {!error && reviews.length === 0 && (
                <div className="text-center py-12">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No reviews found.</p>
                </div>
            )}

            {!error && reviews.length > 0 && (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Coffee</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Review</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="w-20">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reviews.map((review) => (
                                <TableRow key={review.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Coffee className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{review.coffeeName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{review.customerName}</TableCell>
                                    <TableCell>{renderStars(review.rating)}</TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {review.content || (
                                            <span className="text-muted-foreground italic">No comment</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(review.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    )
}
