import type { ReactNode } from "react"
import { AuthNavbar } from "./_components/ui/auth-navbar"

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
            <AuthNavbar />
            <main className="flex-1 flex items-center justify-center p-4">
                {children}
            </main>
        </div>
    )
}
