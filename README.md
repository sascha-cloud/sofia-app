# Sofía – Tu amiga española

Spanisch-Lern-App für deine Nichte (7. Klasse).

## So veröffentlichst du die App (in ~15 Min, kostenlos)

### Was du brauchst
- GitHub-Account (kostenlos, falls noch nicht vorhanden: github.com)
- Vercel-Account (kostenlos: vercel.com – einfach mit GitHub einloggen)

### Schritt für Schritt

**1. Diesen Ordner auf GitHub hochladen**
- Auf github.com einloggen
- Oben rechts "+" → "New repository"
- Name: `sofia-spanish-app` (oder was du willst)
- Als "Public" lassen, dann "Create repository"
- Auf der nächsten Seite: "uploading an existing file" anklicken
- Den kompletten `sofia-app`-Ordner (alle Dateien!) reinziehen
- "Commit changes" klicken

**2. Vercel mit GitHub verbinden**
- Auf vercel.com "Sign up" → mit GitHub einloggen
- Klick "Add New..." → "Project"
- Dein neues Repository auswählen → "Import"
- Einstellungen sind schon richtig (Vite wird automatisch erkannt)
- "Deploy" klicken
- ~1 Minute warten

**3. Fertig!**
- Du bekommst einen Link wie `sofia-spanish-app.vercel.app`
- Diesen Link schickst du deiner Nichte
- Sie öffnet ihn auf dem Handy im Browser
- Optional: "Zum Home-Bildschirm hinzufügen" → sieht aus wie eine echte App

### Lokal testen (optional, nur für Techies)

```bash
npm install
npm run dev
```

## Datenspeicherung
Der Fortschritt (XP, Streak, gelernte Wörter) wird im Browser deiner Nichte lokal gespeichert (`localStorage`). Sie sollte also immer denselben Browser benutzen.
