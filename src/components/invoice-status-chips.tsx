import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Invoice {
  id: string
  date: string
  clientName: string
  amount: number
  status: "draft" | "sent" | "paid"
}

interface TimeRange {
  label: string
  value: string
}

interface InvoiceStatusChipsProps {
  invoices: Invoice[]
  className?: string
}

const timeRanges: TimeRange[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Quarter", value: "quarter" }
]

const statuses = ["draft", "sent", "paid"] as const

export function InvoiceStatusChips({ invoices, className }: InvoiceStatusChipsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = React.useState<string>("week")
  const [selectedStatuses, setSelectedStatuses] = React.useState<Set<string>>(new Set(statuses))

  const toggleStatus = (status: string) => {
    const newStatuses = new Set(selectedStatuses)
    if (newStatuses.has(status)) {
      newStatuses.delete(status)
    } else {
      newStatuses.add(status)
    }
    setSelectedStatuses(newStatuses)
  }

  const getFilteredInvoices = () => {
    const now = new Date()
    const startDate = new Date()

    switch (selectedTimeRange) {
      case "today":
        startDate.setHours(0, 0, 0, 0)
        break
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "quarter":
        startDate.setMonth(now.getMonth() - 3)
        break
      default:
        startDate.setDate(now.getDate() - 7) // default to week
    }

    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date)
      return (
        invoiceDate >= startDate &&
        invoiceDate <= now &&
        selectedStatuses.has(invoice.status)
      )
    })
  }

  const filteredInvoices = getFilteredInvoices()
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0)

  const getStatusColor = (status: string, isSelected: boolean) => {
    const baseColors = {
      draft: isSelected ? "bg-yellow-500 hover:bg-yellow-600" : "bg-yellow-500/20 hover:bg-yellow-500/30",
      sent: isSelected ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-500/20 hover:bg-blue-500/30",
      paid: isSelected ? "bg-green-500 hover:bg-green-600" : "bg-green-500/20 hover:bg-green-500/30"
    }
    return baseColors[status as keyof typeof baseColors] || ""
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Time Range Filters */}
      <div className="flex flex-wrap gap-2">
        {timeRanges.map((range) => (
          <Badge
            key={range.value}
            variant="outline"
            className={cn(
              "cursor-pointer transition-colors",
              selectedTimeRange === range.value
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            )}
            onClick={() => setSelectedTimeRange(range.value)}
          >
            {range.label}
          </Badge>
        ))}
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <Badge
            key={status}
            variant="outline"
            className={cn(
              "cursor-pointer transition-colors capitalize",
              getStatusColor(status, selectedStatuses.has(status))
            )}
            onClick={() => toggleStatus(status)}
          >
            {status}
          </Badge>
        ))}
      </div>

      {/* Filtered Results */}
      <Card className="bg-card/60">
        <CardContent className="p-4">
          <div className="grid gap-4">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{invoice.clientName}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(invoice.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={getStatusColor(invoice.status, true)}>
                    {invoice.status}
                  </Badge>
                  <span className="font-medium">
                    ${invoice.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between items-center pt-3 border-t">
            <span className="text-sm text-muted-foreground">
              {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
            </span>
            <span className="font-bold">
              Total: ${totalAmount.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
