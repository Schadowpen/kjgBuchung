/* global apiUrl, urlForKartenVorlageBearbeitenPage, urlForSitzplanBearbeitenPage, objectsToLoad, databaseName, veranstaltung, imagesUrl */

function loadUI() {
    // iframe eine Demo Theaterkarte laden lassen
    var iframe = document.getElementById("demoTheaterkarte");
    iframe.src = apiUrl + "demoTheaterkarte.php?key=" + getKey() + "&template=" + encodeURIComponent(databaseName);
    
    loadVorstellungen();
};

function initUI() {
    renderUI();
}

function renderUI() {
    document.getElementById("kartenPreis").value = veranstaltung.kartenPreis;
    document.getElementById("versandPreis").value = veranstaltung.versandPreis;
    renderAdditionalFieldsForVorgang();
}

// ----------
// | Preise |
// ----------

function onKartenPreisInput() {
    var kartenPreis = parseFloat(document.getElementById("kartenPreis").value);
    if (isNaN(kartenPreis))
        return;
    setzeVeranstaltung(veranstaltung.raumBreite, veranstaltung.raumLaenge, veranstaltung.sitzBreite, veranstaltung.sitzLaenge, veranstaltung.laengenEinheit, kartenPreis, veranstaltung.versandPreis);
}

function onVersandPreisInput() {
    var versandPreis = parseFloat(document.getElementById("versandPreis").value);
    if (isNaN(versandPreis))
        return;
    setzeVeranstaltung(veranstaltung.raumBreite, veranstaltung.raumLaenge, veranstaltung.sitzBreite, veranstaltung.sitzLaenge, veranstaltung.laengenEinheit, veranstaltung.kartenPreis, versandPreis);
}

// ----------------------------------------
// | Termine der Vorstellungen bearbeiten |
// ----------------------------------------

/**
 * Alle Vorstellungen aus getVorstellungen.php
 * @type Array
 */
var vorstellungen = null;
/**
 * Alle Buttons, um eine Vorstellung zu löschen, in aufsteigender Reihenfolge.
 * @type Array
 */
var vorstellungenDeleteButtons = null;

