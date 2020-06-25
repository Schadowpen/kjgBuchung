// ------------------
// | Initialisieren |
// ------------------

function initUI() {
    // Verfügbare, ersetzbare Bilder bekanntmachen
    var qrCodeConfigImageSelect = document.getElementById("qrCodeConfig")[1];
    var sitzplanConfigImageSelect = document.getElementById("sitzplanConfig")[1];
    vorlagePositionen.imageOperators.forEach(function (imageOperator) {
        var option = document.createElement("option");
        option.value = imageOperator.operatorNumber;
        option.text = imageOperator.name;
        qrCodeConfigImageSelect.appendChild(option);

        option = document.createElement("option");
        option.value = imageOperator.operatorNumber;
        option.text = imageOperator.name;
        sitzplanConfigImageSelect.appendChild(option);
    });

    // Verfügbare Schriftarten bekannt machen
    var fontSelects = [
        document.getElementById("sitzplanConfig")[15],
        document.getElementById("textConfig")[2]
    ];
    textConfigNames.forEach(function (textConfigName) {
        fontSelects.push(document.getElementById(textConfigName)[5]);
    });
    availableFonts.forEach(function (font) {
        fontSelects.forEach(function (fontSelect) {
            var option = document.createElement("option");
            option.value = font;
            option.text = font;
            fontSelect.appendChild(option);
        });
    });

    // Demo Window initialisieren
    initDemoWindow();

    // onsubmit bei forms "deaktivieren", um Neuladen der Seite durch abschicken der Formulare zu verhindern
    var eventStopper = function (e) {
        e.stopPropagation();
        e.preventDefault();
    };
    document.getElementById("qrCodeConfig").onsubmit = eventStopper;
    document.getElementById("sitzplanConfig").onsubmit = eventStopper;
    document.getElementById("textConfig").onsubmit = eventStopper;
    textConfigNames.forEach(function (textConfigName) {
        document.getElementById(textConfigName).onsubmit = eventStopper;
    });
}

// ------------------
// | Daten anzeigen |
// ------------------

/**
 * Rendert sowohl die Konfiguration also auch das Canvas
 */
function renderEverything() {
    drawCanvas();

    showQrCodeConfig();
    showSitzplanConfig();
    showAllTextConfig();
    textConfigNames.forEach(showTextConfig);

    document.getElementById("undoKartenConfigButton").disabled = !undoKartenConfigPossible();
    document.getElementById("redoKartenConfigButton").disabled = !redoKartenConfigPossible();
}

function showQrCodeConfig() {
    var i = 0;
    var form = document.getElementById("qrCodeConfig");

    // Ob qrCodeConfig überhaupt angegeben ist
    var visible = kartenConfig.qrCodeConfig != null;
    form[0].checked = visible;
    form.children.namedItem("qrCodeConfigData").style.display = (visible && document.getElementById("qrCodeConfigSurrounder").classList.contains("expanded")) ? "block" : "none";
    if (!visible)
        return;

    // Ob ein vorhandenes Bild ersetzt wird
    var replacing = kartenConfig.qrCodeConfig.operatorNumber != null;
    if (replacing) {
        for (i = 0; i < form[1].options.length; i++) {
            if (form[1].options[i].value == kartenConfig.qrCodeConfig.operatorNumber) {
                form[1].selectedIndex = i;
                break;
            }
        }
    } else {
        form[1].selectedIndex = 0;
    }
    // Bild, welches durch den Saalplan ersetzt wird, soll nicht zur Auswahl stehen
    if (kartenConfig.sitzplanConfig != null && kartenConfig.sitzplanConfig.operatorNumber != null) {
        for (i = 0; i < form[1].options.length; i++)
            form[1].options[i].disabled = form[1].options[i].value == kartenConfig.sitzplanConfig.operatorNumber;
    } else {
        for (i = 0; i < form[1].options.length; i++)
            form[1].options[i].disabled = false;
    }

    // untere linke Ecke
    form[3].value = kartenConfig.qrCodeConfig.lowerLeftCorner.x;
    form[4].value = kartenConfig.qrCodeConfig.lowerLeftCorner.y;

    // untere rechte Ecke
    form[6].value = kartenConfig.qrCodeConfig.lowerRightCorner.x;
    form[7].value = kartenConfig.qrCodeConfig.lowerRightCorner.y;

    // obere linke Ecke
    form[9].value = kartenConfig.qrCodeConfig.upperLeftCorner.x;
    form[10].value = kartenConfig.qrCodeConfig.upperLeftCorner.y;

    // obere rechte Ecke
    form[12].value = kartenConfig.qrCodeConfig.upperRightCorner.x;
    form[13].value = kartenConfig.qrCodeConfig.upperRightCorner.y;
}

