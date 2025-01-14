import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import TasksProvider from './context/tasks-context'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { TableSkeleton } from '@/components/ui/skeleton-patterns'
import { useToast } from '@/hooks/use-toast'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tasks')
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch tasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <TasksProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Tasks</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <TasksPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          {loading ? (
            <TableSkeleton rows={10} />
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <p className="text-muted-foreground">No tasks found</p>
              <Button onClick={fetchTasks}>Refresh</Button>
            </div>
          ) : (
            <DataTable data={tasks} columns={columns} />
          )}
        </div>
      </Main>

      <TasksDialogs />
    </TasksProvider>
  )
}
