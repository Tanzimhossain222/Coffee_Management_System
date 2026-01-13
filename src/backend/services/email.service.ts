import nodemailer from "nodemailer"

// Email configuration from environment variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
})

export interface SendEmailOptions {
    to: string
    subject: string
    html: string
    text?: string
}

export const emailService = {
    /**
     * Send an email using configured SMTP
     */
    async send(options: SendEmailOptions): Promise<boolean> {
        try {
            await transporter.sendMail({
                from: `"Coffee Hub" <${process.env.SMTP_USER}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            })
            console.log(`✅ Email sent to ${options.to}`)
            return true
        } catch (error) {
            console.error("❌ Failed to send email:", error)
            return false
        }
    },

    /**
     * Send verification email with code
     */
    async sendVerificationEmail(email: string, name: string, code: string): Promise<boolean> {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify Your Email</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">☕ Coffee Hub</h1>
                                        <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your favorite coffee, delivered</p>
                                    </td>
                                </tr>
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px;">
                                        <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px; font-weight: 600;">Verify Your Email</h2>
                                        <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                                            Hi ${name},
                                        </p>
                                        <p style="margin: 0 0 30px; color: #52525b; font-size: 16px; line-height: 1.6;">
                                            Welcome to Coffee Hub! Please use the verification code below to complete your registration:
                                        </p>
                                        <!-- Code Box -->
                                        <div style="background-color: #f4f4f5; border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px;">
                                            <p style="margin: 0 0 10px; color: #71717a; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                                            <p style="margin: 0; color: #18181b; font-size: 36px; font-weight: 700; letter-spacing: 8px;">${code}</p>
                                        </div>
                                        <p style="margin: 0 0 10px; color: #52525b; font-size: 14px; line-height: 1.6;">
                                            This code will expire in <strong>24 hours</strong>.
                                        </p>
                                        <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                                            If you didn't create an account with Coffee Hub, you can safely ignore this email.
                                        </p>
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 30px 40px; background-color: #f4f4f5; border-radius: 0 0 16px 16px; text-align: center;">
                                        <p style="margin: 0 0 10px; color: #71717a; font-size: 14px;">
                                            Need help? Contact us at support@coffeehub.com
                                        </p>
                                        <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                                            © ${new Date().getFullYear()} Coffee Hub. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `

        const text = `
            Hi ${name},

            Welcome to Coffee Hub! Please use the verification code below to complete your registration:

            Your Verification Code: ${code}

            This code will expire in 24 hours.

            If you didn't create an account with Coffee Hub, you can safely ignore this email.

            © ${new Date().getFullYear()} Coffee Hub
        `

        return this.send({
            to: email,
            subject: "Verify Your Email - Coffee Hub",
            html,
            text,
        })
    },

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email: string, name: string, code: string): Promise<boolean> {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Your Password</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); border-radius: 16px 16px 0 0;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">☕ Coffee Hub</h1>
                                        <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Password Reset Request</p>
                                    </td>
                                </tr>
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px;">
                                        <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                                        <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                                            Hi ${name},
                                        </p>
                                        <p style="margin: 0 0 30px; color: #52525b; font-size: 16px; line-height: 1.6;">
                                            We received a request to reset your password. Use the code below to proceed:
                                        </p>
                                        <!-- Code Box -->
                                        <div style="background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px;">
                                            <p style="margin: 0 0 10px; color: #71717a; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Reset Code</p>
                                            <p style="margin: 0; color: #dc2626; font-size: 36px; font-weight: 700; letter-spacing: 8px;">${code}</p>
                                        </div>
                                        <p style="margin: 0 0 10px; color: #52525b; font-size: 14px; line-height: 1.6;">
                                            This code will expire in <strong>1 hour</strong>.
                                        </p>
                                        <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                                            If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                                        </p>
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 30px 40px; background-color: #f4f4f5; border-radius: 0 0 16px 16px; text-align: center;">
                                        <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                                            © ${new Date().getFullYear()} Coffee Hub. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `

        return this.send({
            to: email,
            subject: "Reset Your Password - Coffee Hub",
            html,
            text: `Hi ${name}, Use code ${code} to reset your password. Expires in 1 hour.`,
        })
    },

    /**
     * Test email configuration
     */
    async testConnection(): Promise<boolean> {
        try {
            await transporter.verify()
            console.log("✅ Email service connected")
            return true
        } catch (error) {
            console.error("❌ Email service connection failed:", error)
            return false
        }
    },
}
