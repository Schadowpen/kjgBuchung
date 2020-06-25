/* global apiUrl */

// ----------------------
// | gespeicherte Daten |
// ----------------------
var databaseName = null;

var vorlagePositionen = null;
var kartenConfig = null;
var availableFonts = null;
/**
 * Alle möglichen Textkonfigurationen, Array zum durchiterieren
 * @type {string[]}
 */
var textConfigNames = [
    "dateTextConfig",
    "timeTextConfig",
    "blockTextConfig",
    "reiheTextConfig",
    "platzTextConfig",
    "preisTextConfig",
    "bezahlstatusTextConfig",
    "vorgangsNummerTextConfig"
];

// -------------------
// | Laden der Daten |
// -------------------
var sourcesToLoad = 3;
var sourcesLoaded = 0;

/**
 * Interne Funktion, die aufgerufen wird, wenn ein XMLHttpRequest zum laden von Daten fertig ist.
 * Erkennt, wenn alle Daten geladen wurden und initialisiert Canvas sowie Anzeige der Konfiguration
 */
function loadingComplete() {
    sourcesLoaded++;
    if (sourcesLoaded === sourcesToLoad) {
        initCanvas();
        initUI();
        renderEverything();
        positionUserElements();
        setLoading(false);
    }
}

/**
 * Nachdem die Seite geladen wurde, werden alle benötigten Daten geladen.
 * Danach wird in loadingComplete() die Seite initialisiert
 */
window.addEventListener("load", function () {
    // Name der Datenbank aus URL Parameters
    var queryString = document.location.search.substring(1);
    var queryObj = parseQueryString(queryString);
    databaseName = queryObj.database;
    if (databaseName == null) {
        window.alert("Name der Vorlage nicht in den URL-Parametern angegeben. Öffne diese Seite besser von der Übersichtsseite aus!");
        return;
    }
    
    // Laden die Positionen in der Vorlage
    var httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", apiUrl + "getVorlagePositionen.php?key=" + getKey() + "&template=" + encodeURIComponent(databaseName), true);
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
            if (httpRequest.responseText.startsWith("Error:"))
                throw ("Positionen in der PDF-Vorlage konnten nicht geladen werden.\n\n" + httpRequest.responseText);
            vorlagePositionen = JSON.parse(httpRequest.responseText);
            console.log("Positionen", vorlagePositionen);

            /**
             * Berechnet eine Transformationsmatrix zu dem TextOperator, um zu erkennen ob die Maus innerhalb des TextOperators ist.
             * Fügt zudem eine Funktion isOnText(x, y) hinzu, die zurückliefert, ob der Punkt auf dem Text liegt
             */
            vorlagePositionen.textOperators.forEach(function (textOperator) {
                var dx = textOperator.endPoint.x - textOperator.startPoint.x;
                var dy = textOperator.endPoint.y - textOperator.startPoint.y;
                var textLength = Math.sqrt(dx * dx + dy * dy);

                var translate = new Matrix(1, 0, 0, 1, textOperator.startPoint.x, textOperator.startPoint.y);
                var rotate = new Matrix(dx / textLength, dy / textLength, -dy / textLength, dx / textLength, 0, 0);
                var scale = new Matrix(textLength, 0, 0, textOperator.fontSize, 0, 0);
                textOperator.matrix = translate.addTransformation(rotate).addTransformation(scale).invers();
                textOperator.isOnText = function (x, y) {
                    pointOnText = this.matrix.transformPoint({x, y});
                    return pointOnText.x >= 0 && pointOnText.x <= 1 && pointOnText.y >= 0 && pointOnText.y <= 1;
                };
            });

            loadingComplete();
        }
    };
    httpRequest.send(null);

    // Lade die Konfiguration für Theaterkarten
    var httpRequest2 = new XMLHttpRequest();
    httpRequest2.open("GET", apiUrl + "getKartenConfig.php?key=" + getKey() + "&template=" + encodeURIComponent(databaseName), true);
    httpRequest2.onreadystatechange = function () {
        if (httpRequest2.readyState === 4) {
            if (httpRequest2.responseText.startsWith("Error:"))
                throw ("Karten Konfiguration konnte nicht geladen werden\n\n" + httpRequest2.responseText);
            kartenConfig = JSON.parse(httpRequest2.responseText);
            console.log("kartenConfig", kartenConfig);
            addKartenConfigHistoryEntry();
            loadingComplete();
        }
    };
    httpRequest2.send(null);

    // Lade die verfügbaren Schriftarten
    var httpRequest3 = new XMLHttpRequest();
    httpRequest3.open("GET", apiUrl + "getAvailableFonts.php?key=" + getKey() + "&template=" + encodeURIComponent(databaseName), true);
    httpRequest3.onreadystatechange = function () {
        if (httpRequest3.readyState === 4) {
            if (httpRequest3.responseText.startsWith("Error:"))
                throw ("Verfügbare Schriftarten konnte nicht geladen werden\n\n" + httpRequest3.responseText);
            availableFonts = JSON.parse(httpRequest3.responseText);
            console.log("fonts", availableFonts);
            loadingComplete();
        }
    };
    httpRequest3.send(null);
});


// --------------------
// | Ändern der Daten |
// --------------------

