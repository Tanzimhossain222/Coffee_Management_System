"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface TopProductsChartProps {
    data: Array<{
        name: string
        sales: number
        revenue: number
    }>
}

const chartConfig = {
    sales: {
        label: "Sales",
        color: "hsl(var(--chart-1))",
    },
    revenue: {
        label: "Revenue",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export function TopProductsChart({ data }: TopProductsChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best selling coffee items</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" tickLine={false} axisLine={false} />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            width={80}
                        />
                        <ChartTooltip
                            cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name) => (
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {name === "revenue" ? `$${value}` : `${value} units`}
                                            </span>
                                        </div>
                                    )}
                                />
                            }
                        />
                        <Bar
                            dataKey="sales"
                            fill="var(--color-sales)"
                            radius={[0, 4, 4, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
