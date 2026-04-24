const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "druck123";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── Einfache JSON-Datenbank ───
const DB_FILE = path.join(__dirname, "db.json");

function ladeDB() {
  if (!fs.existsSync(DB_FILE)) {
    const start = {
      bestellungen: [],
      farben: [
        { id: 1, name: "Schwarz", hex: "#1a1a1a" },
        { id: 2, name: "Weiß", hex: "#f5f5f5" },
        { id: 3, name: "Rot", hex: "#e53e3e" },
        { id: 4, name: "Blau", hex: "#3182ce" },
        { id: 5, name: "Grün", hex: "#38a169" },
        { id: 6, name: "Gelb", hex: "#d69e2e" },
        { id: 7, name: "Orange", hex: "#dd6b20" },
        { id: 8, name: "Pink", hex: "#d53f8c" }
      ],
      nextId: 1,
      nextFarbeId: 9
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(start, null, 2));
    return start;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function speichereDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ─── Auth ───
function auth(req, res, next) {
  const pw = req.headers["x-admin-password"] || req.query.pw;
  if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: "Falsches Passwort" });
  next();
}

// ─── Farben ───
app.get("/api/farben", (req, res) => {
  const db = ladeDB();
  res.json(db.farben);
});

app.post("/api/farben", auth, (req, res) => {
  const { name, hex } = req.body;
  if (!name) return res.status(400).json({ error: "Name fehlt" });
  const db = ladeDB();
  const farbe = { id: db.nextFarbeId++, name, hex: hex || "#888888" };
  db.farben.push(farbe);
  speichereDB(db);
  res.json(farbe);
});

app.delete("/api/farben/:id", auth, (req, res) => {
  const db = ladeDB();
  db.farben = db.farben.filter(f => f.id !== parseInt(req.params.id));
  speichereDB(db);
  res.json({ ok: true });
});

// ─── Bestellungen ───
app.post("/api/bestellungen", (req, res) => {
  const { name, objekt, farbe, nachricht } = req.body;
  if (!name || !objekt || !farbe) return res.status(400).json({ error: "Name, Objekt und Farbe sind Pflicht" });
  const db = ladeDB();
  const bestellung = {
    id: db.nextId++,
    name: name.trim(),
    objekt: objekt.trim(),
    farbe: farbe.trim(),
    nachricht: (nachricht || "").trim(),
    bezahlt: false,
    gedruckt: false,
    uebergeben: false,
    erstellt_am: new Date().toISOString()
  };
  db.bestellungen.push(bestellung);
  speichereDB(db);
  res.json({ id: bestellung.id, ok: true });
});

app.get("/api/bestellungen", auth, (req, res) => {
  const db = ladeDB();
  const sortiert = [...db.bestellungen].sort((a, b) => {
    if (a.uebergeben !== b.uebergeben) return a.uebergeben ? 1 : -1;
    return new Date(b.erstellt_am) - new Date(a.erstellt_am);
  });
  res.json(sortiert);
});

app.patch("/api/bestellungen/:id", auth, (req, res) => {
  const { feld, wert } = req.body;
  const erlaubt = ["bezahlt", "gedruckt", "uebergeben"];
  if (!erlaubt.includes(feld)) return res.status(400).json({ error: "Ungültiges Feld" });
  const db = ladeDB();
  const b = db.bestellungen.find(b => b.id === parseInt(req.params.id));
  if (!b) return res.status(404).json({ error: "Nicht gefunden" });
  b[feld] = wert;
  speichereDB(db);
  res.json({ ok: true });
});

app.delete("/api/bestellungen/:id", auth, (req, res) => {
  const db = ladeDB();
  db.bestellungen = db.bestellungen.filter(b => b.id !== parseInt(req.params.id));
  speichereDB(db);
  res.json({ ok: true });
});

// ─── Stats für ESP32 ───
app.get("/api/stats", (req, res) => {
  const db = ladeDB();
  const b = db.bestellungen;
  res.json({
    gesamt: b.length,
    offen: b.filter(x => !x.uebergeben).length,
    gedruckt: b.filter(x => x.gedruckt).length,
    uebergeben: b.filter(x => x.uebergeben).length,
    bezahlt: b.filter(x => x.bezahlt).length
  });
});

// ─── Fallback ───
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
