import { and, desc, eq } from "drizzle-orm"
import { db } from "../database/client"
import { authUsers, supportTickets, userProfiles } from "../database/schema"
import { NewSupportTicket, SupportTicket } from "../database/schema/support.schema"

export const supportService = {
  async createTicket(data: NewSupportTicket) {
    const [ticket] = await db.insert(supportTickets).values(data).returning()
    return ticket
  },

  async getCustomerTickets(customerId: string) {
    return await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.customerId, customerId))
      .orderBy(desc(supportTickets.createdAt))
  },

  async getAllTickets(status?: string) {
    const conditions = []
    if (status && status !== "all") {
      conditions.push(eq(supportTickets.status, status as any))
    }

    return await db
      .select({
        id: supportTickets.id,
        customerId: supportTickets.customerId,
        customerName: userProfiles.name,
        customerEmail: userProfiles.email,
        orderId: supportTickets.orderId,
        subject: supportTickets.subject,
        description: supportTickets.description,
        status: supportTickets.status,
        priority: supportTickets.priority,
        assignedTo: supportTickets.assignedTo,
        createdAt: supportTickets.createdAt,
        updatedAt: supportTickets.updatedAt,
        resolvedAt: supportTickets.resolvedAt,
      })
      .from(supportTickets)
      .innerJoin(authUsers, eq(supportTickets.customerId, authUsers.id))
      .innerJoin(userProfiles, eq(authUsers.id, userProfiles.authUserId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(supportTickets.createdAt))
  },

  async updateTicket(id: string, data: Partial<SupportTicket>) {
    const [updated] = await db
      .update(supportTickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning()
    return updated
  },

  async deleteTicket(id: string) {
    const [deleted] = await db
      .delete(supportTickets)
      .where(eq(supportTickets.id, id))
      .returning()
    return deleted
  }
}
