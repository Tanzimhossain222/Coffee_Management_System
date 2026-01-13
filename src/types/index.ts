// User roles - Updated for multi-branch coffee shop
export type UserRole = "CUSTOMER" | "ADMIN" | "MANAGER" | "STAFF" | "DELIVERY"

// Order type for pickup or delivery
export type OrderType = "PICKUP" | "DELIVERY"

// User entity
export interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  branchId?: string
  branchName?: string
  createdAt: Date
}

// Branch entity
export interface Branch {
  id: string
  name: string
  address: string
  city: string
  phoneNo?: string
  email?: string
  managerId?: string
  managerName?: string
  isActive: boolean
  openingTime?: string
  closingTime?: string
  createdAt: Date
}

// Coffee item
export interface Coffee {
  id: string
  name: string
  description: string
  price: number
  image: string
  available: boolean
  category: "hot" | "cold" | "specialty"
}

// Order status lifecycle
export type OrderStatus = "CREATED" | "ACCEPTED" | "ASSIGNED" | "PICKED_UP" | "DELIVERED" | "CANCELLED"

// Order item
export interface OrderItem {
  coffeeId: string
  coffeeName: string
  quantity: number
  price: number
}

// Order entity
export interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  branchId: string
  branchName?: string
  orderType: OrderType
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  deliveryAddress?: string
  deliveryAgentId?: string
  deliveryAgentName?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Delivery entity
export interface Delivery {
  id: string
  orderId: string
  deliveryAgentId: string
  status: "PENDING" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED"
  pickedUpAt?: Date
  deliveredAt?: Date
}

// Cart item
export interface CartItem {
  coffee: Coffee
  quantity: number
}

// Cart context type
export interface CartState {
  items: CartItem[]
  addItem: (coffee: Coffee) => void
  removeItem: (coffeeId: string) => void
  updateQuantity: (coffeeId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalAmount: number
}
