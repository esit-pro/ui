import { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from '@/components/ui/toaster'
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import Dashboard from '@/features/dashboard'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => {
    const defaultOpen = true
    return (
      <SearchProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <div
            id='content'
            className='max-w-full w-full ml-auto peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)] peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))] transition-[width] ease-linear duration-200 h-svh flex flex-col'
          >
            <Dashboard />
          </div>
          <Toaster />
          {import.meta.env.MODE === 'development' && (
            <>
              <ReactQueryDevtools buttonPosition='bottom-left' />
              <TanStackRouterDevtools position='bottom-right' />
            </>
          )}
        </SidebarProvider>
      </SearchProvider>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})
