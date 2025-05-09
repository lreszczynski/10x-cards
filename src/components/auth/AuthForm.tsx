import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
  onSubmit: (data: AuthFormData) => Promise<void>
  isLoading?: boolean
  error?: string
}

interface ValidationErrors {
  email?: string
  password?: string
  confirmPassword?: string
  acceptTerms?: string
}

export function AuthForm({ type, onSubmit, isLoading = false, error }: AuthFormProps) {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })
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
    
    // Validate all fields
    const errors: ValidationErrors = {}
    Object.keys(formData).forEach((field) => {
      const error = validateField(field as keyof AuthFormData, formData[field as keyof AuthFormData])
      if (error) {
        errors[field as keyof ValidationErrors] = error
      }
    })

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    await onSubmit(formData)
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
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={checked => updateField('acceptTerms', !!checked)}
                required
                aria-describedby={validationErrors.acceptTerms ? 'terms-error' : undefined}
              />
              <Label htmlFor="terms" className="text-sm">
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