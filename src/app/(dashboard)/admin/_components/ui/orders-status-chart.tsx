"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { Cell, Pie, PieChart } from "recharts"

interface OrdersChartProps {
    data: Array<{
        status: string
        count: number
        color: string
    }>
}

export function OrdersStatusChart({ data }: OrdersChartProps) {
    const chartConfig = data.reduce((acc, item, index) => {
        acc[item.status] = {
            label: item.status,
            color: `hsl(var(--chart-${index + 1}))`,
        }
        return acc
    }, {} as ChartConfig)

    const total = data.reduce((sum, item) => sum + item.count, 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
                <CardDescription>Distribution of orders by current status</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="count"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            label={({ status, count }) => `${status}: ${count}`}
                            labelLine={false}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={`hsl(var(--chart-${index + 1}))`}
                                />
                            ))}
                        </Pie>
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name) => (
                                        <div className="flex items-center justify-between gap-4">
                                            <span>{name}</span>
                                            <span className="font-medium">
                                                {value} ({((Number(value) / total) * 100).toFixed(1)}%)
                                            </span>
                                        </div>
                                    )}
                                />
                            }
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
