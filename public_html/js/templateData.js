/* global initUI, loadUI, apiUrl, loadCanvas, renderUI, draw, urlForVorlagen */

/**
 * This scipt provides loading, accessing and editing of background data
 * 
 * It also loads and inits the templateCanvas and calls loadUI(), initUI() and renderUI().
 */

// loaded content
/**
 * Name of the template Database.
 * @type String
 */
var databaseName = null;
/**
 * Number of objects to initially load
 * @type Number
 */
var objectsToLoad = 5;
/**
 * Number of objects that have been loaded. If equal to objectsToLoad, then everything is initially loaded, if less then some loadings are pending
 * @type Number
 */
var objectsLoaded = 0;

/**
 * Loaded from getBereiche.php
 * @type Array
 */
var bereiche = null;
/**
 * Loaded from getEingaenge.php
 * @type Array
 */
var eingaenge = null;
/**
 * Loaded from getPlaetze.php
 * @type Array
 */
var plaetze = null;
/**
 * Loaded from getPlatzGruppen
 * @type Array
 */
var platzGruppen = null;
/**
 * plaetze, die aus den platzGruppen resultieren.
 * @type Array
 */
var platzGruppenPlaetze = null;
/**
 * Loaded from getVeranstaltung.php
 * @type Object
 */
var veranstaltung = null;


// -------------------
// | initial loading |
// -------------------

window.addEventListener('load', function () {
    showLoading(0);

    // lade Target Archiv Datenbank
    var queryString = document.location.search.substring(1);
    var queryObj = parseQueryString(queryString);
    databaseName = queryObj.database;
    if (databaseName == null) {
        location.href = urlForVorlagen;
        return;
    }

    if (typeof loadCanvas === "function")
        loadCanvas();
    if (typeof loadUI === "function")
        loadUI();

    // load everything
    var xmlHttp1;
    try {
        xmlHttp1 = new XMLHttpRequest();
    } catch (e) {
        // Fehlerbehandlung, wenn die Schnittstelle vom Browser nicht unterstützt wird.
        alert("XMLHttpRequest wird von ihrem Browser nicht unterstützt.");
    }
    if (xmlHttp1) {
        loadBereiche();
        loadEingaenge();
        loadPlaetze();
        loadPlatzGruppen();
        loadVeranstaltung();
    }
});
function loadBereiche() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', apiUrl + "getBereiche.php?template=" + encodeURIComponent(databaseName), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status !== 200)
                throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
            if (xmlHttp.responseText.startsWith("Error:"))
                throw xmlHttp.responseText;

            bereiche = JSON.parse(xmlHttp.responseText);
            loadingComplete();
        }
    };
    xmlHttp.send(null);
}
function loadEingaenge() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', apiUrl + "getEingaenge.php?template=" + encodeURIComponent(databaseName), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status !== 200)
                throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
            if (xmlHttp.responseText.startsWith("Error:"))
                throw xmlHttp.responseText;

            eingaenge = JSON.parse(xmlHttp.responseText);
            loadingComplete();
        }
    };
    xmlHttp.send(null);
}
function loadPlaetze() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', apiUrl + "getPlaetze.php?template=" + encodeURIComponent(databaseName), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status !== 200)
                throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
            if (xmlHttp.responseText.startsWith("Error:"))
                throw xmlHttp.responseText;

            plaetze = JSON.parse(xmlHttp.responseText);
            loadingComplete();
        }
    };
    xmlHttp.send(null);
}
function loadPlatzGruppen() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', apiUrl + "getPlatzGruppen.php?template=" + encodeURIComponent(databaseName) + "&key=" + getKey(), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status !== 200)
                throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
            if (xmlHttp.responseText.startsWith("Error:"))
                throw xmlHttp.responseText;

            platzGruppen = JSON.parse(xmlHttp.responseText);
            calculatePlaetzeFromPlatzGruppen();
            loadingComplete();
        }
    };
    xmlHttp.send(null);
}
function loadVeranstaltung() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', apiUrl + "getVeranstaltung.php?template=" + encodeURIComponent(databaseName), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status !== 200)
                throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
            if (xmlHttp.responseText.startsWith("Error:"))
                throw xmlHttp.responseText;

            veranstaltung = JSON.parse(xmlHttp.responseText);

            // set title
            var vName = document.getElementById("veranstaltungsName");
            if (vName)
                vName.innerHTML = veranstaltung.veranstaltung;

            loadingComplete();
        }
    };
    xmlHttp.send(null);
}

