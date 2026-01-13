/**
 * Backend Services Index
 * Exports all service modules for use across the application
 */

// Auth Service
export { authService } from "./auth.service"
export type { AuthResult, AuthUser, LoginInput, RegisterInput, UserRole } from "./auth.service"

// Email Service
export { emailService } from "./email.service"

// Coffee Service
export { coffeeService } from "./coffee.service"
export type {
    CoffeeFilters, CoffeeWithCategory, CreateCoffeeInput,
    UpdateCoffeeInput
} from "./coffee.service"

// Branch Service
export { branchService } from "./branch.service"
export type {
    BranchWithManager,
    BranchWithStats, CreateBranchInput, StaffMember, UpdateBranchInput
} from "./branch.service"

// Cart Service
export { cartService } from "./cart.service"
export type { AddToCartInput, CartItem, CartSummary } from "./cart.service"

// Order Service
export { orderService } from "./order.service"
export type {
    CreateOrderInput, OrderDetail, OrderFilters, OrderItemDetail,
    OrderStatus,
    OrderType,
    PaymentMethod
} from "./order.service"

// Delivery Service
export { deliveryService } from "./delivery.service"
export type {
    DeliveryDetail, DeliveryFilters, DeliveryStatus
} from "./delivery.service"

// Review Service
export { reviewService } from "./review.service"
export type {
    CreateReviewInput, ReviewSummary, ReviewWithUser
} from "./review.service"

// Payment Service
export { paymentService } from "./payment.service"
export type {
    PaymentMethodType, PaymentStatus, PaymentWithOrder, ProcessPaymentInput
} from "./payment.service"

// User Service
export { userService } from "./user.service"
export type {
    CreateUserInput, UpdateUserInput, UserFilters, UserWithProfile
} from "./user.service"
