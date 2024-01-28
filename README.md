**# Google-Ads-Script**
## Kod Google Ads Scripts - Zarządzanie Budżetem Kampanii

## Opis

Ten skrypt w języku JavaScript jest narzędziem do monitorowania i zarządzania kampaniami reklamowymi w narzędziu Google Ads. Skrypt analizuje wydatki kampanii w danym okresie i podejmuje decyzje dotyczące ewentualnego zatrzymania kampanii, gdy miesięczny budżet zostanie przekroczony. Dodatkowo, skrypt generuje raporty i wysyła powiadomienia e-mail, informując o podjętych decyzjach.

## Konfiguracja

**## Zmienne**

Przed uruchomieniem skryptu, dostosuj poniższe zmienne zgodnie z Twoimi preferencjami i danymi konta reklamowego:

```javascript
// Adresy e-mail, na które będą wysyłane powiadomienia
var email = [""];

// Symbol waluty
var currencySymbol = "PLN";

// Separator tysięcy
var thousandsSeparator = ",";

// Separator dziesiętny
var decimalMark = ".";

// Etykieta dla kampanii przekraczających budżet
var labelName = "Over Budget";

// Czy pauzować kampanie, gdy budżet zostanie przekroczony
var campaignPauser = true;

// Miesięczny budżet (możliwość modyfikacji w każdej chwili)
var MONTHLY_BUDGET = 0;

// Niewykorzystany budżet z poprzedniego miesiąca
var UNUSED_BUDGET = 0;
```

**## Funkcje**

Skrypt wykorzystuje następujące funkcje:

* **basicCampaigns()** - Analizuje kampanie podstawowe i ewentualnie je zatrzymuje.
* **wholeSpend(MONTHLY_BUDGET)** - Analizuje całkowite wydatki na kampanie w danym okresie.
* **pauseCampaign(campID)** - Zatrzymuje konkretną kampanię.
* **pauseBasicCampaigns(campaignName)** - Zatrzymuje kampanię podstawową.
* **pauseShoppingCampaigns(campaignName)** - Zatrzymuje kampanię zakupów.
* **makeChangeMessage(campaignData, changed, MONTHLY_BUDGET)** - Generuje wiadomość z podsumowaniem zmian.
* **sendSummaryEmail(campaignsToPause, campaignPauser, email, MONTHLY_BUDGET)** - Wysyła e-mail z podsumowaniem i decyzjami.

## Uruchamianie Skryptu

**## Ręcznie**

Aby skrypt działał poprawnie, należy go uruchomić w narzędziu Google Ads Scripts. Aby to zrobić, wykonaj następujące kroki:

1. Zaloguj się do konta Google Ads.
2. Przejdź do sekcji **Narzędzia** > **Skrypty**.
3. Kliknij przycisk **Dodaj skrypt**.
4. Wybierz skrypt **Google-Ads-Script.js**.
5. Kliknij przycisk **Zapisz i zatwierdź**.

**## Automatycznie**

Skrypt można skonfigurować do uruchamiania automatycznego w określonych interwałach czasowych. Aby to zrobić, wykonaj następujące kroki:

1. W sekcji **Ustawienia** skryptu ustaw **Częstotliwość** na żądaną wartość.
2. Kliknij przycisk **Zapisz**.

## Struktura Pliku

Skrypt składa się z następujących plików:

* **main.js** - Plik zawierający główny kod skryptu.

## Funkcje Główne

**## basicCampaigns()**

Funkcja **basicCampaigns()** analizuje kampanie podstawowe i ewentualnie je zatrzymuje. Wykorzystuje ona funkcję **wholeSpend()** do obliczenia całkowitych wydatków na kampanie w danym okresie. Jeśli całkowite wydatki przekroczą miesięczny budżet, funkcja **basicCampaigns()** dodaje do kampanii etykietę **Over Budget**.

**## wholeSpend(MONTHLY_BUDGET)**

Funkcja **wholeSpend(MONTHLY_BUDGET)** oblicza całkowite wydatki na kampanie w danym okresie. Wykorzystuje ona funkcję **getCampaigns()** do pobrania listy wszystkich kampanii. Następnie, dla każdej kampanii, funkcja **wholeSpend()** dodaje do całkowitych wydatków wydatki kampan