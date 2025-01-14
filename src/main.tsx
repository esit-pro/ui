import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { AxiosError } from 'axios';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { useAuthStore } from './stores/authStore';
import { handleServerError } from './utils/handle-server-error';
import { toast } from './hooks/use-toast';
import { ThemeProvider } from './context/theme-context';
import './index.css';
// Generated Routes
import { routeTree } from './routeTree.gen';

// Constants
const STALE_TIME = 10 * 1000; // 10s
const MAX_RETRIES = 3;
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;
const NOT_MODIFIED = 304;
const INTERNAL_SERVER_ERROR = 500;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.log({ failureCount, error });

        if (failureCount >= 0 && import.meta.env.DEV) return false;
        if (failureCount > MAX_RETRIES && import.meta.env.PROD) return false;

        return !(
          error instanceof AxiosError &&
          [UNAUTHORIZED, FORBIDDEN].includes(error.response?.status ?? 0)
        );
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: STALE_TIME,
    },
    mutations: {
      onError: (error) => {
        handleServerError(error);

        if (error instanceof AxiosError) {
          if (error.response?.status === NOT_MODIFIED) {
            toast({
              variant: 'destructive',
              title: 'Content not modified!',
            });
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === UNAUTHORIZED) {
          toast({
            variant: 'destructive',
            title: 'Session expired!',
          });
          useAuthStore.getState().auth.reset();
          const redirect = `${router.history.location.href}`;
          router.navigate({ to: '/sign-in', search: { redirect } });
        }
        if (error.response?.status === INTERNAL_SERVER_ERROR) {
          toast({
            variant: 'destructive',
            title: 'Internal Server Error!',
          });
          router.navigate({ to: '/500' });
        }
        if (error.response?.status === FORBIDDEN) {
          // Implement FORBIDDEN error handling or remove this block
          // router.navigate({ to: '/forbidden', replace: true });
        }
      }
    },
  }),
});

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById('root');
if (rootElement) {
  if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <RouterProvider router={router} />
          </ThemeProvider>
        </QueryClientProvider>
      </StrictMode>
    );
  }
} else {
  console.error('Root element not found');
}
