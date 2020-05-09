/* global initUI, loadUI, apiUrl */

/**
 * This scipt provides loading, accessing and editing of background data
 * 
 * It also loads and inits the canvas and calls loadUI(), initUI() and initCanvas().
 */

// loaded content
/**
 * Name of the archive Database, if given in URL Parameters.
 * @type null|String
 */
var archiveDatabase = null;
/**
 * Number of objects to initially load
 * @type Number
 */
var objectsToLoad = 2;
/**
 * Number of objects that have been loaded. If equal to objectsToLoad, then everything is initially loaded, if less then some loadings are pending
 * @type Number
 */
var objectsLoaded = 0;
/**
 * If any update (Server request) is currently working. Good if only one Server request should be active at a time
 * @type Boolean
 */
var updating = false;

/**
 * Loaded from getSitzplan.php
 * @type Object
 */
var sitzplan = null;
/**
 * Loaded from getVorstellungenWithStatus.php
 * @type Array
 */
var vorstellungen = null;
/**
 * Loaded Vorgang (if any is loaded)
 * @type Object|null
 */
var vorgang = null;


// -------------------
// | initial loading |
// -------------------

window.addEventListener('load', function () {
    showLoading(0);
    
    // lade Target Archiv Datenbank
    var queryString = document.location.search.substring(1);
    var queryObj = parseQueryString(queryString);
    archiveDatabase = queryObj.database;

    if (typeof loadCanvas === "function")
        loadCanvas();
    if (typeof loadUI === "function")
        loadUI();

    // load room
    var xmlHttp1;
    try {
        xmlHttp1 = new XMLHttpRequest();
    } catch (e) {
        // Fehlerbehandlung, wenn die Schnittstelle vom Browser nicht unterstützt wird.
        alert("XMLHttpRequest wird von ihrem Browser nicht unterstützt.");
    }
    if (xmlHttp1) {
        if (archiveDatabase == null)
            xmlHttp1.open('GET', apiUrl + "getSitzplan.php", true);
        else
            xmlHttp1.open('GET', apiUrl + "getSitzplan.php?archive=" + encodeURIComponent(archiveDatabase), true);
        xmlHttp1.onreadystatechange = function () {
            if (xmlHttp1.readyState === 4) {
                if (xmlHttp1.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp1.status;
                if (xmlHttp1.responseText.startsWith("Error:"))
                    throw xmlHttp1.responseText;

                sitzplan = JSON.parse(xmlHttp1.responseText);
                // Generate ID from block, reihe, platz
                for (var i = 0; i < sitzplan.plaetze.length; i++)
                    sitzplan.plaetze[i].ID = sitzplan.plaetze[i].block + "," + sitzplan.plaetze[i].reihe + sitzplan.plaetze[i].platz;

                // set title
                var vName = document.getElementById("veranstaltungsName");
                if (vName)
                    vName.innerHTML = sitzplan.veranstaltung;

                loadingComplete();
            }
        };
        xmlHttp1.send(null);


        // load bookings
        var xmlHttp2 = new XMLHttpRequest();
        if (archiveDatabase == null)
            xmlHttp2.open('GET', apiUrl + "getVorstellungenWithStatus.php" + "?key=" + getKey(), true);
        else
            xmlHttp2.open('GET', apiUrl + "getVorstellungenWithStatus.php?archive=" + encodeURIComponent(archiveDatabase) + "&key=" + getKey(), true);
        
        xmlHttp2.onreadystatechange = function () {
            if (xmlHttp2.readyState === 4) {
                if (xmlHttp2.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp2.status;
                if (xmlHttp2.responseText.startsWith("Error:"))
                    throw xmlHttp2.responseText;

                vorstellungen = JSON.parse(xmlHttp2.responseText);
                // Convert Date and Time to Date Object
                for (var i = 0; i < vorstellungen.length; i++)
                    vorstellungen[i].utc = new Date(vorstellungen[i].date + "T" + vorstellungen[i].time);

                loadingComplete();
            }
        };
        xmlHttp2.send(null);
    }
});

/**
 * Function to call whenever some resource for initial loading is completed.
 * When everything is loaded, it will init Everything.
 */
function loadingComplete() {
    objectsLoaded++;
    if (objectsLoaded === objectsToLoad) {
        if (typeof initCanvas === "function")
            initCanvas();
        if (typeof initUI === "function")
            initUI();
        if (archiveDatabase == null) // only update if not in archive
            setTimeout(updateData, 10000);
    } else {
        showLoading(objectsLoaded / objectsToLoad);
    }
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
 * !CALL THIS FUNCTION ONCE, IT THEN STARTS TO CALL ITSELF!
 * 
 * This function updates every 10 seconds the platzStatusse.
 * If an Entry is changed, maybe because multiple Users editing the same Data, it tries to call onStatusUpdate(number, platz, platzStatus)
 */
function updateData() {
    // check if someone other is updating something.
    if (updating) {
        setTimeout(updateData, 100);
        return;
    }
    updating = true;

    var xmlHttp = new XMLHttpRequest();
    if (archiveDatabase == null)
        xmlHttp.open('GET', apiUrl + "getPlatzStatusse.php" + "?key=" + getKey(), true);
    else
        xmlHttp.open('GET', apiUrl + "getPlatzStatusse.php" + "?key=" + getKey() + "&archive=" + encodeURIComponent(archiveDatabase), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status === 200 && !xmlHttp.responseText.startsWith("Error:")) {
                var status = JSON.parse(xmlHttp.responseText);

                // go through all possible statuses and check for changes
                for (var i = 0; i < vorstellungen.length; i++) {
                    for (var k = 0; k < sitzplan.plaetze.length; k++) {
                        var oldStatus = vorstellungen[i][sitzplan.plaetze[k].ID];
                        var newStatus = null;
                        for (var j = 0; j < status.length; j++) {
                            if (vorstellungen[i].date === status[j].date
                                    && vorstellungen[i].time === status[j].time
                                    && sitzplan.plaetze[k].block === status[j].block
                                    && sitzplan.plaetze[k].reihe === status[j].reihe
                                    && sitzplan.plaetze[k].platz === status[j].platz) {
                                newStatus = status[j];
                            }
                        }
                        if (oldStatus == null && newStatus != null) {
                            var editStatus = true;
                            if (typeof onStatusUpdate === "function")
                                editStatus = onStatusUpdate(i, sitzplan.plaetze[k], newStatus);
                            if (editStatus) {
                                vorstellungen[i][sitzplan.plaetze[k].ID] = {"status": newStatus.status, "vorgangsNr": newStatus.vorgangsNr};
                            }

                        } else if (oldStatus != null && newStatus == null) {
                            var editStatus = true;
                            if (typeof onStatusUpdate === "function")
                                editStatus = onStatusUpdate(i, sitzplan.plaetze[k], newStatus);
                            if (editStatus) {
                                delete(oldStatus); //vorstellungen[i][sitzplan.plaetze[k].ID]);
                            }

                        } else if (oldStatus != null && newStatus != null && (oldStatus.status != newStatus.status || oldStatus.vorgangsNr != newStatus.vorgangsNr)) {
                            var editStatus = true;
                            if (typeof onStatusUpdate === "function")
                                editStatus = onStatusUpdate(i, sitzplan.plaetze[k], newStatus);
                            if (editStatus) {
                                vorstellungen[i][sitzplan.plaetze[k].ID].status = newStatus.status;
                                vorstellungen[i][sitzplan.plaetze[k].ID].vorgangsNr = newStatus.vorgangsNr;
                            }
                        }
                    }
                }
                draw();

                if (typeof onUpdateDataFinished === "function")
                    onUpdateDataFinished();
            } else {
                console.log("Updating failed");
            }
            updating = false;
            setTimeout(updateData, 10000);
        }
    };
    xmlHttp.send(null);
}

// -----------
// | editing |
// -----------

/**
 * Sets the Platz Status on the server
 * @param {string} date
 * @param {string} time
 * @param {string} block
 * @param {string} reihe
 * @param {number} platz
 * @param {string} status
 * @param {function|null} returnFunc
 * @param {number|null} vorgangsNr
 * @returns {undefined}
 */
function setzePlatzStatus(date, time, block, reihe, platz, status, returnFunc, vorgangsNr) {
    // check if someone other is updating something.
    if (updating) {
        setTimeout(function () {
            setzePlatzStatus(date, time, block, reihe, platz, status, returnFunc, vorgangsNr);
        }, 10);
        return;
    }
    updating = true;

    var xmlHttp = new XMLHttpRequest();
    if (archiveDatabase == null)
        xmlHttp.open('POST', apiUrl + "setPlatzStatus.php" + "?key=" + getKey(), true);
    else
        xmlHttp.open('POST', apiUrl + "setPlatzStatus.php" + "?key=" + getKey() + "&archive=" + encodeURIComponent(archiveDatabase), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.responseText.startsWith("Error:") || xmlHttp.status !== 200) {
                window.alert("Platz Status konnte nicht verändert werden\n\n" + xmlHttp.responseText);
                if (typeof returnFunc === "function")
                    returnFunc(false);
                draw();

            } else {
                var returnStatus = JSON.parse(xmlHttp.responseText);

                // save changes to local data
                for (var i = 0; i < vorstellungen.length; i++) {
                    if (vorstellungen[i].date === returnStatus.date && vorstellungen[i].time === returnStatus.time) {
                        var id = returnStatus.block + "," + returnStatus.reihe + returnStatus.platz;
                        if (vorstellungen[i][id] == null)
                            vorstellungen[i][id] = {};
                        vorstellungen[i][id].status = returnStatus.status;
                        if (returnStatus.vorgangsNr != null)
                            vorstellungen[i][id].vorgangsNr = returnStatus.vorgangsNr;
                        else
                            delete vorstellungen[i][id].vorgangsNr;

                        if (typeof returnFunc === "function")
                            returnFunc(true);

                        draw();
                        updating = false;
                        return;
                    }
                }
            }
            updating = false;
        }
    };
    var sendStatus = {
        "date": date,
        "time": time,
        "block": block,
        "reihe": reihe,
        "platz": platz,
        "status": status
    };
    if (vorgangsNr != null)
        sendStatus.vorgangsNr = vorgangsNr;
    xmlHttp.send(JSON.stringify(sendStatus));
}

