import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChartSkeleton } from '@/components/ui/skeleton-patterns';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

interface ProfitLossData {
  month_label: string;
  income: number;
  expenses: number;
  profit: number;
}

export function ProfitLossWidget() {
  const [timeframe, setTimeframe] = useState('monthly');
  
  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ['profit-loss'],
    queryFn: async () => {
      const response = await apiClient.get<ProfitLossData[]>('/api/profit-loss');
      return response.data;
    }
  });

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.profit, 0);
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(total)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profit & Loss Overview</CardTitle>
          <div className="text-2xl font-bold">
            {formattedTotal}
          </div>
        </div>
        <Tabs value={timeframe} onValueChange={setTimeframe} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monthly" disabled>MTD</TabsTrigger>
            <TabsTrigger value="quarterly" disabled>Quarter</TabsTrigger>
            <TabsTrigger value="yearly" disabled>YTD</TabsTrigger>
          </TabsList>
        </Tabs>
        {queryError && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              {queryError instanceof Error ? queryError.message : 'An error occurred while fetching data'}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
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
              tickFormatter={(value) => `$${Math.abs(value)}`}
            />
            <Bar
              name="Income"
              dataKey="income"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-green-500"
            />
            <Bar
              name="Expenses"
              dataKey="expenses"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-red-500"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
