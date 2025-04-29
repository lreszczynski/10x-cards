# Przewodnik implementacji usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter służy do integrowania oraz uzupełniania czatów opartych na LLM przy użyciu API OpenRouter. Jej zadaniem jest przekazywanie odpowiednich komunikatów (systemowych i użytkownika) do modelu, a następnie przetwarzanie ustrukturyzowanych odpowiedzi zgodnych z określonym schematem JSON. Usługa umożliwia konfigurowanie nazwy modelu oraz parametrów modelu, co pozwala na precyzyjne sterowanie zachowaniem i wydajnością rozwiązania. 

## 2. Opis konstruktora

Konstruktor usługi powinien inicjalizować główne komponenty integracji:
1. **Moduł Konfiguracji** - Odpowiada za wczytywanie i walidację kluczy API oraz ustawień środowiskowych (np. endpoint API OpenRouter).
2. **Klient API** - Realizuje komunikację z API OpenRouter, w tym budowanie, wysyłkę żądań i odbiór odpowiedzi.
3. **Formater Żądań** - Przygotowuje payloady do wysłania, łącząc komunikaty systemowe, użytkownika oraz ustawienia modelu w jeden obiekt.
4. **Parser Odpowiedzi** - Odpowiada za walidację i przetwarzanie ustrukturyzowanych odpowiedzi zwróconych przez API, zgodnie z określonym schematem JSON.
5. **Obsługa Błędów** - Centralizowany mechanizm zarządzania i rejestrowania błędów powstałych podczas komunikacji z API.

## 3. Publiczne metody i pola

- **Metody:**
  1. `initialize(config: ConfigType): void` – Inicjalizacja usługi z odpowiednią konfiguracją.
  2. `sendChatPrompt(systemMessage: string, userMessage: string, options?: ModelOptions): Promise<ResponseType>` – Wysyła komunikaty do modelu i zwraca ustrukturyzowaną odpowiedź.
  3. `setModelParameters(params: ModelOptions): void` – Umożliwia modyfikację parametrów modelu w czasie działania.

- **Pola:**
  1. `systemMessage: string` – Domyślny komunikat systemowy (np. "You are a helpful assistant").
  2. `userMessage: string` – Dynamiczny komunikat użytkownika.
  3. `responseFormat` – Konfiguracja formatu odpowiedzi, np. 
     ```
     { type: 'json_schema', json_schema: { name: 'ChatResponse', strict: true, schema: { message: 'string', usage: { total_tokens: 'number' } } } }
     ```
  4. `modelName: string` – Nazwa modelu, np. "openrouter-gpt".
  5. `modelParameters: ModelOptions` – Parametry modelu, takie jak `temperature`, `max_tokens`, `top_p`.

## 4. Prywatne metody i pola

- **Metody:**
  1. `_buildRequestPayload(systemMessage: string, userMessage: string, options: ModelOptions): RequestPayload` – Prywatna metoda formatująca dane do wysłania do API.
  2. `_parseResponse(apiResponse: any): ResponseType` – Prywatna metoda służąca do walidacji oraz parsowania odpowiedzi na podstawie określonego JSON schema.
  3. `_handleError(error: any): void` – Centralna metoda do obsługi błędów, która loguje problem i zwraca przyjazny komunikat błędu.

- **Pola:**
  1. `_apiEndpoint: string` – Endpoint API OpenRouter pobierany z konfiguracji.
  2. `_apiKey: string` – Klucz API, bezpiecznie przechowywany w zmiennych środowiskowych.
  3. `_internalLogger: Logger` – Prywatny logger do rejestrowania błędów i zdarzeń.

## 5. Obsługa błędów

Potencjalne scenariusze błędów oraz proponowane rozwiązania:
1. **Błąd autoryzacji:**
   - Wyzwanie: Nieprawidłowy lub wygasły klucz API.
   - Rozwiązanie: Walidacja klucza na etapie inicjalizacji oraz mechanizm odświeżania tokena.

2. **Błąd sieciowy / Timeout:**
   - Wyzwanie: Problemy z połączeniem sieciowym lub długie czasy odpowiedzi API.
   - Rozwiązanie: Implementacja retry logic oraz odpowiednie timeouty na poziomie klienta HTTP.

