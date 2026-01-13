/**
 * Pagination Utilities
 * Smart pagination helpers for API responses
 */

import { NextRequest } from "next/server"

// ============================================
// Types
// ============================================

export interface PaginationParams {
    page: number
    limit: number
    skip: number
}

export interface PaginationMeta {
    totalItems: number
    totalPages: number
    currentPage: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
    startItem: number
    endItem: number
    remainingItems: number
}

export interface PaginationLinks {
    current: string
    next: string | null
    prev: string | null
    first: string | null
    last: string | null
}

export interface PaginatedResponse<T> {
    data: T[]
    meta: PaginationMeta
    links: PaginationLinks
}

// ============================================
// Pagination Functions
// ============================================

/**
 * Parse pagination parameters from request URL
 */
export function parsePaginationParams(request: NextRequest): PaginationParams {
    const { searchParams } = new URL(request.url)

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)))
    const skip = (page - 1) * limit

    return { page, limit, skip }
}

/**
 * Build pagination metadata
 */
export function buildPaginationMeta(
    totalItems: number,
    page: number,
    limit: number
): PaginationMeta {
    const totalPages = Math.ceil(totalItems / limit) || 1
    const skip = (page - 1) * limit
    const startItem = totalItems > 0 ? skip + 1 : 0
    const endItem = Math.min(skip + limit, totalItems)

    return {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        startItem,
        endItem,
        remainingItems: Math.max(0, totalItems - endItem),
    }
}

/**
 * Build pagination links
 */
export function buildPaginationLinks(
    request: NextRequest,
    meta: PaginationMeta
): PaginationLinks {
    const url = new URL(request.url)
    const baseUrl = `${url.origin}${url.pathname}`

    const buildLink = (page: number): string => {
        const params = new URLSearchParams(url.searchParams)
        params.set("page", String(page))
        params.set("limit", String(meta.itemsPerPage))
        return `${baseUrl}?${params.toString()}`
    }

    return {
        current: buildLink(meta.currentPage),
        next: meta.hasNextPage ? buildLink(meta.currentPage + 1) : null,
        prev: meta.hasPrevPage ? buildLink(meta.currentPage - 1) : null,
        first: meta.currentPage > 1 ? buildLink(1) : null,
        last: meta.currentPage < meta.totalPages ? buildLink(meta.totalPages) : null,
    }
}

/**
 * Create a complete paginated response
 */
export function createPaginatedResponse<T>(
    data: T[],
    totalItems: number,
    request: NextRequest,
    page: number,
    limit: number
): PaginatedResponse<T> {
    const meta = buildPaginationMeta(totalItems, page, limit)
    const links = buildPaginationLinks(request, meta)

    return {
        data,
        meta,
        links,
    }
}
