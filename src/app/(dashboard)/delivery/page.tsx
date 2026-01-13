import { DeliveryOrders } from "./_components/interactive/delivery-orders"

export default function DeliveryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Deliveries</h1>
      <DeliveryOrders />
    </div>
  )
}
