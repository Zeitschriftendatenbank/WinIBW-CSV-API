//============================================================================
// ZDB_BatchCsv.js
//
// Maintenance dialog for CSV Batch Import (ZDB specific).
// Dialog is implemented in zdb_batch_csv_config.xul,
//
//============================================================================
// Erstellt: ZDB, Carsten Klee
//============================================================================

var ww   = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
					.getService(Components.interfaces.nsIWindowWatcher);
var application = Components.classes["@oclcpica.nl/kitabapplication;1"]
					.getService(Components.interfaces.IApplication);

// get params from open_xul_dialog()
var params = this.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);

const utility = 
{
	newFileInput: function() {
		return Components.classes["@oclcpica.nl/scriptinputfile;1"]
								.createInstance(Components.interfaces.IInputTextFile);
	},

     newFileOutput: function() {
        return Components.classes["@oclcpica.nl/scriptoutputfile;1"]
                                 .createInstance(Components.interfaces.IOutputTextFile);
	},

	newPrompter: function() {
         return Components.classes["@oclcpica.nl/scriptpromptutility;1"]
                                   .createInstance(Components.interfaces.IPromptUtilities);
   }
};


function csvOnCancel()
{
	params.SetString(1, "cancel");
	return true;
}

function csvOnAccept(){
	// PRODUKTCODE
	//check if something is selected
	var prduktMenuIndex = document.getElementById("produktmenu").selectedIndex;
	if(prduktMenuIndex == 0 || prduktMenuIndex == -1){
		prduktCodePopup.childNodes[prduktMenuIndex].value == "";
	}
	// write selected to params
	var prduktCodePopup = document.getElementById("produktcode");
	pushToParams(prduktCodePopup.childNodes[prduktMenuIndex].value, 995);
		
	// PRODUKTISIL
	// check if value is given
	var produktIsil = document.getElementById("isil").value;
	if(produktIsil == "") {
		alert("Bitte geben Sie ein Produkt-ISIL ein!");
		return false;
	} else {
		pushToParams(produktIsil, 994);
	}

	// DESCRIPTION
	// check if value is given
	if(params.GetString(1) != "titel"){
		var produktDescription = document.getElementById("description").value;
		if(produktDescription == "") {
			alert("Bitte geben Sie die Anmerkungen zur Lizenz ein!");
			return false;
		} else {
			pushToParams(produktDescription, 993);
		}
	}
	
	return true;

}

function pushToParams(key, num){
	params.SetString(num, key);
}

function buildConfigBox(line){
	// get the keys from string and rebuild an array
	var keys = params.GetString(2).split(",");
	var theEle, theList, thePopup, theText, theGroup;
	while(document.getElementById("firstChild").nextSibling){
		document.getElementById("configbox").removeChild(document.getElementById("firstChild").nextSibling);
	}
	
	// Titel des Fenster aendern
	var tit = "";
	switch(params.GetString(1)){
		case "exemplar": tit = "Konfigurationsmaske für die Exemplarenebe";
		break;
		case "titel": tit = "Konfigurationsmaske für die Titelenebe";
		break;
		default: tit = "Konfigurationsmaske";
	}
	var dialog = document.getElementById("ZDB_BatchCsv");
	dialog.setAttribute("title", tit);

	var theBox = document.getElementById("configbox");
	//var i = 0;
	//while(line[0][i] != null){
	for(var i = 0; i < line.length;i++)
	{
		// we don't want empty elements
		//if(line[i] != "")
		//{
			// create an element menulist
			theList = document.createElement("menulist");
			theList.setAttribute("id", "list_" + i+1);
			var linecount = i+1;
			theList.setAttribute("oncommand", "pushToParams(this.value, " + linecount + ");")
			
			// create an element menupopup
			thePopup = document.createElement("menupopup");
			thePopup.setAttribute("id", "pop_" + i+1);
			
			// create an element gruopbox
			theGroup = document.createElement("groupbox");
			theGroup.setAttribute("orient", "horizontal");		
		
			// iterate the keys and create an element menuitem
			for(e = 0; e < keys.length; e++) {
				theEle = document.createElement("menuitem");
				theEle.setAttribute("label", keys[e]);
				theEle.setAttribute("value", keys[e]);
				thePopup.appendChild(theEle);
			}
			
			// create an element textbox
			theText = document.createElement("textbox");
			theText.setAttribute("readonly", "true");
			theText.setAttribute("value", line[i]);
			theText.setAttribute("rows", "1");
			theText.setAttribute("multiline", "false");
			theText.setAttribute("size", "100");
			
			// bind them all together
			thePopup.appendChild(theText);
			theList.appendChild(thePopup);
			theGroup.appendChild(theList);
			theGroup.appendChild(theText);
			theBox.appendChild(theGroup);
		//}	
		//i++;
	}
	// total count of lines --> for iteration later on 
	pushToParams(i, 0);
}

