import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ReloadIcon } from '@radix-ui/react-icons'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'

export interface AuthFormData {
  email: string
  password: string
  confirmPassword?: string
  acceptTerms?: boolean
}

interface AuthFormProps {
  type: 'login' | 'register' | 'reset'
}

interface ValidationErrors {
  email?: string
  password?: string
  confirmPassword?: string
  acceptTerms?: string
}

export function AuthForm({ type }: AuthFormProps) {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [success, setSuccess] = useState<string>()
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (field: keyof AuthFormData, value: string | boolean) => {
    const errors: ValidationErrors = {}

    switch (field) {
      case 'email':
        if (!value) {
          errors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(value as string)) {
          errors.email = 'Please enter a valid email address'
        }
        break
      case 'password':
        if (type !== 'reset' && !value) {
          errors.password = 'Password is required'
        } else if (type === 'register' && (value as string).length < 8) {
          errors.password = 'Password must be at least 8 characters long'
        }
        break
      case 'confirmPassword':
        if (type === 'register') {
          if (!value) {
            errors.confirmPassword = 'Please confirm your password'
          } else if (value !== formData.password) {
            errors.confirmPassword = 'Passwords do not match'
          }
        }
        break
      case 'acceptTerms':
        if (type === 'register' && !value) {
          errors.acceptTerms = 'You must accept the terms and conditions'
        }
        break
    }

    return errors[field]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(undefined)
    setSuccess(undefined)
    
    // Validate all fields
    const errors: ValidationErrors = {}
    Object.keys(formData).forEach((field) => {
      const fieldName = field as keyof AuthFormData
      const error = validateField(fieldName, formData[fieldName] || '')
      if (error) {
        errors[fieldName] = error
      }
    })

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setIsLoading(true)

    try {
      if (type === 'login') {
        console.log('Sending login request...');
        
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Unexpected response type:', contentType);
          const text = await response.text();
          console.error('Response body:', text);
          throw new Error('Server returned an invalid response');
        }

        const text = await response.text();
        console.log('Response text:', text);

        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse JSON:', e);
          throw new Error('Invalid response format from server');
        }

        if (!response.ok) {
          throw new Error(data.error || 'Failed to sign in');
        }

        if (!data.user) {
          throw new Error('No user data received');
        }

        console.log('Login successful, redirecting...');
        window.location.href = '/generate';
      } else if (type === 'register') {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned an invalid response');
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create account');
        }

        if (data.user && !data.user.confirmed_at) {
          setSuccess('Please check your email for a confirmation link to complete your registration.');
        } else {
          window.location.href = '/generate';
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  const updateField = (field: keyof AuthFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, value)
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={e => updateField('email', e.target.value)}
          onBlur={() => updateField('email', formData.email)}
          required
          aria-describedby={validationErrors.email ? 'email-error' : undefined}
          className={validationErrors.email && touched.email ? 'border-destructive' : ''}
        />
        {validationErrors.email && touched.email && (
          <p id="email-error" className="text-sm text-destructive">{validationErrors.email}</p>
        )}
      </div>

      {type !== 'reset' && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={e => updateField('password', e.target.value)}
            onBlur={() => updateField('password', formData.password)}
            required
            aria-describedby={validationErrors.password ? 'password-error' : undefined}
            className={validationErrors.password && touched.password ? 'border-destructive' : ''}
          />
          {validationErrors.password && touched.password && (
            <p id="password-error" className="text-sm text-destructive">{validationErrors.password}</p>
          )}
          {type === 'register' && <PasswordStrengthIndicator password={formData.password} />}
        </div>
      )}

      {type === 'register' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={e => updateField('confirmPassword', e.target.value)}
              onBlur={() => formData.confirmPassword !== undefined && updateField('confirmPassword', formData.confirmPassword)}
              required
              aria-describedby={validationErrors.confirmPassword ? 'confirm-password-error' : undefined}
              className={validationErrors.confirmPassword && touched.confirmPassword ? 'border-destructive' : ''}
            />
            {validationErrors.confirmPassword && touched.confirmPassword && (
              <p id="confirm-password-error" className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={formData.acceptTerms}
                onChange={(e) => updateField('acceptTerms', e.target.checked)}
              />
              <Label 
                htmlFor="terms" 
                className="text-sm cursor-pointer select-none"
              >
                I accept the terms and conditions
              </Label>
            </div>
            {validationErrors.acceptTerms && touched.acceptTerms && (
              <p id="terms-error" className="text-sm text-destructive">{validationErrors.acceptTerms}</p>
            )}
          </div>
        </>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
        {type === 'login' && 'Sign In'}
        {type === 'register' && 'Create Account'}
        {type === 'reset' && 'Reset Password'}
      </Button>
    </form>
  )
} 