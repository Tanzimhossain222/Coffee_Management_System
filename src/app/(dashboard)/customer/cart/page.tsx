import { CartList } from "../_components/interactive/cart-list"
import { CheckoutForm } from "../_components/interactive/checkout-form"

export default function CartPage() {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        <CartList />
      </div>
      <div>
        <CheckoutForm />
      </div>
    </div>
  )
}
