import { Button } from "@/components/ui/button"
import { Coffee, Shield, ShoppingBag, Truck } from "lucide-react"
import Link from "next/link"
import type React from "react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Coffee Hub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
              Coffee Delivery for <span className="text-primary">Developers</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Quick and reliable coffee delivery during your work hours. Order your favorite brew and get it delivered
              right to your workspace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                  Start Ordering
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8 bg-transparent">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16 border-t border-border">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<ShoppingBag className="h-8 w-8" />}
              title="Browse & Order"
              description="Explore our menu of premium coffees and place your order in seconds."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Area-Based Delivery"
              description="Orders are matched with shops in your area for fast, reliable delivery."
            />
            <FeatureCard
              icon={<Truck className="h-8 w-8" />}
              title="Track & Receive"
              description="Real-time order tracking from preparation to delivery at your desk."
            />
          </div>
        </section>

        {/* Roles Section */}
        <section className="container mx-auto px-4 py-16 border-t border-border">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Multi-Role Platform</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Whether you are ordering coffee, managing a shop, or delivering orders, we have got you covered.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <RoleCard
              title="Customer"
              description="Browse menu, place orders, and track your coffee delivery in real-time."
            />
            <RoleCard
              title="Shop Admin"
              description="Manage your menu, accept orders, and assign deliveries to agents."
            />
            <RoleCard
              title="Delivery Agent"
              description="View assigned orders, pick up coffee, and update delivery status."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Coffee Hub - Developer Coffee Delivery System</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}

function RoleCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-secondary/50 border border-border">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}