function showSitzplanConfig() {
    var i = 0;
    var form = document.getElementById("sitzplanConfig");

    // Ob sitzplanConfig überhaupt angegeben ist
    var visible = kartenConfig.sitzplanConfig != null;
    form[0].checked = visible;
    form.children.namedItem("sitzplanConfigData").style.display = (visible && document.getElementById("sitzplanConfigSurrounder").classList.contains("expanded")) ? "block" : "none";
    if (!visible)
        return;

    // Ob ein vorhandenes Bild ersetzt wird
    var replacing = kartenConfig.sitzplanConfig.operatorNumber != null;
    if (replacing) {
        for (i = 0; i < form[1].options.length; i++) {
            if (form[1].options[i].value == kartenConfig.sitzplanConfig.operatorNumber) {
                form[1].selectedIndex = i;
                break;
            }
        }
    } else {
        form[1].selectedIndex = 0;
    }
    // Bild, welches durch den Saalplan ersetzt wird, soll nicht zur Auswahl stehen
    if (kartenConfig.qrCodeConfig != null && kartenConfig.qrCodeConfig.operatorNumber != null) {
        for (i = 0; i < form[1].options.length; i++)
            form[1].options[i].disabled = form[1].options[i].value == kartenConfig.qrCodeConfig.operatorNumber;
    } else {
        for (i = 0; i < form[1].options.length; i++)
            form[1].options[i].disabled = false;
    }

    // untere linke Ecke
    form[3].value = kartenConfig.sitzplanConfig.lowerLeftCorner.x;
    form[4].value = kartenConfig.sitzplanConfig.lowerLeftCorner.y;

    // untere rechte Ecke
    form[6].value = kartenConfig.sitzplanConfig.lowerRightCorner.x;
    form[7].value = kartenConfig.sitzplanConfig.lowerRightCorner.y;

    // obere linke Ecke
    form[9].value = kartenConfig.sitzplanConfig.upperLeftCorner.x;
    form[10].value = kartenConfig.sitzplanConfig.upperLeftCorner.y;

    // obere rechte Ecke
    form[12].value = kartenConfig.sitzplanConfig.upperRightCorner.x;
    form[13].value = kartenConfig.sitzplanConfig.upperRightCorner.y;

    // Schriftart
    for (i = 0; i < form[15].options.length; i++) {
        if (form[15].options[i].value == kartenConfig.sitzplanConfig.font) {
            form[15].selectedIndex = i;
            break;
        }
    }

    // Schriftgröße
    form[16].value = kartenConfig.sitzplanConfig.fontSize;
    // Ob die Nummern der Sitzplätze sichtbar sein sollen
    form[17].checked = kartenConfig.sitzplanConfig.seatNumbersVisible;
    // Linienbreite im Sitzplan
    form[18].value = kartenConfig.sitzplanConfig.lineWidth;
    // Ob die Pfeile, die den Eingang markieren, verbunden werden sollen
    form[19].checked = kartenConfig.sitzplanConfig.connectEntranceArrows;
}

