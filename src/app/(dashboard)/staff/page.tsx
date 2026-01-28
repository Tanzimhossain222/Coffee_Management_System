import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Construction, LayoutGrid, Package, Users } from "lucide-react"

export default function StaffPage() {
  const upcomingFeatures = [
    { icon: LayoutGrid, title: "Order Management", desc: "Live order tracking and processing" },
    { icon: Package, title: "Inventory", desc: "Real-time stock monitoring" },
    { icon: Users, title: "Customer Sync", desc: "In-store customer profile access" },
    { icon: Clock, title: "Shift Scheduler", desc: "Personal shift logs and history" },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="px-2 py-0.5 text-xs font-medium border-primary/30 text-primary">
              v1.5 Coming Soon
            </Badge>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Staff Dash<span className="text-primary">board</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Welcome to your future unified workspace.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <Card className="md:col-span-2 overflow-hidden border-2 border-dashed border-primary/20 bg-primary/5">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
              <Construction className="h-8 w-8 text-primary animate-bounce-slow" />
            </div>
            <CardTitle className="text-2xl font-bold">Preparation in Progress</CardTitle>
            <CardDescription className="max-w-lg mx-auto text-base">
              We&apos;re crafting a tailored experience for our shop staff to streamline every cup brewed and every order served.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8 sticky">
             <div className="flex gap-2">
               <div className="h-1.5 w-12 rounded-full bg-primary/30" />
               <div className="h-1.5 w-12 rounded-full bg-primary/30" />
               <div className="h-1.5 w-12 rounded-full bg-primary animate-pulse" />
               <div className="h-1.5 w-12 rounded-full bg-primary/30" />
             </div>
          </CardContent>
        </Card>

        {upcomingFeatures.map((feature, idx) => (
          <Card key={idx} className="group hover:border-primary/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg">{feature.icon && <feature.icon className="h-4 w-4 inline mr-2 md:hidden" />}{feature.title}</CardTitle>
                <CardDescription>{feature.desc}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Clock className="h-4 w-4" />
          Scheduled for Q2 2026 deployment
        </p>
      </div>
    </div>
  )
}
