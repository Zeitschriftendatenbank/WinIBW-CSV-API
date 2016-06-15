## Beschreibung:
Die Klasse CSV dient der Batchvearbeitung von CSV-Dateien in der WinIBW3.

Dabei arbeitet die Klasse im Moment mit den Skripten "[ZDB_BatchCsv.xul](https://github.com/cKlee/WinIBW3/blob/master/xul/ZDB_BatchCsv.xul)" und "[ZDB_BatchCsv.js](https://github.com/cKlee/WinIBW3/blob/master/xul/ZDB_BatchCsv.js)" zusammen, um ein Interface für die Konfiguration der Batchbearbeitung zu erlauben.

Die Klasse CSV stellt dann Eigenschaften der Konfiguration und Methoden zur Bearbeitung der CSV-Batchvearbeitung bereit.
WinIBW-Entwickler können dann die Klasse mit ihren eigenen Verarbeitungsmethoden erweitern, um die konkreten Datensatzänderungen durchzuführen.

## Installation:
Die drei Dateien "csv.js", "ZDB_BatchCsv.xul" und "ZDB_BatchCSV.js" müssen an den folgenden Orten abgelegt werden:

chrome/ibw/content/xul/ZDB_BatchCsv.xul
chrome/ibw/content/xul/ZDB_BatchCSV.js
scripts/csv.js

Die Datei csv.js muss in der Konfigurationsdatei setup.js includiert werden:

pref("ibw.standardScripts.script.LAUFENDE_NUMMER", "resource:/scripts/csv.js");

## Eigenschaften der Klasse CSV:
### callback
Typ Funktion

Name der Callback Funktion, die vom Entwickler selbst definiert wird un die die Klasse erweitert.

Default Wert: function() {};

### keys
Typ Objekt

Schlüsselwörter, die zur Konfiguration der Batchverarbeitung im Interface angezeigt werden.

Default Wert: ["","ZDB-ID","URL","Band Beginn","Jahr Beginn","Heft Beginn","Band Ende","Jahr Ende","Heft Ende","Suchstring"];

### id_key
Typ String

Ist das Schlüsselwort, welches den unikalen Wert repräsentiert, nachdem zusammen mit dem Wert der Eigenschaft 'searchindex' gesucht wird, um genau einen Datensatz zu finden.

Wenn deine CSV-Datei eine Spalte mit PPNs enthält, dann repräsentiert der Wert von id_key immer die jeweilige PPN, nach der gesucht wird. Sinnvoller Weise würde man id_key dann den Wert 'PPN' geben.

Schema: f <searchindex> <id_key>

Beispiel: f ppn 12345678

Default Wert: "ZDB-ID"

### searchindex
Typ String

Ist der Suchindex, der im Zusammenhang mit id_key verwendet wird. Repräsentiert der Wert von id_key eine PPN, dann muss der Wert von searchindex 'ppn' lauten.

Default Wert: "zdb"

### withbib
Typ Bool

True oder False geben an, ob die IDN des Bibliothekssatzes ermittelt werden soll. Wird True gesetzt, dann steht durch Aufruf der Methode __csvBatch die globale Eigenschaft 'eigene_bibliothek' bereit.

Default Wert: true

### logFilename
Typ String

Name der LogDatei, die im Anwendungspfad der WinIBW erstellt wird.

Default Wert: "ZDB_LOG.txt"

### eigene_bibliothek
Typ String

IDN/PPN des Bbliothekssatzes

Default Wert: ""

## Konstruktor
CSV

Stellt alle (default-)Eigenschaften und Methoden der Klasse bereit.

## Methoden der Klasse CSV
### __csvSetProperties
Setzt die Eigenschaften der Klasse

#### Parameter: 
*    _Function_ callback
*    _Object_ keys
*    _String_ id_key
*    _String_ searchindex
*    _Bool_ withbib
*    _String_ logFilename

### __csvSetCallback:
Setzt die Eigenschaft callback.

#### Parameter: 
*    _Function_ callback

### __csvSetLogFilename:
Setzt die Eigenschaft logFilename.

#### Parameter:
*    _String_ logFilename
		
### __csvSetEigeneBibliothek:
Setzt die Eigenschaft eigene_bibliothek.

#### Parameter:
*    _String_ eigene_bibliothek

### __csvConfig
Initiert den Aufruf des Konfigurations-Interface

#### Stellt folgende Eigenschaften bereit:

