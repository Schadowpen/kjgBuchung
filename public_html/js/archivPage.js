/* global apiUrl, urlForArchivAnsehenPage, imagesUrl */

/**
 * Daten zur Veranstaltung aus der Datenbank
 * @type Object
 */
veranstaltung = null;
/**
 * Namen aller archivierten Datenbanken
 * @type String[]
 */
archivedDatabases = null;

/**
 * Buttons, die den Datensatz anzeigen in der Reihenfolge, wie sie in der Tabelle vorkommen.
 * @type DOM Button
 */
anzeigenButtons = null;
/**
 * Buttons, die den Datensatz austauschen in der Reihenfolge, wie sie in der Tabelle vorkommen.
 * @type DOM Button
 */
austauschenButtons = null;
/**
 * Buttons, die den Datensatz löschen in der Reihenfolge, wie sie in der Tabelle vorkommen.
 * @type DOM Button
 */
loeschenButtons = null;

/**
 * Wenn die Webseite geladen wurde, lade die Daten
 */
window.addEventListener('load', loadData);

/**
 * Lädt die Daten (ob zu Beginn oder zum aktualisieren)
 */
function loadData() {
    // Lade die aktuelle Veranstaltung (für den Namen)
    var xmlHttp1;
    try {
        xmlHttp1 = new XMLHttpRequest();
    } catch (e) {
        // Fehlerbehandlung, wenn die Schnittstelle vom Browser nicht unterstützt wird.
        alert("XMLHttpRequest wird von ihrem Browser nicht unterstützt.");
    }
    if (xmlHttp1) {
        xmlHttp1.open('GET', apiUrl + "getVeranstaltung.php", true);
        xmlHttp1.onreadystatechange = function () {
            if (xmlHttp1.readyState === 4) {
                if (xmlHttp1.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp1.status;
                if (xmlHttp1.responseText.startsWith("Error:"))
                    throw xmlHttp1.responseText;

                veranstaltung = JSON.parse(xmlHttp1.responseText);
                showActiveProject(veranstaltung.veranstaltung);
            }
        };
        xmlHttp1.send(null);


        // Lade die Namen aller Datensätze im Archiv
        var xmlHttp2 = new XMLHttpRequest();
        xmlHttp2.open('GET', apiUrl + "getArchivedDatabases.php?key=" + getKey(), true);
        xmlHttp2.onreadystatechange = function () {
            if (xmlHttp2.readyState === 4) {
                if (xmlHttp2.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp2.status;
                if (xmlHttp2.responseText.startsWith("Error:"))
                    throw xmlHttp2.responseText;

                archivedDatabases = JSON.parse(xmlHttp2.responseText);
                showArchives();
            }
        };
        xmlHttp2.send(null);
    }
}

/**
 * Zeige den Namen des aktuellen Projektes an der entsprechenden Stelle an.
 * @param {String} activeProjectName
 */
function showActiveProject(activeProjectName) {
    document.getElementById("activeProject").innerHTML = activeProjectName;
}

/**
 * Zeigt die Vorhandenen Archive aus archivedDatabases in der archivTable.
 */
function showArchives() {
    var archivTable = document.getElementById("archivTable");
    var securityCopyTable = document.getElementById("securityCopyTable");
    
    // entferne alles bisherige aus dem DOM tree
    while (archivTable.firstChild) {
        archivTable.removeChild(archivTable.firstChild);
    }
    while (securityCopyTable.firstChild) {
        securityCopyTable.removeChild(securityCopyTable.firstChild);
    }
    anzeigenButtons = [];
    austauschenButtons = [];
    loeschenButtons = [];

    // füge jede Datenbank in einer Zeile ein
    for (var i = 0; i < archivedDatabases.length; i++) {
        var databaseInfo = extractArchivedDatabase(archivedDatabases[i]);

        var td1 = document.createElement("td");
        td1.innerHTML = databaseInfo.name.escapeHTML();

        var button1 = document.createElement("button");
        button1.innerHTML = '<img src="' + imagesUrl + '/eye.png" class="buttonImage"/> Anzeigen';
        button1.onclick = onAnzeigenClick;
        anzeigenButtons[i] = button1;
        var button2 = document.createElement("button");
        button2.innerHTML = '<img src="' + imagesUrl + '/moveDatabase.png" class="buttonImage"/> Als aktuelle Veranstaltung laden';
        button2.onclick = onAustauschenClick;
        austauschenButtons[i] = button2;
        var button3 = document.createElement("button");
        button3.innerHTML = '<img src="' + imagesUrl + '/bin.png" class="buttonImage"/> L&ouml;schen';
        button3.onclick = onLoeschenClick;
        loeschenButtons[i] = button3;
        var td3 = document.createElement("td");
        td3.appendChild(button1);
        td3.appendChild(button2);
        td3.appendChild(button3);

        // Zeile in Archiv Tabelle oder Sicherungskopien Table
        if (databaseInfo.isSecurityCopy) {
            var td2 = document.createElement("td");
            td2.innerHTML = databaseInfo.date.toLocaleString();
            
            var tr = document.createElement("tr");
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            securityCopyTable.appendChild(tr);

        } else {
            var tr = document.createElement("tr");
            tr.appendChild(td1);
            tr.appendChild(td3);
            archivTable.appendChild(tr);
        }
    }
}

/**
 * Zerlegt den Namen eines Datensatzes im Archiv in seine Einzelteile
 * @param {String} archivedDatabase
 * @returns {{isSecurityCopy: Boolean, name: String, date: String, time: String}}
 */
function extractArchivedDatabase(archivedDatabase) {
    if (archivedDatabase.startsWith("SecurityCopy_")) {
        // is security copy
        var name = archivedDatabase.substring(34);

        var dateString = archivedDatabase.substring(13, 23);
        var timeString = archivedDatabase.substring(24, 29);
        timeString = timeString.replace("-", ":");
        var date = new Date(dateString + "T" + timeString + "+00:00");

        return {
            isSecurityCopy: true,
            name: name,
            date: date
        };

    } else {
        // not security copy
        return {
            isSecurityCopy: false,
            name: archivedDatabase,
            date: null
        };
    }
}

/**
 * Zeigt an, dass etwas geladen wird
 */
function showLoading() {
    // Active Project
    document.getElementById("activeProject").innerHTML = "Loading...";

    // archive
    var archivTable = document.getElementById("archivTable");
    var securityCopyTable = document.getElementById("securityCopyTable");
    while (archivTable.firstChild) {
        archivTable.removeChild(archivTable.firstChild);
    }
    while (securityCopyTable.firstChild) {
        securityCopyTable.removeChild(securityCopyTable.firstChild);
    }
    anzeigenButtons = null;
    austauschenButtons = null;
    loeschenButtons = null;
    archivTable.innerHTML = "<tr><td>Loading...<td/><tr/>";
    securityCopyTable.innerHTML = "<tr><td>Loading...<td/><tr/>";
}

/**
 * Disabled (oder enabled) sämtliche Buttons
 * @param {Boolean} disabled
 */
function disableButtons(disabled) {
    // Aktives Projekt
    document.getElementById("archivierenButton").disabled = disabled;
    document.getElementById("sicherungskopieButton").disabled = disabled;

    // Archiv
    for (var i = 0; i < anzeigenButtons.length; i++) {
        anzeigenButtons[i].disabled = disabled;
    }
    for (var i = 0; i < austauschenButtons.length; i++) {
        austauschenButtons[i].disabled = disabled;
    }
    for (var i = 0; i < loeschenButtons.length; i++) {
        loeschenButtons[i].disabled = disabled;
    }
}


/**
 * Erstellt eine Sicherungskopie für den aktuellen Datensatz.
 * Danach werden die Daten neu geladen.
 */
function onSicherungskopieClick() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", apiUrl + "securityCopyDatabase.php?key=" + getKey(), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            disableButtons(false);
            if (xmlHttp.status !== 200)
                throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
            if (xmlHttp.responseText.startsWith("Error:"))
                throw xmlHttp.responseText;

            showLoading();
            loadData();
        }
    };
    xmlHttp.send(null);
    disableButtons(true);
}

