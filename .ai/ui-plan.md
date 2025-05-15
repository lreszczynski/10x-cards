# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Architektura UI została zaprojektowana z użyciem Astro 5, TypeScript 5, React 19, Tailwind 4 oraz Shadcn/ui. Główna struktura opiera się na wyraźnie rozdzielonych widokach, które łączą się w spójny, responsywny i dostępny interfejs użytkownika. Każdy widok został zaprojektowany z myślą o intuicyjności, efektywności oraz bezpieczeństwie, zgodnie z wymaganiami produktu, planem API i wytycznymi dotyczącymi sesji planowania.

## 2. Lista widoków

- **Ekran autoryzacji**

  - Ścieżka: `/login` i `/register`
  - Główny cel: Umożliwienie użytkownikowi rejestracji i logowania.
  - Kluczowe informacje: Formularze logowania/rejestracji, walidacja pól (e-mail, hasło), komunikaty błędów.
  - Kluczowe komponenty: Formularze logowania/rejestracji
  - UX, dostępność i bezpieczeństwo: Responsywny design, prosty formularz, czytelne komunikaty błędów, wsparcie dla urządzeń mobilnych, zabezpieczenie przesyłania danych (JWT) oraz właściwa obsługa błędów.

- **Widok generowania fiszek**

  - Ścieżka: `/generate`
  - Główny cel: Umożliwienie użytkownikowi generowanie propozycji fiszek przez AI i ich rewizję (akceptuj, edytuj, odrzuć)
  - Kluczowe informacje: Pole tekstowe do wprowadzania treści, lista propozycji fiszek wygenerowanych przez AI, przyciski akcji, edycji lub odrzucenia dla każdej fiszki
  - Kluczowe komponenty: Komponent wejscia tekstowego, przycisk "Generuj fiszki", lista fiszek, przyciski akcji (zapisz wszystkie, zapisz zaakceptowane), wskaźnik ładowania (skeleton), komunikaty o błędach
  - UX, dostępność i bezpieczeństwo: Walidacja długości tekstu (1000-10000 znaków), responsywność, czytelne komunikaty i inline komunikaty o błędach

- **Widok listy fiszek**

  - Ścieżka: `/flashcards`
  - Główny cel: Przegląd, edycja i usuwanie istniejących fiszek.
  - Kluczowe informacje: Lista wszystkich fiszek (zarówno AI-generowanych, jak i ręcznie tworzonych), podgląd treści fiszki.
  - Kluczowe komponenty: Lista lub tabela z fiszkami, modale do edycji, przyciski usuwania, potwierdzenia operacji.
  - UX, dostępność i bezpieczeństwo: Czytelny interfejs, łatwość edycji poprzez modale, ostrzeżenia przy usuwaniu oraz mechanizmy potwierdzające akcje.

- **Panel użytkownika**

  - Ścieżka: `/profile`
  - Główny cel: Wyświetlenie informacji o koncie użytkownika.
  - Kluczowe informacje: Dane konta (e-mail, data rejestracji), przycisk wylogowania.
  - Kluczowe komponenty: Formularz edycji profilu, przyciski akcji.
  - UX, dostępność i bezpieczeństwo: Prosty, przejrzysty design, minimalna liczba interakcji.

- **Dashboard**
  - **Ścieżka**: `/dashboard`
  - **Główny cel**: Zapewnienie użytkownikowi przeglądu najważniejszych informacji i statystyk dotyczących jego aktywności w aplikacji.
  - **Kluczowe informacje**:
    - Statystyki dotyczące fiszek (np. liczba stworzonych fiszek, liczba zaakceptowanych, liczba odrzuconych).
    - Ostatnie aktywności użytkownika (np. ostatnio edytowane fiszki, ostatnie generacje).
    - Szybki dostęp do najczęściej używanych funkcji (np. przycisk do generowania nowych fiszek, link do listy fiszek).
  - **Kluczowe komponenty**:
    - **Statystyki**: Komponent wyświetlający wykresy lub liczby dotyczące aktywności użytkownika.
    - **Lista ostatnich aktywności**: Komponent pokazujący ostatnie działania użytkownika w aplikacji.
    - **Skróty**: Przyciski lub linki do najczęściej używanych funkcji, takich jak generowanie fiszek czy przeglądanie listy fiszek.
    - **Powiadomienia**: Komponent do wyświetlania powiadomień o nowych funkcjach lub aktualizacjach.
  - **UX, dostępność i bezpieczeństwo**:
    - Responsywny design, aby dashboard był dostępny na różnych urządzeniach.
    - Czytelne komunikaty i wizualizacje, aby użytkownik mógł szybko zrozumieć swoje dane.
    - Zabezpieczenia dotyczące danych użytkownika, aby zapewnić prywatność i bezpieczeństwo.

## 3. Mapa podróży użytkownika

1. Użytkownik uzyskuje dostęp do aplikacji i trafia do ekranu logowania/rejestracji.
2. Po poprawnym uwierzytelnieniu użytkownik zostaje przekierowany do widoku generowania fiszek.
3. Użytkownik wprowadza tekst do generowania fiszek i inicjuje proces generacji.
4. API zwraca propozycje fiszek, które są prezentowane na widoku generowania.
5. Użytkownik przegląda propozycje i decyduje, które fiszki zaakceptować, edytować lub odrzucić (opcjonalne otwarcie modala edycji).
6. Użytkownik zatwierdza wybrane fiszki i dokonuje zbiorczego zapisu poprzez interakcję z API.
7. Następnie użytkownik przechodzi do widoku "Moje fiszki", gdzie może przeglądać, edytować lub usuwać fiszki.
8. Użytkownik korzysta z nawigacji, aby odwiedzić panel użytkownika oraz opcjonalnie rozpocząć sesję powtórek.
9. W przypadku błędów (np. walidacji, problemów z API) użytkownik otrzymuje komunikaty inline.

## 4. Układ i struktura nawigacji

— **Gotowa nawigacja:** Dostępna jako górne menu w layoucie strony po zalogowaniu.
— **Elementy nawigacyjne:** Linki do widokow: "Generowanie fiszek", "Moje fiszki", "Profil" oraz przycisk wylogowania.
— **Responsywność:** W widoku mobilnym nawigacja przekształca się w menu hamburger, umożliwiając łatwy dostep do pozostalych widoków.
— **Przepływ:** Nawigacja umożliwia bezproblemowe przechodzenie między widokami, zachowując kontekst użytkownika i jego dane sesyjne.

## 5. Kluczowe komponenty

— **Formularze uwierzytelnienia:** Komponenty logowania i rejestracji z obsługą walidacji.
— **Komponent generowania fiszek:** Z polem tekstowym i przyciskiem uruchamiającym proces generacji, z wskaźnikiem ładowania.
— **Lista fiszek:** Interaktywny komponent wyświetlający listę fiszek z opcjami edycji i usuwania.
— **Modal edycji:** Komponent umożliwiający edycję fiszek z walidacją danych przed zatwierdzeniem.
— **Toast notifications:** Komponent do wyświetlania komunikatów o sukcesach oraz błędach.
— **Menu nawigacji:** Elementy nawigacyjne ułatwiające przemieszczanie się między widokami.
