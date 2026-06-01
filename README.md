## Beschreibung:
WinIBW-CSV-API dient der Batchvearbeitung von CSV-Dateien in der WinIBW.

WinIBW-CSV-API stellt dann Eigenschaften der Konfiguration und Methoden zur Bearbeitung der CSV-Batchvearbeitung bereit.
WinIBW-Entwickler können dann die Klasse mit ihren eigenen Verarbeitungsmethoden erweitern, um die konkreten Datensatzänderungen durchzuführen.

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

### filepath
Typ String
Der relative Pfad (ausgehend von ProfD) unter dem die zu importierenden CSV-Dateien liegen. Default Wert ist hier "import". Unter den User-Einstellungen (user_Pref.txt) kan dieser Wert geändert werden. Z.B.:

csv.filepath = meine_import_dateien

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
### setProperties
Setzt die Eigenschaften der Klasse

#### Parameter: 
*    _Function_ callback
*    _Object_ keys
*    _String_ id_key
*    _String_ searchindex
*    _PPN_	  eigene_bibliothek
*    _String_ logFilename

### api
Initiiert die Batchverarbeitung der CSV-Datei ohne vorherige Konfiguration. Die keys, die mit der methode setProperties definiert werden, müssen mit den Spalten der CSV-Datei übereinstimmen. Siehe Beispiel

#### Stellt folgende Eigenschaften bereit:

*    _Array_ line			: Array mit allen Werten einer CSV-Zeile

### log
Erlaubt das Speichern von Log-Einträgen während der Bearbeitung.

#### Parameter:
_String_ message

### save
Stellt eine Speicherroutine bereit.

#### Parameter:
*    _Bool_ save
*    _String_ message

#### Erläuterung:
Nach Aufruf der Methode wird zunächst gesprüft, ob überhaupt gespeichert werden soll (save == true) oder der Datensatz unverändert verlassen werden soll (save == false).

Soll der Datensatz nicht gespeichert werden, wird der Datensatz veralssen und 0 zurück gegeben.

Ist save == true wird zusätzlich gesprüft, ob der Datensatz überhaupt gespeichert werden kann. Kann der Datensatz nicht gespeichert werden, wird ein Eintrag in die LOG-Datei geschrieben und der Wert 0 zurückgegeben.

Kann der Datensatz gespeichert werden wird der Wert 1 zurückgegeben.

## Benutzung

```javascript
// erstelle eine neue Function
function csvBatchIstWertVorhanden()
{
	// initiiere das CSV-Objekt
	var csv = new CSV();
	application.activeWindow.writeProfileString('csv', 'filepath', 'import');
	// diese csv muss im Unterverzeichnis 'import' des Anwendungsprofils liegen.
	csv.csvFilename = "test.csv";
	// start ab Zeile
	csv.startLine = 1;
	// ende Zeile 10
	csv.endLine = 10;
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
	csv.setProperties(csv.meineMethode,["","ZDB-ID","Suchstring"],'ZDB-ID','zdb',false,"ZDB_LOG.txt");
	
	// initiiere die Batchbearbeitung
	csv.api();
}
```

### getAllLines
Gibt den gesamten Inhalt der aktuell gesetzten CSV-Datei als Array von Objekt-Zeilen zurück. Jede Zeile wird anhand der `keys`-Konfiguration in ein Objekt gemappt (Schlüssel → Spaltenwert).

Rückgabe:

* _Array_ von Objekten, z.B. `[ {"ZDB-ID":"123","Suchstring":"abc"}, ... ]`

Beispiel:

```javascript
function __openUsers() {
    // initiiere das CSV-Objekt
	var csv = new CSV();
	application.activeWindow.writeProfileString('csv', 'filepath', 'user');
	// diese tsv muss im Unterverzeichnis 'user' des Anwendungsprofils liegen.
	csv.csvFilename = "users.tsv";
	csv.startLine = 2;
	csv.endLine = 0;
	// werte getrennt mit
	csv.delimiter = "\t";
	Users = csv.getAllLines();
}
```

Wie kann nun auf die Eigenschaften und Methoden zugegriffen werden?

Beispiel für die Methoden csv.log

```javascript
// versuche in den Korrekturmodus eines Datensatzes zu gelangen
try
{
	application.activeWindow.command("k", false);
} 
catch(e) 
{
	// die Variable csv hat alle Methoden der Klasse geerbt
	// daher kann über csv.log auf die Methodev log zugegriffen werden
	csv.log("Datensatz kann nicht geoeffnet werden.\nFehlermeldung: " + e);
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

Beispiel für den Zugriff auf die Methode csv.save

```javascript
// Wenn ein Wert gefunden wurde soll der Datensatz gespeichert werden
// wenn nicht soll der Datensatz verlassen werden
if(!gefunden)
{
	csv.save(false,"String " + csv.line['Suchstring'] + " kann nicht gefunden werden.\n");
	return;
}

csv.save(true,"String " + csv.line['Suchstring'] + " wurde gefunden.\n");
```

Beispiel zur Verwendung der Klasse ohne CSV-Dateien:

```javascript
function setBearbeiten()
{
	// initiiere die Klasse
	var csv = new CSV();
	// setzte den Dateinamen des Logfiles
	csv.logFilename = "loeschen_LOG.txt";
	// setzte die IDN/PPN der eigenen Bibliothek
	csv.setEigeneBibliothek("020593228");
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
			csv.log(idn + "\tDatensatz kann nicht geoeffnet werden.\nFehlermeldung: " + e);
			return;
		}
		application.activeWindow.title.endOfBuffer();
		var neuesFeld = "\n6000 Test";
		application.activeWindow.title.insertText(neuesFeld);
		// starte Speicherroutine
		csv.save(true,idn + "\t" + neuesFeld);
		i++;
	} while (i <= setSize)
}
```