function loadVorstellungen() {
    objectsToLoad += 1;
    var xmlHttp1;
    try {
        xmlHttp1 = new XMLHttpRequest();
    } catch (e) {
        // Fehlerbehandlung, wenn die Schnittstelle vom Browser nicht unterstützt wird.
        alert("XMLHttpRequest wird von ihrem Browser nicht unterstützt.");
    }
    if (xmlHttp1) {
        xmlHttp1.open('GET', apiUrl + "getVorstellungen.php?template=" + encodeURIComponent(databaseName), true);
        xmlHttp1.onreadystatechange = function () {
            if (xmlHttp1.readyState === 4) {
                if (xmlHttp1.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp1.status;
                if (xmlHttp1.responseText.startsWith("Error:"))
                    throw xmlHttp1.responseText;

                vorstellungen = JSON.parse(xmlHttp1.responseText);
                loadingComplete();
                initVorstellungen();
            }
        };
        xmlHttp1.send(null);
    }
}

function initVorstellungen() {
    var vorstellungenDiv = document.getElementById("vorstellungenDiv");
    vorstellungenDiv.innerHTML = "";
    vorstellungenDeleteButtons = [];
    
    for (var i = 0; i < vorstellungen.length; i++) {
        var date = vorstellungen[i].date;
        var time = vorstellungen[i].time;
        
        var td1 = document.createElement("td");
        td1.innerHTML = "Datum:";
        var td2 = document.createElement("td");
        td2.innerHTML = date;
        var td3 = document.createElement("td");
        var tr1 = document.createElement("tr");
        tr1.appendChild(td1);
        tr1.appendChild(td2);
        tr1.appendChild(td3);
        
        var td4 = document.createElement("td");
        td4.innerHTML = "Uhrzeit:";
        var td5 = document.createElement("td");
        td5.innerHTML = time;
        var deleteButton = document.createElement("button");
        deleteButton.innerHTML = '<img src="' + imagesUrl + '/bin.png" class="buttonImage"/> Löschen';
        deleteButton.onclick = deleteVorstellung;
        vorstellungenDeleteButtons.push(deleteButton);
        var td6 = document.createElement("td");
        td6.appendChild(deleteButton);
        var tr2 = document.createElement("tr");
        tr2.appendChild(td4);
        tr2.appendChild(td5);
        tr2.appendChild(td6);
        
        var tbody = document.createElement("tbody");
        tbody.appendChild(tr1);
        tbody.appendChild(tr2);
        var table = document.createElement("table");
        table.appendChild(tbody);
        vorstellungenDiv.appendChild(table);
    }
}

function newVorstellung() {
    // get Data
    var date = document.getElementById("newVorstellungDate").value;
    var time = document.getElementById("newVorstellungTime").value;
    
    var vorstellung = {
        date: date,
        time: time
    };

    // upload
    var xmlHttp1 = new XMLHttpRequest();
    xmlHttp1.open('POST', apiUrl + "setVorstellung.php?key=" + getKey() + "&template=" + encodeURIComponent(databaseName), true);
    xmlHttp1.onreadystatechange = function () {
        if (xmlHttp1.readyState === 4) {
            document.getElementById("newVorstellungButton").disabled = false;
            loadVorstellungen();
            
            if (xmlHttp1.status !== 200)
                throw "Could not connect to Server. Server sent status code " + xmlHttp1.status;
            if (xmlHttp1.responseText.startsWith("Error:"))
                throw xmlHttp1.responseText;
        }
    };
    xmlHttp1.send(JSON.stringify(vorstellung));
    document.getElementById("newVorstellungButton").disabled = true;
    document.getElementById("vorstellungenDiv").innerHTML = "Loading ...";
}

function deleteVorstellung(event) {
    // get vorstellung from event
    for (var i = 0; i < vorstellungenDeleteButtons.length; i++) {
        if (event.srcElement == vorstellungenDeleteButtons[i])
            break;
    }
    if (i === vorstellungenDeleteButtons.length)
        throw "Clicked Button not found!";
    var date = vorstellungen[i].date;
    var time = vorstellungen[i].time;
    
    
    var xmlHttp1 = new XMLHttpRequest();
    xmlHttp1.open('GET', apiUrl + "deleteVorstellung.php?key=" + getKey() + "&template=" + encodeURIComponent(databaseName) 
            + "&date=" + date + "&time=" + time, true);
    xmlHttp1.onreadystatechange = function () {
        if (xmlHttp1.readyState === 4) {
            loadVorstellungen();
            
            if (xmlHttp1.status !== 200)
                throw "Could not connect to Server. Server sent status code " + xmlHttp1.status;
            if (xmlHttp1.responseText.startsWith("Error:"))
                throw xmlHttp1.responseText;
        }
    };
    xmlHttp1.send(null);
    document.getElementById("vorstellungenDiv").innerHTML = "Loading ...";
}

// ----------------------------------
// | Zusätzliche Felder für Vorgang |
// ----------------------------------

var additionalFieldsForVorgangDeleteButtons = [];

function renderAdditionalFieldsForVorgang() {
    var fieldsDiv = document.getElementById("additionalFieldsForVorgangDiv");
    fieldsDiv.innerHTML = "";
    additionalFieldsForVorgangDeleteButtons = [];
    
    for (var i = 0; i < veranstaltung.additionalFieldsForVorgang.length; i++) {
        var description = veranstaltung.additionalFieldsForVorgang[i].description;
        var type = veranstaltung.additionalFieldsForVorgang[i].type;
        var required = veranstaltung.additionalFieldsForVorgang[i].required;
        
        var td1 = document.createElement("td");
        td1.innerHTML = description.escapeHTML() + ":";
        var td2 = document.createElement("td");
        switch (type) {
            case "integer": td2.innerHTML = "Ganze Zahl"; break;
            case "float": td2.innerHTML = "Kommazahl"; break;
            case "string": td2.innerHTML = "Text"; break;
            case "longString": td2.innerHTML = "Langer Text"; break;
            case "boolean": td2.innerHTML = "Ja/Nein-Wert"; break;
        }
        var td3 = document.createElement("td");
        td3.innerHTML = required ? "Ja" : "Nein";
        var tr1 = document.createElement("tr");
        tr1.appendChild(td1);
        tr1.appendChild(td2);
        tr1.appendChild(td3);
        
        var td4 = document.createElement("td");
        var td5 = document.createElement("td");
        var deleteButton = document.createElement("button");
        deleteButton.innerHTML = '<img src="' + imagesUrl + '/bin.png" class="buttonImage"/> Löschen';
        deleteButton.onclick = deleteAdditionalFieldForVorgang;
        additionalFieldsForVorgangDeleteButtons.push(deleteButton);
        var td6 = document.createElement("td");
        td6.appendChild(deleteButton);
        var tr2 = document.createElement("tr");
        tr2.appendChild(td4);
        tr2.appendChild(td5);
        tr2.appendChild(td6);
        
        
        var tbody = document.createElement("tbody");
        tbody.appendChild(tr1);
        tbody.appendChild(tr2);
        var table = document.createElement("table");
        table.appendChild(tbody);
        fieldsDiv.appendChild(table);
    }
}

function newAdditionalFieldForVorgang() {
    // get Data
    var description = document.getElementById("newAdditionalFieldForVorgangDescription").value;
    var type = document.getElementById("newAdditionalFieldForVorgangType").value;
    var required = document.getElementById("newAdditionalFieldForVorgangRequired").checked;
    
    // insert new Field
    var additionalFieldsForVorgang = veranstaltung.additionalFieldsForVorgang;
    var i = 0;
    for (; i < additionalFieldsForVorgang.length; i++)
        additionalFieldsForVorgang[i].fieldName = "additionalField"+(i+1);
    additionalFieldsForVorgang[i] = {
        fieldName: "additionalField"+(i+1),
        type: type,
        description: description,
        required: required
    };
    
    // upload
    setzeVeranstaltung(veranstaltung.raumBreite, 
            veranstaltung.raumLaenge, 
            veranstaltung.sitzBreite, 
            veranstaltung.sitzLaenge, 
            veranstaltung.laengenEinheit, 
            veranstaltung.kartenPreis, 
            veranstaltung.versandPreis, 
            additionalFieldsForVorgang);
}

function deleteAdditionalFieldForVorgang(event) {
    // get button Index from event
    for (var i = 0; i < additionalFieldsForVorgangDeleteButtons.length; i++) {
        if (event.srcElement == additionalFieldsForVorgangDeleteButtons[i])
            break;
    }
    if (i === additionalFieldsForVorgangDeleteButtons.length)
        throw "Clicked Button not found!";
    
    // delete additional Field with index
    var additionalFieldsForVorgang = veranstaltung.additionalFieldsForVorgang.splice(i, 1);
    
    // upload
    setzeVeranstaltung(veranstaltung.raumBreite, 
            veranstaltung.raumLaenge, 
            veranstaltung.sitzBreite, 
            veranstaltung.sitzLaenge, 
            veranstaltung.laengenEinheit, 
            veranstaltung.kartenPreis, 
            veranstaltung.versandPreis, 
            veranstaltung.additionalFieldsForVorgang);
}

// ------------
// | Sitzplan |
// ------------

function onElementClicked(clickedElement) {
    selectedElement = clickedElement;
}

// -------------------------------------
// | Verlinkung auf andere Edit-Seiten |
// -------------------------------------

/**
 * Öffne die Seite, um den Sitzplan zu bearbeiten
 */
function onSitzplanBearbeitenClick() {
    location.href = urlForSitzplanBearbeitenPage + "?database=" + encodeURIComponent(databaseName);
}

function onKartenVorlageBearbeitenClick() {
    location.href = urlForKartenVorlageBearbeitenPage + "?database=" + encodeURIComponent(databaseName);
}

// --------------------------
// | Kartenvorlage Uploader |
// --------------------------

// Initialisiere nur, wenn die W3C File API unterstützt wird. Ansonsten ist es ein gewöhnliches Form
if (window.File && window.FileList && window.FileReader) {
    window.addEventListener("load", init);
}

/**
 * Initialisiert das Form so, dass der drag&drop-Bereich eingeschaltet wird und alles als AJAX hochgeladen werden kann
 */
function init() {
    var fileselect = document.getElementById("fileselect"),
            filedrag = document.getElementById("filedrag"),
            submitbutton = document.getElementById("submitbutton");

    // file select
    fileselect.addEventListener("change", fileSelectHandler, false);

    // is XHR2 available?
    var xhr = new XMLHttpRequest();
    if (xhr.upload) {

        // file drop
        filedrag.addEventListener("dragover", fileDragHover, false);
        filedrag.addEventListener("dragleave", fileDragHover, false);
        filedrag.addEventListener("drop", fileSelectHandler, false);
        filedrag.style.display = "block";

        // remove submit button
        submitbutton.style.display = "none";
    }
}

/**
 * Funktion zum Setzen der hover-CSS-Klasse bei dem drag&drop-Element
 * @param e Event vom EventListener
 */
function fileDragHover(e) {
    e.stopPropagation();
    e.preventDefault();
    e.target.className = (e.type === "dragover" ? "hover" : "");
}

/**
 * Event Handler, der ausgeführt wird, wenn eine Datei ausgewählt wurde
 * @param e Event vom EventListener
 */
function fileSelectHandler(e) {
    // Brich das Event ab, dass das Form nicht abgeschickt wird, und entferne Hover Styling beim drag&drop
    fileDragHover(e);

    // fetch FileList object
    var files = e.target.files || e.dataTransfer.files;

    // Lade erste (und einzige) Datei aus der FileList hoch
    if (files.length !== 1)
        throw "Es kann nur eine Datei hochgeladen werden";
    uploadFile(files[0]);
}

/**
 * Lädt eine Datei im Hintergrund hoch
 * @param file
 */
function uploadFile(file) {
    var xhr = new XMLHttpRequest();
    if (xhr.upload) {
        document.getElementById("uploadSpinner").style.display = "block";
        // start upload
        xhr.open("POST", document.getElementById("upload").action, true);
        xhr.setRequestHeader("X-FILENAME", file.name);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                document.getElementById("uploadSpinner").style.display = "none";
                if (xhr.responseText === "Success")
                    window.location = urlForKartenVorlageBearbeitenPage + "?database=" + encodeURIComponent(databaseName);
                else {
                    throw xhr.responseText;
                }
            }
        };
        xhr.send(file);
    }
}


/**
 * Sort dafür, dass in den Parametern der URL, zu welcher das form hochlädt, immer ein aktueller Datenbankschlüssel ist.
 */
function setDatabaseKey() {
    // aktuellen Datenbankschlüssel berechnen
    document.getElementById("upload").action = apiUrl + "uploadKartenVorlage.php?key=" + getKey() + "&template=" + encodeURIComponent(databaseName);

    // alle 10 sec wiederholen
    setTimeout(setDatabaseKey, 10000);
}
window.addEventListener("load", setDatabaseKey);
