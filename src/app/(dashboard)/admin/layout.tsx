import type { ReactNode } from "react"
import { AuthGuard } from "../_components/interactive/auth-guard"
import { AdminSidebar } from "./_components/admin-sidebar"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <div className="flex min-h-screen w-full">
        <AdminSidebar>{children}</AdminSidebar>
      </div>
    </AuthGuard>
  )
}
