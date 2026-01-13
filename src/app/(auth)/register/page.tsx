import { AuthCard } from "../_components/ui/auth-card"
import { RegisterForm } from "../_components/interactive/register-form"

export default function RegisterPage() {
  return (
    <AuthCard title="Create Account" description="Join Coffee Hub and start ordering your favorite coffee">
      <RegisterForm />
    </AuthCard>
  )
}
