//--------------------------------------------------------------------------------------------------------
//name:		CSV
//description: Get acces on a csv file
//author: 	Carsten Klee ZDB
// see https://github.com/cKlee/WinIBW3/wiki/CSV for documentation and tutorial
//--------------------------------------------------------------------------------------------------------

// Constants
var CSV_CONFIG = {
    DEFAULT_LOG_FILENAME: "LOG_default.txt",
    CSV_PATH: "\csv\\",
    DEFAULT_DELIMITER: ";",
    VALID_USER_ROLES: "#7A#8A#FI#",
    REQUIRED_ROLE_FOR_SAVE: "8A",
    SEARCH_PARAM_VAR: "P3GPP",
    LOG_FOLDER: "listen"
};

function CSV() {
    this.callback = function () { };
    this.keys = [];
    this.id_key = "";
    this.searchindex = false;
    this.logFilename = CSV_CONFIG.DEFAULT_LOG_FILENAME;
    this.eigene_bibliothek = "";
    this.csv = utility.newFileInput();
    this.path = CSV_CONFIG.CSV_PATH;
    this.isOpen = false;
    this.csvFilename = false;
    this.logger = null;
    this.delimiter = CSV_CONFIG.DEFAULT_DELIMITER;
    this.startLine = 0;
    this.endLine = 0;
    this.validateUserLogin();
}



CSV.prototype =
{
    validateUserLogin: function () {
        var userRole = activeWindow.getVariable("scr");
        if (userRole === "" || CSV_CONFIG.VALID_USER_ROLES.indexOf(userRole) < 0) {
            throw "Sie müssen sich eingeloggt haben um mit diesem Skript arbeiten zu können.";
        }
    },
    openCsv: function () {
        if (this.csvFilename === this.isOpen) {
            messageBox("Die Datei " + this.csvFilename + " ist bereits geöffnet.");
            this.csv.close();
        }
        if (!this.csv.openSpecial("ProfD", this.path + this.csvFilename)) {
            throw "Datei " + this.csvFilename + " wurde nicht gefunden.";
        }
        this.isOpen = this.csvFilename;
    },
    csvSetProperties:
        function (callback, keys, id_key, searchindex, eigene_bibliothek, logFilename) {
            this.callback = callback;
            this.keys = keys;
            this.id_key = id_key;
            this.searchindex = searchindex;
            this.eigene_bibliothek = eigene_bibliothek;
            this.logFilename = logFilename;
        },
    csvSetEigeneBibliothek:
        function (eigene_bibliothek) {
            this.eigene_bibliothek = "!" + eigene_bibliothek + "!";
        },
    csvGetHeader:
        function () {
            this.openCsv();
            this.header = this.csvToArray(this.csv.readLine());
            return this.header;
        },
    // Converts a raw CSV line string into a keyed object using this.keys.
    csvLineToObj: function (aLine) {
        var lineArray = this.csvToArray(aLine);
        var lineObj = {};
        for (var y = 0; y < this.keys.length; y++) {
            lineObj[this.keys[y]] = (lineArray[y] !== undefined && lineArray[y] !== null) ? lineArray[y].toString() : "";
        }
        return lineObj;
    },
    // Looks up the record in CBS and dispatches the callback, or logs a failure.
    csvLookupAndDispatch: function () {
        var idn, cbsMessage;
        activeWindow.setVariable(CSV_CONFIG.SEARCH_PARAM_VAR, "");
        activeWindow.command("\\zoe " + this.searchindex + " " + this.line[this.id_key], false);
        idn = activeWindow.getVariable(CSV_CONFIG.SEARCH_PARAM_VAR);
        cbsMessage = this.csvGetMessages();
        if (idn === "" || cbsMessage) {
            this.csvLOG("\\zoe " + this.searchindex + " " + this.line[this.id_key] + " " + cbsMessage + ";" + activeWindow.status);
        } else {
            this.callback();
        }
    },
    // Processes a single CSV line: builds the line object, dispatches callback or lookup.
    csvProcessLine: function (aLine) {
        this.line = this.csvLineToObj(aLine);
        if (!this.searchindex) {
            this.callback();
        } else {
            this.csvLookupAndDispatch();
        }
        delete this.line;
    },
    csvAPI: function () {
        if (this.csvFilename === false) return;
        this.openCsv();
        var aLine;
        var theStart = parseInt(this.startLine);
        var row = 0;

        while (!this.csv.isEOF()) {
            aLine = this.csv.readLine();
            row += 1;
            if (this.endLine > 0 && row > parseInt(this.endLine)) {
                break;
            }
            if (row >= theStart && aLine !== "") {
                this.csvProcessLine(aLine);
            }
        }
        this.csv.close();
    },
    csvLOG: function (message) {
        if (this.logger === null) {
            this.logger = new LOGGER();
            this.logger.setLogFile(this.logFilename, CSV_CONFIG.LOG_FOLDER);
        }
        var d = new Date();
        var dateString = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear().toString().substr(-2) + " " + d.getHours() + ":" + d.getMinutes() + ":";
        var seconds = d.getSeconds();
        seconds = seconds <= 9 ? "0" + seconds : seconds;
        this.logger.log(dateString + seconds + ";" + activeWindow.getVariable(CSV_CONFIG.SEARCH_PARAM_VAR) + ";" + this.line[this.id_key] + ";" + message);
    },
    csvSaveBuffer: function (save, message) {
        message = "\"" + message + "\"";
        var cbsMessage;
        if (activeWindow.status !== "OK" || save !== true) {
            var logMsg = save === false
                ? "Datensatz wurde verlassen und nicht gespeichert;"
                : "Datensatz kann nicht gespeichert werden;";
            this.csvLOG(logMsg + activeWindow.status + ";" + message);
            activeWindow.simulateIBWKey("FE");
            return false;
        }
        activeWindow.simulateIBWKey("FR");
        cbsMessage = this.csvGetMessages();
        if (cbsMessage) {
            message = message + ";" + cbsMessage;
        }
        if (activeWindow.getVariable("scr") !== CSV_CONFIG.REQUIRED_ROLE_FOR_SAVE) {
            this.csvLOG("Datensatz kann nicht gespeichert werden;" + activeWindow.status + ";" + message);
            activeWindow.simulateIBWKey("FE");
            return false;
        }
        this.csvLOG("Datensatz wurde gespeichert;" + activeWindow.status + ";" + message);
        return true;
    },
    csvGetMessages: function () {
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
