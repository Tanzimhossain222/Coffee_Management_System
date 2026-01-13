import { ForgotPasswordForm } from "../_components/interactive/forgot-password-form"
import { AuthCard } from "../_components/ui/auth-card"

export default function ForgotPasswordPage() {
    return (
        <AuthCard
            title="Forgot Password?"
            description="No worries, we'll send you reset instructions"
        >
            <ForgotPasswordForm />
        </AuthCard>
    )
}
