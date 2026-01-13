import { db } from "@database/client"
import { authUsers, loginHistory, userProfiles, verifications } from "@database/schema"
import type { NewAuthUser, NewLoginHistory, NewUserProfile, NewVerification } from "@database/schema/auth.schema"
import bcrypt from "bcryptjs"
import { and, eq, gt } from "drizzle-orm"
import jwt from "jsonwebtoken"
import { emailService } from "./email.service"

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || "coffee-hub-secret-key-change-in-production"
const SALT_ROUNDS = 10
const VERIFICATION_EXPIRY_HOURS = 24
const PASSWORD_RESET_EXPIRY_HOURS = 1

// Types
export type UserRole = "CUSTOMER" | "ADMIN" | "MANAGER" | "STAFF" | "DELIVERY"

export interface RegisterInput {
    email: string
    password: string
    name: string
    role?: UserRole
    phoneNo?: string
}

export interface LoginInput {
    email: string
    password: string
    ipAddress?: string
    userAgent?: string
}

export interface AuthUser {
    id: string
    email: string
    username: string
    role: UserRole
    name: string
    verified: boolean
    phoneNo?: string | null
}

export interface AuthResult {
    success: boolean
    message: string
    token?: string
    user?: AuthUser
    requiresVerification?: boolean
}

/**
 * Generate a random verification code
 */
function generateVerificationCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
}

/**
 * Generate username from email
 */
function generateUsername(email: string): string {
    const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "_")
    const suffix = Math.random().toString(36).substring(2, 6)
    return `${base}_${suffix}`
}

