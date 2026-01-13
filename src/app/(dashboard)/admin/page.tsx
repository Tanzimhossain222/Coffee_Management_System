import { DashboardContent } from "./_components/dashboard-content"

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your coffee shop.
        </p>
      </div>
      <DashboardContent />
    </div>
  )
}
