/* global apiUrl, urlForVorlageAnsehenPage, urlForKartenVorlageBearbeitenPage, urlForVorlageBearbeitenPage, urlForSitzplanBearbeitenPage */

/**
 * Daten zur Veranstaltung aus der Datenbank
 * @type Object
 */
veranstaltung = null;
/**
 * Namen aller Vorlagen
 * @type String[]
 */
templateDatabases = null;

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
 * Buttons, die den Datensatz umbenennen in der Reihenfolge, wie sie in der Tabelle vorkommen.
 * @type DOM Button
 */
umbenennenButtons = null;
/**
 * Buttons, die den Sitzplan bearbeiten in der Reihenfolge, wie sie in der Tabelle vorkommen.
 * @type DOM Button
 */
sitzplanBearbeitenButtons = null;
/**
 * Buttons, die die Karten Vorlage bearbeiten in der Reihenfolge, wie sie in der Tabelle vorkommen.
 * @type DOM Button
 */
kartenVorlageBearbeitenButtons = null;

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
        // Lade die Namen aller Datensätze im Archiv
        xmlHttp1.open('GET', apiUrl + "getTemplateDatabases.php?key=" + getKey(), true);
        xmlHttp1.onreadystatechange = function () {
            if (xmlHttp1.readyState === 4) {
                if (xmlHttp1.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp1.status;
                if (xmlHttp1.responseText.startsWith("Error:"))
                    throw xmlHttp1.responseText;

                templateDatabases = JSON.parse(xmlHttp1.responseText);
                showTemplates();
            }
        };
        xmlHttp1.send(null);
    }
}

/**
 * Zeigt die Vorhandenen Vorlagen aus templateDatabases in der templateTable.
 */
function showTemplates() {
    var templateTable = document.getElementById("templateTable");

    // entferne alles bisherige aus dem DOM tree
    while (templateTable.firstChild) {
        templateTable.removeChild(templateTable.firstChild);
    }
    anzeigenButtons = [];
    austauschenButtons = [];
    loeschenButtons = [];
    umbenennenButtons = [];
    sitzplanBearbeitenButtons = [];
    kartenVorlageBearbeitenButtons = [];
    

    // füge jede Datenbank in einer Zeile ein
    for (var i = 0; i < templateDatabases.length; i++) {

        var td1 = document.createElement("td");
        td1.innerHTML = templateDatabases[i];

        var button1 = document.createElement("button");
        button1.innerHTML = "Umbenennen";
        button1.onclick = onUmbenennenClick;
        umbenennenButtons[i] = button1;
        var button2 = document.createElement("button");
        button2.innerHTML = "Als aktuelle Veranstaltung erstellen";
        button2.onclick = onAustauschenClick;
        austauschenButtons[i] = button2;
        var button3 = document.createElement("button");
        button3.innerHTML = "L&ouml;schen";
        button3.onclick = onLoeschenClick;
        loeschenButtons[i] = button3;
        var td2 = document.createElement("td");
        td2.appendChild(button1);
        td2.appendChild(button2);
        td2.appendChild(button3);
        
        var button4 = document.createElement("button");
        button4.innerHTML = "Bearbeiten";
        button4.onclick = onBearbeitenClick;
        anzeigenButtons[i] = button4;
        var button5 = document.createElement("button");
        button5.innerHTML = "Sitzplan bearbeiten";
        button5.onclick = onSitzplanBearbeitenClick;
        sitzplanBearbeitenButtons[i] = button5;
        var button6 = document.createElement("button");
        button6.innerHTML = "Kartenvorlage bearbeiten";
        button6.onclick = onKartenVorlageBearbeitenClick;
        kartenVorlageBearbeitenButtons[i] = button6;
        td2.appendChild(document.createElement("br"));
        td2.appendChild(button4);
        td2.appendChild(button5);
        td2.appendChild(button6);

        var tr = document.createElement("tr");
        tr.appendChild(td1);
        tr.appendChild(td2);
        templateTable.appendChild(tr);
    }
}

/**
 * Zeigt an, dass etwas geladen wird
 */
function showLoading() {
    // archive
    var templateTable = document.getElementById("templateTable");
    while (templateTable.firstChild) {
        templateTable.removeChild(templateTable.firstChild);
    }
    anzeigenButtons = null;
    austauschenButtons = null;
    loeschenButtons = null;
    umbenennenButtons = null;
    sitzplanBearbeitenButtons = null;
    kartenVorlageBearbeitenButtons = null;
    templateTable.innerHTML = "<tr><td>Loading...<td/><tr/>";
}

/**
 * Disabled (oder enabled) sämtliche Buttons
 * @param {Boolean} disabled
 */