/**
 * Loads a Vorgang for the given vorgangsNr.
 * If the vorgangsNr is < 0, an empty Vorgang is created
 * @param {number} vorgangsNr
 * @param {function} returnFunc
 */
function ladeVorgang(vorgangsNr, returnFunc) {
    if (vorgangsNr == null) {
        vorgang = null;
        if (typeof returnFunc === "function")
            returnFunc(true);
        return;
    }
    if (vorgangsNr < 0) {
        var readyFunc = function () {
            if (sitzplan == null || vorstellungen == null) {
                setTimeout(readyFunc, 100);
            } else {
                vorgang = {
                    "nummer": vorgangsNr,
                    "preis": sitzplan.kartenPreis
                };
                berechneVorgangZugehoerigePlaetze();
                if (typeof returnFunc === "function")
                    returnFunc(true);
            }
        };
        readyFunc();
        return;
    }

    var xmlHttp = new XMLHttpRequest();
    if (archiveDatabase == null)
        xmlHttp.open('GET', apiUrl + "getVorgang.php" + "?key=" + getKey() + "&nummer=" + vorgangsNr, true);
    else
        xmlHttp.open('GET', apiUrl + "getVorgang.php" + "?key=" + getKey() + "&nummer=" + vorgangsNr + "&archive=" + encodeURIComponent(archiveDatabase), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status !== 200 || xmlHttp.responseText.startsWith("Error:")) {
                vorgang = null;
                if (typeof returnFunc === "function")
                    returnFunc(false);
                return;
            }
            
                vorgang = JSON.parse(xmlHttp.responseText);
                var readyFunc = function () {
                    if (sitzplan == null || vorstellungen == null) {
                        setTimeout(readyFunc, 100);
                    } else {
                        berechneVorgangZugehoerigePlaetze();
                        if (typeof returnFunc === "function")
                            returnFunc(true);
                    }
                };
                readyFunc();
        }
    };
    xmlHttp.send(null);
}

