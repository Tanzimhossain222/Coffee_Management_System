import { CustomerOrders } from "../_components/interactive/customer-orders"

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <CustomerOrders />
    </div>
  )
}
