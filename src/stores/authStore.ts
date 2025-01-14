import { create } from 'zustand'

const AUTH_TOKEN = 'authToken'

interface AuthUser {
  phone: string
  exp: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  // Initialize with dev token in development
  const devToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6IisxMjM0NTY3ODkwIiwiaWF0IjoxNzA1MjM5MDIyfQ.KkUc8mJFp9eSXMhwBtJhGGqZJGkY-mAYxqoFPXHrXkE';
  const storedToken = import.meta.env.DEV ? devToken : localStorage.getItem(AUTH_TOKEN);
  const initToken = storedToken || '';
  
  // Save dev token to localStorage in development
  if (import.meta.env.DEV && !localStorage.getItem(AUTH_TOKEN)) {
    localStorage.setItem(AUTH_TOKEN, devToken);
  }

  return {
    auth: {
      user: null,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          localStorage.setItem(AUTH_TOKEN, accessToken)
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          localStorage.removeItem(AUTH_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          localStorage.removeItem(AUTH_TOKEN)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})

export const useAuth = () => useAuthStore((state) => state.auth)
