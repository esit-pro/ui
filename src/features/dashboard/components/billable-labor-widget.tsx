import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartSkeleton } from "@/components/ui/skeleton-patterns"
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'

type LaborSummary = {
  month_label: string
  month_date: string
  outstanding_labor: number
  paid_labor: number
}

export function BillableLaborWidget() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['labor-monthly-summary'],
    queryFn: async () => {
      const response = await apiClient.get<LaborSummary[]>('/api/labor/monthly-summary')
      if (!Array.isArray(response.data) || response.data.length === 0) {
        throw new Error('No labor data available. Try reseeding the demo data.')
      }
      return response.data
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billable Labor Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (error instanceof Error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billable Labor Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            {error.message}. Please try reseeding the demo data by clicking Settings {'>'} Demo {'>'} Reset Demo Data.
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentMonthData = data[data.length - 1]
  const totalOutstanding = currentMonthData?.outstanding_labor || 0

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-2">
          <CardTitle>Billable Labor Status</CardTitle>
          <div className="text-2xl font-bold">
            {formatCurrency(totalOutstanding)}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              outstanding this month
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="month_label" 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value/1000}k`}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelStyle={{ color: '#888888' }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
            <Bar 
              dataKey="outstanding_labor" 
              name="Outstanding Labor" 
              fill="hsl(var(--warning))"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="paid_labor" 
              name="Paid Labor" 
              fill="hsl(var(--success))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
