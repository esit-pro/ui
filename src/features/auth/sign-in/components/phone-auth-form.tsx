import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { API_URL } from '@/config/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PinInput, PinInputField } from '@/components/pin-input'
import { useToast } from '@/hooks/use-toast'

type PhoneAuthFormProps = HTMLAttributes<HTMLDivElement>

const phoneFormSchema = z.object({
  phone: z
    .string()
    .min(1, { message: 'Please enter your phone number' })
    .regex(/^\+?[1-9]\d{1,14}$/, { 
      message: 'Please enter a valid phone number' 
    }),
})

const otpFormSchema = z.object({
  otp: z
    .string()
    .length(6, { message: 'Please enter the 6-digit code' })
})

export function PhoneAuthForm({ className, ...props }: PhoneAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const phoneForm = useForm<z.infer<typeof phoneFormSchema>>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      phone: '',
    },
  })

  const otpForm = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: '',
    },
  })

  async function onPhoneSubmit(data: z.infer<typeof phoneFormSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: data.phone }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to send OTP')
      }
      
      setShowOTP(true)
      toast({
        title: "Code Sent",
        description: "Please check your phone for the verification code",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send code",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onOTPSubmit(data: z.infer<typeof otpFormSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phoneForm.getValues('phone'),
          otp: data.otp 
        }),
      })
      
      if (!response.ok) {
        throw new Error('Invalid verification code')
      }

      const { token } = await response.json()
      
      // Store the token
      localStorage.setItem('authToken', token)
      
      // Navigate to root (dashboard)
      navigate({ to: '/' })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify code",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      {!showOTP ? (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}>
            <div className='grid gap-2'>
              <FormField
                control={phoneForm.control}
                name='phone'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder='+1234567890'
                        type="tel"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className='mt-2' disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Code"}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onOTPSubmit)}>
            <div className='grid gap-2'>
              <FormField
                control={otpForm.control}
                name='otp'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <PinInput
                        onComplete={(value) => {
                          field.onChange(value)
                          otpForm.handleSubmit(onOTPSubmit)()
                        }}
                        className="flex gap-2"
                      >
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                      </PinInput>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between items-center mt-2">
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={() => {
                    setShowOTP(false)
                    otpForm.reset()
                  }}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}
