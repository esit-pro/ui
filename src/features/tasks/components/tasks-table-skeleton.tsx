import { TableSkeleton } from "@/components/ui/skeleton-patterns"

export function TasksTableSkeleton() {
  // Use 10 rows to match typical tasks table pagination
  return <TableSkeleton rows={10} />
}
