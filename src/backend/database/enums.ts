import { pgEnum } from "drizzle-orm/pg-core"

// ============================================
// SHARED ENUMS - Used across multiple schemas
// ============================================

// User & Authentication Enums
export const userRoleEnum = pgEnum("user_role", ["CUSTOMER", "ADMIN", "MANAGER", "STAFF", "DELIVERY"])
export const userStatusEnum = pgEnum("user_status", ["ACTIVE", "INACTIVE", "SUSPENDED"])
export const verificationTypeEnum = pgEnum("verification_type", ["EMAIL", "PASSWORD_RESET", "PHONE"])
export const verificationStatusEnum = pgEnum("verification_status", ["PENDING", "USED", "EXPIRED"])
export const loginAttemptEnum = pgEnum("login_attempt", ["SUCCESS", "FAILED"])

// Order & Delivery Enums
export const orderTypeEnum = pgEnum("order_type", ["PICKUP", "DELIVERY"])
export const orderStatusEnum = pgEnum("order_status", [
    "CREATED",
    "ACCEPTED",
    "ASSIGNED",
    "PICKED_UP",
    "DELIVERED",
    "CANCELLED",
])
export const deliveryStatusEnum = pgEnum("delivery_status", ["PENDING", "PICKED_UP", "IN_TRANSIT", "DELIVERED"])

// Coffee Enums
export const coffeeCategoryEnum = pgEnum("coffee_category", ["hot", "cold", "specialty"])

// Payment Enums
export const paymentMethodEnum = pgEnum("payment_method", ["CASH", "CARD", "MOBILE_BANKING", "WALLET"])
export const paymentStatusEnum = pgEnum("payment_status", ["PENDING", "COMPLETED", "FAILED", "REFUNDED"])

// Support Enums
export const supportStatusEnum = pgEnum("support_status", ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
export const supportPriorityEnum = pgEnum("support_priority", ["LOW", "MEDIUM", "HIGH", "URGENT"])