/**
 * Archiviert den aktuellen Datensatz.
 * Danach werden die Daten neu geladen
 */
function onArchivierenClick() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", apiUrl + "archiveDatabase.php?key=" + getKey(), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            disableButtons(false);
            if (xmlHttp.status !== 200)
                throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
            if (xmlHttp.responseText.startsWith("Error:"))
                throw xmlHttp.responseText;

            showLoading();
            loadData();
        }
    };
    xmlHttp.send(null);
    disableButtons(true);
}

/**
 * Funktion zum anzeigen eines Archivdatensatzes.
 * Es wird die Seite zum anzeigen geöffnet.
 * @param {MouseEvent} event
 */
function onAnzeigenClick(event) {
    var databaseName = getDatabaseNameForEvent(event, anzeigenButtons);
    location.href = urlForArchivAnsehenPage + "?database=" + encodeURIComponent(databaseName);
}

/**
 * Tauscht die aktuelle Datenbank durch die Datenbank im Archiv aus.
 * Die aktuelle Datenbank wird vorher archiviert.
 * Zu Anfang wird nachgefragt, ob das wirklich getan werden soll.
 * @param {MouseEvent} event
 */
function onAustauschenClick(event) {
    var databaseName = getDatabaseNameForEvent(event, austauschenButtons);

    // Bestätigung durch Nutzer
    var databaseInfo = extractArchivedDatabase(databaseName);
    var confirmed = false;
    if (databaseInfo.isSecurityCopy) {
        confirmed = window.confirm('Soll die Sicherungskopie für "' + databaseInfo.name.escapeHTML() + '" vom ' + databaseInfo.date.toLocaleString() +
                ' geladen werden und dafür die Veranstaltung "' + veranstaltung.veranstaltung + '" archiviert werden?' + 
                '\n\nBitte stelle sicher, dass aktuell niemand anderes an der Veranstaltung arbeitet!');
    } else {
        confirmed = window.confirm('Soll die Veranstaltung "' + databaseInfo.name.escapeHTML() + 
                '" geladen werden und dafür die Veranstaltung "' + veranstaltung.veranstaltung.escapeHTML() + '" archiviert werden?' + 
                '\n\nBitte stelle sicher, dass aktuell niemand anderes an der Veranstaltung arbeitet!');
    }
    if (!confirmed)
        return;

    // archiviere alte und lade neue Datenbank
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', apiUrl + 'restoreDatabase.php?key=' + getKey() + '&archive=' + encodeURIComponent(databaseName), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            disableButtons(false);
            if (xmlHttp.status !== 200)
                throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
            if (xmlHttp.responseText.startsWith("Error:"))
                throw xmlHttp.responseText;

            // lade Daten für diese Webseite neu
            showLoading();
            loadData();
        }
    };
    xmlHttp.send(null);
    disableButtons(true);
}

