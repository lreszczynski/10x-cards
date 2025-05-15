# Plan implementacji widoku generowania fiszek

## 1. Przegląd

Widok generowania fiszek umożliwia użytkownikowi wklejenie tekstu (1000-10000 znaków), który zostanie przesłany do API modelu LLM w celu wygenerowania propozycji fiszek. Użytkownik może następnie przeglądać wyniki i decydować, które fiszki zaakceptować, edytować lub odrzucić, a następnie zapisać wszystkie lub zaakceptowane fiszki do bazy danych.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką: `/generate`.

## 3. Struktura komponentów

- **FlashcardGenerationView** (główny komponent widoku)
  - Zawiera formularz wejściowy, przycisk generowania, sekcję wyświetlania stanu ładowania, komunikatów o błędach oraz listę propozycji fiszek.
- **FlashcardInputForm**
  - Komponent odpowiedzialny za pole tekstowe oraz przycisk "Generuj fiszki".
- **LoadingSkeleton**
  - Komponent wyświetlający skeleton podczas oczekiwania na odpowiedź API.
- **FlashcardProposalList**
  - Wyświetla listę wygenerowanych propozycji fiszek.
- **FlashcardProposalItem**
  - Reprezentuje pojedynczą fiszkę z przyciskami akcji: akceptacji, edycji oraz odrzucenia.
- **SaveFlashcardsButton**
  - Przyciski umożliwiające zapisanie wszystkich lub tylko zaakceptowanych fiszek do bazy danych.

## 4. Szczegóły komponentów

### FlashcardGenerationView

- Opis: Główny kontener widoku, łączy formularz wejściowy, wyświetlanie wyników oraz akcje zapisu.
- Główne elementy: Formularz (tekst, przycisk), skeleton loader, sekcja wyników, przyciski zapisu.
- Obsługiwane interakcje: Wysyłanie tekstu do API, wyświetlanie stanu ładowania, obsługa komunikatów o błędach.
- Walidacja: Sprawdzenie długości wprowadzanego tekstu (1000-10000 znaków).
- Typy: Używa typów zdefiniowanych w `types.ts` (m.in. `FlashcardProposalDto`) oraz rozszerzonego typu widokowego (np. `FlashcardProposalViewModel`).
- Propsy: Może przyjmować callback do zapisu wyników lub zarządzania stanem globalnym (opcjonalnie).

### FlashcardInputForm

- Opis: Formularz umożliwiający wpisanie tekstu oraz inicjację akcji generacji fiszek.
- Główne elementy: Pole tekstowe (textarea), przycisk "Generuj fiszki".
- Obsługiwane interakcje: Wprowadzanie tekstu, kliknięcie przycisku.
- Walidacja: Długość tekstu musi być między 1000 a 10000 znaków.
- Typy: Input jako string, validation error message jako string.
- Propsy: Callback wywoływany przy próbie generacji.

### FlashcardProposalList

- Opis: Komponent wyświetlający listę propozycji fiszek otrzymanych z API.
- Główne elementy: Lista elementów typu `FlashcardProposalItem`.
- Obsługiwane interakcje: Aktualizacja stanu przy akceptacji, edycji lub odrzuceniu poszczególnych fiszek.
- Walidacja: Sprawdzenie poprawności danych fiszki (np. niepuste pola, poprawne długości tekstu).
- Typy: Lista obiektów typu `FlashcardProposalViewModel`.
- Propsy: Przekazanie danych fiszek, funkcji aktualizujących stan pojedynczej fiszki.

### FlashcardProposalItem

- Opis: Reprezentacja pojedynczej fiszki z możliwością zarządzania.
- Główne elementy: Wyświetlanie treści (front i back), przyciski: Akceptuj, Edytuj, Odrzuć.
- Obsługiwane interakcje: Kliknięcie przycisków akcji powoduje zmianę stanu (np. oznaczenie jako zaakceptowane, otwarcie edycji, usunięcie).
- Walidacja: Walidacja pól przy edycji (front: max 200 znaków, back: max 500 znaków).
- Typy: `FlashcardProposalDto` rozszerzone o flagi (np. `isAccepted`, `isEditing`) oraz ewentualnie pola edycyjne.
- Propsy: Dane fiszki, callbacki do akcji akceptacji, edycji i odrzucenia.

### SaveFlashcardsButton

- Opis: Przycisk umożliwiający zapisanie wybranych (zaakceptowanych) lub wszystkich fiszek do bazy danych.
- Główne elementy: Przycisk wywołujący funkcję zapisu.
- Obsługiwane interakcje: Kliknięcie przycisku powoduje wywołanie API (`POST /api/flashcards`).
- Walidacja: Sprawdzenie poprawności danych fiszek przed wysłaniem do API.
- Typy: Przekazywane dane o fiszkach do zapisu.
- Propsy: Callback do wywołania akcji zapisu oraz ewentualny stan ładowania i błędów.