*    _Object_ params			: Objekt mit allen Eigenschaften
*    _String_ text			: Freitext aus dem Konfigurations-Interface
*    _String_ isil			: ISIL aus dem Konfigurations-Interface
*    _String_ code			: Dropdown-Code aus dem Konfigurations-Interface
*    _String_ startLine			: CSV-Zeile, ab der die Bearbeitung starten soll 
*    _String_ csvFilename		: Name der CSV-Datei	
*    _String_ delimiter			: Trennzeichen in der CSV-Datei


### __csvBatch
Initiiert die Batchverarbeitung der CSV-Datei auf Grundlage der Konfiguration. Ruft Datensatz zur Verarbeitung anhand von 'searchindex' und 'id_key' auf.

#### Stellt folgende Eigenschaften bereit:

*    _Array_ line			: Array mit allen Werten einer CSV-Zeile
*    _String_ eigene_bibliothek		: IDN/PPN des Bibliothekssatzes (wenn Eigenschaft 'withbib = true')

### __csvBatchImport
Initiiert die Batchverarbeitung der CSV-Datei auf Grundlage der Konfiguration. Im Gegensatz zu \__csvBatch ruft __csvBatchImport nicht einzelne Datensätze zur Bearbeitung auf, sondern stellt nur die Werte einzelner CSV-Zeilen breit. Sinnvoll für direkten Import von Daten. 

### __csvAPI
Initiiert die Batchverarbeitung der CSV-Datei ohne vorherige Konfiguration. Funktioniert ähnlich wie \__csvBatchImport. Die keys, die mit der methode __csvSetProperties definiert werden, müssen mit den Spalten der CSV-Datei übereinstimmen. Siehe Beispiel

#### Stellt folgende Eigenschaften bereit:

*    _Array_ line			: Array mit allen Werten einer CSV-Zeile

### __csvLOG
Erlaubt das Speichern von Log-Einträgen während der Bearbeitung.

#### Parameter:
_String_ message

### __csvError
Erlaubt die Ausgabe einer Fehlermeldung

#### Parameter:
_String_ msgText

### __csvSaveBuffer
Stellt eine Speicherroutine bereit.

#### Parameter:
*    _Bool_ save
*    _String_ message

#### Erläuterung:
Nach Aufruf der Methode wird zunächst gesprüft, ob überhaupt gespeichert werden soll (save == true) oder der Datensatz unverändert verlassen werden soll (save == false).

Soll der Datensatz nicht gespeichert werden, wird der Datensatz veralssen und 0 zurück gegeben.

Ist save == true wird zusätzlich gesprüft, ob der Datensatz überhaupt gespeichert werden kann. Kann der Datensatz nicht gespeichert werden, wird ein Eintrag in die LOG-Datei geschrieben und der Wert 0 zurückgegeben.

Kann der Datensatz gespeichert werden wird der Wert 1 zurückgegeben.

### __csvEigeneBibliothek, __csvBatchBibIdn, __csvToArray
Dies sind Methoden, die zur internen Bearbeitung gebraucht werden.

#### Todo
Müssen diese Methoden als Prototypen definiert sein?

## Benutzung

Beispiel mit Konfigurationsmaske

```javascript
// erstelle eine neue Function
function csvBatchIstWertVorhanden()
{
	// initiiere das CSV-Objekt
	// alle Eigenschaften und Methoden des Objekts wurden nun auf die Variable csv vererbt
	var csv = new CSV();
	
	// erweitere nun die Klasse CSV durch deine eigene Methode
	csv.meineMethode = function()
		{
			// mach etwas mit dem Datensatz	
		}
	
	// setze deine eigenen Eigenschaften
	// der erste Parameter ist die Callback Funktion, die Du zuvor erstellt hast
	csv.__csvSetProperties(csv.meineMethode,["","ZDB-ID","Suchstring"],'ZDB-ID','zdb',false,"ZDB_LOG.txt");
	
	// initiiere das Konfigurations-Interface
	// fange dabei eventuelle Fehler ab
	try
	{
		csv.__csvConfig();
	
		// initiiere die Batchbearbeitung
		csv.__csvBatch();
	} 
	catch(e)
	{
		csv.__csvError(e);
	}
	
}
```

Beispiel ohne Konfigurationsmaske

