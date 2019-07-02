function writeCurrentSwatchToFile(doc) {
    /*
    not used currently
    myFile = File('~/Documents/currentSwatch.txt');
    var myResult = myFile.open("w", undefined, undefined);
    for (var i = 0; i < doc.spots.length; i++) {
        myFile.write(doc.spots[i].name + "\n")
    }

    myFile.close()
    */
}

function readInCSV(fileObj) {
    var fileArray = new Array();
    fileObj.open('r');
    fileObj.seek(0, 0);
    while (!fileObj.eof) {
        var thisLine = fileObj.readln();
        if (thisLine.indexOf("Template") < 0 && thisLine.indexOf("Comment") < 0) {
            var csvArray = thisLine.split(',');
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
    csvArr = readInCSV(File("/Users/nsardo/Desktop/colormappingmaster.csv"))


    csvOb = new Object();
    for (i = 0; i < csvArr.length; i++) {
        templateName = csvArr[i][0]
        hexColor = csvArr[i][1]
        hexColor = hexColor.slice(1)
        hexColor = hexColor.toLowerCase()

        pantoneColor = csvArr[i][2]
        tint = Number(csvArr[i][3])
        colorType = csvArr[i][4].toLowerCase()
        kVal = csvArr[i][5]
        if (kVal === "") {
            kVal = -1
        } else {
            kVal = Number(kVal)
        }

        OBB2 = { pantone: pantoneColor, tint: tint, colorType: colorType, kVal: kVal }

        //alert(doc.name + " vs " + templateName )
        if (doc.name.indexOf(templateName) >= 0) {
            csvOb[hexColor] = OBB2


            //alert("mapped " +hexColor + " "+ csvOb[hexColor] )

            //alert("Mapped " + hexColor + " to " + pantoneColor)
        }
    }

    /*
    do {
        line = myFile.readln();
        if (line.indexOf("=>") >= 0) {
            //this is a mapping line

            hexColor = line.split("=>")[0]
            hexColor = hexColor.substring(0, hexColor.length - 1)
            hexColor = hexColor.slice(1)
            hexColor = hexColor.replace(/[ ]+/, "")

            pantonename = line.split("=>")[1]
            pantonename = pantonename.substring(1, pantonename.length)

            fileNameInMap = line.split("=>")[2].replace(/[ ]+/, "")
            if (doc.name.indexOf(fileNameInMap) >= 0) {
                mapOb[hexColor] = pantonename
            }

        }


    } while (myFile.eof == false)
    myFile.close();

    return mapOb
    */
    return csvOb

}

function addSwatchToDoc(colorMapObject, doc, docOrig) {

    /*
    try {
        return docOrig.swatches.getByName(nameC)
    } catch (e) {
        alert("could not get by name " + nameC)
    }
    */

    //run twice to add to doc 

    //finds swach in swatch doc an dadds it to current doc
    var nameC = ""
    if (colorMapObject.colorType == "pantone") {
        //confirms that a pnatone color exists, not a 
        nameC = colorMapObject.pantone
        tint = colorMapObject.tint

        try {
            return docOrig.swatches.getByName(nameC)
        } catch (e) {
            bridgeSwatch = doc.swatches.getByName(nameC)
            var newSwatch = docOrig.spots.add();
            var spotName = bridgeSwatch.color.spot.name;
            var spotValue = bridgeSwatch.color.spot.getInternalColor();
            var spotKind = bridgeSwatch.color.spot.spotKind
            //alert(spotKind)
            //alert(spotValue)
            newSwatch.name = spotName;
            nc = new LabColor();
            nc.l = spotValue[0]
            nc.a = spotValue[1]
            nc.b = spotValue[2]
            newSwatch.colorType = ColorModel.SPOT;
            newSwatch.color = nc;
            newSwatch.spotKind = SpotColorKind.SPOTLAB
            var newSpotColor = new SpotColor();
            newSpotColor.spot = newSwatch;


            //docOrig.swatchGroups[0].addSwatch(newSwatch)

            try {
                return docOrig.swatches.getByName(nameC)
            } catch (e) {

                if (debugPrints) {
                    alert("could not get by name for the second time, this is an issue " + nameC)
                }
                doc.close(SaveOptions.DONOTSAVECHANGES);
                return -1

            }

        }

    } else if (colorMapObject.colorType == "cmyk") {
        name2 = "C=0 M=0 Y=0 K=" + colorMapObject.kVal
        //alert("looking for " + name2)
        try {
            return docOrig.swatches.getByName(name2)
        } catch (e) {
            var newSwatch = docOrig.swatches.add();
            var spotName = name2
            //alert(spotKind)
            //alert(spotValue)
            newSwatch.name = spotName;
            nc = new CMYKColor();
            nc.cyan = 0
            nc.magenta = 0
            nc.yellow = 0
            nc.black = colorMapObject.kVal
            newSwatch.color = nc;

            try {
                return docOrig.swatches.getByName(name2)
            } catch (e) {
                alert("did not work")
                if (debugPrints) {
                    alert("could not get by name for the second time, this is an issue " + name2)
                }
                doc.close(SaveOptions.DONOTSAVECHANGES);
                return -1
            }
        }
    }



    /*
    try {


        bridgeSwatch = doc.swatches.getByName(nameC)
        var newSwatch = docOrig.spots.add();
        var spotName = bridgeSwatch.color.spot.name;
        var spotValue = bridgeSwatch.color.spot.getInternalColor();
        var spotKind = bridgeSwatch.color.spot.spotKind
        //alert(spotKind)
        //alert(spotValue)
        newSwatch.name = spotName;
        nc = new LabColor();
        nc.l = spotValue[0]
        nc.a = spotValue[1]
        nc.b = spotValue[2]
        newSwatch.colorType = ColorModel.SPOT;
        newSwatch.color = nc;
        newSwatch.spotKind = SpotColorKind.SPOTLAB
        var newSpotColor = new SpotColor();
        newSpotColor.spot = newSwatch;
        //return newSwatch;
        return newSwatch
    } catch (e) {
        return undefined
    }
    */




}

function findSpotPMSFromName(nameC, doc) {
    //not used
    try {
        newSpot = doc.swatches.getByName(nameC)
        //newSpot.colorType = ColorModel.PROCESS;
        return newSpot
        //return doc.swatches.getByName(nameC)
    } catch (e) {
        return undefined
    }

    /*
    //for (var i = 0; i < doc.spots.length; i++) {
    //if (doc.spots[i].name.indexOf(nameC) >= 0) {
    //    return doc.spots[i]
    //}

    //}
    //alert("Find by name with " + nameC)

    
    //return undefined
    */
}

function main() {
    /*
        Loops through each object, text, path and maps them to their PANTONE color from Illustrator Pantone + Solid Coated Library 
    */
    //read config file to get mapping object
    debugPrints = true

    countOfColorCorrectedObj = 0
    //opens log file


    try {
        //if no document open, throw an error
        var doc = app.activeDocument;
    } catch (e) {
        return -1
    }

    mapOb = readMapFile("/Users/nsardo/Desktop/colorMapMasterFile.txt", doc)
    writeCurrentSwatchToFile(doc)
    //unselects all
    doc.selection = null;

    var swatchDoc = app.open(File('/Users/nsardo/Library/Application\ Support/Adobe/Adobe\ Illustrator\ 23/en_US/Swatches/FIRSTCOLORLIB.ai'))

    //loops through all path items
    //this should be the majority of svg objects
    for (var i = 0; i < doc.pathItems.length; i++) {


        pathObj = doc.pathItems[i];

        if (pathObj.fillColor.typename != 'NoColor') {

            if (pathObj.fillColor.typename === "RGBColor") {
                hexC = rgbToHex(pathObj.fillColor.red, pathObj.fillColor.green, pathObj.fillColor.blue)
                if (hexC != "#000000" && hexC != "#ffffff" && debugPrints)
                //alert("hexc is"+hexC)
            } else if (pathObj.fillColor.color != undefined && debugPrints) {
                alert(pathObj.fillColor.typename + " " + pathObj.fillColor.color.name)
            }
        }


        //checks for a stroke color
        if (pathObj.strokeColor != undefined) {
            //check if rgb
            if (pathObj.strokeColor.typename === "RGBColor") {
                //is rgb
                //get hex
                hexC = rgbToHex(pathObj.strokeColor.red, pathObj.strokeColor.green, pathObj.strokeColor.blue)
                //chops off #
                hexC = hexC.slice(1)
                //can probably be deleted
                hexNew = rgbToHex()


                if (mapOb[hexC] != undefined) {
                    //found mapping entry
                    //alert("num of swatches is " + swatchDoc.swatches.length)

                    //gets color from helper library file
                    //only for pantone

                    newSpotSwatch = addSwatchToDoc(mapOb[hexC], swatchDoc, doc)

                    if (newSpotSwatch) {
                        if (debugPrints) {
                            alert("1changing HEX from mapping " + hexC + " to " + mapOb[hexC].pantone + " orig was " + pathObj.strokeColor.typename)

                        }
                        co = new RGBColor()
                        co.red = 0
                        co.blue = 200
                        co.green = 0
                        pathObj.strokeColor = co
                        app.redraw()
                        //alert("ok")
                        //assigns color here
                        if (mapOb[hexC].colorType == "pantone") {
                            newSpotSwatch.color.tint = mapOb[hexC].tint
                        }
                        alert(newSpotSwatch)
                        pathObj.strokeColor = newSpotSwatch.color
                        countOfColorCorrectedObj += 1
                    } else {
                        //alert("Could not find " + mapOb[hexC] + " in mapping file/Pantone Library")
                        //error occured, close helper doc and exit
                        swatchDoc.close(SaveOptions.DONOTSAVECHANGES);
                        return -1
                    }


                }

            }

        }
        if (pathObj.fillColor != undefined) {

            if (pathObj.fillColor.typename === "RGBColor") {
                //is rgb
                //alert("found RBG color" + pathObj.fillColor.red)
                hexC = rgbToHex(pathObj.fillColor.red, pathObj.fillColor.green, pathObj.fillColor.blue)
                hexC = hexC.slice(1)
                hexNew = rgbToHex()
                if (mapOb[hexC] != undefined) {
                    //found mapping entry

                    //#alert("num of swatches is " + swatchDoc.swatches.length)
                    //foundSpotColor = findSpotPMSFromName(mapOb[hexC], swatchDoc)
                    newSpotSwatch = addSwatchToDoc(mapOb[hexC], swatchDoc, doc)

                    if (newSpotSwatch) {
                        if (debugPrints) {
                            alert("1changing HEX from mapping " + hexC + " to " + mapOb[hexC].pantone + " or cmyk orig was " + pathObj.fillColor.typename)

                        }

                        co = new RGBColor()
                        co.red = 0
                        co.blue = 200
                        co.green = 0
                        pathObj.fillColor = co
                        app.redraw()

                        if (mapOb[hexC].colorType == "cmyk") {
                            //alert("doing cmyk")
                            /*
                            cmcolor = new CMYKColor()
                            cmcolor.cyan = 0
                            cmcolor.magenta = 0
                            cmcolor.yellow = 0
                            cmcolor.black = mapOb[hexC].kVal
                            pathObj.fillColor = cmcolor
                            */

                            cmcolor = new GrayColor()
                            cmcolor.gray = mapOb[hexC].kVal
                            pathObj.fillColor = cmcolor

                        } else {

                            pathObj.fillColor = newSpotSwatch.color
                        }

                        countOfColorCorrectedObj += 1
                    } else {
                        //alert("Could not find " + mapOb[hexC] + " in mapping file/Pantone Library")
                        swatchDoc.close(SaveOptions.DONOTSAVECHANGES);
                        return -1
                    }
                }

            }
        }


    }



    allItems = doc.pageItems;
    //allPath = doc.pathItems
    for (var i = 0; i < allItems.length; i++) {

        //alert("FOUDN OBJ" + allItems[i].fillColor)

        if (allItems[i].textRange != undefined) {
            //alert("testsing " + allItems[i].fillColor.spot)

            if (allItems[i].textRange != undefined) {
                //text situation
                //stroke

                //alert(allItems[i].kind)
                if (allItems[i].kind != TextType.POINTTEXT) {


                    if (allItems[i].textPath != undefined && allItems[i].kind === TextType.PATHTEXT && allItems[i].textPath.fillColor.typename === "RGBColor") {
                        hexC = rgbToHex(allItems[i].textPath.fillColor.red, allItems[i].textPath.fillColor.green, allItems[i].textPath.fillColor.blue)
                        hexC = hexC.slice(1)
                        hexNew = rgbToHex()

                        //alert("checking map for " + hexC + " " + mapOb[hexC])

                        if (mapOb[hexC] != undefined) {
                            //found mapping entry
                            if (debugPrints) {
                                alert("2changing HEX from mapping " + hexC + " to " + mapOb[hexC])
                            }

                            //#alert("num of swatches is " + swatchDoc.swatches.length)
                            //foundSpotColor = findSpotPMSFromName(mapOb[hexC], swatchDoc)
                            newSpotSwatch = addSwatchToDoc(mapOb[hexC], swatchDoc, doc)

                            if (newSpotSwatch) {
                                allItems[i].textPath.fillColor = newSpotSwatch.color
                                countOfColorCorrectedObj += 1
                            } else {
                                //alert("Could not find " + mapOb[hexC] + " in mapping file/Pantone Library")
                                swatchDoc.close(SaveOptions.DONOTSAVECHANGES);
                                return -1
                            }

                        }

                    }
                    if (allItems[i].textPath != undefined && allItems[i].kind === TextType.PATHTEXT && allItems[i].textPath.strokeColor.typename === "RGBColor") {
                        hexC = rgbToHex(allItems[i].textPath.strokeColor.red, allItems[i].textPath.strokeColor.green, allItems[i].textPath.strokeColor.blue)
                        hexC = hexC.slice(1)
                        hexNew = rgbToHex()

                        //alert("checking map for " + hexC + " " + mapOb[hexC])

                        if (mapOb[hexC] != undefined) {
                            //found mapping entry
                            if (debugPrints) {
                                alert("3changing HEX from mapping " + hexC + " to " + mapOb[hexC])
                            } //#alert("num of swatches is " + swatchDoc.swatches.length)
                            //foundSpotColor = findSpotPMSFromName(mapOb[hexC], swatchDoc)
                            newSpotSwatch = addSwatchToDoc(mapOb[hexC], swatchDoc, doc)

                            if (newSpotSwatch) {
                                allItems[i].textPath.strokeColor = newSpotSwatch.color
                                countOfColorCorrectedObj += 1
                            } else {
                                //alert("Could not find " + mapOb[hexC] + " in mapping file/Pantone Library")
                                swatchDoc.close(SaveOptions.DONOTSAVECHANGES);
                                return -1
                            }

                        }

                    }
                }
                /*)
                if (allItems[i].textPath != undefined && allItems[i].kind === TextType.PATHTEXT && allItems[i].textPath.strokeColor.typename === "RGBColor") {
                    hexC = rgbToHex(allItems[i].textPath.strokeColor.red, allItems[i].textPath.strokeColor.green, allItems[i].textPath.strokeColor.blue)
                    hexC = hexC.slice(1)
                    hexNew = rgbToHex()

                    //alert("checking map for " + hexC + " " + mapOb[hexC])

                    if (mapOb[hexC] != undefined) {
                        //found mapping entry
                        alert("changing HEX from mapping " + hexC + " to " + mapOb[hexC])
                        //#alert("num of swatches is " + swatchDoc.swatches.length)
                        //foundSpotColor = findSpotPMSFromName(mapOb[hexC], swatchDoc)
                        newSpotSwatch = addSwatchToDoc(mapOb[hexC], swatchDoc, doc)

                        if (newSpotSwatch) {
                            allItems[i].textPath.strokeColor = newSpotSwatch.color
                        } else {
                            alert("Could not find " + mapOb[hexC] + " in mapping file/Pantone Library")
                        }

                    }

                }
                */




                if (allItems[i].textRange.characterAttributes.strokeColor.typename === "RGBColor") {
                    hexC = rgbToHex(allItems[i].textRange.characterAttributes.strokeColor.red, allItems[i].textRange.characterAttributes.strokeColor.green, allItems[i].textRange.characterAttributes.strokeColor.blue)
                    hexC = hexC.slice(1)
                    hexNew = rgbToHex()

                    //alert("checking map for " + hexC + " " + mapOb[hexC])

                    if (mapOb[hexC] != undefined) {
                        //found mapping entry
                        if (debugPrints) {
                            alert("4changing HEX from mapping " + hexC + " to " + mapOb[hexC])
                        }
                        //#alert("num of swatches is " + swatchDoc.swatches.length)
                        //foundSpotColor = findSpotPMSFromName(mapOb[hexC], swatchDoc)
                        newSpotSwatch = addSwatchToDoc(mapOb[hexC], swatchDoc, doc)

                         if (newSpotSwatch || mapOb[hexC].colorType == "cmyk") {
                            //allItems[i].textRange.characterAttributes.fillColor = newSpotSwatch.color

                            if (mapOb[hexC].colorType == "cmyk") {
                                cmcolor = new GrayColor()
                                cmcolor.gray = mapOb[hexC].kVal
                                allItems[i].textRange.characterAttributes.strokeColor = cmcolor
                            } else if (mapOb[hexC].colorType == "pantone") {
                                allItems[i].textRange.characterAttributes.strokeColor = newSpotSwatch.color
                            }
                            countOfColorCorrectedObj += 1
                        } else {
                            //alert("Could not find " + mapOb[hexC] + " in mapping file/Pantone Library")
                            swatchDoc.close(SaveOptions.DONOTSAVECHANGES);
                            return -1
                        }

                    }
                }

                //fillColor
                if (allItems[i].textRange.characterAttributes.fillColor.typename === "RGBColor") {
                    hexC = rgbToHex(allItems[i].textRange.characterAttributes.fillColor.red, allItems[i].textRange.characterAttributes.fillColor.green, allItems[i].textRange.characterAttributes.fillColor.blue)
                    hexC = hexC.slice(1)
                    hexNew = rgbToHex()

                    //alert("checking map for " + hexC + " " + mapOb[hexC])

                    if (mapOb[hexC] != undefined) {
                        //found mapping entry
                        if (debugPrints) {
                            alert("5changing HEX from mapping " + hexC + " to " + mapOb[hexC].pantone)
                        } //#alert("num of swatches is " + swatchDoc.swatches.length)
                        //foundSpotColor = findSpotPMSFromName(mapOb[hexC], swatchDoc)
                        newSpotSwatch = addSwatchToDoc(mapOb[hexC], swatchDoc, doc)

                        if (newSpotSwatch || mapOb[hexC].colorType == "cmyk") {
                            //allItems[i].textRange.characterAttributes.fillColor = newSpotSwatch.color

                            if (mapOb[hexC].colorType == "cmyk") {
                                cmcolor = new GrayColor()
                                cmcolor.gray = mapOb[hexC].kVal
                                allItems[i].textRange.characterAttributes.fillColor = cmcolor
                            } else if (mapOb[hexC].colorType == "pantone") {
                                allItems[i].textRange.characterAttributes.fillColor = newSpotSwatch.color
                            }
                            countOfColorCorrectedObj += 1
                        } else {
                            //alert("Could not find " + mapOb[hexC] + " in mapping file/Pantone Library")
                            swatchDoc.close(SaveOptions.DONOTSAVECHANGES);
                            return -1
                        }




                    }
                }
            } else if ((allItems[i].fillColor != undefined && allItems[i].fillColor.typename === "RGBColor") || (allItems[i].strokeColor != undefined && allItems[i].strokeColor.typename === "RGBColor")) {

                if (allItems[i].fillColor != undefined) {
                    //is a rgb color or cmyk
                    hexC = rgbToHex(allItems[i].fillColor.red, allItems[i].fillColor.green, allItems[i].fillColor.blue)
                    hexC = hexC.slice(1)
                    hexNew = rgbToHex()

                    //alert("checking map for " + hexC + " " + mapOb[hexC])

                    if (mapOb[hexC] != undefined) {
                        //found mapping entry
                        if (debugPrints) {
                            alert("6changing HEX from mapping " + hexC + " to " + mapOb[hexC])
                        } //#alert("num of swatches is " + swatchDoc.swatches.length)
                        //foundSpotColor = findSpotPMSFromName(mapOb[hexC], swatchDoc)
                        newSpotSwatch = addSwatchToDoc(mapOb[hexC], swatchDoc, doc)


                        if (newSpotSwatch) {
                            allItems[i].fillColor = newSpotSwatch.color
                            countOfColorCorrectedObj += 1
                        } else {
                            //alert("Could not find " + mapOb[hexC] + " in mapping file/Pantone Library")
                            swatchDoc.close(SaveOptions.DONOTSAVECHANGES);
                            return -1

                        }


                    }
                }

                if (allItems[i].strokeColor != undefined) {
                    //is a rgb color or cmyk
                    hexC = rgbToHex(allItems[i].strokeColor.red, allItems[i].strokeColor.green, allItems[i].strokeColor.blue)
                    hexC = hexC.slice(1)
                    hexNew = rgbToHex()

                    //alert("checking map for " + hexC + " " + mapOb[hexC])

                    if (mapOb[hexC] != undefined) {
                        //found mapping entry
                        if (debugPrints) {
                            alert("7changing HEX from mapping " + hexC + " to " + mapOb[hexC])
                        } //#alert("num of swatches is " + swatchDoc.swatches.length)
                        //foundSpotColor = findSpotPMSFromName(mapOb[hexC], swatchDoc)
                        newSpotSwatch = addSwatchToDoc(mapOb[hexC], swatchDoc, doc)


                        if (newSpotSwatch) {
                            allItems[i].strokeColor = newSpotSwatch.color
                            countOfColorCorrectedObj += 1
                        } else {
                            //alert("Could not find " + mapOb[hexC] + " in mapping file/Pantone Library")
                            swatchDoc.close(SaveOptions.DONOTSAVECHANGES);
                            return -1

                        }


                    }
                }


            } else if (allItems[i].fillColor.spot != undefined) {
                //is a spot color
                if (debugPrints) {
                    alert("changing Spot " + allItems[i].fillColor.spot + " TO " + spotColor.name)

                }
                //allItems[i].fillColor = spotColor.color
            } else {
                //alert("DIFFERENT COLOR maybe cmyk " + allItems[i].fillColor)

            }
        }


    }

    swatchDoc.close(SaveOptions.DONOTSAVECHANGES);
    app.redraw();

    return countOfColorCorrectedObj

}

/*MAIN BODY CODE*/

logFile = File('/Users/nsardo/RIPProcess/RIPLogs/color.txt');
var myResult = logFile.open("w", undefined, undefined);
logFile.write("starting color correction..\n")
logFile.close()
//corrects twice, now once
for (var z = 0; z < 1; z++) {
    numColorCorrected = main()
    if (numColorCorrected == -1) {

        logFile = File('/Users/nsardo/RIPProcess/RIPLogs/color.txt');
        myResult = logFile.open("w", undefined, undefined);
        logFile.write("color correction failed\n")
        logFile.close()
        z = 2
    } else {
        logFile = File('/Users/nsardo/RIPProcess/RIPLogs/color.txt');
        myResult = logFile.open("a", undefined, undefined);
        logFile.write("Converted " + numColorCorrected + "\n")
        logFile.close()
    }
}