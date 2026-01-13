import type { Coffee } from "@/types"

// Mock coffee items for menu display
// TODO: Replace with database data via API
export const mockCoffees: Coffee[] = [
    {
        id: "coffee-1",
        name: "Espresso",
        description: "Rich and bold single shot of pure coffee essence",
        price: 3.5,
        image: "/espresso-coffee-shot.jpg",
        available: true,
        category: "hot",
    },
    {
        id: "coffee-2",
        name: "Cappuccino",
        description: "Espresso with steamed milk and a cap of foam",
        price: 4.5,
        image: "/cappuccino.jpg",
        available: true,
        category: "hot",
    },
    {
        id: "coffee-3",
        name: "Iced Latte",
        description: "Chilled espresso with cold milk over ice",
        price: 5.0,
        image: "/iced-latte.jpg",
        available: true,
        category: "cold",
    },
    {
        id: "coffee-4",
        name: "Mocha",
        description: "Espresso with chocolate and steamed milk",
        price: 5.0,
        image: "/mocha.jpg",
        available: true,
        category: "specialty",
    },
    {
        id: "coffee-5",
        name: "Americano",
        description: "Espresso diluted with hot water",
        price: 3.0,
        image: "/americano.jpg",
        available: true,
        category: "hot",
    },
    {
        id: "coffee-6",
        name: "Cold Brew",
        description: "Slow-steeped coffee served cold",
        price: 4.5,
        image: "/cold-brew.jpg",
        available: true,
        category: "cold",
    },
]

// Export empty array since we removed mock users
export const mockUsers: never[] = []
export const mockOrders: never[] = []