/**
 * Lädt die aktuelle KartenConfig hoch
 * @param {boolean} addToKartenConfigHistory Ob nach erfolgreichem Upload die kartenConfig zur History hinzugefügt werden soll
 */
function uploadKartenConfig(addToKartenConfigHistory = true) {
    // sollte noch ein Request laufen, abbrechen, da neuer Request mit neuen Daten gestartet wird
    if (uploadHttpRequest !== null)
        uploadHttpRequest.abort();

    // Anzeige der neuen Daten für direktes Feedback
    renderEverything();
    setLoading(true);

    // Daten hochladen
    var httpRequest = new XMLHttpRequest();
    httpRequest.open("POST", apiUrl + "setKartenConfig.php?key=" + getKey() + "&template=" + encodeURIComponent(databaseName), true);
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.responseText !== "") {
            // Sollte der Server Error zurückliefern
            if (httpRequest.responseText.startsWith("Error:")) {
                setTimeout(function () {
                    // in parallelem Thread, um Programmfortlauf nicht zu unterbrechen
                    throw ("Karten Konfiguration konnte nicht aktualisiert werden\n\n" + httpRequest.responseText);
                }, 1);
                reloadKartenConfig(); // wieder Laden der aktuellen Konfiguration

            } else {
                // sollten die Daten vom Server sich von den lokalen unterscheiden, werden diese aktualisert
                var newKartenConfig = JSON.parse(httpRequest.responseText);
                if (Object.equals(kartenConfig, newKartenConfig) === false) {
                    kartenConfig = newKartenConfig;
                    console.log("kartenConfig", kartenConfig);
                }
                if (addToKartenConfigHistory)
                    addKartenConfigHistoryEntry();
                setLoading(false);
                renderEverything();
            }
            httpRequest = null;
            reloadDemoWindow();
        }
    };
    httpRequest.send(JSON.stringify(kartenConfig));
    uploadHttpRequest = httpRequest;
}

var uploadHttpRequest = null;

/**
 * Lädt die Daten neu, sollten beim Hochladen Fehler aufgetreten sein.
 */
function reloadKartenConfig() {
    setLoading(true);
    var httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", apiUrl + "getKartenConfig.php?key=" + getKey() + "&template=" + encodeURIComponent(databaseName), true);
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
            if (httpRequest.responseText.startsWith("Error:"))
                throw ("Karten Konfiguration konnte nicht geladen werden\n\n" + httpRequest.responseText);
            kartenConfig = JSON.parse(httpRequest.responseText);
            console.log("kartenConfig", kartenConfig);
            addKartenConfigHistoryEntry();
            reloadDemoWindow();
            renderEverything();
            setLoading(false);
        }
    };
    httpRequest.send(null);
}

/**
 * Führt eine automatische Detektion der KartenConfig durch
 */
function autoDetectKartenConfig() {
    setLoading(true);
    var httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", apiUrl + "autoDetectKartenConfig.php?key=" + getKey() + "&template=" + encodeURIComponent(databaseName), true);
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
            if (httpRequest.responseText.startsWith("Error:"))
                throw ("Fehler beim automatischen Erkennen der Standardkonfiguration\n\n" + httpRequest.responseText);
            kartenConfig = JSON.parse(httpRequest.responseText);
            addKartenConfigHistoryEntry();
            reloadDemoWindow();
            renderEverything();
            setLoading(false);
        }
    };
    httpRequest.send(null);
}


// --------------------
// | Helferfunktionen |
// --------------------

/**
 * Vergleicht zwei Objekte, auch in die Tiefe, ob sie gleich sind
 * Code von https://stackoverflow.com/a/6713782, leicht verändert
 * @param x {object}
 * @param y {object}
 * @returns {boolean}
 */
Object.equals = function (x, y) {
    if (x === y) return true;
    // if both x and y are null or undefined and exactly the same

    if (!(x instanceof Object) || !(y instanceof Object)) return false;
    // if they are not strictly equal, they both need to be Objects

    if (x.constructor !== y.constructor) return false;
    // they must have the exact same prototype chain, the closest we can do is
    // test there constructor.

    for (var p in x) {
        if (!x.hasOwnProperty(p)) continue;
        // other properties were tested using x.constructor === y.constructor

        if (x[p] === y[p]) continue;
        // if they have the same strict value or identity then they are equal
        // also when one of them is set to undefined and the other is not set or if both are null

        if (typeof (x[p]) !== "object") return false;
        // Numbers, Strings, Functions, Booleans, null and undefined must be strictly equal

        if (!Object.equals(x[p], y[p])) return false;
        // Objects and Arrays must be tested recursively
    }

    for (p in y) {
        if (!y.hasOwnProperty(p)) continue;
        // other properties were tested using x.constructor === y.constructor

        if (y[p] === x[p]) continue;
        // if they have the same strict value or identity then they are equal
        // also when one of them is set to undefined and the other is not set or if both are null

        if (typeof (y[p]) !== "object") return false;
        // Numbers, Strings, Functions, Booleans, null and undefined must be strictly equal

        // Objects and Arrays are already tested recursively
    }
    return true;
};

/**
 * Erzeugt eine tiefe Kopie von x
 * @param {object} x
 * @returns {object}
 */
Object.clone = function (x) {
    return JSON.parse(JSON.stringify(x));
};