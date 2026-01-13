import { MenuManagement } from "../_components/interactive/menu-management"

export default function MenuPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Menu</h1>
        <p className="text-muted-foreground">
          Manage your coffee menu items and pricing
        </p>
      </div>
      <MenuManagement />
    </div>
  )
}
