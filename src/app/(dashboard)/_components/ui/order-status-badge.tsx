import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types";

interface OrderStatusBadgeProps {
  status: OrderStatus
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  CREATED: { label: "Pending", className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  ACCEPTED: { label: "Accepted", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  ASSIGNED: { label: "Assigned", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  PICKED_UP: { label: "Picked Up", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  DELIVERED: { label: "Delivered", className: "bg-green-500/10 text-green-600 border-green-500/20" },
  CANCELLED: { label: "Cancelled", className: "bg-red-500/10 text-red-600 border-red-500/20" },
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
