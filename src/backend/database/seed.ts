/**
 * Database Seeder
 * Comprehensive seed file for Coffee Management System
 * Idempotent - safe to run multiple times (checks for existing data)
 *
 * Run with: pnpm seed
 */

import { faker } from "@faker-js/faker"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { db } from "./client"
import {
    authUsers,
    branches,
    coffeeCategories,
    coffees,
    deliveries,
    orderItems,
    orders,
    payments,
    reviews,
    userProfiles,
} from "./schema"

// ============================================
// CONSTANTS
// ============================================

const SALT_ROUNDS = 10

// Fixed credentials for demo/testing
const DEMO_USERS = {
    admin: {
        email: "admin@coffeehub.com",
        password: "Admin@123",
        name: "System Admin",
        role: "ADMIN" as const,
    },
    manager: {
        email: "manager@coffeehub.com",
        password: "Manager@123",
        name: "Branch Manager",
        role: "MANAGER" as const,
    },
    staff: {
        email: "staff@coffeehub.com",
        password: "Staff@123",
        name: "Coffee Staff",
        role: "STAFF" as const,
    },
    delivery: {
        email: "delivery@coffeehub.com",
        password: "Delivery@123",
        name: "Delivery Agent",
        role: "DELIVERY" as const,
    },
    customer: {
        email: "customer@coffeehub.com",
        password: "Customer@123",
        name: "Demo Customer",
        role: "CUSTOMER" as const,
    },
}

// Coffee categories and items
const COFFEE_CATEGORIES = [
    { name: "Hot Coffee", description: "Freshly brewed hot coffee drinks" },
    { name: "Cold Coffee", description: "Refreshing iced and cold brew coffees" },
    { name: "Specialty", description: "Premium specialty coffee drinks" },
]

