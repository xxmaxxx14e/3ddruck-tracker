[README.md](https://github.com/user-attachments/files/27051640/README.md)
# 🖨️ 3D-Druck Bestellungs-Tracker

## Was ist das?
Eine Webseite mit:
- **Kunden-Seite**: Bestellung aufgeben (Name, Objekt, Farbe wählen)
- **Admin-Seite**: Bestellungen verwalten + abhaken
- **REST API**: Für den ESP32

---

## 🚀 Online stellen (Railway.app – kostenlos)

### Schritt 1: GitHub
1. Geh auf https://github.com → Account erstellen (falls nicht vorhanden)
2. „New Repository" → Name: `3ddruck-tracker` → Create
3. Lade alle Dateien hoch (drag & drop)

### Schritt 2: Railway
1. Geh auf https://railway.app
2. „Login with GitHub"
3. „New Project" → „Deploy from GitHub repo"
4. Dein Repository auswählen
5. Railway erkennt Node.js automatisch!

### Schritt 3: Umgebungsvariablen setzen
In Railway → dein Projekt → „Variables":
```
ADMIN_PASSWORD = deinSicheresPasswort
```

### Schritt 4: Domain
- Railway gibt dir eine URL wie: `https://3ddruck-tracker.up.railway.app`
- Diese URL in den ESP32-Code eintragen!

---

## 🔌 ESP32 anpassen

Im ESP32-Code (`3ddruck_esp32.ino`) diese Zeile anpassen:
```cpp
const char* API_URL = "https://DEINE-URL.up.railway.app/api/stats";
```

---

## 📡 API Endpunkte

| Methode | URL | Beschreibung |
|---------|-----|--------------|
| GET | `/api/stats` | Stats für ESP32 |
| GET | `/api/farben` | Alle Farben (öffentlich) |
| POST | `/api/bestellungen` | Neue Bestellung |
| GET | `/api/bestellungen` | Alle Bestellungen (Admin) |
| PATCH | `/api/bestellungen/:id` | Status ändern (Admin) |
| DELETE | `/api/bestellungen/:id` | Löschen (Admin) |

**Admin-Authentifizierung:** Header `x-admin-password: deinPasswort`

---

## 🛠️ Lokal testen

```bash
npm install
node server.js
# → http://localhost:3000
```

---

## 📱 iPhone Homescreen

1. Safari öffnen → deine Railway-URL aufrufen
2. Teilen-Symbol → „Zum Home-Bildschirm"
3. Fertig – sieht aus wie eine App!
