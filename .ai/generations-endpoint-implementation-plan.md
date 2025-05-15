# API Endpoint Implementation Plan: POST /api/generations

## 1. Przegląd punktu końcowego

Endpoint POST /api/generations służy do generowania propozycji fiszek (flashcards) przy użyciu usługi AI. Endpoint waliduje długość pola `source_text`, wywołuje zewnętrzny serwis AI do generowania propozycji, zapisuje wynik w bazie danych (w tabeli generations) oraz zwraca odpowiednią strukturę odpowiedzi.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **URL**: /api/generations
- **Parametry**:
  - **Wymagane**:
    - `source_text`: string (tekst o długości od 1000 do 10000 znaków)
  - **Opcjonalne**: brak
- **Request Body**:
  ```json
  {
    "source_text": "User provided text (1000 to 10000 characters)"
  }
  ```

## 3. Wykorzystywane typy

- **Command Model / DTO**:
  - `CreateGenerationCommand`: Definiuje strukturę żądania z polem `source_text`.
  - `GenerationResponseDto`: Struktura odpowiedzi zawierająca pola:
    - `id`: number
    - `generated_count`: number
    - `created_at`: timestamp
    - `flashcards_proposals`: array zawierająca elementy typu `FlashcardProposalDto` (z polami: `id`, `front`, `back`, `source`)

## 4. Szczegóły odpowiedzi

- **201 Created (Sukces)**:
  - Odpowiedź:
    ```json
    {
      "id": number,
      "flashcards_proposals": [
        { "id": 1, "front": "Generated question", "back": "Generated answer", "source": "ai-full" }
      ],
      "generated_count": number,
      "created_at": "timestamp"
    }
    ```
- **Błędy**:
  - 400 Bad Request: Błędne dane wejściowe (np. `source_text` nie spełnia wymagań długościowych).
  - 401 Unauthorized: Brak autoryzacji użytkownika.
  - 500 Internal Server Error: Błędy wynikające z wywołania serwisu AI lub problemy serwera; błędy te są logowane do tabeli `generation_error_logs`.

## 5. Przepływ danych

1. Klient wysyła żądanie z polem `source_text` do endpointa.
2. Middleware lub mechanizm autoryzacji w Astro weryfikuje, czy użytkownik jest uwierzytelniony (np. za pomocą Supabase Auth).
3. Walidacja danych wejściowych:
   - Użycie biblioteki Zod do sprawdzenia, że `source_text` jest typu string i jego długość mieści się w przedziale 1000-10000 znaków.
4. Logika biznesowa:
   - Wywołanie serwisu AI w celu generowania propozycji fiszek.
   - W przypadku sukcesu, utworzenie rekordu w tabeli `generations` oraz, w razie potrzeby, powiązanych rekordów w tabeli `flashcards`.
5. Odpowiedź:
   - Zwrot wygenerowanej struktury `GenerationResponseDto` z wynikami.
6. W przypadku błędów:
   - Logowanie błędów do tabeli `generation_error_logs` z informacjami o błędzie.

## 6. Względy bezpieczeństwa

- **Autoryzacja**: Weryfikacja użytkownika przy użyciu mechanizmu Supabase Auth. Dostęp do danych ograniczony przez RLS (Row-Level Security), gdzie użytkownik może operować jedynie na swoich rekordach.
- **Walidacja danych**: Użycie Zod do walidacji długości i typu `source_text` w celu zapobiegania atakom (np. DoS) i nieprawidłowym danym wejściowym.
- **Bezpieczeństwo operacji na bazie danych**: Wdrożenie polityk RLS na tabelach `generations`, `flashcards` oraz `generation_error_logs`.

## 7. Obsługa błędów

- **400 Bad Request**: Zwrot błędu w przypadku naruszenia warunków weryfikacji danych wejściowych (np. długość `source_text` poza dozwolonym zakresem).
- **401 Unauthorized**: Zwrot błędu, jeśli użytkownik nie jest poprawnie uwierzytelniony.
- **500 Internal Server Error**: Obsługa błędów wewnętrznych, takich jak niepowodzenie wywołania serwisu AI lub problemy z zapisem/odczytem danych z bazy. Błędy te są logowane do tabeli `generation_error_logs` aby umożliwić późniejszą diagnostykę.

## 8. Rozważania dotyczące wydajności

- **Walidacja**: Optymalizacja walidacji danych wejściowych celem minimalizacji narzutów.
- **Baza danych**: Upewnienie się, że odpowiednie indeksy (np. na `user_id` i `generation_id`) są wykorzystane dla szybkich zapytań.
- **Serwis AI**: Monitorowanie opóźnień i ewentualne implementowanie mechanizmów ponownego wywołania lub kolejkowania, aby zminimalizować wpływ opóźnień zewnętrznego serwisu.

## 9. Etapy wdrożenia

1. **Utworzenie endpointa**:
   - Skonfigurowanie routingu w Astro dla ścieżki `/api/generations`.
   - Zaimplementowanie middleware do weryfikacji autoryzacji.
2. **Walidacja danych wejściowych**:
   - Integracja biblioteki Zod do walidacji `source_text` (sprawdzenie typu i długości).
3. **Integracja serwisu AI**:
   - Utworzenie warstwy serwisowej odpowiedzialnej za wywoływanie zewnętrznego serwisu AI i przetwarzanie otrzymanej odpowiedzi.
4. **Operacje na bazie danych**:
   - Implementacja logiki zapisu generacji do tabeli `generations` oraz opcjonalnie utworzenie rekordów w tabeli `flashcards`.
5. **Logowanie błędów**:
   - Dodanie mechanizmu logowania błędów do tabeli `generation_error_logs` w przypadku niepowodzenia operacji z serwisem AI lub innych błędów.
6. **Testy**:
   - Pisanie testów jednostkowych i integracyjnych, aby zweryfikować prawidłowość działania endpointa.
7. **Wdrożenie**:
   - Deploy implementacji, monitorowanie pracy endpointa i reakcja na ewentualne incydenty.
