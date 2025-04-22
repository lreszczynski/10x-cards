# API Endpoint Implementation Plan: POST /api/flashcards

## 1. Przegląd punktu końcowego
Endpoint `/api/flashcards` służy do tworzenia jednego lub wielu rekordów flashcards, umożliwiając zarówno ręczne tworzenie, jak i generowanie przez AI. Umożliwia przesłanie zestawu danych dla kart flashcards i zwraca utworzone rekordy.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/api/flashcards`
- Parametry:
  - Wymagane:
    - `flashcards` (array):
      - `front`: string, wymagany, niepusty, maksymalnie 200 znaków.
      - `back`: string, wymagany, niepusty, maksymalnie 500 znaków.
      - `source`: string, wymagany, dopuszczalne wartości: "ai-full", "ai-edited", "manual".
      - `generation_id`:
         - Musi być `null` przy `source` równym "manual".
         - Wymagany przy `source` "ai-full" lub "ai-edited" (wartość liczbową, reprezentującą identyfikator generacji).
  - Opcjonalne: Brak

## 3. Wykorzystywane typy
- `CreateFlashcardsCommand` – interfejs reprezentujący payload żądania, zawierający pole `flashcards`.
- `CreateFlashcardCommandDto` – typ definiujący strukturę pojedynczej karty (discriminated union):
  - Dla `manual`: `generation_id` musi być `null`.
  - Dla `ai-full` lub `ai-edited`: `generation_id` jest wymagany.
- `FlashcardResponseDto` – DTO reprezentujący rekord flashcard w odpowiedzi.

## 4. Szczegóły odpowiedzi
- Sukces:
  - Kod statusu: 201 Created.
  - Treść: Tablica utworzonych rekordów flashcards, zawierająca m.in. identyfikator, front, back, source, generation_id, created_at, updated_at.
- Błędy:
  - 400 Bad Request – nieprawidłowe dane wejściowe (np. błędna długość tekstu, niepoprawne wartości, złe dopasowanie generation_id).
  - 401 Unauthorized – brak autoryzacji użytkownika.
  - 500 Internal Server Error – awarie serwera lub błędy wewnętrzne (z jednoczesnym logowaniem do tabeli generation_error_logs w razie potrzeby).

## 5. Przepływ danych
1. Klient wysyła żądanie POST z payload zawierającym tablicę flashcards.
2. Autoryzacja użytkownika:
   - Użycie mechanizmów Supabase (np. context.locals) do weryfikacji, czy użytkownik jest zalogowany.
3. Walidacja danych wejściowych:
   - Użycie Zod do walidacji pól `front`, `back`, `source` oraz warunkowej walidacji `generation_id`.
4. Przetwarzanie logiki biznesowej:
   - Po poprawnej walidacji, dane są przekazywane do warstwy serwisowej odpowiedzialnej za tworzenie rekordów flashcards.
5. Wstawienie danych:
   - Transakcyjne wstawienie rekordów do tabeli `flashcards`.
6. Zwrócenie odpowiedzi:
   - W przypadku sukcesu: 201 Created z utworzonymi rekordami.
   - W przypadku błędów: odpowiednie kody błędów (400, 401, 500) wraz z opisem problemu.
7. (Opcjonalnie) Logowanie błędów:
   - W sytuacji błędów systemowych, zapisywanie wpisów do tabeli `generation_error_logs`.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: Endpoint dostępny tylko dla zalogowanych użytkowników.
- Walidacja wejścia: Ścisła walidacja przy użyciu Zod zapewniająca integralność danych.
- Autoryzacja: Sprawdzenie, czy użytkownik ma prawo do operacji (np. weryfikacja posiadanego `generation_id`).
- Sanitizacja danych: Ochrona przed SQL Injection oraz atakami XSS.

## 7. Obsługa błędów
- Walidacja:
  - Zwracanie 400 Bad Request przy nieprawidłowych danych (np. błędna długość, niezgodność typów).
- Autoryzacja:
  - Zwracanie 401 Unauthorized w przypadku braku odpowiednich uprawnień.
- Błędy systemowe:
  - Zwracanie 500 Internal Server Error, przy jednoczesnym logowaniu błędów systemowych (opcjonalnie do `generation_error_logs`).

## 8. Rozważania dotyczące wydajności
- Wstawianie wielu rekordów w jednej transakcji dla zwiększenia wydajności.
- Optymalizacja zapytań do bazy danych (m.in. indeksacja pól `user_id` i `generation_id`).
- Ograniczenie wielkości żądania, aby zapobiec przeciążeniu serwera.

## 9. Kroki implementacji
1. Utworzenie pliku endpointu: `src/pages/api/flashcards.ts` z eksportowanym `prerender = false` zgodnie z zasadami Astro.
2. Importowanie wymaganych typów z `src/types.ts` oraz zależności (np. Zod) do pliku endpointu.
3. Implementacja schematu walidacyjnego dla `CreateFlashcardsCommand`:
   - Walidacja pól `front`, `back`, `source` oraz warunkowej walidacji `generation_id`.
4. Implementacja logiki autoryzacyjnej:
   - Użycie kontekstu Supabase (context.locals) do weryfikacji autentyczności użytkownika.
5. Implementacja logiki biznesowej:
   - Przetwarzanie żądania, wstawienie rekordów do bazy w ramach transakcji.
6. Obsługa błędów:
   - Zwracanie odpowiednich kodów błędów (400, 401, 500) wraz z komunikatami.
7. Testowanie endpointu:
   - Opracowanie testów jednostkowych i integracyjnych.
   - Walidacja przypadków brzegowych i scenariuszy błędów.
8. Przegląd i optymalizacja kodu:
   - Code review oraz ewentualna refaktoryzacja, wydzielenie logiki do warstwy serwisowej.
9. Dokumentacja:
   - Aktualizacja dokumentacji API i dodanie przykładów użycia endpointu. 