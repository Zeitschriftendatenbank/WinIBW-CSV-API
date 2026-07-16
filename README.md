## WinIBW CSV API

Zweck: Klasse `CSV` unterstützt die Batchverarbeitung von CSV/TSV-Dateien in WinIBW. Die Klasse liefert Konfiguration, Hilfsfunktionen (Dateizugriff, Logging) und ruft eine von dir implementierte Callback-Funktion für jede CSV-Zeile auf.

Wichtige Eigenschaften (kurz)
- `csv.csvFilename` — Dateiname (relativ zu `ProfD` oder dem in Preferences eingestellten `csv.filepath`).
- `csv.delimiter` — Trennzeichen (z. B. `;` oder `\t`).
- `csv.startLine`, `csv.endLine` — Bereich (1-basiert; `endLine=0` = bis Ende).
- `csv.keys` — Array von Header-Schlüsseln, wird genutzt, um Zeilen in Objekte zu mappen.
- `csv.logFilename` — Name der Logdatei (wird in Profil/Anwendungspfad angelegt).
- `csv.meineMethode` (oder `csv.callback`) — Funktion, die du implementierst; wird pro Zeile ausgeführt.

Wichtige Methoden
- `csv.setProperties(callback, keys, id_key, searchindex, eigene_bibliothek, logFilename)` — konfigurieren.
- `csv.api()` — starte die Batchverarbeitung (ruft deine Callback für jede Zeile auf).
- `csv.getAllLines()` — gibt alle Zeilen als Array von Objekten zurück (nützlich für Tests).
- `csv.log(message)` — schreibt in die Logdatei.
- `csv.save(saveFlag, message)` — speichert/verlässt aktuell geöffneten Datensatz; `saveFlag` boolean, `message` wird ins Log geschrieben.

Minimaler Arbeitsablauf (kompakt)

1) Erstelle CSV-Objekt, setze Datei und Trennzeichen.
2) Implementiere `csv.meineMethode` — hier machst du die Datensatz-Änderungen.
3) Rufe `csv.setProperties(...)` und `csv.api()` auf.

Konkret: Einfacher Durchlauf, prüfe ob ein Suchstring existiert und speichere

```javascript
function csvBatchIstWertVorhanden() {
	var csv = new CSV();
	// wo liegt die Datei (optional in prefs setzen)
	application.activeWindow.writeProfileString('csv','filepath','import');
	csv.csvFilename = "test.csv";
	csv.startLine = 1; csv.endLine = 0; // bis Ende
	csv.delimiter = ";";

	// callback: pro Zeile ausgeführt; 'csv.line' enthält die gemappte Zeile
	csv.meineMethode = function() {
		var such = csv.line['Suchstring'];
		if (!such) return false;
		// Suche im aktuellen Titel-Editor
		if (application.activeWindow.title.find(such, false, false, true)) {
			return application.activeWindow.title.currentLineNumber; // Erfolg
		}
		return false; // nicht gefunden
	};

	csv.setProperties(csv.meineMethode, ["","ZDB-ID","Suchstring"], 'ZDB-ID', 'zdb', false, 'ZDB_LOG.txt');
	csv.api();
}
```

getAllLines — Vollinhalt als Array (nützlich für Tests oder vorab prüfen):

```javascript
function readUsers() {
	var csv = new CSV();
	application.activeWindow.writeProfileString('csv','filepath','user');
	csv.csvFilename = 'users.tsv';
	csv.startLine = 2; csv.delimiter = '\t';
	var rows = csv.getAllLines();
	// rows ist Array von Objekten: rows[0]['ZDB-ID'] etc.
	return rows;
}
```

Speicher- und Log-Verhalten
- `csv.save(true, "msg")` versucht den aktuellen Datensatz zu speichern. Rückgabe: 1 (erfolgreich) oder 0 (fehler).
- `csv.save(false, "msg")` verlässt den Datensatz ohne Speichern und schreibt `msg` ins Log.
- Verwende `csv.log("text")` für zusätzliche Einträge.

Beispiel: sichere nur wenn gefunden

```javascript
// innerhalb csv.meineMethode()
var gefunden = csv.extraMethode(csv.line['Suchstring']);
if (!gefunden) {
	csv.save(false, 'Nicht gefunden: ' + csv.line['Suchstring']);
	return;
}
csv.save(true, 'Gefunden und gespeichert: ' + csv.line['Suchstring']);
```

Batch ohne CSV (Arbeiten an einem Set)

```javascript
function setBearbeiten() {
	var csv = new CSV();
	csv.logFilename = 'loeschen_LOG.txt';
	csv.setEigeneBibliothek('020593228');

	var setSize = application.activeWindow.getVariable('P3GSZ');
	for (var i = 1; i <= setSize; i++) {
		try {
			application.activeWindow.command('k ' + i, false);
			var idn = application.activeWindow.getVariable('P3GPP');
		} catch (e) {
			csv.log((idn||'?') + '\tDatensatz kann nicht geöffnet werden. ' + e);
			continue;
		}
		application.activeWindow.title.insertText('\n6000 Test');
		csv.save(true, idn + '\tFeld hinzugefügt');
	}
}
```