const COFFEE_ITEMS = [
    // Hot Coffee
    { name: "Espresso", description: "Rich and bold single shot espresso", price: "3.50", category: "Hot Coffee", imageUrl: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400" },
    { name: "Americano", description: "Espresso diluted with hot water", price: "4.00", category: "Hot Coffee", imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400" },
    { name: "Cappuccino", description: "Espresso with steamed milk foam", price: "4.50", category: "Hot Coffee", imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400" },
    { name: "Latte", description: "Espresso with steamed milk", price: "4.75", category: "Hot Coffee", imageUrl: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400" },
    { name: "Mocha", description: "Espresso with chocolate and steamed milk", price: "5.25", category: "Hot Coffee", imageUrl: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400" },
    { name: "Flat White", description: "Double espresso with microfoam milk", price: "4.50", category: "Hot Coffee", imageUrl: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400" },

    // Cold Coffee
    { name: "Iced Latte", description: "Chilled espresso with cold milk over ice", price: "5.00", category: "Cold Coffee", imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400" },
    { name: "Cold Brew", description: "Smooth cold-steeped coffee", price: "4.50", category: "Cold Coffee", imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400" },
    { name: "Iced Americano", description: "Espresso over ice with cold water", price: "4.25", category: "Cold Coffee", imageUrl: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400" },
    { name: "Frappuccino", description: "Blended iced coffee with cream", price: "5.50", category: "Cold Coffee", imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400" },
    { name: "Iced Mocha", description: "Chilled chocolate espresso with milk", price: "5.50", category: "Cold Coffee", imageUrl: "https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=400" },

    // Specialty
    { name: "Caramel Macchiato", description: "Vanilla, milk, espresso with caramel drizzle", price: "5.75", category: "Specialty", imageUrl: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400" },
    { name: "Vanilla Latte", description: "Espresso with vanilla syrup and steamed milk", price: "5.25", category: "Specialty", imageUrl: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=400" },
    { name: "Hazelnut Cappuccino", description: "Cappuccino with hazelnut flavor", price: "5.50", category: "Specialty", imageUrl: "https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?w=400" },
    { name: "Irish Coffee", description: "Coffee with Irish whiskey and cream", price: "7.00", category: "Specialty", imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400" },
    { name: "Affogato", description: "Espresso poured over vanilla gelato", price: "6.00", category: "Specialty", imageUrl: "https://images.unsplash.com/photo-1579888944880-d98341245702?w=400" },
]

const BRANCH_DATA = [
    { name: "Downtown Coffee Hub", address: "123 Main Street", city: "New York", phoneNo: "+1-212-555-0101", email: "downtown@coffeehub.com", openingTime: "07:00", closingTime: "22:00" },
    { name: "Airport Terminal Branch", address: "JFK Airport Terminal 4", city: "New York", phoneNo: "+1-212-555-0102", email: "airport@coffeehub.com", openingTime: "05:00", closingTime: "23:00" },
    { name: "University Campus Cafe", address: "456 College Ave", city: "Boston", phoneNo: "+1-617-555-0103", email: "campus@coffeehub.com", openingTime: "06:30", closingTime: "21:00" },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
}

function generateUsername(email: string): string {
    const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "_")
    const suffix = Math.random().toString(36).substring(2, 6)
    return `${base}_${suffix}`
}

// ============================================
// SEEDERS
// ============================================

async function seedCategories() {
    console.log("🏷️  Seeding coffee categories...")

    for (const category of COFFEE_CATEGORIES) {
        const existing = await db.query.coffeeCategories.findFirst({
            where: eq(coffeeCategories.name, category.name),
        })

        if (!existing) {
            await db.insert(coffeeCategories).values(category)
            console.log(`   ✅ Created category: ${category.name}`)
        } else {
            console.log(`   ⏭️  Category exists: ${category.name}`)
        }
    }
}

async function seedCoffees() {
    console.log("☕ Seeding coffee items...")

    // Get category map
    const categories = await db.query.coffeeCategories.findMany()
    const categoryMap = new Map(categories.map(c => [c.name, c.id]))

    for (const coffee of COFFEE_ITEMS) {
        const existing = await db.query.coffees.findFirst({
            where: eq(coffees.name, coffee.name),
        })

        if (!existing) {
            const categoryId = categoryMap.get(coffee.category)
            await db.insert(coffees).values({
                name: coffee.name,
                description: coffee.description,
                price: coffee.price,
                imageUrl: coffee.imageUrl,
                categoryId,
                available: true,
            })
            console.log(`   ✅ Created coffee: ${coffee.name}`)
        } else {
            console.log(`   ⏭️  Coffee exists: ${coffee.name}`)
        }
    }
}

async function seedDemoUsers() {
    console.log("👥 Seeding demo users...")

    const createdUsers: Record<string, string> = {}

    for (const [key, user] of Object.entries(DEMO_USERS)) {
        const existing = await db.query.authUsers.findFirst({
            where: eq(authUsers.email, user.email),
        })

        if (!existing) {
            const passwordHash = await hashPassword(user.password)
            const username = generateUsername(user.email)

            const [newUser] = await db.insert(authUsers).values({
                username,
                email: user.email,
                passwordHash,
                role: user.role,
                verified: true, // Demo users are pre-verified
                status: "ACTIVE",
            }).returning()

            await db.insert(userProfiles).values({
                authUserId: newUser.id,
                name: user.name,
                email: user.email,
                phoneNo: faker.phone.number({ style: "international" }),
                address: faker.location.streetAddress({ useFullAddress: true }),
            })

            createdUsers[key] = newUser.id
            console.log(`   ✅ Created ${user.role}: ${user.email} (password: ${user.password})`)
        } else {
            createdUsers[key] = existing.id
            console.log(`   ⏭️  User exists: ${user.email}`)
        }
    }

    return createdUsers
}

async function seedBranches(managerId?: string) {
    console.log("🏪 Seeding branches...")

    const createdBranches: string[] = []

    for (const branch of BRANCH_DATA) {
        const existing = await db.query.branches.findFirst({
            where: eq(branches.name, branch.name),
        })

        if (!existing) {
            const [newBranch] = await db.insert(branches).values({
                ...branch,
                managerId: managerId || null,
                isActive: true,
            }).returning()

            createdBranches.push(newBranch.id)
            console.log(`   ✅ Created branch: ${branch.name}`)
        } else {
            createdBranches.push(existing.id)
            console.log(`   ⏭️  Branch exists: ${branch.name}`)
        }
    }

    return createdBranches
}

async function seedRandomCustomers(count: number = 10) {
    console.log(`👤 Seeding ${count} random customers...`)

    const customerIds: string[] = []

    for (let i = 0; i < count; i++) {
        const email = faker.internet.email().toLowerCase()

        const existing = await db.query.authUsers.findFirst({
            where: eq(authUsers.email, email),
        })

        if (!existing) {
            const passwordHash = await hashPassword("Customer@123")
            const username = generateUsername(email)
            const name = faker.person.fullName()

            const [newUser] = await db.insert(authUsers).values({
                username,
                email,
                passwordHash,
                role: "CUSTOMER",
                verified: faker.datatype.boolean({ probability: 0.8 }),
                status: "ACTIVE",
            }).returning()

            await db.insert(userProfiles).values({
                authUserId: newUser.id,
                name,
                email,
                phoneNo: faker.phone.number({ style: "international" }),
                address: faker.location.streetAddress({ useFullAddress: true }),
            })

            customerIds.push(newUser.id)
        }
    }

    console.log(`   ✅ Created ${customerIds.length} customers`)
    return customerIds
}

async function seedDeliveryAgents(count: number = 5, branchIds: string[]) {
    console.log(`🚚 Seeding ${count} delivery agents...`)

    const agentIds: string[] = []

    for (let i = 0; i < count; i++) {
        const email = `delivery${i + 1}@coffeehub.com`

        const existing = await db.query.authUsers.findFirst({
            where: eq(authUsers.email, email),
        })

        if (!existing) {
            const passwordHash = await hashPassword("Delivery@123")
            const username = generateUsername(email)
            const name = faker.person.fullName()

            const [newUser] = await db.insert(authUsers).values({
                username,
                email,
                passwordHash,
                role: "DELIVERY",
                verified: true,
                status: "ACTIVE",
            }).returning()

            await db.insert(userProfiles).values({
                authUserId: newUser.id,
                name,
                email,
                phoneNo: faker.phone.number({ style: "international" }),
                address: faker.location.streetAddress({ useFullAddress: true }),
                branchId: branchIds[i % branchIds.length], // Assign to branches round-robin
            })

            agentIds.push(newUser.id)
            console.log(`   ✅ Created delivery agent: ${email}`)
        } else {
            agentIds.push(existing.id)
            console.log(`   ⏭️  Agent exists: ${email}`)
        }
    }

    return agentIds
}

async function seedSampleOrders(
    customerIds: string[],
    branchIds: string[],
    deliveryAgentIds: string[],
    count: number = 20
) {
    console.log(`📦 Seeding ${count} sample orders...`)

    // Get all coffees
    const allCoffees = await db.query.coffees.findMany()
    if (allCoffees.length === 0) {
        console.log("   ⚠️  No coffees found, skipping orders")
        return
    }

    // Check existing orders count
    const existingOrders = await db.query.orders.findMany()
    if (existingOrders.length >= count) {
        console.log(`   ⏭️  Already have ${existingOrders.length} orders`)
        return
    }

    // Seed with realistic data distributed across different statuses
    const orderStatuses = ["CREATED", "ACCEPTED", "ASSIGNED", "PICKED_UP", "DELIVERED", "CANCELLED"] as const
    const orderTypes = ["PICKUP", "DELIVERY"] as const

    let created = 0
    for (let i = existingOrders.length; i < count; i++) {
        const customerId = customerIds[Math.floor(Math.random() * customerIds.length)]
        const branchId = branchIds[Math.floor(Math.random() * branchIds.length)]
        const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)]

        // During seeding, we bypass the approval workflow to create a realistic dashboard
        const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)]

        // Random 1-4 items per order
        const itemCount = Math.floor(Math.random() * 4) + 1
        const selectedCoffees = faker.helpers.arrayElements(allCoffees, itemCount)

        let totalAmount = 0
        const items: { coffeeId: string; quantity: number; unitPrice: string }[] = []

        for (const coffee of selectedCoffees) {
            const quantity = Math.floor(Math.random() * 3) + 1
            const unitPrice = parseFloat(coffee.price)
            totalAmount += unitPrice * quantity
            items.push({
                coffeeId: coffee.id,
                quantity,
                unitPrice: coffee.price,
            })
        }

        // Create order
        const [order] = await db.insert(orders).values({
            customerId,
            branchId,
            totalAmount: totalAmount.toFixed(2),
            status,
            orderType,
            deliveryAddress: orderType === "DELIVERY" ? faker.location.streetAddress({ useFullAddress: true }) : null,
        }).returning()

        // Create order items
        for (const item of items) {
            await db.insert(orderItems).values({
                orderId: order.id,
                coffeeId: item.coffeeId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })
        }

        // Create payment
        const paymentMethods = ["CASH", "CARD", "MOBILE_BANKING", "WALLET"] as const
        const paymentStatus = status === "DELIVERED" ? "COMPLETED" : "PENDING"

        await db.insert(payments).values({
            orderId: order.id,
            customerId, // Add customer ID
            amount: totalAmount.toFixed(2),
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            status: paymentStatus,
            transactionId: paymentStatus === "COMPLETED" ? `TXN${Date.now()}${i}` : null,
        })

        // Create delivery if order type is DELIVERY and status is appropriate
        if (orderType === "DELIVERY" && ["ASSIGNED", "PICKED_UP", "DELIVERED"].includes(status)) {
            const deliveryAgentId = deliveryAgentIds[Math.floor(Math.random() * deliveryAgentIds.length)]
            const deliveryStatuses: Record<string, "PENDING" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED"> = {
                "ASSIGNED": "PENDING",
                "PICKED_UP": "PICKED_UP",
                "DELIVERED": "DELIVERED",
            }

            await db.insert(deliveries).values({
                orderId: order.id,
                deliveryAgentId,
                branchId,
                status: deliveryStatuses[status] || "PENDING",
                deliveredAt: status === "DELIVERED" ? new Date() : null,
            })
        }

        created++
    }

    console.log(`   ✅ Created ${created} orders with items, payments, and deliveries`)
}

async function seedReviews(customerIds: string[], count: number = 15) {
    console.log(`⭐ Seeding ${count} reviews...`)

    const allCoffees = await db.query.coffees.findMany()
    if (allCoffees.length === 0) {
        console.log("   ⚠️  No coffees found, skipping reviews")
        return
    }

    const existingReviews = await db.query.reviews.findMany()
    if (existingReviews.length >= count) {
        console.log(`   ⏭️  Already have ${existingReviews.length} reviews`)
        return
    }

    const reviewTexts = [
        "Amazing coffee! Best in town.",
        "Really enjoyed this drink. Will order again!",
        "Perfect morning pick-me-up.",
        "Good flavor but a bit pricey.",
        "Excellent quality and taste.",
        "My daily go-to coffee.",
        "Love the rich aroma and smooth finish.",
        "Could be better, expected more.",
        "Fantastic! Highly recommend.",
        "Great coffee, friendly staff.",
    ]

    let created = 0
    for (let i = existingReviews.length; i < count; i++) {
        const customerId = customerIds[Math.floor(Math.random() * customerIds.length)]
        const coffee = allCoffees[Math.floor(Math.random() * allCoffees.length)]

        // Check if this customer already reviewed this coffee
        const existingReview = await db.query.reviews.findFirst({
            where: (r, { and, eq }) => and(
                eq(r.customerId, customerId),
                eq(r.coffeeId, coffee.id)
            ),
        })

        if (!existingReview) {
            await db.insert(reviews).values({
                customerId,
                coffeeId: coffee.id,
                rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
                content: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
            })
            created++
        }
    }

    console.log(`   ✅ Created ${created} reviews`)
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function seed() {
    console.log("🌱 Starting database seed...\n")

    try {
        // 1. Seed categories first (no dependencies)
        await seedCategories()

        // 2. Seed coffees (depends on categories)
        await seedCoffees()

        // 3. Seed demo users (no dependencies)
        const demoUsers = await seedDemoUsers()

        // 4. Seed branches (optional manager reference)
        const branchIds = await seedBranches(demoUsers.manager)

        // 5. Seed additional delivery agents
        const deliveryAgentIds = await seedDeliveryAgents(5, branchIds)

        // 6. Seed random customers
        const customerIds = await seedRandomCustomers(15)

        // Add demo customer to the list
        if (demoUsers.customer) {
            customerIds.push(demoUsers.customer)
        }

        // 7. Seed orders with items, payments, deliveries
        await seedSampleOrders(customerIds, branchIds, deliveryAgentIds, 25)

        // 8. Seed reviews
        await seedReviews(customerIds, 20)

        console.log("\n✅ Database seeding completed successfully!")
        console.log("\n📋 Demo Login Credentials:")
        console.log("─".repeat(50))
        console.log("| Role     | Email                    | Password     |")
        console.log("─".repeat(50))
        console.log("| Admin    | admin@coffeehub.com      | Admin@123    |")
        console.log("| Manager  | manager@coffeehub.com    | Manager@123  |")
        console.log("| Staff    | staff@coffeehub.com      | Staff@123    |")
        console.log("| Delivery | delivery@coffeehub.com   | Delivery@123 |")
        console.log("| Customer | customer@coffeehub.com   | Customer@123 |")
        console.log("─".repeat(50))

    } catch (error) {
        console.error("\n❌ Seeding failed:", error)
        throw error
    }
}

// Run seed
seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
