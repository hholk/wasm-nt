# WASM NT Graph Visualizer

Eine statische Web-App, die große N-Triples-Dateien vollständig im Browser verarbeitet und visualisiert. Oxigraph läuft als WebAssembly-Parser, Graphology/Sigma übernehmen die Visualisierung per WebGL.

## Features

- ✅ Lädt automatisch einen Beispieldatensatz mit 3.000 Knoten und 9.000 gerichteten Kanten
- ✅ Parst N-Triples-Dateien clientseitig mit Oxigraph (WASM)
- ✅ Layout mit ForceAtlas2 und Rendering via Sigma.js (WebGL)
- ✅ Manuelles Hochladen eigener `.nt`-Dateien möglich
- ✅ Dark-Mode taugliche Oberfläche
- ✅ Für GitHub Pages vorkonfiguriert (Base-Path und Deploy-Workflow)

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Der Dev-Server läuft standardmäßig auf [http://localhost:5173](http://localhost:5173).

## Produktion bauen

```bash
npm run build
npm run preview
```

Der Befehl `npm run build` erstellt ein produktionsfertiges Bundle im Ordner `dist/`.

## GitHub Pages Deployment

1. Aktivieren Sie GitHub Pages für dieses Repository unter **Settings → Pages** und wählen Sie `GitHub Actions` als Quelle (dieser Schritt muss einmalig manuell erfolgen, da der Workflow keine Admin-Rechte besitzt).
2. Pushen Sie den Code auf GitHub – der Workflow `.github/workflows/deploy.yml` baut das Projekt und veröffentlicht es auf dem `gh-pages`-Branch.
3. Die Seite ist anschließend unter `https://<ihr-user>.github.io/wasm-nt/` erreichbar.

## Datensatz anpassen

- Der Beispieldatensatz liegt unter `public/data/sample.nt` und enthält einen synthetischen Graphen.
- Nutzen Sie `scripts/generate_sample_nt.py`, um einen neuen Datensatz zu generieren (Python 3.10+).

```bash
python scripts/generate_sample_nt.py
```

- Alternativ können Sie eigene `.nt`-Dateien im UI hochladen. Die Visualisierung beginnt, sobald das Parsing abgeschlossen ist.

## Technologien

- [Vite](https://vitejs.dev) – Bundler & Dev-Server
- [Oxigraph](https://github.com/oxigraph/oxigraph) – RDF-Parser in WebAssembly
- [Graphology](https://graphology.github.io/) & [ForceAtlas2](https://github.com/graphology/graphology-layout-forceatlas2) – Graphdatenstruktur & Layout
- [Sigma.js](https://github.com/jacomyal/sigma.js) – WebGL-Rendering großer Graphen
