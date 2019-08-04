/*
    Nathan Sardo
    Dancor Solutions

    This script reads in a mapping file and replaces every object in .svg file with a new color specifed in the mapping file.
*/

function readInCSV(fileObj) {
    //helper function to parse csv
    var fileArray = new Array();
    fileObj.open("r");
    fileObj.seek(0, 0);
    while (!fileObj.eof) {
        var thisLine = fileObj.readln();
        if (
            thisLine.indexOf("Template") < 0 &&
            thisLine.indexOf("Comment") < 0
        ) {
            var csvArray = thisLine.split(",");
            fileArray.push(csvArray);
        }
    }
    fileObj.close();
    return fileArray;
}

function rgbToHex(r, g, b) {
    //helper function from stack overflow
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function readMapFile(path, doc) {
    //reads mapping file to determine hex to pantone mapping
    var mapOb = new Object();
    myFile = File(path);
    var myResult = myFile.open("r", undefined, undefined);
    csvArr = readInCSV(File("/PATH"));

    csvOb = new Object();
    for (i = 0; i < csvArr.length; i++) {
        //for each line, get information
        templateName = csvArr[i][0];
        hexColor = csvArr[i][1];
        hexColor = hexColor.slice(1);
        hexColor = hexColor.toLowerCase();

        pantoneColor = csvArr[i][2];
        tint = Number(csvArr[i][3]);
        colorType = csvArr[i][4].toLowerCase();
        kVal = csvArr[i][5];
        if (kVal === "") {
            kVal = -1;
        } else {
            kVal = Number(kVal);
        }

        OBB2 = {
            pantone: pantoneColor,
            tint: tint,
            colorType: colorType,
            kVal: kVal
        };
        if (doc.name.indexOf(templateName) >= 0) {
            csvOb[hexColor] = OBB2;
            //alert("mapped " +hexColor + " "+ csvOb[hexColor] )
            //alert("Mapped " + hexColor + " to " + pantoneColor)
        }
    }

    return csvOb;
}

function addSwatchToDoc(colorMapObject, doc, docOrig) {
    var nameC = "";
    if (colorMapObject.colorType == "pantone") {
        //confirms that a pnatone color exists
        nameC = colorMapObject.pantone;
        tint = colorMapObject.tint;

        try {
            return docOrig.swatches.getByName(nameC);
        } catch (e) {
            bridgeSwatch = doc.swatches.getByName(nameC);
            var newSwatch = docOrig.spots.add();
            var spotName = bridgeSwatch.color.spot.name;
            var spotValue = bridgeSwatch.color.spot.getInternalColor();
            var spotKind = bridgeSwatch.color.spot.spotKind;

            newSwatch.name = spotName;
            nc = new LabColor();
            nc.l = spotValue[0];
            nc.a = spotValue[1];
            nc.b = spotValue[2];
            newSwatch.colorType = ColorModel.SPOT;
            newSwatch.color = nc;
            newSwatch.spotKind = SpotColorKind.SPOTLAB;
            var newSpotColor = new SpotColor();
            newSpotColor.spot = newSwatch;

            //adds to doc swatch, should be able to get by name now

            try {
                return docOrig.swatches.getByName(nameC);
            } catch (e) {
                if (debugPrints) {
                    alert("could not get by name for the second time " + nameC);
                }
                doc.close(SaveOptions.DONOTSAVECHANGES);
                return -1;
            }
        }
    } else if (colorMapObject.colorType == "cmyk") {
        //cmyk case
        name2 = "C=0 M=0 Y=0 K=" + colorMapObject.kVal;
        try {
            return docOrig.swatches.getByName(name2);
        } catch (e) {
            var newSwatch = docOrig.swatches.add();
            var spotName = name2;
            newSwatch.name = spotName;
            nc = new CMYKColor();
            nc.cyan = 0;
            nc.magenta = 0;
            nc.yellow = 0;
            nc.black = colorMapObject.kVal;
            newSwatch.color = nc;

            try {
                return docOrig.swatches.getByName(name2);
            } catch (e) {
                alert("did not work");
                if (debugPrints) {
                    alert(
                        "could not get by name for the second time, this is an issue " +
                            name2
                    );
                }
                doc.close(SaveOptions.DONOTSAVECHANGES);
                return -1;
            }
        }
    }
}

function main() {
    /*
        Loops through each object, text, path and maps them to their PANTONE color from Illustrator Pantone + Solid Coated Library 
    */
    //read config file to get mapping object
    debugPrints = false;
    countOfColorCorrectedObj = 0;
    //opens log file

    try {
        //if no document open, throw an error
        var doc = app.activeDocument;
    } catch (e) {
        return -1;
    }

    mapOb = readMapFile("/Users/nsardo/Desktop/colorMapMasterFile.txt", doc);
    //unselects all
    doc.selection = null;

    var swatchDoc = app.open(
        File(
            "/Users/nsardo/Library/Application Support/Adobe/Adobe Illustrator 23/en_US/Swatches/FIRSTCOLORLIB.ai"
        )
    );

    //loops through all path items
    //this should be the majority of svg objects
    for (var i = 0; i < doc.pathItems.length; i++) {
        pathObj = doc.pathItems[i];

        //checks for a stroke color
        if (pathObj.strokeColor != undefined) {
            //check if rgb
            if (pathObj.strokeColor.typename === "RGBColor") {
                //is rgb
                //get hex
                hexC = rgbToHex(
                    pathObj.strokeColor.red,
                    pathObj.strokeColor.green,
                    pathObj.strokeColor.blue
                );
                hexC = hexC.slice(1);
                hexNew = rgbToHex();

                if (mapOb[hexC] != undefined) {
                    //found mapping entry
                    //gets color from helper library file
                    newSpotSwatch = addSwatchToDoc(mapOb[hexC], swatchDoc, doc);

                    if (newSpotSwatch) {
                        //assigns color here
                        if (mapOb[hexC].colorType == "pantone") {
                            newSpotSwatch.color.tint = mapOb[hexC].tint;
                        }
                        alert(newSpotSwatch);
                        pathObj.strokeColor = newSpotSwatch.color;
                        countOfColorCorrectedObj += 1;
                    } else {
                        //error occured, close helper doc and exit
                        swatchDoc.close(SaveOptions.DONOTSAVECHANGES);
                        return -1;
                    }
                }
            }
        }
        if (pathObj.fillColor != undefined) {
            if (pathObj.fillColor.typename === "RGBColor") {
                //is rgb
                hexC = rgbToHex(
                    pathObj.fillColor.red,
                    pathObj.fillColor.green,
                    pathObj.fillColor.blue
                );
                hexC = hexC.slice(1);
                hexNew = rgbToHex();
                if (mapOb[hexC] != undefined) {
                    //found mapping entry
                    newSpotSwatch = addSwatchToDoc(mapOb[hexC], swatchDoc, doc);

                    if (newSpotSwatch) {
                       

                        if (mapOb[hexC].colorType == "cmyk") {
                            cmcolor = new GrayColor();
                            cmcolor.gray = mapOb[hexC].kVal;
                            pathObj.fillColor = cmcolor;
                        } else {
                            pathObj.fillColor = newSpotSwatch.color;
                        }

                        countOfColorCorrectedObj += 1;
                    } else {
                        swatchDoc.close(SaveOptions.DONOTSAVECHANGES);
                        return -1;
                    }
                }
            }
        }
    }

    swatchDoc.close(SaveOptions.DONOTSAVECHANGES);
    app.redraw();

    return countOfColorCorrectedObj;
}

/*MAIN BODY CODE*/

logFile = File("/Users/nsardo/RIPProcess/RIPLogs/color.txt");
var myResult = logFile.open("w", undefined, undefined);
logFile.write("starting color correction..\n");
logFile.close();

//runs main function
numColorCorrected = main();
if (numColorCorrected == -1) {
    logFile = File("/Users/nsardo/RIPProcess/RIPLogs/color.txt");
    myResult = logFile.open("w", undefined, undefined);
    logFile.write("color correction failed\n");
    logFile.close();
    z = 2;
} else {
    logFile = File("/Users/nsardo/RIPProcess/RIPLogs/color.txt");
    myResult = logFile.open("a", undefined, undefined);
    logFile.write("Converted " + numColorCorrected + "\n");
    logFile.close();
}