/**
 * saves a Vorgang on the Server.
 * @param {function} returnFunc
 */
function speichereVorgang(returnFunc) {
    // check if someone other is updating something.
    if (updating) {
        setTimeout(function () {
            speichereVorgang(returnFunc);
        }, 10);
        return;
    }
    updating = true;

    var xmlHttp = new XMLHttpRequest();
    if (archiveDatabase == null)
        xmlHttp.open('POST', apiUrl + "setVorgang.php" + "?key=" + getKey(), true);
    else
        xmlHttp.open('POST', apiUrl + "setVorgang.php" + "?key=" + getKey() + "&archive=" + encodeURIComponent(archiveDatabase), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status !== 200 || xmlHttp.responseText.startsWith("Error:")) {
                window.alert("Vorgang konnte nicht gespeichert werden!\n\n" + xmlHttp.responseText);
                if (typeof returnFunc === "function")
                    returnFunc(false);
                
            } else {
                vorgang = JSON.parse(xmlHttp.responseText);
                berechneVorgangZugehoerigePlaetze();
                if (typeof returnFunc === "function")
                    returnFunc(true);
            }
            updating = false;
        }
    };
    var stringified = JSON.stringify(vorgang);
    xmlHttp.send(stringified);
}

/**
 * Calculates which places belong to the Vorgang and sets vorgang.plaetze accordingly.
 * @see berechneVorgangGesamtpreis()
 */
