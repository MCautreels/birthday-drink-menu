# 🎈 Drankkaart Mila (8) & Vik (4)

Online drankkaart voor het verjaardagsfeest, geoptimaliseerd voor de telefoon.
Gasten bekijken de drankjes per categorie (met foto), stellen een bestelling samen
en zien live wanneer hun bestelling klaar is. De bar volgt alles op in het admin-gedeelte.

- **Menu:** `index.html`
- **Admin / bar:** `admin.html`

## Hoe werkt het?

Het is een volledig statische website (geen server nodig, bv. GitHub Pages).
Bestellingen worden als bericht verstuurd naar een [ntfy.sh](https://ntfy.sh) topic
(gratis, geen account nodig). De adminpagina luistert live mee op die topic.

- De topic staat in [`js/config.js`](js/config.js). Wie de naam kent kan meelezen, dus hou hem een beetje geheim.
- ntfy bewaart berichten 12 uur. De adminpagina bewaart ze daarnaast lokaal in de browser.
- **Pushmeldingen:** installeer de ntfy-app op je telefoon en abonneer je op de topic → bij elke bestelling een melding.
- **Testen** zonder de echte bestellingen te vervuilen: voeg `?topic=test-iets` toe aan de URL (zowel menu als admin).

## Drankjes aanpassen

Alles staat in [`js/drinks.js`](js/drinks.js). Een foto toevoegen of vervangen:
zet het bestand in `images/` en vul `img: 'images/naam.jpg'` in bij het drankje.
Drankjes zonder `img` krijgen een getekend flesje.

## Lokaal draaien

```bash
python3 -m http.server 8765
```

Open daarna http://localhost:8765.

## Credits

Productfoto's van [Open Food Facts](https://world.openfoodfacts.org), licentie CC BY-SA.
