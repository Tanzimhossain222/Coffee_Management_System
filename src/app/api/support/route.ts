import { supportService } from "@/backend/services"
import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from '../_lib'


export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const tickets = await supportService.getCustomerTickets(user.id)
    return NextResponse.json({ success: true, data: tickets })
  } catch (error) {
    console.error("Support API Error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { subject, description, orderId, priority } = body

    if (!subject || !description) {
      return NextResponse.json({ success: false, message: "Subject and description are required" }, { status: 400 })
    }

    // Basic UUID validation for orderId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const validOrderId = orderId && uuidRegex.test(orderId) ? orderId : null

    const ticket = await supportService.createTicket({
      customerId: user.id,
      subject,
      description,
      orderId: validOrderId,
      priority: priority || "MEDIUM",
      status: "OPEN",
    })

    return NextResponse.json({ success: true, data: ticket })
  } catch (error) {
    console.error("Support API Error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