function berechneVorgangZugehoerigePlaetze() {
    vorgang.anzahlPlaetze = 0;
    vorgang.plaetze = [];
    for (var i = 0; i < vorstellungen.length; i++) {
        for (var k = 0; k < sitzplan.plaetze.length; k++) {
            var status = vorstellungen[i][sitzplan.plaetze[k].ID];
            if (status && status.vorgangsNr == vorgang.nummer) {
                vorgang.anzahlPlaetze++;
                var neuerPlatz = {
                    "date": vorstellungen[i].date,
                    "time": vorstellungen[i].time,
                    "block": sitzplan.plaetze[k].block,
                    "reihe": sitzplan.plaetze[k].reihe,
                    "platz": sitzplan.plaetze[k].platz
                };
                vorgang.plaetze.push(neuerPlatz);
            }
        }
    }
    berechneVorgangGesamtpreis();
}

/**
 * Calculates the prize for the vorgang
 */
function berechneVorgangGesamtpreis() {
    vorgang.gesamtpreis = (vorgang.bezahlart === "VIP" || vorgang.bezahlart === "TripleA") ? 0 : vorgang.anzahlPlaetze * (vorgang.preis ? vorgang.preis : sitzplan.kartenPreis);
    if (vorgang.versandart === "Post") {
        vorgang.gesamtpreis += sitzplan.versandPreis;
    }
}

/**
 * Generates a theater ticket on the Server for the vorgang, but only if there is none.
 * @param {function} returnFunc
 */
function erstelleVorgangTheaterkarte(returnFunc) {
    // Überprüfe ob Theaterkarte bereits erstellt wurde
    if (vorgang.theaterkarte != null) {
        if (typeof returnFunc === "function")
            returnFunc(true);
        return;
    }
    
    // check if someone other is updating something.
    if (updating) {
        setTimeout(function () {
            erstelleVorgangTheaterkarte(returnFunc);
        }, 10);
        return;
    }
    updating = true;

    var xmlHttp = new XMLHttpRequest();
    if (archiveDatabase == null)
        xmlHttp.open('GET', apiUrl + "generateTheaterkarte.php" + "?key=" + getKey() + "&nummer=" + vorgang.nummer, true);
    else
        xmlHttp.open('GET', apiUrl + "generateTheaterkarte.php" + "?key=" + getKey() + "&nummer=" + vorgang.nummer + "&archive=" + encodeURIComponent(archiveDatabase), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status !== 200 || xmlHttp.responseText.startsWith("Error:")) {
                window.alert("Theaterkarte konnte nicht erzeugt werden!\n\n" + xmlHttp.responseText);
                if (typeof returnFunc === "function")
                    returnFunc(false);
                
            } else {
                vorgang = JSON.parse(xmlHttp.responseText);
                berechneVorgangZugehoerigePlaetze();
                if (typeof returnFunc === "function")
                    returnFunc(true);
            }
            updating = false;
        }
    };
    xmlHttp.send(null);
}

/**
 * Deletes the theater ticket for the vorgang on the Server
 * @param {function} returnFunc
 */