```javascript
// erstelle eine neue Function
function csvBatchIstWertVorhanden()
{
	// initiiere das CSV-Objekt
	var csv = new CSV();
	// diese csv muss im Unterverzeichnis 'csv' des Anwendungsprofils liegen.
	csv.csvFilename = "test.csv";
	// start ab Zeile
	csv.startLine = 1;
	// werte getrennt mit
	csv.delimiter = ";";
	// erweitere nun die Klasse CSV durch deine eigene Methode
	csv.meineMethode = function()
	{
		// mach etwas mit dem Datensatz	
		// greife auf csv werte zu
		if(application.activeWindow.title.find(csv.line['Suchstring'],false,false,true))
		{
			return application.activeWindow.title.currentLineNumber;
		}
		else
		{
			return false;
		}	
	}
	
	// setze deine eigenen Eigenschaften
	// der erste Parameter ist die Callback Funktion, die Du zuvor erstellt hast
	csv.__csvSetProperties(csv.meineMethode,["","ZDB-ID","Suchstring"],'ZDB-ID','zdb',false,"ZDB_LOG.txt");
	
	// initiiere das Konfigurations-Interface
	// fange dabei eventuelle Fehler ab
	try
	{
		// initiiere die Batchbearbeitung
		csv.__csvAPI();
	} 
	catch(e)
	{
		csv.__csvError(e);
	}
	
}
```

Wie kann nun auf die Eigenschaften und Methoden zugegriffen werden?

Beispiel für die Methoden __csvLOG und __csvError

```javascript
// versuche in den Korrekturmodus eines Datensatzes zu gelangen
try
{
	application.activeWindow.command("k", false);
} 
catch(e) 
{
	// die Variable csv hat alle Methoden der Klasse geerbt
	// daher kann über csv.__csvLOG und csv.__csvError auf die Methodev __csvLOG und __csvError zugegriffen werden
	csv.__csvLOG("Datensatz kann nicht geoeffnet werden.\nFehlermeldung: " + e);
	csv.__csvError("Datensatz kann nicht geoeffnet werden.\nFehlermeldung: " + e);
	return;
}
```

Beispiel für den Zugriff auf Eigenschaften

```javascript
// zunächst möchtest Du noch eine weitere Methode erstellen, die eine Extra-Aufgabe erledigt
csv.extraMethode = function(wert)
{
	// z.B suche nach wert und gib tue bei Erfolg zurück, ansonsten gib false zurück
	if(application.activeWindow.title.find(wert,false,false,true))
	{
		return application.activeWindow.title.currentLineNumber;
	}
	else
	{
		return false;
	}	
}

// Diese Methode möchtest Du mit einem Wert einer Klasseneingenschaft bestücken
// dazu kannst Du z.B. auf csv.line zugreifen und eine CSV-Spalte wählen
// 'Suchstring' wurde im Konfigurations-Interface zuvor mit einer CSV-Spalte verknüpft
var gefunden = csv.extraMethode(csv.line['Suchstring']);
```

Beispiel für den Zugriff auf die Methode __csvSaveBuffer

```javascript
// Wenn ein Wert gefunden wurde soll der Datensatz gespeichert werden
// wenn nicht soll der Datensatz verlassen werden
if(!gefunden)
{
	csv.__csvSaveBuffer(false,"String " + csv.line['Suchstring'] + " kann nicht gefunden werden.\n");
	return;
}

csv.__csvSaveBuffer(true,"String " + csv.line['Suchstring'] + " wurde gefunden.\n");
```

Beispiel zur Verwendung der Klasse ohne CSV-Dateien:

```javascript
function setBearbeiten()
{
	// initiiere die Klasse
	var csv = new CSV();
	// setzte den Dateinamen des Logfiles
	csv.__csvSetLogFilename("loeschen_LOG.txt");
	// setzte die IDN/PPN der eigenen Bibliothek
	csv.__csvSetEigeneBibliothek("020593228");
	// hole Umfang des Sets
	var setSize = application.activeWindow.getVariable("P3GSZ");
	i = 1;
	do 
	{
		// mach etwas mit dem Set ...
		try
		{
			application.activeWindow.command("k " + i,false);
			var idn = application.activeWindow.getVariable("P3GPP");
		}
		catch(e) 
		{
			// schreib etwas in die Log-Datei ...
			csv.__csvLOG(idn + "\tDatensatz kann nicht geoeffnet werden.\nFehlermeldung: " + e);
			return;
		}
		application.activeWindow.title.endOfBuffer();
		var neuesFeld = "\n6000 Test";
		application.activeWindow.title.insertText(neuesFeld);
		// starte Speicherroutine
		csv.__csvSaveBuffer(true,idn + "\t" + neuesFeld);
		i++;
	} while (i <= setSize)
}
```