function CSVToArray( strData, strDelimiter ){
	// in case last character of line is not the delimiter
	if(strData.substring(strData.length) != strDelimiter) strData + strDelimiter;

	// Create a regular expression to parse the CSV values.
	var objPattern = new RegExp(
		(
			// Delimiters.
			"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

			// Quoted fields.
			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

			// Standard fields.
			"([^\"\\" + strDelimiter + "\\r\\n]*))"
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
			(strMatchedDelimiter != strDelimiter)		
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
}
//----------------------------------------------------------------------------
function getSpecialDirectory(name)
{
	const nsIProperties = Components.interfaces.nsIProperties;
    var dirService = Components.classes["@mozilla.org/file/directory_service;1"]
    					.getService(nsIProperties);
    
    return dirService.get(name, Components.interfaces.nsIFile);
}
//----------------------------------------------------------------------------
function loadFileByName()
{
try {
	var theList = document.getElementById('idFileListMenu');
	// push filename to params for later use
	pushToParams(theList.value, 997);
	var strDelimiter = document.getElementById('delimiter');
	// push the delimiter to params for later use
	pushToParams(strDelimiter.value, 998);
	var theStart = document.getElementById('sZeile');
	// push the start line number to params for later use
	pushToParams(theStart.value, 996);
	//application.messageBox("Eigenschaften", theStart, false);
	if(theStart.value == "") return;
	// convert to integer
	theStart = parseInt(theStart.value);
	
	// load file object
	var theFileInput = utility.newFileInput();
	if (!theFileInput.openSpecial("ProfD", "\csv\\" + theList.value)) {
			alert("Datei " + theList.value + " wurde nicht gefunden.");
			return;
	}
	// read the start line
	var aLine = "";
	var i = 0;
	while(i < theStart){
		aLine = theFileInput.readLine();
		i++;
	}
	theFileInput.close();
	// call CSVToArray() function
	var lineArray = CSVToArray( aLine, strDelimiter.value );

	//application.messageBox("test",lineArray,false);
	buildConfigBox(lineArray);

} catch(e) { alert('loadFileByName: '+ e.name + ': ' + e.message); }
}

//----------------------------------------------------------------------------
function loadFiles()
{
	try {

		//document.getElementById('delimit').value = this.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock).GetString(0);
		
		//params.SetString(1, "out");
		var arNames = new Array(); // Array to store the names of the files in
		// Get the user's csv files:
		theDir = getSpecialDirectory("ProfD");
		theDir.append("csv");
		if (theDir.exists()) {
			theDirEnum = theDir.directoryEntries;
			while (theDirEnum.hasMoreElements()) {
				var theItem = theDirEnum.getNext();
				var theFile = theItem.QueryInterface(Components.interfaces.nsIFile);
				if (theFile.isFile()) {
					for (found = false, i = 0; (i < arNames.length) && !found; i++) {
						found = (arNames[i] == theFile.leafName);
					}
					if (!found) arNames.push(theFile.leafName);
				}
			}
		} else {
			alert('Der Ordner '+ theDir + ' existiert nicht.');
		}
		arNames.sort();
		var theFileList = document.getElementById("idFileList");
		for (i = 0; i < arNames.length; i++) {
			var theEle = document.createElement("menuitem");
			theEle.setAttribute("label", arNames[i]);
			theEle.setAttribute("value", arNames[i]);
			theFileList.appendChild(theEle);
		}

		document.getElementById("idFileListMenu").selectedIndex = 0;
		loadFileByName();
		arNames = null;
	} catch(e) { alert('loadFiles: '+ e.name + ': ' + e.message); }
}