## 5. Typy

- `FlashcardProposalDto` (z `types.ts`): Zawiera pola `id`, `front`, `back` oraz `source`.
- `FlashcardGenerationResponse`: Typ odpowiedzi z API `/api/generations`, zawiera `id`, `flashcards_proposals`, `generated_count` oraz `created_at`.
- `FlashcardProposalViewModel` (nowy typ): Rozszerza `FlashcardProposalDto` o flagi `accepted: boolean` i `edited: boolean` oraz opcjonalne właściwości `editedFront?: string`, `editedBack?: string`.

## 6. Zarządzanie stanem

Stan widoku będzie zarządzany przy użyciu hooków React (`useState` i `useEffect`):

- `inputText`: Przechowuje wprowadzony tekst.
- `loading`: Flaga wskazująca, czy trwa żądanie do API.
- `error`: Komunikaty błędów (walidacja, odpowiedź API).
- `flashcardProposals`: Lista obiektów typu `FlashcardProposalViewModel`.
  Dodatkowo, można utworzyć customowy hook (np. `useFlashcardGeneration`) do enkapsulacji logiki API oraz aktualizacji stanu.

## 7. Integracja API

- **POST /api/generations**: Wywoływany po zatwierdzeniu danych w formularzu. Wysyłany payload: { source_text: string }. Oczekiwany typ odpowiedzi to `FlashcardGenerationResponse`.
- **POST /api/flashcards**: Wywoływany po zatwierdzeniu fiszek przez użytkownika. Payload zawiera tablicę fiszek z polami `front`, `back`, `source` oraz `generation_id` (dla fiszek AI). Obsługa błędów przez komunikaty na UI.

## 8. Interakcje użytkownika

- Użytkownik wprowadza tekst (1000-10000 znaków) w polu tekstowym.
- Po kliknięciu przycisku "Generuj fiszki" następuje walidacja tekstu oraz wysłanie żądania do API.
- Podczas oczekiwania wyświetlany jest skeleton loader.
- Po otrzymaniu odpowiedzi, wyświetlana jest lista propozycji fiszek.
- Użytkownik może:
  - Kliknąć przycisk Akceptuj dla fiszki – oznaczając ją jako wybraną.
  - Kliknąć przycisk Edytuj – umożliwiając modyfikację treści fiszki inline lub w modalowym oknie.
  - Kliknąć przycisk Odrzuć – usuwając fiszkę z listy.
- Po zakończeniu przeglądania, użytkownik klika przycisk zapisu, który wysyła zmodyfikowane dane do `/api/flashcards`.

## 9. Warunki i walidacja

- Tekst wejściowy: Musi mieć długość między 1000 a 10000 znaków.
- Pola fiszek:
  - `front`: Wymagane, niepuste, max 200 znaków.
  - `back`: Wymagane, niepuste, max 500 znaków.
- Przy edycji, walidacja odbywa się na bieżąco przed zatwierdzeniem zmian.

## 10. Obsługa błędów

- Walidacja na poziomie formularza z wyświetlaniem inline errorów.
- W przypadku błędów API (zarówno w `/api/generations`, jak i `/api/flashcards`) wyświetlane są komunikaty informujące użytkownika o problemie.
- Dodatkowo, można wykorzystać toast notifications z Shadcn/ui do informowania o sukcesach lub błędach operacji.

## 11. Kroki implementacji

1. Utworzyć nową stronę Astro dla widoku `/generate` (np. `src/pages/generate.astro`).
2. Stworzyć główny komponent widoku `FlashcardGenerationView` w katalogu `src/components`.
3. Zaimplementować komponent `FlashcardInputForm` z polem tekstowym i przyciskiem "Generuj fiszki", w tym walidację długości tekstu.
4. Po wysłaniu formularza, zaimplementować logikę wywołania API `/api/generations` oraz ustawienie stanu `loading` i `error`.
5. Dodać komponent `LoadingSkeleton` wyświetlany podczas oczekiwania na odpowiedź API.
6. Utworzyć komponent `FlashcardProposalList`, który renderuje listę fiszek przy użyciu komponentu `FlashcardProposalItem`.
7. W komponencie `FlashcardProposalItem` dodać przyciski do akceptacji, edycji (inline lub modal) oraz odrzucenia fiszki, wraz z odpowiednią walidacją pól.
8. Zaimplementować akcję zapisu fiszek przy użyciu endpointu `/api/flashcards` za pomocą komponentu `SaveFlashcardsButton`.
9. Zapewnić responsywność interfejsu przy użyciu Tailwind CSS oraz integrację komponentów Shadcn/ui.
10. Przeprowadzić testy integracyjne i jednostkowe, aby sprawdzić poprawność interakcji oraz obsługę błędów.
