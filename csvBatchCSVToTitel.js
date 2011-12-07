function csvBatchTitel()
{
	var csv = new CSV();
	csv.__csvBatchTitle = function ()
	{
		var codes = "";
		var fields = new Array("0600","0601");
		var values = new Array(csv.code,csv.isil);
		application.activeWindow.command("k", false);
		for(var f in fields){
			// we don't want empty fields
			if(fields[f] != "") 
			{
				//	check if field alredy exists
					if((codes = application.activeWindow.title.findTag(fields[f], 0, false, true, false)) == false)
					{
				//		move cursor to the end of the buffer
						application.activeWindow.title.endOfBuffer(false);
				//		insert a new field with the params value
						application.activeWindow.title.insertText(fields[f] + " " + values[f] + "\n");
				//	field does already exist		
					}
					else
					{
						var codeFalse = 0;
						// check field  if code is already in it
						var code = codes.split(";");
						for(var y in code){
							if(code[y].replace (/^\s+/, '').replace (/\s+$/, '') == values[f].replace (/^\s+/, '').replace (/\s+$/, '')){ // replace leading an following whitespaces
								csv.__csvLOG("Zeichenkette " + values[f] + " war schon im Feld " + fields[f] + " vorhanden.");
								codeFalse = 1;
							}
						}
						// if code is not already in field
						if(codeFalse == 0) {
							application.activeWindow.title.endOfField(false);
						//		insert params value
									
							application.activeWindow.title.insertText(";" + values[f]);
						}
					}
			} 
			else
			{
				//do nothing
			}
		}
		//			save buffer		
			return csv.__csvSaveBuffer(true,"hinzugefuegt " + values[f]);
	}
	
	csv.__csvSetProperties(csv.__csvBatchTitle,["","ZDB-ID"],'ZDB-ID','zdb',false,"ZDB_LOG.txt");
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