3. **Błąd formatu odpowiedzi:**
   - Wyzwanie: Otrzymanie odpowiedzi niezgodnej z oczekiwanym schema JSON.
   - Rozwiązanie: Implementacja walidatora JSON oraz fallback z domyślnym komunikatem błędu.

4. **Błąd krytyczny (systemowy):**
   - Wyzwanie: Niespodziewane wyjątki w trakcie przetwarzania lub brak dostępu do konfiguracji.
   - Rozwiązanie: Użycie centralnego mechanizmu logowania błędów z możliwością alertowania administratora.

## 6. Kwestie bezpieczeństwa

1. **Przechowywanie Kluczy API:**
   - Użycie zmiennych środowiskowych do przechowywania wrażliwych danych.
   - Ograniczenie dostępu do kluczy na poziomie systemu operacyjnego oraz samej aplikacji.

2. **Bezpieczne Połączenia:**
   - Wykorzystanie HTTPS do komunikacji z API OpenRouter.

3. **Walidacja Wejść:**
   - Szczegółowa walidacja danych wejściowych zarówno w żądaniach wysyłanych do API, jak i odpowiedzi otrzymanych od API.

4. **Obsługa Uprawnień:**
   - Minimalizacja dostępu do krytycznych metod na poziomie kodu.

## 7. Plan wdrożenia krok po kroku

1. **Konfiguracja środowiska i inicjalizacja projektu**
   - Upewnij się, że wszystkie zmienne środowiskowe (API key, endpoint) są poprawnie ustawione.
   - Skonfiguruj dependency injection dla modułu konfiguracji oraz loggera.

2. **Implementacja modułu Klienta API**
   - Stwórz moduł odpowiedzialny za komunikację z API OpenRouter.
   - Zaimplementuj funkcje wysyłające żądania HTTP z obsługą retry logic oraz timeoutów.

3. **Implementacja systemu formatowania żądań**
   - Opracuj funkcję `_buildRequestPayload`, która łączy: 
     1. Komunikat systemowy (np. "You are a helpful assistant")
     2. Komunikat użytkownika (przykładowo: "Jakie są zalety naszej usługi?")
     3. Parametry modelu (np. { temperature: 0.7, max_tokens: 200 })
     4. Nazwę modelu (np. "openrouter-gpt")
     5. Ustrukturyzowane odpowiedzi poprzez response_format, np.: 
        ```
        { type: 'json_schema', json_schema: { name: 'ChatResponse', strict: true, schema: { message: 'string', usage: { total_tokens: 'number' } } } }
        ```

4. **Implementacja parsera odpowiedzi**
   - Stwórz funkcję `_parseResponse`, która waliduje otrzymaną odpowiedź względem zdefiniowanego JSON schema.
   - Upewnij się, że wszystkie niezgodności są odpowiednio logowane i obsługiwane.

5. **Centralizacja obsługi błędów**
   - Zaimplementuj metodę `_handleError` dla wszystkich przypadków wyjątkowych: autoryzacja, błędy sieciowe, błąd formatu odpowiedzi, błędy systemowe.
   - Dodaj odpowiedni mechanizm logowania i informowania użytkownika o krytycznych błędach.

---

**Przykłady implementacji kluczowych elementów:**

1. Komunikat systemowy:
   - Przykład: "You are a helpful assistant."

2. Komunikat użytkownika:
   - Przykład: "Jakie są zalety naszej usługi?"

3. Ustrukturyzowane odpowiedzi (response_format):
   - Przykład:
     ```json
     {
       "type": "json_schema",
       "json_schema": {
         "name": "ChatResponse",
         "strict": true,
         "schema": {
           "message": "string",
           "usage": { "total_tokens": "number" }
         }
       }
     }
     ```

4. Nazwa modelu:
   - Przykład: "openrouter-gpt"

5. Parametry modelu:
   - Przykład: { "temperature": 0.7, "max_tokens": 200, "top_p": 0.9 }

---

Niniejszy przewodnik implementacji stanowi kompleksowy plan wdrożenia usługi OpenRouter, uwzględniając zarówno aspekty funkcjonalne, jak i kwestie bezpieczeństwa oraz obsługi błędów. Powinien on służyć jako punkt wyjścia do prawidłowego i sprawnego wdrożenia integracji z API OpenRouter w obecnym stacku technologicznym. 