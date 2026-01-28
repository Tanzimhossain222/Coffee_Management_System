import type { ReactNode } from "react"
import { AuthGuard } from "../_components/interactive/auth-guard"
import { DashboardHeader } from "../_components/ui/dashboard-header"

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["STAFF"]}>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </AuthGuard>
  )
}
