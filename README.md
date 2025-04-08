# Absence

Absence ist ein Open-Source-Projekt, das ursprünglich von der Direktion der HTL Rennweg im Rahmen des ITP-Unterrichts in Auftrag gegeben wurde. Ziel dieses Projekts ist es, Fehlstunden von Schüler*innen visuell darzustellen und Lehrer*innen – insbesondere Klassenvorständen – einen übersichtlichen und schnellen Einblick in die Abwesenheiten zu ermöglichen.

Entwickelt von: Arlon Labalan | Benjamin Bician | Anil Kapan

## Merkmale

- **Übersichtliche Visualisierung** von Fehlstunden
- **Benutzerfreundliche Oberfläche** für Lehrer*innen
- **Open Source** unter der [MIT License](#license)

## Technologien

Absence wurde unter Einsatz moderner Web-Technologien entwickelt:

- [Electron](https://www.electronjs.org/) – zur Erstellung einer Desktop-Anwendung
- [React](https://reactjs.org/) – als Frontend-Bibliothek
- [Tailwind CSS](https://tailwindcss.com/) – für schnelles und effizientes Styling

## Installation

1. **Repository klonen**  
   ```bash
   git clone <URL-zu-diesem-Repository>
   ```
2. **Abhängigkeiten installieren**  
   Wechsle in das Projektverzeichnis und installiere die benötigten Abhängigkeiten:
   ```bash
   cd absence
   npm install
   ```
3. **Entwicklungsserver starten**  
   ```bash
   npm run dev
   ```
   Dies öffnet in der Regel ein Browser-Fenster bzw. startet die Electron-App im Entwicklungsmodus.

4. **Production-Build erstellen (optional)**  
   ```bash
   npm run build
   ```
   Hiermit erstellst du einen Build, der in einer produktiven Umgebung eingesetzt werden kann.

## Verwendung

1. **App starten**  
   Nach der Installation und dem Start (siehe oben) wird eine Electron-Fenster geöffnet, in dem die React-Anwendung läuft.
2. **Fehlstunden verwalten**  
   Du kannst die Fehlzeiten für einzelne Schüler*innen eintragen oder aktualisieren. Absence stellt diese Daten visuell dar, sodass du einen schnellen Überblick hast.
3. **Übersicht prüfen**  
   Dank des Tailwind-Stylings kannst du Fehlstunden-Diagramme oder Listenansichten verwenden. Die Darstellung kann je nach Implementierung weiter personalisiert werden.

## Mitwirken

Wir freuen uns über jede Art von Beitrag, sei es durch:
- **Fehlerbehebungen (Bugfixes)**
- **Neue Funktionen (Features)**
- **Dokumentations-Updates**

Um beizutragen, kannst du gerne einen **Fork** erstellen, einen **Branch** anlegen und Pull Requests mit deinen Änderungen stellen.

## Lizenz

Absence steht unter der **MIT License**. Weitere Details findest du in der Datei [`LICENSE`](LICENSE).  



Vielen Dank für dein Interesse an Absence! Bei Fragen oder Anmerkungen freuen wir uns über deine [Issues](#) oder Pull Requests.

## Github Repo

https://github.com/arlonlab/absence
