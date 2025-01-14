import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { PhoneAuthForm } from './components/phone-auth-form'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'

export default function SignIn() {
  const navigate = useNavigate()

  const handleDevLogin = () => {
    // Token signed with JWT_SECRET=JUDESUljhWLoHaHwY4vIicdCaKLVO199eYv5WkpadlQ=
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6IisxMjM0NTY3ODkwIiwiaWF0IjoxNzA1MjM5MDIyfQ.KkUc8mJFp9eSXMhwBtJhGGqZJGkY-mAYxqoFPXHrXkE'
    localStorage.setItem('authToken', token)
    navigate({ to: '/' })  // Root path is the dashboard in authenticated routes
  }

  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='flex flex-col space-y-2 text-left'>
          <h1 className='text-2xl font-semibold tracking-tight'>Login</h1>
          <p className='text-sm text-muted-foreground'>
            Enter your phone number to receive <br />
            a one-time verification code
          </p>
        </div>
        <PhoneAuthForm />
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={handleDevLogin}
            className="w-full"
          >
            Dev Mode Login
          </Button>
        </div>
        <p className='mt-4 px-8 text-center text-sm text-muted-foreground'>
          By clicking login, you agree to our{' '}
          <a
            href='/terms'
            className='underline underline-offset-4 hover:text-primary'
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href='/privacy'
            className='underline underline-offset-4 hover:text-primary'
          >
            Privacy Policy
          </a>
          .
        </p>
      </Card>
    </AuthLayout>
  )
}
