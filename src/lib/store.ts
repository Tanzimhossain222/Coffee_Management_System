import { mockCoffees, mockOrders, mockUsers } from "@/data"
import type { Coffee, Order, User } from "@/types"

// In-memory store (simulates database)
class Store {
  private users: User[] = [...mockUsers]
  private coffees: Coffee[] = [...mockCoffees]
  private orders: Order[] = [...mockOrders]

  // User operations
  getUsers(): User[] {
    return this.users
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id)
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email)
  }

  addUser(user: User): void {
    this.users.push(user)
  }

  // Coffee operations
  getCoffees(): Coffee[] {
    return this.coffees
  }

  getAvailableCoffees(): Coffee[] {
    return this.coffees.filter((c) => c.available)
  }

  getCoffeeById(id: string): Coffee | undefined {
    return this.coffees.find((c) => c.id === id)
  }

  updateCoffee(id: string, updates: Partial<Coffee>): Coffee | undefined {
    const index = this.coffees.findIndex((c) => c.id === id)
    if (index !== -1) {
      this.coffees[index] = { ...this.coffees[index], ...updates }
      return this.coffees[index]
    }
    return undefined
  }

  addCoffee(coffee: Coffee): void {
    this.coffees.push(coffee)
  }

  deleteCoffee(id: string): boolean {
    const index = this.coffees.findIndex((c) => c.id === id)
    if (index !== -1) {
      this.coffees.splice(index, 1)
      return true
    }
    return false
  }

  // Order operations
  getOrders(): Order[] {
    return this.orders
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id)
  }

  getOrdersByCustomerId(customerId: string): Order[] {
    return this.orders.filter((o) => o.customerId === customerId)
  }

  getOrdersByDeliveryAgentId(agentId: string): Order[] {
    return this.orders.filter((o) => o.deliveryAgentId === agentId)
  }

  getOrdersByBranch(branchId: string): Order[] {
    return this.orders.filter((o) => o.branchId === branchId)
  }

  getOrdersByStatus(status: Order["status"]): Order[] {
    return this.orders.filter((o) => o.status === status)
  }

  addOrder(order: Order): void {
    this.orders.push(order)
  }

  updateOrder(id: string, updates: Partial<Order>): Order | undefined {
    const index = this.orders.findIndex((o) => o.id === id)
    if (index !== -1) {
      this.orders[index] = {
        ...this.orders[index],
        ...updates,
        updatedAt: new Date(),
      }
      return this.orders[index]
    }
    return undefined
  }

  // Get delivery agents by branch
  getDeliveryAgentsByBranch(branchId: string): User[] {
    return this.users.filter((u) => u.role === "DELIVERY" && u.branchId === branchId)
  }
}

// Singleton instance
export const store = new Store()
