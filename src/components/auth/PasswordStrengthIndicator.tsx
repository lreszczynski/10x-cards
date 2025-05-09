import { Progress } from '@/components/ui/progress'

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const calculateStrength = (password: string): number => {
    if (!password) return 0

    let strength = 0
    const checks = {
      length: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    strength = Object.values(checks).filter(Boolean).length * 20

    return strength
  }

  const strength = calculateStrength(password)
  const getStrengthText = (strength: number): string => {
    if (strength === 0) return 'Very Weak'
    if (strength <= 20) return 'Weak'
    if (strength <= 40) return 'Fair'
    if (strength <= 60) return 'Good'
    if (strength <= 80) return 'Strong'
    return 'Very Strong'
  }

  const getStrengthColor = (strength: number): string => {
    if (strength <= 20) return 'text-destructive'
    if (strength <= 40) return 'text-warning'
    if (strength <= 60) return 'text-info'
    return 'text-success'
  }

  return (
    <div className="space-y-2">
      <Progress value={strength} className="h-2" />
      <p className={`text-sm ${getStrengthColor(strength)}`}>
        Password Strength: {getStrengthText(strength)}
      </p>
      <ul className="text-sm text-muted-foreground space-y-1">
        <li>• At least 8 characters</li>
        <li>• At least one number</li>
        <li>• At least one lowercase letter</li>
        <li>• At least one uppercase letter</li>
        <li>• At least one special character</li>
      </ul>
    </div>
  )
} 