//--------------------------------------------------------------------------------------------------------
//name:		CSV
//description: Get acces on a csv file
//author: 	Carsten Klee ZDB
// see https://github.com/cKlee/WinIBW3/wiki/CSV for documentation and tutorial
//--------------------------------------------------------------------------------------------------------

// Constants
var CSV_CONFIG = {
    DEFAULT_LOG_FILENAME: "LOG_default.txt",
    CSV_PATH: "csv",
    DEFAULT_DELIMITER: ";",
    VALID_USER_ROLES: "#7A#8A#FI#",
    LOG_FOLDER: "listen"
};

function CSV() {
    this.callback = function () { };
    this.keys = [];
    this.id_key = "";
    this.searchindex = false;
    this.logFilename = CSV_CONFIG.DEFAULT_LOG_FILENAME;
    this.eigene_bibliothek = "";
    this.filepath = getProfileString('csv', 'filepath', CSV_CONFIG.CSV_PATH);
    this.csv = utility.newFileInput();
    this.isOpen = false;
    this.csvFilename = false;
    this.logger = null;
    this.delimiter = CSV_CONFIG.DEFAULT_DELIMITER;
    this.startLine = 0;
    this.endLine = 0;
}



CSV.prototype =
{
    validateUserLogin: function () {
        var userRole = activeWindow.getVariable("scr");
        if (userRole === "" || CSV_CONFIG.VALID_USER_ROLES.indexOf(userRole) < 0) {
            throw "CSV [1]: Sie müssen sich eingeloggt haben um mit diesem Skript arbeiten zu können.";
        }
    },
    __openCsv: function () {
        if (this.csvFilename === this.isOpen) {
            //messageBox("Die Datei " + this.csvFilename + " ist bereits geöffnet.");
            this.csv.close();
        }

        if ('\\' === this.filepath.charAt(0)) {
            alert('relative');
            if (!this.csv.openSpecial("ProfD", this.filepath + '\\' + this.csvFilename)) {
                throw "CSV [2]: Datei " + this.filepath + '\\' + this.csvFilename + " wurde nicht gefunden.";
            }
        } else {
            alert("Pfad: " + this.filepath + '\\' + this.csvFilename);
            if (!this.csv.open(this.filepath + '\\' + this.csvFilename)) {
                alert("Nicht gefunden: " + this.filepath + '\\' + this.csvFilename);
                throw "CSV [2]: Datei " + this.filepath + '\\' + this.csvFilename + " wurde nicht gefunden.";
            }

            this.isOpen = this.csvFilename;
        }
    },
    setProperties:
        function (callback, keys, id_key, searchindex, eigene_bibliothek, logFilename) {
            this.callback = callback;
            this.keys = keys;
            this.id_key = id_key;
            this.searchindex = searchindex;
            this.eigene_bibliothek = eigene_bibliothek;
            this.logFilename = logFilename;
        },
    setEigeneBibliothek:
        function (eigene_bibliothek) {
            this.eigene_bibliothek = "!" + eigene_bibliothek + "!";
        },
    getHeader:
        function () {
            this.__openCsv();
            this.header = this.csvToArray(this.csv.readLine());
            return this.header;
        },
    // Converts a raw CSV line string into a keyed object using this.keys.
    __lineToObj: function (aLine) {
        var lineArray = this.csvToArray(aLine);
        var lineObj = {};
        for (var y = 0; y < this.keys.length; y++) {
            lineObj[this.keys[y]] = (lineArray[y] !== undefined && lineArray[y] !== null) ? lineArray[y].toString() : "";
        }
        return lineObj;
    },
    // Looks up the record in CBS and dispatches the callback, or logs a failure.
    __lookupAndDispatch: function () {
        this.validateUserLogin();
        var idn, cbsMessage;
        activeWindow.setVariable("P3GPP", "");
        //alert("\\zoe " + this.searchindex + " " + this.line[this.id_key]);
        activeWindow.command("\\zoe " + this.searchindex + " " + this.line[this.id_key], false);
        idn = activeWindow.getVariable("P3GPP");
        //alert("Lookup result: " + idn);
        cbsMessage = this.__getMessages();
        if (idn === "" || cbsMessage) {
            this.log("\\zoe " + this.searchindex + " " + this.line[this.id_key] + " " + cbsMessage + ";" + activeWindow.status);
        } else {
            this.callback();
        }
    },
    // Processes a single CSV line: builds the line object, dispatches callback or lookup.
    __processLine: function (aLine) {
        this.line = this.__lineToObj(aLine);
        if (!this.searchindex) {
            this.callback();
        } else {
            this.__lookupAndDispatch();
        }
        delete this.line;
    },
    api: function () {
        if (this.csvFilename === false) return;
        this.__openCsv();
        var aLine;
        var theStart = parseInt(this.startLine);
        var theEnd = parseInt(this.endLine);
        //alert("CSV-Datei " + this.csvFilename + " wird verarbeitet. Startzeile: " + theStart + ", Endzeile: " + (theEnd > 0 ? theEnd : "EOF") + ".");
        var row = 0;

        while (!this.csv.isEOF()) {
            aLine = this.csv.readLine();
            row += 1;
            if (theEnd > 0 && row > theEnd) {
                break;
            }
            if (row >= theStart && aLine !== "") {
                this.__processLine(aLine);
            }
        }
        this.csv.close();
    },
    // Returns the whole CSV file as an array of line-objects
    getAllLines: function () {
        if (this.csvFilename === false) return [];
        this.__openCsv();
        var result = [];
        var aLine;
        var row = 0;
        var theStart = parseInt(this.startLine);
        var theEnd = parseInt(this.endLine);

        while (!this.csv.isEOF()) {
            aLine = this.csv.readLine();
            row += 1;
            if (theEnd > 0 && row > theEnd) {
                break;
            }
            if (row >= theStart && aLine !== "") {
                result.push(this.__lineToObj(aLine));
            }
        }
        this.csv.close();
        return result;
    },
    log: function (message) {
        if (this.logger === null) {
            this.logger = new LOGGER();
            this.logger.setLogFile(this.logFilename, CSV_CONFIG.LOG_FOLDER);
        }
        var d = new Date();
        var dateString = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear().toString().substr(-2) + " " + d.getHours() + ":" + d.getMinutes() + ":";
        var seconds = d.getSeconds();
        seconds = seconds <= 9 ? "0" + seconds : seconds;
        this.logger.log(dateString + seconds + ";" + activeWindow.getVariable("P3GPP") + ";" + this.line[this.id_key] + ";" + message);
    },
    save: function (save, message) {
        message = "\"" + message + "\"";
        var cbsMessage;
        if (save === true) {
            activeWindow.simulateIBWKey("FR");
            cbsMessage = this.__getMessages();
            if (cbsMessage) message = message + ";" + cbsMessage;
            if (activeWindow.status !== "OK") {
                this.log("Datensatz konnte nicht gespeichert werden;" + activeWindow.status + ";" + message);
                activeWindow.simulateIBWKey("FE");
                return false;
            }
            this.log("Datensatz wurde gespeichert;" + activeWindow.status + ";" + message);
            return true;
        }
        activeWindow.simulateIBWKey("FE");
        this.log("Datensatz wurde verlassen und nicht gespeichert;" + activeWindow.status + ";" + message);
        return true;
    },
    __getMessages: function () {
        var msgs = utility.messages();
        if (msgs.count === 0) {
            return false;
        }
        var messageText = "";
        for (var i = 0; i < msgs.count; i++) {
            messageText += msgs.item(i).text + ";";
        }
        return "\"" + messageText + "\"";
    },
    csvToArray:
        function (strData, delimit) {
            var delimiter = delimit || this.delimiter;
            // in case last character of line is not the delimiter
            if (strData.length > 0 && strData.charAt(strData.length - 1) !== delimiter) {
                strData = strData + delimiter;
            }

            // Create a regular expression to parse the CSV values.
            var objPattern = new RegExp(
                (
                    // Delimiters.
                    "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
                    // Quoted fields.
                    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                    // Standard fields.
                    "([^\"\\" + delimiter + "\\r\\n]*))"
                ),
                "gi"
            );
            // Create an array to hold our data. Give the array
            // a default empty first row.
            var arrData = [[]];

            // Create an array to hold our individual pattern
            // matching groups.
            var arrMatches = null;

            var strMatchedValue;

            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while (arrMatches = objPattern.exec(strData)) {

                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[1];

                // Only line delimiters start a new row, not field delimiters.
                if (
                    strMatchedDelimiter.length &&
                    (strMatchedDelimiter != delimiter)
                ) {
                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push([]);
                }
                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[2]) {
                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    strMatchedValue = arrMatches[2].replace(
                        new RegExp("\"\"", "g"),
                        "\""
                    );
                } else {
                    // We found a non-quoted value.
                    strMatchedValue = arrMatches[3];
                }
                // Now that we have our value string, let's add
                // it to the data array.
                arrData[arrData.length - 1].push(strMatchedValue);
            }
            // For line-based processing, return the first row as a flat array.
            return arrData.length ? arrData[0] : [];
        }
}; // end of class
