# Plan Testów

## 1. Wprowadzenie i cele testowania
Celem testowania jest zapewnienie wysokiej jakości oraz niezawodności aplikacji. Testy mają na celu:
- Weryfikację poprawności działania kluczowych funkcjonalności związanych z renderowaniem stron, interakcjami użytkownika oraz integracją API.
- Zapewnienie zgodności z wymaganiami technologicznymi stosu (Astro 5, TypeScript 5, React 19, Tailwind 4, Shadcn/ui).

## 2. Zakres testów
Plan testów obejmuje:
- Testy jednostkowe dla pojedynczych funkcji i komponentów.
- Testy integracyjne obejmujące interakcje między komponentami, layoutami, stronami i API.
- Testy end-to-end (E2E) symulujące ścieżki użytkownika w aplikacji.

## 3. Typy testów
- **Testy jednostkowe:** dla funkcji pomocniczych, komponentów React oraz logiki biznesowej.
- **Testy integracyjne:** dla współdziałania między warstwami aplikacji (np. komunikacja między stronami Astro a komponentami React).
- **Testy end-to-end:** weryfikujące pełen cykl działania aplikacji, od interfejsu użytkownika po backend (API, middleware).

## 4. Scenariusze testowe dla kluczowych funkcjonalności
- **Renderowanie i nawigacja stron:** sprawdzenie poprawności działania układów i layoutów (Astro, React) oraz responsywności interfejsu.
- **Interakcje użytkownika:** testowanie przycisków, formularzy, przechodzenia między stronami i dynamicznych komponentów (Shadcn/ui).
- **Integracja API:** weryfikacja poprawności przekazywanych danych, obsługi błędów i komunikacji między frontendem a API.

## 5. Środowiska testowe
- **Środowisko lokalne:** uruchamiane podczas developmentu z wykorzystaniem dedykowanej bazy danych testowych.
- **Środowisko testowe:** wykorzystuje Docker do izolacji środowiska, używane głównie do testów integracyjnych i E2E.
- **CI/CD:** testy uruchamiane automatycznie w GitHub Actions przy każdym pull requeście.

## 6. Narzędzia do testowania
- **Frameworki testowe:** Vitest oraz React Testing Library do testów jednostkowych.
- **Testy E2E:** Playwright do symulacji pełnych ścieżek użytkownika.
- **Analiza statyczna:** ESLint, Prettier do wstępnej kontroli jakości kodu.

## 7. Harmonogram testów
- **Testy jednostkowe:** wykonywane na bieżąco podczas developmentu.
- **Testy integracyjne i E2E:** uruchamiane w środowisku testowym oraz w GitHub Actions.
- **Testy regresyjne:** przeprowadzane automatycznie przy każdym pull requeście.

## 8. Kryteria akceptacji testów
- Pokrycie krytycznych funkcji aplikacji testami na poziomie minimum 80%.
- Przejście wszystkich testów jednostkowych, integracyjnych i E2E bez błędów.
- Brak blokujących błędów w środowisku testowym.

## 9. Procedury raportowania błędów
- Wykorzystanie GitHub Issues do dokumentowania i śledzenia zgłoszonych problemów.
- Każdy raport powinien zawierać:
  - Dokładny opis błędu wraz z krokami do jego reprodukcji.
  - Oczekiwany i faktyczny rezultat.
  - Priorytet błędu.