/**
 * Function to call whenever some resource for initial loading is completed.
 * When everything is loaded, it will init Everything.
 */
function loadingComplete() {
    objectsLoaded++;
    if (objectsLoaded === objectsToLoad) {
        if (typeof initCanvas === "function")
            initCanvas();
        else
            showLoading(1);
        if (typeof initUI === "function")
            initUI();
    } else if (objectsLoaded > objectsToLoad) {
        renderEverything();
    } else {
        showLoading(objectsLoaded / objectsToLoad);
    }
}

/**
 * Renders the canvas and the UI, if possible
 */
function renderEverything() {
    if (typeof renderUI === "function")
        renderUI();
    if (typeof draw === "function")
        draw();
}

/**
 * If a Canvas with the ID "canvas" is present, this function shows a loading screen inside the canvas.
 * @param {number} percentage
 */
function showLoading(percentage) {
    var canvas = document.getElementById('canvas');
    if (canvas && canvas.getContext) {
        ctx = canvas.getContext('2d');
        if (ctx) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.lineWidth = 5;
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.moveTo(0, canvas.height * 2 / 3);
            ctx.lineTo(canvas.width * percentage, canvas.height * 2 / 3);
            ctx.stroke();
            ctx.font = "16px Times New Roman";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Loading...", canvas.width / 2, canvas.height / 2);
        }
    }
}

/**
 * Berechnet die platzGruppenPlaetze neu ausgehend von den aktuellen platzGruppen
 */
function calculatePlaetzeFromPlatzGruppen() {
    platzGruppenPlaetze = [];
    for (var gruppenIndex = 0; gruppenIndex < platzGruppen.length; gruppenIndex++) {
        var platzGruppe = platzGruppen[gruppenIndex];

        // Berechne welche Reihen / Spalten es gibt
        var reihen = [];
        var reiheVorneCharCode = platzGruppe.reiheVorne.charCodeAt(0);
        var reiheHintenCharCode = platzGruppe.reiheHinten.charCodeAt(0);
        var charCodeJ = "J".charCodeAt(0);
        if (reiheVorneCharCode < reiheHintenCharCode) {
            for (var c = reiheVorneCharCode; c <= reiheHintenCharCode; c++) {
                if (c !== charCodeJ)
                    reihen.push(String.fromCharCode(c));
            }
        } else {
            for (var c = reiheVorneCharCode; c >= reiheHintenCharCode; c--) {
                if (c !== charCodeJ)
                    reihen.push(String.fromCharCode(c));
            }
        }
        var gruppenLaenge = (reihen.length - 1) * platzGruppe.reiheAbstand;

        var platzSpalten = [];
        if (platzGruppe.platzLinks < platzGruppe.platzRechts) {
            for (var p = platzGruppe.platzLinks; p <= platzGruppe.platzRechts; p++)
                platzSpalten.push(p);
        } else {
            for (var p = platzGruppe.platzLinks; p >= platzGruppe.platzRechts; p--)
                platzSpalten.push(p);
        }
        var gruppenBreite = (platzSpalten.length - 1) * platzGruppe.platzAbstand;

        for (var i = 0; i < reihen.length; i++) {
            for (var k = 0; k < platzSpalten.length; k++) {
                var internalX = -gruppenBreite / 2 + k * platzGruppe.platzAbstand;
                var internalY = gruppenLaenge / 2 - i * platzGruppe.reiheAbstand;
                var rotationRad = platzGruppe.rotation * Math.PI / 180;
                platzGruppenPlaetze.push({
                    block: platzGruppe.block,
                    reihe: reihen[i],
                    platz: platzSpalten[k],
                    xPos: Math.cos(rotationRad) * internalX - Math.sin(rotationRad) * internalY + platzGruppe.xPos,
                    yPos: Math.sin(rotationRad) * internalX + Math.cos(rotationRad) * internalY + platzGruppe.yPos,
                    rotation: platzGruppe.rotation,
                    eingang: platzGruppe.eingang,
                    platzGruppe: platzGruppe
                });
            }
        }
    }
}