function loescheVorgangTheaterkarte(returnFunc) {
    // check if someone other is updating something.
    if (updating) {
        setTimeout(function () {
            loescheVorgangTheaterkarte(returnFunc);
        }, 10);
        return;
    }
    updating = true;

    var xmlHttp = new XMLHttpRequest();
    if (archiveDatabase == null)
        xmlHttp.open('GET', apiUrl + "deleteTheaterkarte.php" + "?key=" + getKey() + "&nummer=" + vorgang.nummer, true);
    else
        xmlHttp.open('GET', apiUrl + "deleteTheaterkarte.php" + "?key=" + getKey() + "&nummer=" + vorgang.nummer + "&archive=" + encodeURIComponent(archiveDatabase), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {

            if (xmlHttp.status !== 200 || xmlHttp.responseText.startsWith("Error:")) {
                window.alert("Theaterkarte konnte nicht geloescht werden!\n\n" + xmlHttp.responseText);
                if (typeof returnFunc === "function")
                    returnFunc(false);
                
            } else {
                vorgang = JSON.parse(xmlHttp.responseText);
                berechneVorgangZugehoerigePlaetze();
                if (typeof returnFunc === "function")
                    returnFunc(true);
            }
            updating = false;
        }
    };
    xmlHttp.send(null);
}


// -------------
// | selection |
// -------------

/**
 * Array with all Seats that shall be selected
 * @type [{dateIndex: number, seat: object}]
 */
var selectedSeats = [];

/**
 * Selects a seat if not selected and otherwise
 * @param {number} dateIndex
 * @param {object} seat
 */
function antiselectSeat(dateIndex, seat) {
    var newElement = {
        "dateIndex": (dateIndex),
        "seat": (seat)
    };
    var elementIndex = -1;
    for (var i = 0; i < selectedSeats.length; i++) {
        if (selectedSeats[i].dateIndex === newElement.dateIndex && selectedSeats[i].seat == newElement.seat)
            elementIndex = i;
    }
    // Add or remove Element depending on if it was found
    if (elementIndex === -1) {
        selectedSeats.push(newElement);
    } else {
        selectedSeats.splice(elementIndex, 1);
    }
}

/**
 * Checks if a seat is selected
 * @param {number} dateIndex
 * @param {object} seat
 * @returns {Boolean}
 */
function isSelectedSeat(dateIndex, seat) {
    for (var i = 0; i < selectedSeats.length; i++) {
        if (selectedSeats[i].dateIndex === dateIndex && selectedSeats[i].seat == seat)
            return true;
    }
    return false;
}

/**
 * Selects a seat
 * @param {number} dateIndex
 * @param {object} seat
 */
function selectSeat(dateIndex, seat) {
    var newElement = {
        "dateIndex": (dateIndex),
        "seat": (seat)
    };
    var elementIndex = -1;
    for (var i = 0; i < selectedSeats.length; i++) {
        if (selectedSeats[i].dateIndex === newElement.dateIndex && selectedSeats[i].seat == newElement.seat)
            elementIndex = i;
    }
    // Add Element if necessary
    if (elementIndex === -1) {
        selectedSeats.push(newElement);
    }
}

/**
 * Deselects a seat
 * @param {number} dateIndex
 * @param {object} seat
 */
function deselectSeat(dateIndex, seat) {
    var newElement = {
        "dateIndex": (dateIndex),
        "seat": (seat)
    };
    var elementIndex = -1;
    for (var i = 0; i < selectedSeats.length; i++) {
        if (selectedSeats[i].dateIndex === newElement.dateIndex && selectedSeats[i].seat == newElement.seat)
            elementIndex = i;
    }
    // remove Element
    if (elementIndex !== -1) {
        selectedSeats.splice(elementIndex, 1);
    }
}

/**
 * Sets the given Seat as the only selected seat in the plan
 * @param {number} dateIndex
 * @param {object} seat
 */
function setSelectedSeat(dateIndex, seat) {
    selectedSeats = [{
            "dateIndex": (dateIndex),
            "seat": (seat)
        }];
}

/**
 * Returns the selected seat, only usable if only one is selected
 * @returns {{dateIndex: number, seat: object}}
 */
function getSelectedSeat() {
    return selectedSeats[0];
}

/**
 * sorts the selected Seats by date-block-reihe-platz
 */
function sortSelectedSeats() {
    selectedSeats.sort(function (a, b) {
        var ret = a.dateIndex - b.dateIndex;
        if (ret === 0) {
            ret = a.seat.block.localeCompare(b.seat.block);
            if (ret === 0) {
                ret = a.seat.reihe.localeCompare(b.seat.reihe);
                if (ret === 0) {
                    ret = a.seat.platz - b.seat.platz;
                }
            }
        }
        return ret;
    });
}