function showAllTextConfig() {
    var form = document.getElementById("textConfig");
    // Sichtbarkeit
    form.children.namedItem("textConfigData").style.display = document.getElementById("textConfigSurrounder").classList.contains("expanded") ? "block" : "none";

    // gleiche Konfigurationen finden
    var textConfig = null;
    var allVisible = true;
    textConfigNames.forEach(function (textConfigName) {
        if (kartenConfig[textConfigName] == null) {
            allVisible = false;
        } else if (textConfig == null) {
            textConfig = Object.clone(kartenConfig[textConfigName]);
            delete textConfig.position;
        } else {
            if (textConfig.alignment !== kartenConfig[textConfigName].alignment)
                textConfig.alignment = null;
            if (textConfig.font !== kartenConfig[textConfigName].font)
                textConfig.font = null;
            if (textConfig.fontSize !== kartenConfig[textConfigName].fontSize)
                textConfig.fontSize = null;
            if (!Object.equals(textConfig.color, kartenConfig[textConfigName].color))
                textConfig.color = null;
        }
    });

    // alle Textbausteine ausgeschaltet
    var visible = textConfig != null;
    form[0].checked = visible;
    form[0].indeterminate = visible === true && allVisible === false;
    if (!visible)
        return;

    // Ausrichtung
    if (textConfig.alignment == null) {
        form[1].selectedIndex = 0;
    } else {
        for (i = 0; i < form[1].options.length; i++) {
            if (form[1].options[i].value == textConfig.alignment) {
                form[1].selectedIndex = i;
                break;
            }
        }
    }

    // Schriftart
    if (textConfig.font == null) {
        form[2].selectedIndex = 0;
    } else {
        for (i = 0; i < form[2].options.length; i++) {
            if (form[2].options[i].value == textConfig.font) {
                form[2].selectedIndex = i;
                break;
            }
        }
    }

    // Schriftgröße
    if (textConfig.fontSize == null)
        form[3].value = "";
    else
        form[3].value = textConfig.fontSize;

    // Farbe
    if (textConfig.color == null) {
        // input type color unterstützt keine leeren Felder, deshalb Ersetzen durch Button
        form[4].style.display = "inline-block";
        form[5].style.display = "none";
    } else {
        form[4].style.display = "none";
        form[5].style.display = "inline-block";
        var red = textConfig.color.r * 255;
        var green = textConfig.color.g * 255;
        var blue = textConfig.color.b * 255;
        form[5].value = "#"
            + red.toString(16).padStart(2, "0")
            + green.toString(16).padStart(2, "0")
            + blue.toString(16).padStart(2, "0");
    }
}

function showTextConfig(textConfigName) {
    var i = 0;
    var form = document.getElementById(textConfigName);

    // Ob Konfiguration überhaupt angegeben ist
    var visible = kartenConfig[textConfigName] != null;
    form[0].checked = visible;
    form.children.namedItem(textConfigName + "Data").style.display = (visible && document.getElementById(textConfigName + "Surrounder").classList.contains("expanded")) ? "block" : "none";
    if (!visible)
        return;

    // Position
    form[2].value = kartenConfig[textConfigName].position.x;
    form[3].value = kartenConfig[textConfigName].position.y;

    // Ausrichtung
    for (i = 0; i < form[4].options.length; i++) {
        if (form[4].options[i].value == kartenConfig[textConfigName].alignment) {
            form[4].selectedIndex = i;
            break;
        }
    }

    // Schriftart
    for (i = 0; i < form[5].options.length; i++) {
        if (form[5].options[i].value == kartenConfig[textConfigName].font) {
            form[5].selectedIndex = i;
            break;
        }
    }

    // Schriftgröße
    form[6].value = kartenConfig[textConfigName].fontSize;
    // Farbe
    var red = kartenConfig[textConfigName].color.r * 255;
    var green = kartenConfig[textConfigName].color.g * 255;
    var blue = kartenConfig[textConfigName].color.b * 255;
    form[7].value = "#"
        + red.toString(16).padStart(2, "0")
        + green.toString(16).padStart(2, "0")
        + blue.toString(16).padStart(2, "0");
}

