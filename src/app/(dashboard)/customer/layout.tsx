import type { ReactNode } from "react"
import { DashboardHeader } from "../_components/ui/dashboard-header"
import { AuthGuard } from "../_components/interactive/auth-guard"

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["CUSTOMER"]}>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-6">{children}</main>
      </div>
    </AuthGuard>
  )
}
