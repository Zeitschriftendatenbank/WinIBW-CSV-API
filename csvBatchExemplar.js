//--------------------------------------------------------------------------------------------------------
//name:		__csvBatchCSVToExemplar
// is called by	__csvBatchCSV
// calls		__csvLOG
//description:	manipulates the data of a given record in the "exemplar" section
//user:	  	internal
//input: 		Array line: the data to write to the title section
//			Array config: the semantic of each tupel of the Array
//			Array params: some extra params for handling the csv file
//return:		Integer 1 if record was updated, 0 if an error occurred
//author: 		Carsten Klee
//date:		2011-07-04
//version:		1.0.0.1
//status:		testing
//--------------------------------------------------------------------------------------------------------
function csvBatchExemplar()
{
	var csv = new CSV();
	csv.__csvBatchExemplar = function()
	{
	
		//	create field 7120 content
		// start volume
		var v = (csv.line['Band Beginn'] == "" || !csv.line['Band Beginn']) ? "" : "/v" + csv.line['Band Beginn'];
		var v2 = (csv.line['Band Beginn'] == "" || !csv.line['Band Beginn']) ? "" : csv.line['Band Beginn'];
		
		var b2trenner = (csv.line['Band Beginn'] == "" || !csv.line['Band Beginn']) ? "" : ".";
		
		// issue start
		var h = (csv.line['Heft Beginn'] == "" || !csv.line['Heft Beginn']) ? "" : ","+ csv.line['Heft Beginn'];
		
		// start year
		var b = (csv.line['Jahr Beginn'] == "" || !csv.line['Jahr Beginn']) ? "" : "/b" + csv.line['Jahr Beginn'];
		var b2 = (csv.line['Jahr Beginn'] == "" || !csv.line['Jahr Beginn']) ? "" : csv.line['Jahr Beginn'];
		
		// volume end
		var V = (csv.line['Band Ende'] == "" || !csv.line['Band Ende']) ? "" : "/V" + csv.line['Band Ende'];
		var V2 = (csv.line['Band Ende'] == "" || !csv.line['Band Ende']) ? "" : csv.line['Band Ende'];
		
		var E2trenner = (csv.line['Band Ende'] == "" || !csv.line['Band Ende']) ? "" : ".";
		
		// issue end
		var H = (csv.line['Heft Ende'] == "" || !csv.line['Heft Ende']) ? "" : ","+csv.line['Heft Ende'];
		
		// year end
		var E = (csv.line['Jahr Ende'] == "" || !csv.line['Jahr Ende']) ? "" : "/E" + csv.line['Jahr Ende'];
		var E2 = (csv.line['Jahr Ende'] == "" || !csv.line['Jahr Ende']) ? "" : csv.line['Jahr Ende'];
		
		if((csv.line['Band Ende'] == "" || !csv.line['Band Ende']) && (csv.line['Jahr Ende']  == "" || !csv.line['Jahr Ende'])) {
			V = "-";
		}
		
		var bestandsangaben = v + b + V + E;
		var bestandsangaben2 = v2 + b2trenner + b2 + h + " - " + V2 + E2trenner + E2 + H;

	//	create value for field 7135
		var lizenz = "";
		switch(csv.code){
			case "nl": lizenz = "Nationallizenz";
			break;
			case "ad": lizenz = "DFG-geförderte Allianz-Lizenz";
			break;
			case "al": lizenz = "Allianz-Lizenz";
			break;
			case "nk": lizenz = "Nationalkonsortium";
			break;
		}
		
		
		application.activeWindow.command("show d", false);
		// Sichert Inhalt des Zwischenspeichers, da dieser sonst durch copyTitle() überschrieben würde

		try{
			var clipboard = application.activeWindow.clipboard;
		} catch(e){
			// do nothing
		}
		// Kopiert Titel
		var kopie = application.activeWindow.copyTitle();
		application.activeWindow.clipboard = clipboard;
		//Schleife von 1 bis 99, da max. 99 Exemplare pro Bibliothek erfasst werden können
		for (var i = 1; i <= 99; i++) {
			var vergleich = 7000 + i;
			if (kopie.indexOf(vergleich) == -1) {
				var eingabe = vergleich + " x\n4800 " + csv.eigene_bibliothek + "\n7120 " + bestandsangaben + "\n7135 =u " + csv.line['URL'] + "=x " + lizenz + "\n8032 " + bestandsangaben2 + "\n8034 " + csv.text + "\n";
				// Exemplarsatz anlegen und befüllen
				application.activeWindow.command("e e" + i, false);
				if (application.activeWindow.status != "ERROR") {
					application.activeWindow.title.startOfBuffer(false);
					application.activeWindow.title.insertText(eingabe);
				}
		//			save buffer		
				return csv.__csvSaveBuffer(true,eingabe);
			}
		}
	}
	
	csv.__csvSetCallback(csv.__csvBatchExemplar);	
	try
	{	
		csv.__csvConfig();
		csv.__csvBatch();
	} 
	catch(e)
	{
		csv.__csvError(e);
	}	
}
