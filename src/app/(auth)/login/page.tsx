import { AuthCard } from "../_components/ui/auth-card"
import { LoginForm } from "../_components/interactive/login-form"

export default function LoginPage() {
  return (
    <AuthCard title="Welcome Back" description="Sign in to your Coffee Hub account to continue">
      <LoginForm />
    </AuthCard>
  )
}