function disableButtons(disabled) {
    // Aktives Projekt
    document.getElementById("newTemplateButton").disabled = disabled;

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
    for (var i = 0; i < umbenennenButtons.length; i++) {
        umbenennenButtons[i].disabled = disabled;
    }
    for (var i = 0; i < sitzplanBearbeitenButtons.length; i++) {
        sitzplanBearbeitenButtons[i].disabled = disabled;
    }
    for (var i = 0; i < kartenVorlageBearbeitenButtons.length; i++) {
        kartenVorlageBearbeitenButtons[i].disabled = disabled;
    }
}


/**
 * Erstellt eine neue Vorlage
 * Danach werden die Daten neu geladen
 */
function onNewTemplateClick() {
    var newName = window.prompt("Welchen Namen soll die neue Veranstaltung tragen?");
    if (newName == null)
        return;
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", apiUrl + "createTemplateDatabase.php?key=" + getKey() + "&template=" + newName, true);
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
 * Funktion zum anzeigen einer Vorlage.
 * Es wird die Seite zum anzeigen geöffnet.
 * @param {MouseEvent} event
 */
function onBearbeitenClick(event) {
    var databaseName = getDatabaseNameForEvent(event, anzeigenButtons);
    location.href = urlForVorlageBearbeitenPage + "?database=" + encodeURIComponent(databaseName);
}

/**
 * Tauscht die aktuelle Datenbank durch die Datenbank in den Vorlagen aus.
 * Die aktuelle Datenbank wird vorher archiviert.
 * Zu Anfang wird nachgefragt, ob das wirklich getan werden soll.
 * @param {MouseEvent} event
 */
function onAustauschenClick(event) {
    var databaseName = getDatabaseNameForEvent(event, austauschenButtons);

    // Bestätigung durch Nutzer
    var confirmed = window.confirm('Soll die Veranstaltung "' + databaseName +
            '" als aktive Veranstaltung erstellt werden und dafür die aktive Veranstaltung archiviert werden?' +
            '\n\nBitte stelle sicher, dass aktuell niemand anderes an der aktiven Veranstaltung arbeitet!');
    if (!confirmed)
        return;

    // archiviere alte und lade neue Datenbank
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', apiUrl + 'createCurrentFromTemplate.php?key=' + getKey() + '&template=' + encodeURIComponent(databaseName), true);
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
 * Löscht diesen Datensatz aus den Vorlagen
 * @param {MouseEvent} event
 */
function onLoeschenClick(event) {
    var databaseName = getDatabaseNameForEvent(event, loeschenButtons);

    // Bestätigung durch Nutzer
    var confirmed = window.confirm('Soll die Veranstaltung "' + databaseName + '" wirklich aus den Vorlagen gelöscht werden?' +
            '\n\nGelöschte Daten sind nicht wiederherstellbar!');
    if (!confirmed)
        return;

    // lösche die Datenbank
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', apiUrl + "deleteDatabase.php?key=" + getKey() + "&template=" + encodeURIComponent(databaseName), true);
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
 * Funktion zum umbenennen einer Vorlage.
 * Der neue Name wird abgefragt und danach eine API-Anfrage ausgeführt
 * @param {MouseEvent} event
 */
function onUmbenennenClick(event) {
    var databaseName = getDatabaseNameForEvent(event, umbenennenButtons);

    // Bestätigung durch Nutzer
    var newName = window.prompt('Neuer Name für die Veranstaltung "' + databaseName + '":');
    if (newName == null)
        return;

    // lösche die Datenbank
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', apiUrl + "renameDatabase.php?key=" + getKey() + "&template=" + encodeURIComponent(databaseName) + "&newName=" + newName, true);
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
 * Funktion zum bearbeiten des Sitzplans einer Vorlage.
 * Es wird die Seite zum Bearbeiten geöffnet.
 * @param {MouseEvent} event
 */
function onSitzplanBearbeitenClick(event) {
    var databaseName = getDatabaseNameForEvent(event, sitzplanBearbeitenButtons);
    location.href = urlForSitzplanBearbeitenPage + "?database=" + encodeURIComponent(databaseName);
}

/**
 * Funktion zum bearbeiten einer Kartenvorlage einer Vorlage
 * Es wird die Seite zum Bearbeiten geöffnet.
 * @param {MouseEvent} event
 */
function onKartenVorlageBearbeitenClick(event) {
    var databaseName = getDatabaseNameForEvent(event, kartenVorlageBearbeitenButtons);
    location.href = urlForKartenVorlageBearbeitenPage + "?database=" + encodeURIComponent(databaseName);
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
    return templateDatabases[index];
}