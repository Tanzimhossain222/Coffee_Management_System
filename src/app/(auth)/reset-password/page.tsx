import { ResetPasswordForm } from "../_components/interactive/reset-password-form"
import { AuthCard } from "../_components/ui/auth-card"

export default function ResetPasswordPage() {
    return (
        <AuthCard
            title="Reset Password"
            description="Enter your reset code and create a new password"
        >
            <ResetPasswordForm />
        </AuthCard>
    )
}
