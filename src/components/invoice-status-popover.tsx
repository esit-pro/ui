import * as React from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Invoice {
  id: string
  date: string
  clientName: string
  amount: number
  status: "draft" | "sent" | "paid"
}

interface InvoiceStatusPopoverProps {
  status: "draft" | "sent" | "paid"
  invoices: Invoice[]
  className?: string
  children: React.ReactNode
}

export function InvoiceStatusPopover({
  status,
  invoices,
  className,
  children
}: InvoiceStatusPopoverProps) {
  const filteredInvoices = invoices.filter(invoice => invoice.status === status)

  return (
    <Popover>
      <PopoverTrigger className={cn("cursor-pointer w-full", className)}>
        <Card className="bg-card/60 hover:bg-card/80 transition-colors">
          <CardContent className="p-3">
            {children}
          </CardContent>
        </Card>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg capitalize">{status} Invoices</CardTitle>
            <CardDescription>
              {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="mb-4 rounded-lg border p-3 last:mb-0 hover:bg-accent"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{invoice.clientName}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-1 text-sm font-medium text-muted-foreground">
                    ${invoice.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
