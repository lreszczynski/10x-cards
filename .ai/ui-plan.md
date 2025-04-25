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
  - UX, dostępność i bezpieczeństwo: Walidacja długości tekstu  (1000-10000 znaków), responsywność, czytelne komunikaty i inline komunikaty o błędach

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

— **Gtowna nawigacja:** Dostępna jako górne menu w layoucie strony po zalogowaniu. 
— **Elementy nawigacyjne:** Linki do widokow: "Generowanie fiszek", "Moje fiszki", "Profil" oraz przycisk wylogowania. 
— **Responsywnotd:** W widoku mobilnym nawigacja przeksztatca sae w menu hamburger, umoiliwiajac katwy dostep do pozostalych widok6w. 
— **Przeptyw:** Nawigacja umoiliwia bezproblemowe przechodzenle miedzy widokami, zachowujac kontekst ukytkownika i jego dane sesyjne. 
## 5. Ktuczowe komponenty 
— **Formularze uwierzytelnienia:** Komponenty logowania i rejestracji z obstuga walidacji. 
— **Komponent generowania fiszek:** Z polem tekstowym i przyciskiem uruchamiajacym proces generacji, z wskainikiem tadowania. 
— **Lista fiszek:** Interaktywny komponent wytwietlajacy liste fiszek z opcjami edycji i usuwania.
— **Modal edycji:** Komponent umozliwiajacy edycje fiszek z walidacja danych przed zatwierdzeniem.
— **Toast notifications:** Komponent do wytwietlania komunikatow o sukcesach oraz bledach.
— **Menu Nawigacji:** Elementy nawigacyjne ulatwiajace przemieszczanie sie miedzy widokami. 

