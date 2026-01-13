import { AdminOrders } from "../_components/interactive/admin-orders"

export default function OrdersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                <p className="text-muted-foreground">
                    Manage and process incoming customer orders
                </p>
            </div>
            <AdminOrders />
        </div>
    )
}
