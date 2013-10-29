//--------------------------------------------------------------------------------------------------------
//name:		CSV
//description:	initiates a csv import
//user:		staff only
//author: 	Carsten Klee ZDB
//status:	testing
// see https://github.com/cKlee/WinIBW3/wiki/CSV for documentation and tutorial
//--------------------------------------------------------------------------------------------------------
function CSV(){
	
	this.callback = function() {};
	this.keys = ["","ZDB-ID","URL","Band Beginn","Jahr Beginn","Heft Beginn","Band Ende","Jahr Ende","Heft Ende","Moving Wall","Suchstring"];
	this.id_key = "ZDB-ID";
	this.searchindex = "zdb";
	this.withbib = true;
	this.logFilename = "ZDB_LOG.txt";
	this.eigene_bibliothek = "";
	
	var scr = application.activeWindow.getVariable("scr");
	
	if ( (scr == "") || ("#7A#8A#FI#".indexOf(scr) < 0) ) {
		throw("Sie müssen sich eingeloggt haben um mit diesem Skript arbeiten zu können.");
		return null;
	}
}

CSV.prototype = 
{

	__csvSetProperties:
		function(callback,keys,id_key,searchindex,withbib,logFilename)
		{
			this.callback = callback;
			this.keys = keys;
			this.id_key = id_key;
			this.searchindex = searchindex;
			this.withbib = withbib;
			this.logFilename = logFilename;
		},
		
	__csvSetCallback:
		function(callback)
		{
			this.callback = callback;
		},
		
	__csvSetLogFilename:
		function(logFilename)
		{
			this.logFilename = logFilename;
		},
		
	__csvSetEigeneBibliothek:
		function(eigene_bibliothek)
		{
			this.eigene_bibliothek = "!" + eigene_bibliothek + "!";
		},

	
	__csvConfig:
		function()
		{
			const params = Components.classes["@mozilla.org/embedcomp/dialogparam;1"]
							.createInstance(Components.interfaces.nsIDialogParamBlock);		
			params.SetNumberStrings(999);

			params.SetString(1,this.callback);
			params.SetString(2,this.keys);

			open_xul_dialog("chrome://ibw/content/xul/ZDB_BatchCsv.xul", null, params);
			
			// on cancel
			if(params.GetString(1) == "cancel") {
				this.csvFilename 	= false;
				return;
			}

			this.config = new Array();

			for(var i = 0; i <= params.GetString(0);i++)
			{
				if(params.GetString(i) !== "")
					this.config[params.GetString(i)] = i-1;
					
			}

			
			this.params			= params;
			this.constants		= params.GetString(992);
			this.text			= params.GetString(993);
			this.isil 			= params.GetString(994);
			this.code			= params.GetString(995);
			this.startLine 		= params.GetString(996);
			this.csvFilename 	= params.GetString(997);
			this.delimiter		= params.GetString(998);
			params = null;
			
			//__zeigeEigenschaften(params);
			
			eval("var const = new Array(this.constants)");
			this.__csvError(typeof this.constants);
			/*for(var c = 1;c <= this.constants.length; c++){
				eval("this.const_"+c) = this.constants[c];
			}*/
			return;
		},


	__csvEigeneBibliothek:
		function()
		{
			//define eigene bibliothek
			this.eigene_bibliothek = this.__csvBatchBibIdn();
			if(this.eigene_bibliothek == false){
				this.__csvLOG(this.isil + "\tDer Bibliothekssatz für das Produktsigel konnte nicht gefunden werden.");
				throw "Das Skript wird abgebrochen. Der Bibliothekssatz für das Produktsigel konnte nicht gefunden werden.";
				return false;
			} else {
				this.eigene_bibliothek = "!" + this.eigene_bibliothek + "!";
				return true;
			}
		},
		
	 __csvBatch:
		function()
		{	
			// on cancel
			if(this.csvFilename == false) return;
			
			if(this.withbib == true) {
				if(!this.__csvEigeneBibliothek()) return;
			}

			// first selct the file you want to work with
			// open the input file
			var csv = utility.newFileInput();
			
			if(!csv.openSpecial("ProfD", "\csv\\" + this.csvFilename)){
				throw "Datei " + this.csvFilename + " wurde nicht gefunden.";
				throw "Das Skript wird abgebrochen. Datei " + this.csvFilename + " wurde nicht gefunden.";
				return false;
			}

			// read the start line
			var aLine, idn;
			var theStart = parseInt(this.startLine);
			
			
			// for each line of the csv file
			var i = 1;

			while((aLine = csv.readLine()) != null)
			{
				// when aLine is empty memory error occours
				if(i >= theStart && aLine != "")
				{
					// call CSVToArray() function
					this.lineArray 	= this.__csvToArray(aLine);
					
					this.line = new Array();
					// for better acces write a simple array
					for(var y = 0;y < this.keys.length; y++) 
						this.line[this.keys[y]] = this.lineArray[[this.config[this.keys[y]]]];

					application.activeWindow.setVariable("P3GPP","");
					
					// search for zdb-id
					application.activeWindow.command("f " + this.searchindex + " " + this.line[this.id_key],false);
					
					idn = application.activeWindow.getVariable("P3GPP");

					if(idn != "")
					{ 
						this.callback();
					}
					else
					{
						this.__csvLOG(this.line[this.id_key] + "\tTitel konnte nicht gefunden werden.");
					}
						
				} 
				else
				{
					// do nothing
				}
				i++;
			}
			csv.close();
			
			return;
		},
		
	 __csvAPI:
		function()
		{	
			// on cancel
			if(this.csvFilename == false) return;
			
			if(this.withbib == true) {
				if(!this.__csvEigeneBibliothek()) return;
			}

			// first selct the file you want to work with
			// open the input file
			var csv = utility.newFileInput();
			
			if(!csv.openSpecial("ProfD", "\csv\\" + this.csvFilename)){
				throw "Datei " + this.csvFilename + " wurde nicht gefunden.";
				throw "Das Skript wird abgebrochen. Datei " + this.csvFilename + " wurde nicht gefunden.";
				return false;
			}

			// read the start line
			var aLine, idn;
			var theStart = parseInt(this.startLine);
			
			
			// for each line of the csv file
			var i = 1;

			while((aLine = csv.readLine()) != null)
			{
				// when aLine is empty memory error occours
				if(i >= theStart && aLine != "")
				{
					// call CSVToArray() function
					this.lineArray 	= this.__csvToArray(aLine);
					
					this.line = new Array();
					// for better acces write a simple array
					for(var y = 0;y < this.keys.length; y++) 
						this.line[this.keys[y]] = this.lineArray[y];

					application.activeWindow.setVariable("P3GPP","");
					
					// search for zdb-id
					application.activeWindow.command("f " + this.searchindex + " " + this.line[this.id_key],false);
					
					idn = application.activeWindow.getVariable("P3GPP");

					if(idn != "")
					{ 
						this.callback();
					}
					else
					{
						this.__csvLOG(this.line[this.id_key] + "\tTitel konnte nicht gefunden werden.");
					}
						
				} 
				else
				{
					// do nothing
				}
				i++;
			}
			csv.close();
			
			return;
		},
		
	 __csvBatchImport:
		function()
		{	
			// on cancel
			if(this.csvFilename == false) return;
			
			// first selct the file you want to work with
			// open the input file
			var csv = utility.newFileInput();
			
			if(!csv.openSpecial("ProfD", "\csv\\" + this.csvFilename)){
				throw "Datei " + this.csvFilename + " wurde nicht gefunden.";
				throw "Das Skript wird abgebrochen. Datei " + this.csvFilename + " wurde nicht gefunden.";
				return false;
			}

			// read the start line
			var aLine;
			var theStart = parseInt(this.startLine);
			
			
			// for each line of the csv file
			var i = 1;

			while((aLine = csv.readLine()) != null)
			{
				// when aLine is empty memory error occours
				if(i >= theStart && aLine != "")
				{
					// call CSVToArray() function
					this.lineArray 	= this.__csvToArray(aLine);
					
					this.line = new Array();
					// for better acces write a simple array
					for(var y = 0;y < this.keys.length; y++) 
						this.line[this.keys[y]] = this.lineArray[[this.config[this.keys[y]]]];

					try
					{ 
						this.callback();
					}
					catch(e)
					{
						this.__csvLOG(this.line[this.id_key] + e);
					}
						
				} 
				else
				{
					// do nothing
				}
				i++;
			}
			csv.close();
			
			return;
		},		
		

	__csvBatchBibIdn:
		function()
		{
			application.activeWindow.setVariable("P3GPP","");
			// find record
			application.activeWindow.command("f sg \"" + this.isil + "\" AND bbg tw",false);
			var idn = application.activeWindow.getVariable("P3GPP");
			if(idn != ""){
				return application.activeWindow.getVariable("P3GPP");
			} else {
				return false;
			}
		},	
		

	__csvLOG:
		function(message)
		{

			var theFileInput = utility.newFileInput();
			var	theFileOutput = utility.newFileOutput();
			// check if file already exists
			if(!theFileInput.openSpecial("ProfD",this.logFilename))
			{
			//	create file
				if(!theFileOutput.createSpecial("ProfD",this.logFilename))
				{
					//this.__csvError("Die LOG-Datei " + this.logFilename + " konnte nicht erstellt werden");
					throw "Die LOG-Datei " + this.logFilename + " konnte nicht erstellt werden";
					return;
				}
			} 
			else
			{
			//	use  existing file
				theFileOutput.createSpecial("ProfD",this.logFilename);
			}
			var simpleDate = new Date();
			var idn = (!this.line) ? application.activeWindow.getVariable("P3GPP") : this.line[this.id_key];
			theFileOutput.writeLine(simpleDate+";"+idn+";"+message);
			theFileInput.close();
			theFileOutput.close();
			return;
		},

	__csvError:
		function(msgText)
		{
			application.messageBox("Fehler",msgText,"eror-icon");
			return;
		},	


	__csvSaveBuffer:
		function(save,message)
		{
			message = "'" + message + "'";
			if (application.activeWindow.status == "OK" && save == true) 
			{
				application.activeWindow.simulateIBWKey("FR");
				if(application.activeWindow.getVariable("scr") != "8A")
				{
					//	return undone but write error to a log file
					this.__csvLOG("Datensatz kann nicht gespeichert werden;" + application.activeWindow.status
					+ ";" + message
					+ ";" + this.__csvGetMessages()
					);
					application.activeWindow.simulateIBWKey("FE");
					return false;					
				} 
				else
				{
					this.__csvLOG("Datensatz wurde gespeichert;" + application.activeWindow.status
					+ ";" + message
					+ ";" + this.__csvGetMessages()
					);
					return true;
				}
			} 
			else if (save == false)
			{
				//	return undone but write error to a log file
				this.__csvLOG("Datensatz wurde verlassen und nicht gespeichert;" + application.activeWindow.status
				+ ";" + message
				+ ";" + this.__csvGetMessages()
				);
				application.activeWindow.simulateIBWKey("FE");
				return false;			
			}
			else 
			{
				//	return undone but write error to a log file
				this.__csvLOG("Datensatz kann nicht gespeichert werden;" + application.activeWindow.status
				+ ";" + message
				+ ";" + this.__csvGetMessages()
				);
				application.activeWindow.simulateIBWKey("FE");
				return false;
			}

		},
	
	__csvGetMessages:
		function()
		{
			var messageText = "";
			try
			{
				for(var i = 0; i < application.activeWindow.messages.count; i++){
					messageText += "'" + application.activeWindow.messages.item(i).text + "';";
				}
			} catch(e) {
				return "Keine Meldungen;";
			}
			
			return messageText;
			
		},


	__csvToArray:
		function(strData)
		{
			// in case last character of line is not the delimiter
			if(strData.substring(strData.length) != this.delimiter) strData + this.delimiter;

			// Create a regular expression to parse the CSV values.
			var objPattern = new RegExp(
				(
					// Delimiters.
					"(\\" + this.delimiter  + "|\\r?\\n|\\r|^)" +

					// Quoted fields.
					"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

					// Standard fields.
					"([^\"\\" + this.delimiter  + "\\r\\n]*))"
				),
				"gi"
			);


			// Create an array to hold our data. Give the array
			// a default empty first row.
			var arrData = [[]];

			// Create an array to hold our individual pattern
			// matching groups.
			var arrMatches = null;

			// Keep looping over the regular expression matches
			// until we can no longer find a match.
			while (arrMatches = objPattern.exec( strData )){

				// Get the delimiter that was found.
				var strMatchedDelimiter = arrMatches[ 1 ];

				// Check to see if the given delimiter has a length
				// (is not the start of string) and if it matches
				// field delimiter. If id does not, then we know
				// that this delimiter is a row delimiter.
				/*if (
					strMatchedDelimiter.length &&
					(strMatchedDelimiter != this.delimiter)
					)*/			
				if (
					strMatchedDelimiter.length
					)
				{
					// Since we have reached a new row of data,
					// add an empty row to our data array.
					arrData.push( [] );
				}
				// Now that we have our delimiter out of the way,
				// let's check to see which kind of value we
				// captured (quoted or unquoted).
				if (arrMatches[ 2 ]){
					// We found a quoted value. When we capture
					// this value, unescape any double quotes.
					var strMatchedValue = arrMatches[ 2 ].replace(
						new RegExp( "\"\"", "g" ),
						"\""
						);
				} else {
					// We found a non-quoted value.
					var strMatchedValue = arrMatches[ 3 ];
				}
				// Now that we have our value string, let's add
				// it to the data array.
				arrData[ arrData.length - 1 ].push( strMatchedValue );
			}
			// Return the parsed data.
			return( arrData );
		},
	
	/**
	* this method searches for a given term and returns 
	* all line numbers of occurrences in an array
	* @param 		string		term
	* @param		int/string		lastline
	* @return	array			lines
	*/
	__utilCsvBatchCSVSearch: 
		function (term,lastline)
		{
			var lines = new Array();
			regex = new RegExp(term,"gm");
			var count = 1;
			var currentField = "";
			var currentLine = application.activeWindow.title.currentLineNumber;
			while(currentLine != lastline){
				// write selection into variable
				currentField = application.activeWindow.title.currentField;
				if(regex.test(currentField)) lines.push(count);
				
				application.activeWindow.title.lineDown(1,false);
				currentLine = application.activeWindow.title.currentLineNumber;
				count++;

			}
			return lines;
		},
		
	__utilCsvBatchCSVLineUpAndTest70XX:
		function (currentField)
		{
			// go one line up
			application.activeWindow.title.lineUp(1,false);
			// test regex
			var regex = /: [xaul].{0,2}/g;
			var test = regex.test(currentField);	
			return test;
		},	
	
	__utilCsvBatchCSVLineUpAndTestRegex:
		function (currentField,regex)
		{
			// go one line up
			application.activeWindow.title.lineUp(1,false);
			// text regex
			var test = regex.test(currentField);		
			return test;
		},	
		
	__utilCsvBatchCSVLineDownAndTestRegex:
		function (currentField,regex)
		{
			// go one line up
			application.activeWindow.title.lineDown(1,false);
			// text regex
			var test = regex.test(currentField);		
			return test;
		},

}; // end of class