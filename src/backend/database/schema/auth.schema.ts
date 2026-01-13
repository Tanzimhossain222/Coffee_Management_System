import { relations } from "drizzle-orm"
import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import {
    loginAttemptEnum,
    userRoleEnum,
    userStatusEnum,
    verificationStatusEnum,
    verificationTypeEnum,
} from "../enums"
import { branches } from "./branch.schema"
import { cart } from "./cart.schema"
import { deliveries } from "./delivery.schema"
import { orders } from "./order.schema"
import { payments } from "./payment.schema"
import { reviews } from "./review.schema"
import { supportTickets } from "./support.schema"

// ============================================
// AUTH USERS TABLE (Authentication data)
// ============================================

export const authUsers = pgTable("auth_users", {
    id: uuid("id").defaultRandom().primaryKey(),
    username: varchar("username", { length: 50 }).unique().notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: userRoleEnum("role").notNull().default("CUSTOMER"),
    verified: boolean("verified").default(false).notNull(),
    status: userStatusEnum("status").default("ACTIVE").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ============================================
// USER PROFILES TABLE (User details - separate from auth)
// ============================================

export const userProfiles = pgTable("user_profiles", {
    id: uuid("id").defaultRandom().primaryKey(),
    authUserId: uuid("auth_user_id")
        .unique()
        .notNull()
        .references(() => authUsers.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phoneNo: varchar("phone_no", { length: 20 }),
    address: text("address"),
    branchId: uuid("branch_id").references(() => branches.id), 
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ============================================
// VERIFICATION CODES TABLE
// ============================================

export const verifications = pgTable("verifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    authUserId: uuid("auth_user_id")
        .notNull()
        .references(() => authUsers.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 10 }).notNull(),
    status: verificationStatusEnum("status").default("PENDING").notNull(),
    type: verificationTypeEnum("type").notNull(),
    issuedAt: timestamp("issued_at").defaultNow().notNull(),
    expiredAt: timestamp("expired_at").notNull(),
    verifiedAt: timestamp("verified_at"),
})

// ============================================
// LOGIN HISTORY TABLE
// ============================================

export const loginHistory = pgTable("login_history", {
    id: uuid("id").defaultRandom().primaryKey(),
    authUserId: uuid("auth_user_id")
        .notNull()
        .references(() => authUsers.id, { onDelete: "cascade" }),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    attempt: loginAttemptEnum("attempt").notNull(),
    loginTime: timestamp("login_time").defaultNow().notNull(),
})

// ============================================
// RELATIONS
// ============================================

export const authUsersRelations = relations(authUsers, ({ one, many }) => ({
    profile: one(userProfiles, {
        fields: [authUsers.id],
        references: [userProfiles.authUserId],
    }),
    verifications: many(verifications),
    loginHistory: many(loginHistory),
    orders: many(orders),
    deliveries: many(deliveries),
    cartItems: many(cart),
    reviews: many(reviews),
    payments: many(payments),
    supportTickets: many(supportTickets),
    assignedTickets: many(supportTickets, { relationName: "assignedTickets" }),
    managedBranches: many(branches),
}))

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
    authUser: one(authUsers, {
        fields: [userProfiles.authUserId],
        references: [authUsers.id],
    }),
    branch: one(branches, {
        fields: [userProfiles.branchId],
        references: [branches.id],
    }),
}))

export const verificationsRelations = relations(verifications, ({ one }) => ({
    authUser: one(authUsers, {
        fields: [verifications.authUserId],
        references: [authUsers.id],
    }),
}))

export const loginHistoryRelations = relations(loginHistory, ({ one }) => ({
    authUser: one(authUsers, {
        fields: [loginHistory.authUserId],
        references: [authUsers.id],
    }),
}))

// ============================================
// TYPE EXPORTS
// ============================================

export type AuthUser = typeof authUsers.$inferSelect
export type NewAuthUser = typeof authUsers.$inferInsert

export type UserProfile = typeof userProfiles.$inferSelect
export type NewUserProfile = typeof userProfiles.$inferInsert

export type Verification = typeof verifications.$inferSelect
export type NewVerification = typeof verifications.$inferInsert

export type LoginHistory = typeof loginHistory.$inferSelect
export type NewLoginHistory = typeof loginHistory.$inferInsert
