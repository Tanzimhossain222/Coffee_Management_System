import { VerifyEmailForm } from "../_components/interactive/verify-email-form"
import { AuthCard } from "../_components/ui/auth-card"

export default function VerifyEmailPage() {
    return (
        <AuthCard
            title="Verify Your Email"
            description="We've sent a verification code to your email address"
        >
            <VerifyEmailForm />
        </AuthCard>
    )
}