// --------------------------------
// | Daten durch Formulare Ändern |
// --------------------------------

/**
 * Setzt die Ecken entsprechend dem zu ersetzenden Bild
 */
function qrCodeConfigSetCorners() {
    var form = document.getElementById("qrCodeConfig");
    if (form[1].selectedIndex !== 0) {
        var imageOperator = vorlagePositionen.imageOperators[form[1].selectedIndex - 1];

        form[3].value = imageOperator.lowerLeftCorner.x;
        form[4].value = imageOperator.lowerLeftCorner.y;
        form[6].value = imageOperator.lowerRightCorner.x;
        form[7].value = imageOperator.lowerRightCorner.y;
        form[9].value = imageOperator.upperLeftCorner.x;
        form[10].value = imageOperator.upperLeftCorner.y;
        form[12].value = imageOperator.upperRightCorner.x;
        form[13].value = imageOperator.upperRightCorner.y;
    }
}

function changeQrCodeConfig() {
    var form = document.getElementById("qrCodeConfig");
    var visible = form[0].checked;

    if (visible === false) {
        kartenConfig.qrCodeConfig = undefined;
    } else {
        var operatorNumber = form[1].options[form[1].selectedIndex].value * 1.0;
        var lowerLeftCornerX = form[3].value * 1.0;
        var lowerLeftCornerY = form[4].value * 1.0;
        var lowerRightCornerX = form[6].value * 1.0;
        var lowerRightCornerY = form[7].value * 1.0;
        var upperLeftCornerX = form[9].value * 1.0;
        var upperLeftCornerY = form[10].value * 1.0;
        kartenConfig.qrCodeConfig = {
            operatorNumber: operatorNumber >= 0 ? operatorNumber : undefined,
            operatorName: operatorNumber >= 0 ? form[1].options[form[1].selectedIndex].text : undefined,
            lowerLeftCorner: {
                x: lowerLeftCornerX,
                y: lowerLeftCornerY
            },
            lowerRightCorner: {
                x: lowerRightCornerX,
                y: lowerRightCornerY
            },
            upperLeftCorner: {
                x: upperLeftCornerX,
                y: upperLeftCornerY
            },
            upperRightCorner: {
                x: upperLeftCornerX + lowerRightCornerX - lowerLeftCornerX,
                y: upperLeftCornerY + lowerRightCornerY - lowerLeftCornerY
            }
        };
    }
    uploadKartenConfig();
}

/**
 * Setzt die Ecken entsprechend dem zu ersetzenden Bild
 */
function sitzplanConfigSetCorners() {
    var form = document.getElementById("sitzplanConfig");
    if (form[1].selectedIndex !== 0) {
        var imageOperator = vorlagePositionen.imageOperators[form[1].selectedIndex - 1];

        form[3].value = imageOperator.lowerLeftCorner.x;
        form[4].value = imageOperator.lowerLeftCorner.y;
        form[6].value = imageOperator.lowerRightCorner.x;
        form[7].value = imageOperator.lowerRightCorner.y;
        form[9].value = imageOperator.upperLeftCorner.x;
        form[10].value = imageOperator.upperLeftCorner.y;
        form[12].value = imageOperator.upperRightCorner.x;
        form[13].value = imageOperator.upperRightCorner.y;
    }
}

