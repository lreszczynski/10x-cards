# Specyfikacja architektury autentykacji dla 10x-cards

## 1. Przegląd architektury

System autentykacji będzie oparty o Supabase Auth, zintegrowany z Astro i React, wykorzystując server-side rendering oraz client-side components gdzie to konieczne. Całość będzie zgodna z wymaganiami RODO i najlepszymi praktykami bezpieczeństwa.

### 1.1. Kluczowe założenia

- Wykorzystanie Supabase Auth jako głównego mechanizmu autentykacji
- Server-side rendering (SSR) dla stron statycznych
- Client-side React components dla interaktywnych elementów formularzy
- Wykorzystanie Shadcn/ui dla spójnego interfejsu użytkownika
- Implementacja middleware do zarządzania sesją użytkownika
- Obsługa Row Level Security (RLS) w Supabase

## 2. Architektura interfejsu użytkownika

### 2.1. Strony (Astro)

#### `/auth/login`
- Strona logowania z formularzem React
- Obsługa przekierowania po udanym logowaniu
- Linki do rejestracji i resetowania hasła
- Server-side walidacja sesji

#### `/auth/register`
- Strona rejestracji z formularzem React
- Walidacja danych wejściowych
- Obsługa przekierowania po udanej rejestracji
- Informacja o polityce prywatności i RODO

#### `/auth/reset-password`
- Strona resetowania hasła
- Dwuetapowy proces: żądanie resetu i ustawienie nowego hasła
- Walidacja tokenu resetu

#### `/auth/verify`
- Strona weryfikacji email
- Obsługa tokenów weryfikacyjnych
- Komunikaty o statusie weryfikacji

### 2.2. Komponenty React

#### `AuthForm.tsx`
```typescript
interface AuthFormProps {
  type: 'login' | 'register' | 'reset';
  onSubmit: (data: AuthFormData) => Promise<void>;
  isLoading: boolean;
}
```
- Reużywalny komponent formularza
- Walidacja w czasie rzeczywistym
- Obsługa błędów i komunikatów
- Integracja z Shadcn/ui

#### `PasswordStrengthIndicator.tsx`
- Wskaźnik siły hasła podczas rejestracji
- Wizualna reprezentacja wymagań hasła
- Dynamiczna aktualizacja

#### `AuthLayout.tsx`
- Layout dla stron autoryzacji
- Spójny wygląd i zachowanie
- Responsywność

### 2.3. Przepływ użytkownika

1. **Logowanie**
   - Wprowadzenie email/hasło
   - Walidacja danych
   - Obsługa błędów logowania
   - Przekierowanie do dashboard

2. **Rejestracja**
   - Formularz z walidacją w czasie rzeczywistym
   - Weryfikacja email
   - Utworzenie konta
   - Przekierowanie do dashboard

3. **Reset hasła**
   - Wprowadzenie adresu email
   - Wysłanie linku resetującego
   - Weryfikacja tokenu
   - Ustawienie nowego hasła

## 3. Logika backendowa

### 3.1. Middleware (`src/middleware/auth.ts`)

```typescript
interface AuthMiddlewareState {
  user: User | null;
  session: Session | null;
  supabase: SupabaseClient;
}
```

- Inicjalizacja klienta Supabase
- Weryfikacja sesji
- Przekazywanie kontekstu auth do komponentów
- Obsługa przekierowań dla chronionych ścieżek

### 3.2. Endpointy API

#### POST `/api/auth/login`
- Walidacja danych logowania
- Obsługa sesji Supabase
- Zwracanie JWT

#### POST `/api/auth/register`
- Walidacja danych rejestracji
- Utworzenie konta w Supabase
- Wysłanie emaila weryfikacyjnego

#### POST `/api/auth/logout`
- Wylogowanie użytkownika
- Czyszczenie sesji
- Przekierowanie

#### POST `/api/auth/reset-password`
- Inicjacja procesu resetu hasła
- Wysłanie emaila z linkiem

#### POST `/api/auth/verify-email`
- Weryfikacja adresu email
- Aktualizacja statusu konta

### 3.3. Serwisy

#### `AuthService` (`src/lib/services/auth.service.ts`)
```typescript
interface AuthService {
  login(email: string, password: string): Promise<AuthResponse>;
  register(userData: RegisterData): Promise<AuthResponse>;
  resetPassword(email: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  logout(): Promise<void>;
}
```

## 4. System autentykacji Supabase

### 4.1. Konfiguracja

```typescript
// src/db/supabase.config.ts
interface SupabaseConfig {
  authRedirectUrl: string;
  authCookieOptions: {
    lifetime: number;
    domain: string;
    sameSite: string;
  };
}
```

### 4.2. Polityki bezpieczeństwa

- Row Level Security (RLS) dla wszystkich tabel
- Polityki dostępu bazujące na auth.uid()
- Automatyczne dodawanie user_id do nowych rekordów

### 4.3. Migracje

```sql
-- supabase/migrations/[timestamp]_auth_settings.sql
-- Konfiguracja ustawień auth w Supabase
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
```

## 5. Obsługa błędów i walidacja

### 5.1. Schemat walidacji (Zod)

```typescript
// src/lib/schemas/auth.schema.ts
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = loginSchema.extend({
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true)
}).refine(data => data.password === data.confirmPassword);
```

### 5.2. Typy błędów

```typescript
// src/lib/types/auth.types.ts
type AuthError =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_EXISTS'
  | 'WEAK_PASSWORD'
  | 'SERVER_ERROR';
```

## 6. Bezpieczeństwo i RODO

### 6.1. Ochrona danych

- Szyfrowanie danych wrażliwych
- Bezpieczne przechowywanie haseł (Supabase)
- Automatyczne wygasanie sesji
- Limity prób logowania

### 6.2. Zgodność z RODO

- Zgoda na przetwarzanie danych
- Możliwość eksportu danych użytkownika
- Możliwość usunięcia konta
- Przejrzysta polityka prywatności

## 7. Testy

### 7.1. Testy jednostkowe

```typescript
// src/tests/auth.test.ts
describe('AuthService', () => {
  test('should handle login correctly');
  test('should handle registration correctly');
  test('should handle password reset correctly');
});
```

### 7.2. Testy integracyjne

- Przepływ logowania
- Przepływ rejestracji
- Reset hasła
- Weryfikacja email

## 8. Wdrożenie

### 8.1. Konfiguracja środowiska

```env
SUPABASE_URL=
SUPABASE_KEY=
AUTH_REDIRECT_URL=
AUTH_COOKIE_DOMAIN=
```

### 8.2. Deployment checklist

- [ ] Konfiguracja Supabase Auth
- [ ] Ustawienie domen CORS
- [ ] Konfiguracja providera email
- [ ] Testy bezpieczeństwa
- [ ] Audyt RODO 