// -----------
// | editing |
// -----------

function setzeBereich(bereich, successFunc = undefined) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('POST', apiUrl + "setBereich.php" + "?key=" + getKey() + "&template=" + encodeURIComponent(databaseName), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.responseText.startsWith("Error:") || xmlHttp.status !== 200) {
                // neu laden der Daten
                loadVeranstaltung();
                if (xmlHttp.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
                if (xmlHttp.responseText.startsWith("Error:"))
                    throw xmlHttp.responseText;

            } else {
                bereich = JSON.parse(xmlHttp.responseText);

                // insert or append
                var inserted = false;
                for (var i = 0; i < bereiche.length; i++)
                    if (bereiche[i].id === bereich.id) {
                        bereiche[i] = bereich;
                        inserted = true;
                        break;
                    }
                if (!inserted)
                    bereiche.push(bereich);
                
                if (typeof successFunc === "function")
                    successFunc(bereich);
                renderEverything();
            }
        }
    };
    xmlHttp.send(JSON.stringify(bereich));
    for (var i = 0; i < bereiche.length; i++)
        if (bereiche[i].id === bereich.id)
            bereiche[i] = bereich;
    renderEverything();
}

function loescheBereich(bereichId) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('POST', apiUrl + "deleteBereich.php" + "?key=" + getKey() + "&template=" + encodeURIComponent(databaseName) + "&id=" + bereichId, true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.responseText.startsWith("Error:") || xmlHttp.status !== 200) {
                // neu laden der Daten
                loadVeranstaltung();
                if (xmlHttp.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
                if (xmlHttp.responseText.startsWith("Error:"))
                    throw xmlHttp.responseText;

            } else {
                bereiche = bereiche.filter(function (b) {
                    return b.id !== bereichId;
                });
                renderEverything();
            }
        }
    };
    xmlHttp.send(null);
}

function setzeEingang(eingang, successFunc = undefined) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('POST', apiUrl + "setEingang.php" + "?key=" + getKey() + "&template=" + encodeURIComponent(databaseName), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.responseText.startsWith("Error:") || xmlHttp.status !== 200) {
                // neu laden der Daten
                loadVeranstaltung();
                if (xmlHttp.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
                if (xmlHttp.responseText.startsWith("Error:"))
                    throw xmlHttp.responseText;

            } else {
                eingang = JSON.parse(xmlHttp.responseText);

                // insert or append
                var inserted = false;
                for (var i = 0; i < eingaenge.length; i++)
                    if (eingaenge[i].id === eingang.id) {
                        eingaenge[i] = eingang;
                        inserted = true;
                        break;
                    }
                if (!inserted)
                    eingaenge.push(eingang);
                
                if (typeof successFunc === "function")
                    successFunc(eingang);
                renderEverything();
            }
        }
    };
    xmlHttp.send(JSON.stringify(eingang));
    for (var i = 0; i < eingaenge.length; i++)
        if (eingaenge[i].id === eingang.id)
            eingaenge[i] = eingang;
    renderEverything();
}

function loescheEingang(eingangId) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('POST', apiUrl + "deleteEingang.php" + "?key=" + getKey() + "&template=" + encodeURIComponent(databaseName) + "&id=" + eingangId, true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.responseText.startsWith("Error:") || xmlHttp.status !== 200) {
                // neu laden der Daten
                loadVeranstaltung();
                if (xmlHttp.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
                if (xmlHttp.responseText.startsWith("Error:"))
                    throw xmlHttp.responseText;

            } else {
                eingaenge = eingaenge.filter(function (e) {
                    return e.id !== eingangId;
                });
                for (var i = 0; i < plaetze.length; i++)
                    if (plaetze[i].eingang === eingangId)
                        plaetze[i].eingang = null;
                for (var i = 0; i < platzGruppen.length; i++)
                    if (platzGruppen[i].eingang === eingangId)
                        platzGruppen[i].eingang = null;
                renderEverything();
            }
        }
    };
    xmlHttp.send(null);
}

