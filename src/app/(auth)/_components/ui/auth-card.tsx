import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface AuthCardProps {
    title: string
    description: string
    children: ReactNode
    footer?: ReactNode
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
    return (
        <div className="w-full max-w-md space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <Card className="border-border/50 shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        {title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        {description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    {children}
                </CardContent>
                {footer && (
                    <div className="px-6 pb-6">
                        {footer}
                    </div>
                )}
            </Card>
        </div>
    )
}