function changeSitzplanConfig() {
    var form = document.getElementById("sitzplanConfig");
    var visible = form[0].checked;

    if (visible === false) {
        kartenConfig.sitzplanConfig = undefined;
    } else {
        var operatorNumber = form[1].options[form[1].selectedIndex].value * 1.0;
        var lowerLeftCornerX = form[3].value * 1.0;
        var lowerLeftCornerY = form[4].value * 1.0;
        var lowerRightCornerX = form[6].value * 1.0;
        var lowerRightCornerY = form[7].value * 1.0;
        var upperLeftCornerX = form[9].value * 1.0;
        var upperLeftCornerY = form[10].value * 1.0;
        kartenConfig.sitzplanConfig = {
            operatorNumber: operatorNumber >= 0 ? operatorNumber : undefined,
            operatorName: operatorNumber >= 0 ? form[1].options[form[1].selectedIndex].text : undefined,
            lowerLeftCorner: {
                x: lowerLeftCornerX,
                y: lowerLeftCornerY
            },
            lowerRightCorner: {
                x: lowerRightCornerX,
                y: lowerRightCornerY
            },
            upperLeftCorner: {
                x: upperLeftCornerX,
                y: upperLeftCornerY
            },
            upperRightCorner: {
                x: upperLeftCornerX + lowerRightCornerX - lowerLeftCornerX,
                y: upperLeftCornerY + lowerRightCornerY - lowerLeftCornerY
            },
            font: form[15].options[form[15].selectedIndex].value,
            fontSize: form[16].value * 1.0,
            seatNumbersVisible: form[17].checked,
            lineWidth: form[18].value * 1.0,
            connectEntranceArrows: form[19].checked,
        };
    }
    uploadKartenConfig();
}

function changeAllTextConfig() {
    var form = document.getElementById("textConfig");

    // Sichtbarkeit
    if (form[0].indeterminate === false) {
        if (form[0].checked) {
            textConfigNames.forEach(function (textConfigName) {
                var configForm = document.getElementById(textConfigName);
                var colorHex = configForm[7].value;
                kartenConfig[textConfigName] = {
                    position: {
                        x: configForm[2].value * 1.0,
                        y: configForm[3].value * 1.0
                    },
                    alignment: configForm[4].options[configForm[4].selectedIndex].value * 1.0,
                    font: configForm[5].options[configForm[5].selectedIndex].value,
                    fontSize: configForm[6].value * 1.0,
                    color: {
                        r: parseInt(colorHex.substr(1, 2), 16) / 255.0,
                        g: parseInt(colorHex.substr(3, 2), 16) / 255.0,
                        b: parseInt(colorHex.substr(5, 2), 16) / 255.0
                    }
                };
            })
        } else {
            textConfigNames.forEach(function (textConfigName) {
                kartenConfig[textConfigName] = undefined;
            })
        }
    }

    // Ausrichtung
    var alignment = form[1].options[form[1].selectedIndex].value;
    if (alignment !== "indeterminate") {
        textConfigNames.forEach(function (textConfigName) {
            if (kartenConfig[textConfigName] != null)
                kartenConfig[textConfigName].alignment = alignment * 1.0;
        })
    }

    // Schriftart
    var font = form[2].options[form[2].selectedIndex].value;
    if (font !== "indeterminate") {
        textConfigNames.forEach(function (textConfigName) {
            if (kartenConfig[textConfigName] != null)
                kartenConfig[textConfigName].font = font;
        })
    }

    // Schriftgröße
    var fontSize = form[3].value;
    if (fontSize !== "" && !isNaN(fontSize)) {
        textConfigNames.forEach(function (textConfigName) {
            if (kartenConfig[textConfigName] != null)
                kartenConfig[textConfigName].fontSize = fontSize * 1.0;
        })
    }

    // Farbe
    console.log(form[5]);
    if (form[5].style.display === "inline-block") {
        var colorHex = form[5].value;
        var color = {
            r: parseInt(colorHex.substr(1, 2), 16) / 255.0,
            g: parseInt(colorHex.substr(3, 2), 16) / 255.0,
            b: parseInt(colorHex.substr(5, 2), 16) / 255.0
        };
        textConfigNames.forEach(function (textConfigName) {
            if (kartenConfig[textConfigName] != null)
                kartenConfig[textConfigName].color = color;
        })
    }

    uploadKartenConfig();
}