function setzePlatz(platz, oldPlatz = null, successFunc = undefined) {
    // check if ID changed, so platz has to be deleted and resaved
    if (oldPlatz != null && (oldPlatz.block !== platz.block || oldPlatz.reihe !== platz.reihe || oldPlatz.platz !== platz.platz)) {
        for (var i = 0; i < plaetze.length; i++)
            if (seatIdentical(plaetze[i], oldPlatz))
                plaetze[i] = platz;
        loeschePlatz(oldPlatz.block, oldPlatz.reihe, oldPlatz.platz);
    }
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('POST', apiUrl + "setPlatz.php" + "?key=" + getKey() + "&template=" + encodeURIComponent(databaseName), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.responseText.startsWith("Error:") || xmlHttp.status !== 200) {
                // neu laden der Daten
                loadVeranstaltung();
                if (xmlHttp.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
                if (xmlHttp.responseText.startsWith("Error:"))
                    throw xmlHttp.responseText;

            } else {
                platz = JSON.parse(xmlHttp.responseText);

                // insert or append
                var inserted = false;
                for (var i = 0; i < plaetze.length; i++)
                    if (seatIdentical(plaetze[i], platz)) {
                        plaetze[i] = platz;
                        inserted = true;
                        break;
                    }
                if (!inserted)
                    plaetze.push(platz);
                
                if (typeof successFunc === "function")
                    successFunc(platz);
                renderEverything();
            }
        }
    };
    xmlHttp.send(JSON.stringify(platz));
    for (var i = 0; i < plaetze.length; i++)
        if (seatIdentical(plaetze[i], platz))
            plaetze[i] = platz;
    renderEverything();
}

function loeschePlatz(block, reihe, platz) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('POST', apiUrl + "deletePlatz.php" + "?key=" + getKey() + "&template=" + encodeURIComponent(databaseName) 
            + "&block=" + block + "&reihe=" + reihe + "&platz=" + platz, true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.responseText.startsWith("Error:") || xmlHttp.status !== 200) {
                // neu laden der Daten
                loadVeranstaltung();
                if (xmlHttp.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
                if (xmlHttp.responseText.startsWith("Error:"))
                    throw xmlHttp.responseText;

            } else {
                plaetze = plaetze.filter(function (p) {
                    return p.block !== block || p.reihe !== reihe || p.platz !== platz;
                });
                renderEverything();
            }
        }
    };
    xmlHttp.send(null);
}

function setzePlatzGruppe(platzGruppe, successFunc = undefined) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('POST', apiUrl + "setPlatzGruppe.php" + "?key=" + getKey() + "&template=" + encodeURIComponent(databaseName), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.responseText.startsWith("Error:") || xmlHttp.status !== 200) {
                // neu laden der Daten
                loadVeranstaltung();
                if (xmlHttp.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
                if (xmlHttp.responseText.startsWith("Error:"))
                    throw xmlHttp.responseText;

            } else {
                platzGruppe = JSON.parse(xmlHttp.responseText);

                // insert or append
                var inserted = false;
                for (var i = 0; i < platzGruppen.length; i++)
                    if (platzGruppen[i].id === platzGruppe.id) {
                        platzGruppen[i] = platzGruppe;
                        inserted = true;
                        break;
                    }
                if (!inserted)
                    platzGruppen.push(platzGruppe);
                
                calculatePlaetzeFromPlatzGruppen();
                
                if (typeof successFunc === "function")
                    successFunc(platzGruppe);
                renderEverything();
            }
        }
    };
    xmlHttp.send(JSON.stringify(platzGruppe));
    for (var i = 0; i < platzGruppen.length; i++)
        if (platzGruppen[i].id === platzGruppe.id)
            platzGruppen[i] = platzGruppe;
    renderEverything();
}