export const authService = {
    /**
     * Register a new user
     * TRANSACTION: Ensures atomicity of user creation with profile and verification
     */
    async register(input: RegisterInput): Promise<AuthResult> {
        try {
            // Check if email already exists
            const existingUser = await db.query.authUsers.findFirst({
                where: eq(authUsers.email, input.email.toLowerCase()),
            })

            if (existingUser) {
                return { success: false, message: "Email already registered" }
            }

            // Generate username and hash password
            const username = generateUsername(input.email)
            const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)

            // Generate verification code
            const verificationCode = generateVerificationCode()
            const expiredAt = new Date()
            expiredAt.setHours(expiredAt.getHours() + VERIFICATION_EXPIRY_HOURS)

            // BEGIN TRANSACTION: Create user, profile, and verification atomically
            const result = await db.transaction(async (tx) => {
                // 1. Create auth user
                const [newAuthUser] = await tx
                    .insert(authUsers)
                    .values({
                        username,
                        email: input.email.toLowerCase(),
                        passwordHash,
                        role: input.role || "CUSTOMER",
                        verified: false,
                        status: "ACTIVE",
                    } satisfies NewAuthUser)
                    .returning()

                // 2. Create user profile
                await tx.insert(userProfiles).values({
                    authUserId: newAuthUser.id,
                    name: input.name,
                    email: input.email.toLowerCase(),
                    phoneNo: input.phoneNo,
                } satisfies NewUserProfile)

                // 3. Create verification record
                await tx.insert(verifications).values({
                    authUserId: newAuthUser.id,
                    code: verificationCode,
                    type: "EMAIL",
                    status: "PENDING",
                    expiredAt,
                } satisfies NewVerification)

                return newAuthUser
            })
            // END TRANSACTION

            // Send verification email (outside transaction - non-critical)
            await emailService.sendVerificationEmail(
                input.email,
                input.name,
                verificationCode
            )

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: result.id,
                    email: result.email,
                    role: result.role,
                },
                JWT_SECRET,
                { expiresIn: "7d" }
            )

            return {
                success: true,
                message: "Registration successful. Please check your email for verification code.",
                token,
                user: {
                    id: result.id,
                    email: result.email,
                    username: result.username,
                    role: result.role as UserRole,
                    name: input.name,
                    verified: false,
                    phoneNo: input.phoneNo,
                },
                requiresVerification: true,
            }
        } catch (error) {
            console.error("Registration error:", error)
            return { success: false, message: "Registration failed. Please try again." }
        }
    },

    /**
     * Login user
     */
    async login(input: LoginInput): Promise<AuthResult> {
        try {
            // Find user by email
            const authUser = await db.query.authUsers.findFirst({
                where: eq(authUsers.email, input.email.toLowerCase()),
                with: {
                    profile: true,
                },
            })

            // Log login attempt
            const logAttempt = async (userId: string, success: boolean) => {
                await db.insert(loginHistory).values({
                    authUserId: userId,
                    ipAddress: input.ipAddress,
                    userAgent: input.userAgent,
                    attempt: success ? "SUCCESS" : "FAILED",
                } satisfies NewLoginHistory)
            }

            if (!authUser) {
                return { success: false, message: "Invalid email or password" }
            }

            // Check password
            const passwordValid = await bcrypt.compare(input.password, authUser.passwordHash)

            if (!passwordValid) {
                await logAttempt(authUser.id, false)
                return { success: false, message: "Invalid email or password" }
            }

            // Check if account is active
            if (authUser.status !== "ACTIVE") {
                return { success: false, message: "Your account has been suspended. Please contact support." }
            }

            // Log successful login
            await logAttempt(authUser.id, true)

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: authUser.id,
                    email: authUser.email,
                    role: authUser.role,
                },
                JWT_SECRET,
                { expiresIn: "7d" }
            )

            return {
                success: true,
                message: "Login successful",
                token,
                user: {
                    id: authUser.id,
                    email: authUser.email,
                    username: authUser.username,
                    role: authUser.role as UserRole,
                    name: authUser.profile?.name || authUser.username,
                    verified: authUser.verified,
                    phoneNo: authUser.profile?.phoneNo,
                },
                requiresVerification: !authUser.verified,
            }
        } catch (error) {
            console.error("Login error:", error)
            return { success: false, message: "Login failed. Please try again." }
        }
    },

    /**
     * Verify email with code
     */
    async verifyEmail(userId: string, code: string): Promise<AuthResult> {
        try {
            // Find pending verification
            const verification = await db.query.verifications.findFirst({
                where: and(
                    eq(verifications.authUserId, userId),
                    eq(verifications.code, code.toUpperCase()),
                    eq(verifications.type, "EMAIL"),
                    eq(verifications.status, "PENDING"),
                    gt(verifications.expiredAt, new Date())
                ),
            })

            if (!verification) {
                return { success: false, message: "Invalid or expired verification code" }
            }

            // Update verification status
            await db
                .update(verifications)
                .set({ status: "USED", verifiedAt: new Date() })
                .where(eq(verifications.id, verification.id))

            // Mark user as verified
            await db
                .update(authUsers)
                .set({ verified: true, updatedAt: new Date() })
                .where(eq(authUsers.id, userId))

            // Get updated user
            const authUser = await db.query.authUsers.findFirst({
                where: eq(authUsers.id, userId),
                with: { profile: true },
            })

            if (!authUser) {
                return { success: false, message: "User not found" }
            }

            return {
                success: true,
                message: "Email verified successfully",
                user: {
                    id: authUser.id,
                    email: authUser.email,
                    username: authUser.username,
                    role: authUser.role as UserRole,
                    name: authUser.profile?.name || authUser.username,
                    verified: true,
                    phoneNo: authUser.profile?.phoneNo,
                },
            }
        } catch (error) {
            console.error("Verification error:", error)
            return { success: false, message: "Verification failed. Please try again." }
        }
    },

    /**
     * Resend verification email
     */
    async resendVerification(userId: string): Promise<AuthResult> {
        try {
            // Get user
            const authUser = await db.query.authUsers.findFirst({
                where: eq(authUsers.id, userId),
                with: { profile: true },
            })

            if (!authUser) {
                return { success: false, message: "User not found" }
            }

            if (authUser.verified) {
                return { success: false, message: "Email already verified" }
            }

            // Expire old verifications
            await db
                .update(verifications)
                .set({ status: "EXPIRED" })
                .where(and(
                    eq(verifications.authUserId, userId),
                    eq(verifications.type, "EMAIL"),
                    eq(verifications.status, "PENDING")
                ))

            // Generate new verification code
            const verificationCode = generateVerificationCode()
            const expiredAt = new Date()
            expiredAt.setHours(expiredAt.getHours() + VERIFICATION_EXPIRY_HOURS)

            await db.insert(verifications).values({
                authUserId: userId,
                code: verificationCode,
                type: "EMAIL",
                status: "PENDING",
                expiredAt,
            } satisfies NewVerification)

            // Send verification email
            await emailService.sendVerificationEmail(
                authUser.email,
                authUser.profile?.name || authUser.username,
                verificationCode
            )

            return {
                success: true,
                message: "Verification email sent",
            }
        } catch (error) {
            console.error("Resend verification error:", error)
            return { success: false, message: "Failed to resend verification email" }
        }
    },

    /**
     * Request password reset
     */
    async requestPasswordReset(email: string): Promise<AuthResult> {
        try {
            // Find user
            const authUser = await db.query.authUsers.findFirst({
                where: eq(authUsers.email, email.toLowerCase()),
                with: { profile: true },
            })

            // Always return success to prevent email enumeration
            if (!authUser) {
                return { success: true, message: "If an account exists, a reset email has been sent" }
            }

            // Expire old reset codes
            await db
                .update(verifications)
                .set({ status: "EXPIRED" })
                .where(and(
                    eq(verifications.authUserId, authUser.id),
                    eq(verifications.type, "PASSWORD_RESET"),
                    eq(verifications.status, "PENDING")
                ))

            // Generate reset code
            const resetCode = generateVerificationCode()
            const expiredAt = new Date()
            expiredAt.setHours(expiredAt.getHours() + PASSWORD_RESET_EXPIRY_HOURS)

            await db.insert(verifications).values({
                authUserId: authUser.id,
                code: resetCode,
                type: "PASSWORD_RESET",
                status: "PENDING",
                expiredAt,
            } satisfies NewVerification)

            // Send password reset email
            await emailService.sendPasswordResetEmail(
                authUser.email,
                authUser.profile?.name || authUser.username,
                resetCode
            )

            return {
                success: true,
                message: "If an account exists, a reset email has been sent",
            }
        } catch (error) {
            console.error("Password reset request error:", error)
            return { success: false, message: "Failed to process password reset request" }
        }
    },

    /**
     * Reset password with code
     */
    async resetPassword(email: string, code: string, newPassword: string): Promise<AuthResult> {
        try {
            // Find user
            const authUser = await db.query.authUsers.findFirst({
                where: eq(authUsers.email, email.toLowerCase()),
            })

            if (!authUser) {
                return { success: false, message: "Invalid reset request" }
            }

            // Find valid reset code
            const verification = await db.query.verifications.findFirst({
                where: and(
                    eq(verifications.authUserId, authUser.id),
                    eq(verifications.code, code.toUpperCase()),
                    eq(verifications.type, "PASSWORD_RESET"),
                    eq(verifications.status, "PENDING"),
                    gt(verifications.expiredAt, new Date())
                ),
            })

            if (!verification) {
                return { success: false, message: "Invalid or expired reset code" }
            }

            // Update verification status
            await db
                .update(verifications)
                .set({ status: "USED", verifiedAt: new Date() })
                .where(eq(verifications.id, verification.id))

            // Hash and update password
            const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
            await db
                .update(authUsers)
                .set({ passwordHash, updatedAt: new Date() })
                .where(eq(authUsers.id, authUser.id))

            return {
                success: true,
                message: "Password reset successfully. Please login with your new password.",
            }
        } catch (error) {
            console.error("Password reset error:", error)
            return { success: false, message: "Failed to reset password" }
        }
    },

    /**
     * Get user from JWT token
     */
    async getUserFromToken(token: string): Promise<AuthUser | null> {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

            const authUser = await db.query.authUsers.findFirst({
                where: eq(authUsers.id, decoded.userId),
                with: { profile: true },
            })

            if (!authUser || authUser.status !== "ACTIVE") {
                return null
            }

            return {
                id: authUser.id,
                email: authUser.email,
                username: authUser.username,
                role: authUser.role as UserRole,
                name: authUser.profile?.name || authUser.username,
                verified: authUser.verified,
                phoneNo: authUser.profile?.phoneNo,
            }
        } catch {
            return null
        }
    },
}