function changeTextConfig(textConfigName) {
    var form = document.getElementById(textConfigName);
    var visible = form[0].checked;

    if (visible === false) {
        kartenConfig[textConfigName] = undefined;
    } else {
        var colorHex = form[7].value;
        kartenConfig[textConfigName] = {
            position: {
                x: form[2].value * 1.0,
                y: form[3].value * 1.0
            },
            alignment: form[4].options[form[4].selectedIndex].value * 1.0,
            font: form[5].options[form[5].selectedIndex].value,
            fontSize: form[6].value * 1.0,
            color: {
                r: parseInt(colorHex.substr(1, 2), 16) / 255.0,
                g: parseInt(colorHex.substr(3, 2), 16) / 255.0,
                b: parseInt(colorHex.substr(5, 2), 16) / 255.0
            }
        };
    }
    uploadKartenConfig();
}


// ------------------------------------------
// | Konfiguration auswählen und ausklappen |
// ------------------------------------------

var selectedConfig = "qrCodeConfig";

/**
 * Setzt die Ausgewählte Konfiguration auf den übergebenen Namen
 * @param configName {string} Name der Konfiguration
 */
function setSelectedConfig(configName) {
    document.getElementById(selectedConfig + "Surrounder").classList.remove("selected");
    selectedConfig = configName;
    document.getElementById(selectedConfig + "Surrounder").classList.add("selected");
    drawCanvas();
}

function shrinkOrExpandConfig(configName) {
    var classList = document.getElementById(configName + "Surrounder").classList;
    if (classList.contains("expanded")) {
        classList.remove("expanded");
    } else {
        classList.add("expanded");
    }
    renderEverything();
}


// ----------------
// | Lade-Spinner |
// ----------------

/**
 * Setze, ob der Lade-Spinner angezeigt werden soll
 * @param loading {boolean}
 */
function setLoading(loading) {
    document.getElementById("loadingSpinner").style.display = loading ? "block" : "none";
}


// -----------------
// | live-Vorschau |
// -----------------

var demoWindow = null;

/**
 * Öffnet ein Fenster für die Demo-PDF, jedoch nur, wenn es dank neuladen der Seite bereits geöffnet ist
 */
function initDemoWindow() {
    var demoWindowOpen = sessionStorage.getItem("demoWindowOpen");
    if (demoWindowOpen === "true")
        openDemoWindow();
}

/**
 * Öffnet ein Fenster für die Demo-PDF einer Theaterkarte.
 */
function openDemoWindow() {
    if (demoWindow == null || demoWindow.closed) {
        demoWindow = window.open(apiUrl + "demoTheaterkarte.php?key=" + getKey() + "&template=" + encodeURIComponent(databaseName), "Demo Theaterkarte", 'height=900,width=600,location=no,menubar=no');
        checkDemoWindowOpenEverySecond();
    } else {
        demoWindow.focus();
    }
    sessionStorage.setItem("demoWindowOpen", "true");
}

/**
 * Lädt das Fenster neu, in dem die Demo-PDF einer Theaterkarte gezeigt wird, sofern das Fenster geöffnet ist
 */
function reloadDemoWindow() {
    if (demoWindow != null && !demoWindow.closed)
        demoWindow.location = apiUrl + "demoTheaterkarte.php?key=" + getKey() + "&template=" + encodeURIComponent(databaseName);
    else {
        demoWindow = null;
        sessionStorage.setItem("demoWindowOpen", "false");
    }
}

/**
 * Überprüft jede Sekunde (durch selbstaufrufen mit einem Timeout), ob das demoWindow immer noch offen ist
 */
function checkDemoWindowOpenEverySecond() {
    if (demoWindow == null || demoWindow.closed) {
        demoWindow = null;
        sessionStorage.setItem("demoWindowOpen", "false");
        console.log("Window closed");
    } else {
        setTimeout(checkDemoWindowOpenEverySecond, 1000);
    }
}

function goToPdfUpload() {
    location.href = urlForVorlageBearbeitenPage + "?database=" + encodeURIComponent(databaseName);
}