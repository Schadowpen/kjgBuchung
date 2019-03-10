/* global initUI, loadUI */

/**
 * This scipt provides loading, accessing and editing of background data
 * 
 * It also loads and inits the canvas and calls loadUI() and initUI().
 */

// loaded content
var objectsToLoad = 2;
var objectsLoaded = 0;
var updating = false;

var sitzplan = null;
var vorstellungen = null;
var vorgang = null; // loaded during execution


// loading
window.addEventListener('load', function () {
    showLoading(0);

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
        var key = getKey();
        xmlHttp1.open('GET', "http://localhost:8000/getSitzplan.php", true);
        xmlHttp1.onreadystatechange = function () {
            if (xmlHttp1.readyState === 4) {
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
        xmlHttp2.open('GET', "http://localhost:8000/getVorstellungenWithStatus.php" + "?key=" + getKey(), true);
        xmlHttp2.onreadystatechange = function () {
            if (xmlHttp2.readyState === 4) {
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

function loadingComplete() {
    objectsLoaded++;
    if (objectsLoaded === objectsToLoad) {
        if (typeof initCanvas === "function")
            initCanvas();
        if (typeof initUI === "function")
            initUI();
        setTimeout(updateData, 10000);
    } else {
        showLoading(objectsLoaded / objectsToLoad);
    }
}

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


function updateData() {
    // check if someone other is updating something.
    if (updating) {
        setTimeout(updateData, 100);
        return;
    }
    updating = true;

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', "http://localhost:8000/getPlatzStatusse.php" + "?key=" + getKey(), true);
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

// editing
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
    xmlHttp.open('POST', "http://localhost:8000/setPlatzStatus.php" + "?key=" + getKey(), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.responseText.startsWith("Error:")) {
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
    xmlHttp.open('GET', "http://localhost:8000/getVorgang.php" + "?key=" + getKey() + "&nummer=" + vorgangsNr, true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {

            if (xmlHttp.status === 200 && !xmlHttp.responseText.startsWith("Error:")) {
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
            } else {
                // TODO better error recurrection
                vorgang = null;
                if (typeof returnFunc === "function")
                    returnFunc(false);
            }
        }
    };
    xmlHttp.send(null);
}

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
    xmlHttp.open('POST', "http://localhost:8000/setVorgang.php" + "?key=" + getKey(), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {

            if (xmlHttp.status === 200 && !xmlHttp.responseText.startsWith("Error:")) {
                vorgang = JSON.parse(xmlHttp.responseText);
                berechneVorgangZugehoerigePlaetze();
                if (typeof returnFunc === "function")
                    returnFunc(true);
            } else {
                window.alert("Vorgang konnte nicht gespeichert werden!\n\n" + xmlHttp.responseText);
                if (typeof returnFunc === "function")
                    returnFunc(false);
            }
            updating = false;
        }
    };
    var stringified = JSON.stringify(vorgang);
    xmlHttp.send(stringified);
}

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

function berechneVorgangGesamtpreis() {
    vorgang.gesamtpreis = (vorgang.bezahlart === "VIP" || vorgang.bezahlart === "TripleA") ? 0 : vorgang.anzahlPlaetze * (vorgang.preis ? vorgang.preis : sitzplan.kartenPreis);
    if (vorgang.versandart === "Post") {
        vorgang.gesamtpreis += sitzplan.versandPreis;
    }
}


// selection
var selectedSeats = [];

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

function isSelectedSeat(dateIndex, seat) {
    for (var i = 0; i < selectedSeats.length; i++) {
        if (selectedSeats[i].dateIndex === dateIndex && selectedSeats[i].seat == seat)
            return true;
    }
    return false;
}

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

function setSelectedSeat(dateIndex, seat) {
    selectedSeats = [{
            "dateIndex": (dateIndex),
            "seat": (seat)
        }];
}

function getSelectedSeat() {
    return selectedSeats[0];
}

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