function loeschePlatzGruppe(platzGruppenId) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('POST', apiUrl + "deletePlatzGruppe.php" + "?key=" + getKey() + "&template=" + encodeURIComponent(databaseName) + "&id=" + platzGruppenId, true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.responseText.startsWith("Error:") || xmlHttp.status !== 200) {
                // neu laden der Daten
                loadVeranstaltung();
                if (xmlHttp.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
                if (xmlHttp.responseText.startsWith("Error:"))
                    throw xmlHttp.responseText;

            } else {
                platzGruppen = platzGruppen.filter(function (p) {
                    return p.id !== platzGruppenId;
                });
                calculatePlaetzeFromPlatzGruppen();
                renderEverything();
            }
        }
    };
    xmlHttp.send(null);
}

function splitPlatzGruppe(platzGruppenId) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('POST', apiUrl + "splitPlatzGruppeIntoPlaetze.php" + "?key=" + getKey() + "&template=" + encodeURIComponent(databaseName) + "&id=" + platzGruppenId, true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.responseText.startsWith("Error:") || xmlHttp.status !== 200) {
                // neu laden der Daten
                loadVeranstaltung();
                if (xmlHttp.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
                if (xmlHttp.responseText.startsWith("Error:"))
                    throw xmlHttp.responseText;

            } else {
                platzGruppen = platzGruppen.filter(function (p) {
                    return p.id !== platzGruppenId;
                });
                calculatePlaetzeFromPlatzGruppen();
                plaetze = JSON.parse(xmlHttp.responseText);
                renderEverything();
            }
        }
    };
    xmlHttp.send(null);
}

/**
 * lädt neue Veranstaltungsdaten hoch
 * @param {Number} raumBreite
 * @param {Number} raumLaenge
 * @param {Number} sitzBreite
 * @param {Number} sitzLaenge
 * @param {String} laengenEinheit
 * @param {Number} kartenPreis
 * @param {Number} versandPreis
 * @param {Array} additionalFieldsForVorgang 
 */
function setzeVeranstaltung(raumBreite, raumLaenge, sitzBreite, sitzLaenge, laengenEinheit, kartenPreis, versandPreis, additionalFieldsForVorgang = veranstaltung.additionalFieldsForVorgang) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('POST', apiUrl + "setVeranstaltung.php" + "?key=" + getKey() + "&template=" + encodeURIComponent(databaseName), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.responseText.startsWith("Error:") || xmlHttp.status !== 200) {
                // neu laden der Daten
                loadVeranstaltung();
                if (xmlHttp.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
                if (xmlHttp.responseText.startsWith("Error:"))
                    throw xmlHttp.responseText;

            } else {
                veranstaltung = JSON.parse(xmlHttp.responseText);
                renderEverything();
            }
        }
    };
    veranstaltung = {
        veranstaltung: veranstaltung.veranstaltung,
        raumBreite: raumBreite,
        raumLaenge: raumLaenge,
        sitzBreite: sitzBreite,
        sitzLaenge: sitzLaenge,
        laengenEinheit: laengenEinheit,
        kartenPreis: kartenPreis,
        versandPreis: versandPreis,
        additionalFieldsForVorgang: additionalFieldsForVorgang
    };
    xmlHttp.send(JSON.stringify(veranstaltung));
    renderEverything();
}


// -------------
// |  diverse  |
// -------------

/**
 * Array with all Seats that shall be selected
 * @type [{dateIndex: number, seat: object}]
 */
var selectedElement = {
    type: "None",
    ref: null
};


/**
 * Returns if seats are identical by comparing the ID
 * @param {Object} seat1
 * @param {Object} seat2
 * @returns {Boolean}
 */
function seatIdentical(seat1, seat2) {
    return seat1.block === seat2.block 
    && seat1.reihe === seat2.reihe
    && seat1.platz === seat2.platz;
}