/**
 * Löscht diesen Datensatz aus dem Archiv
 * @param {MouseEvent} event
 */
function onLoeschenClick(event) {
    var databaseName = getDatabaseNameForEvent(event, loeschenButtons);

    // Bestätigung durch Nutzer
    var databaseInfo = extractArchivedDatabase(databaseName);
    var confirmed = false;
    if (databaseInfo.isSecurityCopy) {
        confirmed = window.confirm('Soll die Sicherungskopie für "' + databaseInfo.name.escapeHTML() + '" vom ' + databaseInfo.date.toLocaleString() + ' wirklich gelöscht werden?'+
                '\n\nGelöschte Daten sind nicht wiederherstellbar!');
    } else {
        confirmed = window.confirm('Soll die Veranstaltung "' + databaseName.escapeHTML() + '" wirklich aus dem Archiv gelöscht werden?'+
                '\n\nGelöschte Daten sind nicht wiederherstellbar!');
    }
    if (!confirmed)
        return;

    // lösche die Datenbank
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', apiUrl + "deleteDatabase.php?key=" + getKey() + "&archive=" + encodeURIComponent(databaseName), true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            disableButtons(false);
            if (xmlHttp.status !== 200)
                throw "Could not connect to Server. Server sent status code " + xmlHttp.status;
            if (xmlHttp.responseText.startsWith("Error:"))
                throw xmlHttp.responseText;

            // lade Daten für diese Webseite neu
            showLoading();
            loadData();
        }
    };
    xmlHttp.send(null);
    disableButtons(true);
}

/**
 * Berechnet aus dem Click auf einen Button, welcher Datensatz gemeint ist.
 * @param {MouseEvent} event Click-Event auf einen Button
 * @param {Array} possibleButtons Einer dieser Buttons wurde geklickt
 * @returns {string} Name der Datenbank im Archiv
 */
function getDatabaseNameForEvent(event, possibleButtons) {
    for (var index = 0; index < possibleButtons.length; index++) {
        if (event.srcElement == possibleButtons[index])
            break;
    }
    if (index === possibleButtons.length)
        throw "Clicked Button not found!";
    return archivedDatabases[index];
}