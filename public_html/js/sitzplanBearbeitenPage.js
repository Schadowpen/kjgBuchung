/* global veranstaltung, bereiche, eingaenge, plaetze, platzGruppen, selectedElement, ctx, canvas, supersampling, imagesUrl */

/**
 * Alle Panels, die jeweils einen Bereich darstellen
 * @type Array
 */
var bereichePanels = [];
/**
 * Alle Panels, die jeweils einen Eingang darstellen
 * @type Array
 */
var eingaengePanels = [];
/**
 * Alle Panels, die jeweils einen Platz darstellen
 * @type Array
 */
var plaetzePanels = [];
/**
 * Alle Panels, die jeweils eine PlatzGruppe darstellen
 * @type Array
 */
var platzGruppenPanels = [];

// ------------
// | Anzeigen |
// ------------

function initUI() {
    renderUI();
}

function renderUI() {
    // Anzahl
    document.getElementById("bereicheCount").innerHTML = bereiche.length;
    document.getElementById("eingaengeCount").innerHTML = eingaenge.length;
    document.getElementById("plaetzeCount").innerHTML = plaetze.length;
    document.getElementById("platzGruppenCount").innerHTML = platzGruppen.length;

    // Panel neu initialisieren, wenn sich an der Anzahl etwas Ändert
    if (bereiche.length !== bereichePanels.length) {
        bereichePanels = [];
        document.getElementById("bereiche").innerHTML = "";
        for (var i = 0; i < bereiche.length; i++)
            bereichePanels[i] = renderBereich(i);
    }
    if (eingaenge.length !== eingaengePanels.length) {
        eingaengePanels = [];
        document.getElementById("eingaenge").innerHTML = "";
        for (var i = 0; i < eingaenge.length; i++)
            eingaengePanels[i] = renderEingang(i);
    }
    if (plaetze.length !== plaetzePanels.length) {
        plaetzePanels = [];
        document.getElementById("plaetze").innerHTML = "";
        for (var i = 0; i < plaetze.length; i++)
            plaetzePanels[i] = renderPlatz(i);
    }
    if (platzGruppen.length !== platzGruppenPanels.length) {
        platzGruppenPanels = [];
        document.getElementById("platzGruppen").innerHTML = "";
        for (var i = 0; i < platzGruppen.length; i++)
            platzGruppenPanels[i] = renderPlatzGruppe(i);
    }

    // Panels mit aktuellen Daten füllen
    for (var i = 0; i < bereiche.length; i++)
        fillBereichPanel(bereichePanels[i], bereiche[i]);
    for (var i = 0; i < eingaenge.length; i++)
        fillEingangPanel(eingaengePanels[i], eingaenge[i]);
    for (var i = 0; i < plaetze.length; i++)
        fillPlatzPanel(plaetzePanels[i], plaetze[i]);
    for (var i = 0; i < platzGruppen.length; i++)
        fillPlatzGruppenPanel(platzGruppenPanels[i], platzGruppen[i]);

    // Veranstaltung Edit
    document.getElementById("raumBreite").value = veranstaltung.raumBreite;
    document.getElementById("raumLaenge").value = veranstaltung.raumLaenge;
    document.getElementById("sitzBreite").value = veranstaltung.sitzBreite;
    document.getElementById("sitzLaenge").value = veranstaltung.sitzLaenge;
    document.getElementById("laengenEinheit").value = veranstaltung.laengenEinheit;
}


/**
 * Adds a bereichPanel to the DOM
 * @param {Number} index in bereiche
 * @returns {Object} bereichPanel
 */
function renderBereich(index) {
    var bereich = bereiche[index];
    var bereichPanel = {};

    bereichPanel.mainElement = document.createElement("div");
    bereichPanel.mainElement.className = "mainElement";
    bereichPanel.mainElement.onclick = function () {
        selectedElement = {
            type: "Bereich",
            ref: bereich
        };
        renderEverything();
        return true;
    };
    var table = document.createElement("table");
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);
    bereichPanel.mainElement.append(table);

    tbody.appendChild(renderSingleValue("ID:", document.createTextNode(bereich.id)));

    bereichPanel.xPos = document.createElement("input");
    bereichPanel.xPos.type = "number";
    bereichPanel.xPos.step = "any";
    bereichPanel.xPos.onchange = function () {
        var xPos = parseFloat(bereichPanel.xPos.value);
        if (isNaN(xPos))
            return;
        bereich.xPos = xPos;
        setzeBereich(bereich);
    };
    tbody.appendChild(renderSingleValue("xPos:", bereichPanel.xPos));

    bereichPanel.yPos = document.createElement("input");
    bereichPanel.yPos.type = "number";
    bereichPanel.yPos.step = "any";
    bereichPanel.yPos.onchange = function () {
        var yPos = parseFloat(bereichPanel.yPos.value);
        if (isNaN(yPos))
            return;
        bereich.yPos = yPos;
        setzeBereich(bereich);
    };
    tbody.appendChild(renderSingleValue("yPos:", bereichPanel.yPos));

    bereichPanel.breite = document.createElement("input");
    bereichPanel.breite.type = "number";
    bereichPanel.breite.step = "any";
    bereichPanel.breite.onchange = function () {
        var breite = parseFloat(bereichPanel.breite.value);
        if (isNaN(breite))
            return;
        bereich.breite = breite;
        setzeBereich(bereich);
    };
    tbody.appendChild(renderSingleValue("Breite:", bereichPanel.breite));

    bereichPanel.laenge = document.createElement("input");
    bereichPanel.laenge.type = "number";
    bereichPanel.laenge.step = "any";
    bereichPanel.laenge.onchange = function () {
        var laenge = parseFloat(bereichPanel.laenge.value);
        if (isNaN(laenge))
            return;
        bereich.laenge = laenge;
        setzeBereich(bereich);
    };
    tbody.appendChild(renderSingleValue("Länge:", bereichPanel.laenge));

    bereichPanel.farbe = document.createElement("input");
    bereichPanel.farbe.type = "color";
    bereichPanel.farbe.onchange = function () {
        var farbe = bereichPanel.farbe.value;
        bereich.farbe = farbe;
        setzeBereich(bereich);
    };
    tbody.appendChild(renderSingleValue("Farbe:", bereichPanel.farbe));

    bereichPanel.text = document.createElement("input");
    bereichPanel.text.type = "text";
    bereichPanel.text.onchange = function () {
        var text = bereichPanel.text.value;
        bereich.text = text;
        setzeBereich(bereich);
    };
    tbody.appendChild(renderSingleValue("Text:", bereichPanel.text));

    bereichPanel.textXPos = document.createElement("input");
    bereichPanel.textXPos.type = "number";
    bereichPanel.textXPos.step = "any";
    bereichPanel.textXPos.onchange = function () {
        var textXPos = parseFloat(bereichPanel.textXPos.value);
        if (isNaN(textXPos))
            return;
        bereich.textXPos = textXPos;
        setzeBereich(bereich);
    };
    tbody.appendChild(renderSingleValue("Text xPos:", bereichPanel.textXPos));

    bereichPanel.textYPos = document.createElement("input");
    bereichPanel.textYPos.type = "number";
    bereichPanel.textYPos.step = "any";
    bereichPanel.textYPos.onchange = function () {
        var textYPos = parseFloat(bereichPanel.textYPos.value);
        if (isNaN(textYPos))
            return;
        bereich.textYPos = textYPos;
        setzeBereich(bereich);
    };
    tbody.appendChild(renderSingleValue("Text yPos:", bereichPanel.textYPos));

    bereichPanel.textFarbe = document.createElement("input");
    bereichPanel.textFarbe.type = "color";
    bereichPanel.textFarbe.onchange = function () {
        var textFarbe = bereichPanel.textFarbe.value;
        bereich.textFarbe = textFarbe;
        setzeBereich(bereich);
    };
    tbody.appendChild(renderSingleValue("Text Farbe:", bereichPanel.textFarbe));

    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<img src="' + imagesUrl + '/bin.png" class="buttonImage"/> Löschen';
    deleteButton.onclick = function () {
        loescheBereich(bereich.id);
    };
    tbody.appendChild(renderButton(deleteButton));

    document.getElementById("bereiche").appendChild(bereichPanel.mainElement);
    return bereichPanel;
}

function renderEingang(index) {
    var eingang = eingaenge[index];
    var eingangPanel = {};

    eingangPanel.mainElement = document.createElement("div");
    eingangPanel.mainElement.className = "mainElement";
    eingangPanel.mainElement.onclick = function (event) {
        selectedElement = {
            type: "Eingang",
            ref: eingang
        };
        renderEverything();
    };
    var table = document.createElement("table");
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);
    eingangPanel.mainElement.append(table);

    tbody.appendChild(renderSingleValue("ID:", document.createTextNode(eingang.id)));

    eingangPanel.x0 = document.createElement("input");
    eingangPanel.x0.type = "number";
    eingangPanel.x0.step = "any";
    eingangPanel.x0.onchange = function () {
        var x0 = parseFloat(eingangPanel.x0.value);
        if (isNaN(x0))
            return;
        eingang.x0 = x0;
        setzeEingang(eingang);
    };
    tbody.appendChild(renderSingleValue("x0:", eingangPanel.x0));

    eingangPanel.y0 = document.createElement("input");
    eingangPanel.y0.type = "number";
    eingangPanel.y0.step = "any";
    eingangPanel.y0.onchange = function () {
        var y0 = parseFloat(eingangPanel.y0.value);
        if (isNaN(y0))
            return;
        eingang.y0 = y0;
        setzeEingang(eingang);
    };
    tbody.appendChild(renderSingleValue("y0:", eingangPanel.y0));

    eingangPanel.x1 = document.createElement("input");
    eingangPanel.x1.type = "number";
    eingangPanel.x1.step = "any";
    eingangPanel.x1.onchange = function () {
        var x1 = parseFloat(eingangPanel.x1.value);
        if (isNaN(x1))
            return;
        eingang.x1 = x1;
        setzeEingang(eingang);
    };
    tbody.appendChild(renderSingleValue("x1:", eingangPanel.x1));

    eingangPanel.y1 = document.createElement("input");
    eingangPanel.y1.type = "number";
    eingangPanel.y1.step = "any";
    eingangPanel.y1.onchange = function () {
        var y1 = parseFloat(eingangPanel.y1.value);
        if (isNaN(y1))
            return;
        eingang.y1 = y1;
        setzeEingang(eingang);
    };
    tbody.appendChild(renderSingleValue("y1:", eingangPanel.y1));

    eingangPanel.x2 = document.createElement("input");
    eingangPanel.x2.type = "number";
    eingangPanel.x2.step = "any";
    eingangPanel.x2.onchange = function () {
        var x2 = parseFloat(eingangPanel.x2.value);
        if (isNaN(x2))
            return;
        eingang.x2 = x2;
        setzeEingang(eingang);
    };
    tbody.appendChild(renderSingleValue("x2:", eingangPanel.x2));

    eingangPanel.y2 = document.createElement("input");
    eingangPanel.y2.type = "number";
    eingangPanel.y2.step = "any";
    eingangPanel.y2.onchange = function () {
        var y2 = parseFloat(eingangPanel.y2.value);
        if (isNaN(y2))
            return;
        eingang.y2 = y2;
        setzeEingang(eingang);
    };
    tbody.appendChild(renderSingleValue("y2:", eingangPanel.y2));

    eingangPanel.x3 = document.createElement("input");
    eingangPanel.x3.type = "number";
    eingangPanel.x3.step = "any";
    eingangPanel.x3.onchange = function () {
        var x3 = parseFloat(eingangPanel.x3.value);
        if (isNaN(x3))
            return;
        eingang.x3 = x3;
        setzeEingang(eingang);
    };
    tbody.appendChild(renderSingleValue("x3:", eingangPanel.x3));

    eingangPanel.y3 = document.createElement("input");
    eingangPanel.y3.type = "number";
    eingangPanel.y3.step = "any";
    eingangPanel.y3.onchange = function () {
        var y3 = parseFloat(eingangPanel.y3.value);
        if (isNaN(y3))
            return;
        eingang.y3 = y3;
        setzeEingang(eingang);
    };
    tbody.appendChild(renderSingleValue("y3:", eingangPanel.y3));

    eingangPanel.text = document.createElement("input");
    eingangPanel.text.type = "text";
    eingangPanel.text.onchange = function () {
        var text = eingangPanel.text.value;
        eingang.text = text;
        setzeEingang(eingang);
    };
    tbody.appendChild(renderSingleValue("Text:", eingangPanel.text));

    eingangPanel.textXPos = document.createElement("input");
    eingangPanel.textXPos.type = "number";
    eingangPanel.textXPos.step = "any";
    eingangPanel.textXPos.onchange = function () {
        var textXPos = parseFloat(eingangPanel.textXPos.value);
        if (isNaN(textXPos))
            return;
        eingang.textXPos = textXPos;
        setzeEingang(eingang);
    };
    tbody.appendChild(renderSingleValue("Text xPos:", eingangPanel.textXPos));

    eingangPanel.textYPos = document.createElement("input");
    eingangPanel.textYPos.type = "number";
    eingangPanel.textYPos.step = "any";
    eingangPanel.textYPos.onchange = function () {
        var textYPos = parseFloat(eingangPanel.textYPos.value);
        if (isNaN(textYPos))
            return;
        eingang.textYPos = textYPos;
        setzeEingang(eingang);
    };
    tbody.appendChild(renderSingleValue("Text yPos:", eingangPanel.textYPos));

    eingangPanel.eingang = document.createElement("input");
    eingangPanel.eingang.type = "number";
    eingangPanel.eingang.onchange = function () {
        var value = parseInt(eingangPanel.eingang.value);
        if (isNaN(value))
            value = null;
        eingang.eingang = value;
        setzeEingang(eingang);
    };
    eingangPanel.eingangButton = document.createElement("button");
    eingangPanel.eingangButton.onclick = function (e) {
        initEingangSelection("Wähle Eingang, der zum markierten Eingang führt", function (clickedEingang) {
            eingangPanel.eingang.value = clickedEingang.id;
            eingang.eingang = clickedEingang.id;
            setzeEingang(eingang);
        });
    };
    var buttonImage = document.createElement("img");
    buttonImage.src = imagesUrl + "edit.png";
    buttonImage.className = "buttonImage";
    eingangPanel.eingangButton.appendChild(buttonImage);
    var eingangDiv = document.createElement("div");
    eingangDiv.className = "fieldWithButton";
    eingangDiv.appendChild(eingangPanel.eingang);
    eingangDiv.appendChild(eingangPanel.eingangButton);
    tbody.appendChild(renderSingleValue("Eingang ID:", eingangDiv));

    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<img src="' + imagesUrl + '/bin.png" class="buttonImage"/> Löschen';
    deleteButton.onclick = function () {
        loescheEingang(eingang.id);
    };
    tbody.appendChild(renderButton(deleteButton));

    document.getElementById("eingaenge").appendChild(eingangPanel.mainElement);
    return eingangPanel;
}

/**
 * Adds a platzPanel to the DOM
 * @param {Object} index
 * @returns {Object} platzPanel
 */
function renderPlatz(index) {
    var platz = plaetze[index];
    var platzPanel = {};

    platzPanel.mainElement = document.createElement("div");
    platzPanel.mainElement.className = "mainElement";
    platzPanel.mainElement.onclick = function () {
        selectedElement = {
            type: "Platz",
            ref: platz
        };
        renderEverything();
    };
    var table = document.createElement("table");
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);
    platzPanel.mainElement.append(table);

    platzPanel.block = document.createElement("input");
    platzPanel.block.type = "text";
    platzPanel.block.onchange = function () {
        var oldPlatz = Object.assign({}, platz);
        var block = platzPanel.block.value;
        if (block === "")
            return;
        platz.block = block;
        if (platzWithIdExists(platz)) // temporär doppelte ID
            return;
        setzePlatz(platz, oldPlatz);
    };
    tbody.appendChild(renderSingleValue("Block:", platzPanel.block));

    platzPanel.reihe = document.createElement("input");
    platzPanel.reihe.type = "text";
    platzPanel.reihe.onchange = function () {
        var oldPlatz = Object.assign({}, platz);
        var reihe = platzPanel.reihe.value;
        if (reihe.length !== 1)
            return;
        platz.reihe = reihe;
        if (platzWithIdExists(platz)) // temporär doppelte ID
            return;
        setzePlatz(platz, oldPlatz);
    };
    tbody.appendChild(renderSingleValue("Reihe:", platzPanel.reihe));

    platzPanel.platz = document.createElement("input");
    platzPanel.platz.type = "number";
    platzPanel.platz.onchange = function () {
        var oldPlatz = Object.assign({}, platz);
        var value = parseInt(platzPanel.platz.value);
        if (isNaN(value))
            return;
        platz.platz = value;
        if (platzWithIdExists(platz)) // temporär doppelte ID
            return;
        setzePlatz(platz, oldPlatz);
    };
    tbody.appendChild(renderSingleValue("Platz:", platzPanel.platz));

    platzPanel.xPos = document.createElement("input");
    platzPanel.xPos.type = "number";
    platzPanel.xPos.step = "any";
    platzPanel.xPos.onchange = function () {
        var oldPlatz = Object.assign({}, platz);
        var xPos = parseFloat(platzPanel.xPos.value);
        if (isNaN(xPos))
            return;
        platz.xPos = xPos;
        setzePlatz(platz, oldPlatz);
    };
    tbody.appendChild(renderSingleValue("xPos:", platzPanel.xPos));

    platzPanel.yPos = document.createElement("input");
    platzPanel.yPos.type = "number";
    platzPanel.yPos.step = "any";
    platzPanel.yPos.onchange = function () {
        var oldPlatz = Object.assign({}, platz);
        var yPos = parseFloat(platzPanel.yPos.value);
        if (isNaN(yPos))
            return;
        platz.yPos = yPos;
        setzePlatz(platz, oldPlatz);
    };
    tbody.appendChild(renderSingleValue("yPos:", platzPanel.yPos));

    platzPanel.rotation = document.createElement("input");
    platzPanel.rotation.type = "number";
    platzPanel.rotation.step = "any";
    platzPanel.rotation.onchange = function () {
        var oldPlatz = Object.assign({}, platz);
        var rotation = parseFloat(platzPanel.rotation.value);
        if (isNaN(rotation))
            return;
        platz.rotation = rotation;
        setzePlatz(platz, oldPlatz);
    };
    tbody.appendChild(renderSingleValue("Rotation:", platzPanel.rotation));

    platzPanel.eingang = document.createElement("input");
    platzPanel.eingang.type = "number";
    platzPanel.eingang.onchange = function () {
        var oldPlatz = Object.assign({}, platz);
        var eingang = parseInt(platzPanel.eingang.value);
        if (isNaN(eingang))
            eingang = null;
        platz.eingang = eingang;
        setzePlatz(platz, oldPlatz);
    };
    platzPanel.eingangButton = document.createElement("button");
    platzPanel.eingangButton.onclick = function (e) {
        initEingangSelection("Wähle Eingang, der zum markierten Platz führt", function (clickedEingang) {
            var oldPlatz = Object.assign({}, platz);
            platzPanel.eingang.value = clickedEingang.id;
            platz.eingang = clickedEingang.id;
            setzePlatz(platz, oldPlatz);
        });
    };
    var buttonImage = document.createElement("img");
    buttonImage.src = imagesUrl + "edit.png";
    buttonImage.className = "buttonImage";
    platzPanel.eingangButton.appendChild(buttonImage);
    var eingangDiv = document.createElement("div");
    eingangDiv.className = "fieldWithButton";
    eingangDiv.appendChild(platzPanel.eingang);
    eingangDiv.appendChild(platzPanel.eingangButton);
    tbody.appendChild(renderSingleValue("Eingang ID:", eingangDiv));

    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<img src="' + imagesUrl + '/bin.png" class="buttonImage"/> Löschen';
    deleteButton.onclick = function () {
        loeschePlatz(platz.block, platz.reihe, platz.platz);
    };
    tbody.appendChild(renderButton(deleteButton));

    document.getElementById("plaetze").appendChild(platzPanel.mainElement);
    return platzPanel;
}

/**
 * Adds a platzGruppenPanel to the DOM
 * @param {type} index
 * @returns {platzPanel}
 */
function renderPlatzGruppe(index) {
    var platzGruppe = platzGruppen[index];
    var platzGruppenPanel = {};

    platzGruppenPanel.mainElement = document.createElement("div");
    platzGruppenPanel.mainElement.className = "mainElement";
    platzGruppenPanel.mainElement.onclick = function () {
        selectedElement = {
            type: "PlatzGruppe",
            ref: platzGruppe
        };
        renderEverything();
    };
    var table = document.createElement("table");
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);
    platzGruppenPanel.mainElement.append(table);

    tbody.appendChild(renderSingleValue("ID:", document.createTextNode(platzGruppe.id)));

    platzGruppenPanel.block = document.createElement("input");
    platzGruppenPanel.block.type = "text";
    platzGruppenPanel.block.onchange = function () {
        var block = platzGruppenPanel.block.value;
        if (block === "")
            return;
        platzGruppe.block = block;
        setzePlatzGruppe(platzGruppe);
    };
    tbody.appendChild(renderSingleValue("Block:", platzGruppenPanel.block));

    platzGruppenPanel.reiheVorne = document.createElement("input");
    platzGruppenPanel.reiheVorne.type = "text";
    platzGruppenPanel.reiheVorne.onchange = function () {
        var reiheVorne = platzGruppenPanel.reiheVorne.value;
        if (reiheVorne.length !== 1)
            return;
        platzGruppe.reiheVorne = reiheVorne;
        setzePlatzGruppe(platzGruppe);
    };
    tbody.appendChild(renderSingleValue("Reihe Vorne:", platzGruppenPanel.reiheVorne));

    platzGruppenPanel.reiheHinten = document.createElement("input");
    platzGruppenPanel.reiheHinten.type = "text";
    platzGruppenPanel.reiheHinten.onchange = function () {
        var reiheHinten = platzGruppenPanel.reiheHinten.value;
        if (reiheHinten.length !== 1)
            return;
        platzGruppe.reiheHinten = reiheHinten;
        setzePlatzGruppe(platzGruppe);
    };
    tbody.appendChild(renderSingleValue("Reihe Hinten:", platzGruppenPanel.reiheHinten));

    platzGruppenPanel.reiheAbstand = document.createElement("input");
    platzGruppenPanel.reiheAbstand.type = "number";
    platzGruppenPanel.reiheAbstand.step = "any";
    platzGruppenPanel.reiheAbstand.onchange = function () {
        var reiheAbstand = parseFloat(platzGruppenPanel.reiheAbstand.value);
        if (isNaN(reiheAbstand))
            return;
        platzGruppe.reiheAbstand = reiheAbstand;
        setzePlatzGruppe(platzGruppe);
    };
    tbody.appendChild(renderSingleValue("Reihe Abstand:", platzGruppenPanel.reiheAbstand));

    platzGruppenPanel.platzLinks = document.createElement("input");
    platzGruppenPanel.platzLinks.type = "number";
    platzGruppenPanel.platzLinks.onchange = function () {
        var platzLinks = parseInt(platzGruppenPanel.platzLinks.value);
        if (isNaN(platzLinks))
            return;
        platzGruppe.platzLinks = platzLinks;
        setzePlatzGruppe(platzGruppe);
    };
    tbody.appendChild(renderSingleValue("Platz Links:", platzGruppenPanel.platzLinks));

    platzGruppenPanel.platzRechts = document.createElement("input");
    platzGruppenPanel.platzRechts.type = "number";
    platzGruppenPanel.platzRechts.onchange = function () {
        var platzRechts = parseFloat(platzGruppenPanel.platzRechts.value);
        if (isNaN(platzRechts))
            return;
        platzGruppe.platzRechts = platzRechts;
        setzePlatzGruppe(platzGruppe);
    };
    tbody.appendChild(renderSingleValue("Platz Rechts:", platzGruppenPanel.platzRechts));

    platzGruppenPanel.platzAbstand = document.createElement("input");
    platzGruppenPanel.platzAbstand.type = "number";
    platzGruppenPanel.platzAbstand.step = "any";
    platzGruppenPanel.platzAbstand.onchange = function () {
        var platzAbstand = parseFloat(platzGruppenPanel.platzAbstand.value);
        if (isNaN(platzAbstand))
            return;
        platzGruppe.platzAbstand = platzAbstand;
        setzePlatzGruppe(platzGruppe);
    };
    tbody.appendChild(renderSingleValue("Platz Abstand:", platzGruppenPanel.platzAbstand));

    platzGruppenPanel.xPos = document.createElement("input");
    platzGruppenPanel.xPos.type = "number";
    platzGruppenPanel.xPos.step = "any";
    platzGruppenPanel.xPos.onchange = function () {
        var xPos = parseFloat(platzGruppenPanel.xPos.value);
        if (isNaN(xPos))
            return;
        platzGruppe.xPos = xPos;
        setzePlatzGruppe(platzGruppe);
    };
    tbody.appendChild(renderSingleValue("xPos:", platzGruppenPanel.xPos));

    platzGruppenPanel.yPos = document.createElement("input");
    platzGruppenPanel.yPos.type = "number";
    platzGruppenPanel.yPos.step = "any";
    platzGruppenPanel.yPos.onchange = function () {
        var yPos = parseFloat(platzGruppenPanel.yPos.value);
        if (isNaN(yPos))
            return;
        platzGruppe.yPos = yPos;
        setzePlatzGruppe(platzGruppe);
    };
    tbody.appendChild(renderSingleValue("yPos:", platzGruppenPanel.yPos));

    platzGruppenPanel.rotation = document.createElement("input");
    platzGruppenPanel.rotation.type = "number";
    platzGruppenPanel.rotation.step = "any";
    platzGruppenPanel.rotation.onchange = function () {
        var rotation = parseFloat(platzGruppenPanel.rotation.value);
        if (isNaN(rotation))
            return;
        platzGruppe.rotation = rotation;
        setzePlatzGruppe(platzGruppe);
    };
    tbody.appendChild(renderSingleValue("Rotation:", platzGruppenPanel.rotation));

    platzGruppenPanel.eingang = document.createElement("input");
    platzGruppenPanel.eingang.type = "number";
    platzGruppenPanel.eingang.onchange = function () {
        var eingang = parseInt(platzGruppenPanel.eingang.value);
        if (isNaN(eingang))
            return;
        platzGruppe.eingang = eingang;
        setzePlatzGruppe(platzGruppe);
    };
    platzGruppenPanel.eingangButton = document.createElement("button");
    platzGruppenPanel.eingangButton.onclick = function (e) {
        initEingangSelection("Wähle Eingang, der zur markierten Platzgruppe führt", function (clickedEingang) {
            platzGruppenPanel.eingang.value = clickedEingang.id;
            platzGruppe.eingang = clickedEingang.id;
            setzePlatzGruppe(platzGruppe);
        });
    };
    var buttonImage = document.createElement("img");
    buttonImage.src = imagesUrl + "edit.png";
    buttonImage.className = "buttonImage";
    platzGruppenPanel.eingangButton.appendChild(buttonImage);
    var eingangDiv = document.createElement("div");
    eingangDiv.className = "fieldWithButton";
    eingangDiv.appendChild(platzGruppenPanel.eingang);
    eingangDiv.appendChild(platzGruppenPanel.eingangButton);
    tbody.appendChild(renderSingleValue("Eingang ID:", eingangDiv));

    var splitButton = document.createElement("button");
    splitButton.innerHTML = '<img src="' + imagesUrl + '/split.png" class="buttonImage"/> In Plätze aufsplitten';
    splitButton.onclick = function () {
        splitPlatzGruppe(platzGruppe.id);
    };
    tbody.appendChild(renderButton(splitButton));

    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<img src="' + imagesUrl + '/bin.png" class="buttonImage"/> Löschen';
    deleteButton.onclick = function () {
        loeschePlatzGruppe(platzGruppe.id);
    };
    tbody.appendChild(renderButton(deleteButton));

    document.getElementById("platzGruppen").appendChild(platzGruppenPanel.mainElement);
    return platzGruppenPanel;
}


/**
 * Renders one Value into the Panel
 * @param {string} text name of the value
 * @param {DOMElement} inputElement Input Element to alter the value
 * @returns {Element}
 */
function renderSingleValue(text, inputElement) {
    var td1 = document.createElement("td");
    td1.innerHTML = text.escapeHTML();
    var td2 = document.createElement("td");
    td2.appendChild(inputElement);
    var tr = document.createElement("tr");
    tr.appendChild(td1);
    tr.appendChild(td2);
    return tr;
}

/**
 * Renders a Button into the Panel.
 * @param {type} button
 * @returns {Element}
 */
function renderButton(button) {
    var td = document.createElement("td");
    td.colSpan = 2;
    td.appendChild(button);
    var tr = document.createElement("tr");
    tr.appendChild(td);
    return tr;
}


/**
 * Fills the bereichPanel with data from bereich
 * @param {type} bereichPanel
 * @param {type} bereich
 */
function fillBereichPanel(bereichPanel, bereich) {
    bereichPanel.xPos.value = bereich.xPos;
    bereichPanel.yPos.value = bereich.yPos;
    bereichPanel.breite.value = bereich.breite;
    bereichPanel.laenge.value = bereich.laenge;
    bereichPanel.farbe.value = bereich.farbe;
    bereichPanel.text.value = bereich.text;
    bereichPanel.textXPos.value = bereich.textXPos;
    bereichPanel.textYPos.value = bereich.textYPos;
    bereichPanel.textFarbe.value = bereich.textFarbe;
    if (selectedElement.type === "Bereich" && selectedElement.ref.id === bereich.id)
        bereichPanel.mainElement.className = "mainElement selected";
    else
        bereichPanel.mainElement.className = "mainElement";
}

/**
 * Fills the eingangPanel with data from eingang
 * @param {type} eingangPanel
 * @param {type} eingang
 */
function fillEingangPanel(eingangPanel, eingang) {
    eingangPanel.x0.value = eingang.x0;
    eingangPanel.y0.value = eingang.y0;
    eingangPanel.x1.value = eingang.x1;
    eingangPanel.y1.value = eingang.y1;
    eingangPanel.x2.value = eingang.x2;
    eingangPanel.y2.value = eingang.y2;
    eingangPanel.x3.value = eingang.x3;
    eingangPanel.y3.value = eingang.y3;
    eingangPanel.text.value = eingang.text == null ? "" : eingang.text;
    eingangPanel.textXPos.value = eingang.textXPos;
    eingangPanel.textYPos.value = eingang.textYPos;
    eingangPanel.eingang.value = eingang.eingang == null ? "" : eingang.eingang;
    if (selectedElement.type === "Eingang" && selectedElement.ref.id === eingang.id)
        eingangPanel.mainElement.className = "mainElement selected";
    else
        eingangPanel.mainElement.className = "mainElement";
}

/**
 * Fills the platzPanel with data from platz
 * @param {type} platzPanel
 * @param {type} platz
 */
function fillPlatzPanel(platzPanel, platz) {
    platzPanel.block.value = platz.block;
    platzPanel.reihe.value = platz.reihe;
    platzPanel.platz.value = platz.platz;
    platzPanel.xPos.value = platz.xPos;
    platzPanel.yPos.value = platz.yPos;
    platzPanel.rotation.value = platz.rotation;
    platzPanel.eingang.value = platz.eingang == null ? "" : platz.eingang;
    if (selectedElement.type === "Platz" && seatIdentical(selectedElement.ref, platz))
        platzPanel.mainElement.className = "mainElement selected";
    else
        platzPanel.mainElement.className = "mainElement";
}

/**
 * Fills the platzGruppenPanel with data from platzGruppe
 * @param {type} platzGruppenPanel
 * @param {type} platzGruppe
 */
function fillPlatzGruppenPanel(platzGruppenPanel, platzGruppe) {
    platzGruppenPanel.block.value = platzGruppe.block;
    platzGruppenPanel.reiheVorne.value = platzGruppe.reiheVorne;
    platzGruppenPanel.reiheHinten.value = platzGruppe.reiheHinten;
    platzGruppenPanel.reiheAbstand.value = platzGruppe.reiheAbstand;
    platzGruppenPanel.platzLinks.value = platzGruppe.platzLinks;
    platzGruppenPanel.platzRechts.value = platzGruppe.platzRechts;
    platzGruppenPanel.platzAbstand.value = platzGruppe.platzAbstand;
    platzGruppenPanel.xPos.value = platzGruppe.xPos;
    platzGruppenPanel.yPos.value = platzGruppe.yPos;
    platzGruppenPanel.rotation.value = platzGruppe.rotation;
    platzGruppenPanel.eingang.value = platzGruppe.eingang == null ? "" : platzGruppe.eingang
    if (selectedElement.type === "PlatzGruppe" && selectedElement.ref.id === platzGruppe.id)
        platzGruppenPanel.mainElement.className = "mainElement selected";
    else
        platzGruppenPanel.mainElement.className = "mainElement";
}

// ------------------------
// | Eingaben verarbeiten |
// ------------------------

function addBereich() {
    setzeBereich({
        id: -1,
        xPos: 0,
        yPos: 0,
        breite: 1,
        laenge: 1,
        farbe: "#808080",
        text: "",
        textXPos: 0.5,
        textYPos: 0.5,
        textFarbe: "#000000"
    }, function (bereich) {
        // wenn neues Element, dann als selected setzen
        selectedElement = {
            type: "Bereich",
            ref: bereich
        };
        renderEverything();
        scrollToSelected();
    });
}

function addEingang() {
    setzeEingang({
        id: -1,
        x0: 1,
        y0: 1,
        x1: 2,
        y1: 1,
        x2: 2,
        y2: 2,
        x3: 3,
        y3: 2,
        text: null,
        textXPos: 2,
        textYPos: 1.5,
        eingang: null
    }, function (eingang) {
        // neues Element als selected setzen
        selectedElement = {
            type: "Eingang",
            ref: eingang
        };
        renderEverything();
        scrollToSelected();
    });
}

function addPlatz() {
    var newPlatz = {
        block: "unknown",
        reihe: "A",
        platz: 1,
        xPos: 1,
        yPos: 1,
        rotation: 0,
        eingang: null
    };
    while (platzWithIdExists(newPlatz))
        newPlatz.platz ++;
    setzePlatz(newPlatz, null, function (platz) {
        // neues Element als selected setzen
        selectedElement = {
            type: "Platz",
            ref: platz
        };
        renderEverything();
        scrollToSelected();
    });
}

function addPlatzGruppe() {
    setzePlatzGruppe({
        id: -1,
        block: "unknown",
        reiheVorne: "A",
        reiheHinten: "B",
        reiheAbstand: 1,
        platzLinks: 1,
        platzRechts: 2,
        platzAbstand: 1,
        xPos: 1,
        yPos: 1,
        rotation: 0,
        eingang: null
    }, function (platzGruppe) {
        // neues Element als selected setzen
        selectedElement = {
            type: "PlatzGruppe",
            ref: platzGruppe
        };
        renderEverything();
        scrollToSelected();
    });
}

/**
 * Gibt zurück, ob ein Platz mit der selben ID (Block, Reihe, Platz) bereits existiert
 * @param {Object} platz
 * @returns {Boolean}
 */
function platzWithIdExists(platz) {
    for (var i = 0; i < plaetze.length; i++) {
        var otherPlatz = plaetze[i];
        if (otherPlatz.block === platz.block
                && otherPlatz.reihe === platz.reihe
                && otherPlatz.platz === platz.platz)
            return true;
    }
    return false;
}

function onRaumBreiteChange() {
    var raumBreite = parseFloat(document.getElementById("raumBreite").value);
    if (isNaN(raumBreite))
        return;
    setzeVeranstaltung(raumBreite, veranstaltung.raumLaenge, veranstaltung.sitzBreite, veranstaltung.sitzLaenge, veranstaltung.laengenEinheit, veranstaltung.kartenPreis, veranstaltung.versandPreis);
}

function onRaumLaengeChange() {
    var raumLaenge = parseFloat(document.getElementById("raumLaenge").value);
    if (isNaN(raumLaenge))
        return;
    setzeVeranstaltung(veranstaltung.raumBreite, raumLaenge, veranstaltung.sitzBreite, veranstaltung.sitzLaenge, veranstaltung.laengenEinheit, veranstaltung.kartenPreis, veranstaltung.versandPreis);
}

function onSitzBreiteChange() {
    var sitzBreite = parseFloat(document.getElementById("sitzBreite").value);
    if (isNaN(sitzBreite))
        return;
    setzeVeranstaltung(veranstaltung.raumBreite, veranstaltung.raumLaenge, sitzBreite, veranstaltung.sitzLaenge, veranstaltung.laengenEinheit, veranstaltung.kartenPreis, veranstaltung.versandPreis);
}

function onSitzLaengeChange() {
    var sitzLaenge = parseFloat(document.getElementById("sitzLaenge").value);
    if (isNaN(sitzLaenge))
        return;
    setzeVeranstaltung(veranstaltung.raumBreite, veranstaltung.raumLaenge, veranstaltung.sitzBreite, sitzLaenge, veranstaltung.laengenEinheit, veranstaltung.kartenPreis, veranstaltung.versandPreis);
}

function onLaengenEinheitChange() {
    var laengenEinheit = document.getElementById("laengenEinheit").value;
    setzeVeranstaltung(veranstaltung.raumBreite, veranstaltung.raumLaenge, veranstaltung.sitzBreite, veranstaltung.sitzLaenge, laengenEinheit, veranstaltung.kartenPreis, veranstaltung.versandPreis);
}

// -----------------------------------
// | Elemente auswählen und anzeigen |
// -----------------------------------

/**
 * Ob gerade ein Eingang ausgewählt wird. Falls ja, soll das Element-Auswählen ersetzt werden.
 * @type Boolean
 */
var selectEingang = false;
/**
 * Nachricht, die angezeigt wird, solange ein Eingang ausgewählt werden soll
 * @type String
 */
var eingangSelectMessage = "";
/**
 * Funktion, die aufgerufen wird, wenn ein Eingang angeklickt wird
 * @type function
 */
var eingangSelectedReturnFunc = null;

function onElementClicked(clickedElement) {
    if (selectEingang === false) {
        selectedElement = clickedElement;
        scrollToSelected();
        renderUI();
    } else {
        if (clickedElement.type === "Eingang")
            eingangSelectedReturnFunc(clickedElement.ref);
        selectEingang = false;
        setClickable(true, true, true, true);
    }
}

/**
 * Scrollt zu dem selectedElement in dem jeweiligen Panel
 */
function scrollToSelected() {
    switch (selectedElement.type) {
        case "Bereich":
            for (var i = 0; i < bereiche.length; i++) {
                if (bereiche[i].id === selectedElement.ref.id) {
                    document.getElementById("bereiche").scrollTop = bereichePanels[i].mainElement.offsetTop - document.getElementById("bereiche").offsetTop;
                    break;
                }
            }
            break;
        case "Eingang":
        for (var i = 0; i < eingaenge.length; i++) {
            if (eingaenge[i].id === selectedElement.ref.id) {
                document.getElementById("eingaenge").scrollTop = eingaengePanels[i].mainElement.offsetTop - document.getElementById("bereiche").offsetTop;
                break;
            }
        }
        case "Platz":
        for (var i = 0; i < plaetze.length; i++) {
            if (seatIdentical(plaetze[i], selectedElement.ref)) {
                document.getElementById("plaetze").scrollTop = plaetzePanels[i].mainElement.offsetTop - document.getElementById("plaetze").offsetTop;
                break;
            }
        }
        case "PlatzGruppe":
            for (var i = 0; i < platzGruppen.length; i++) {
                if (platzGruppen[i].id === selectedElement.ref.id) {
                    document.getElementById("platzGruppen").scrollTop = platzGruppenPanels[i].mainElement.offsetTop - document.getElementById("platzGruppen").offsetTop;
                    break;
                }
            }
            break;
    }
}

/**
 * Initialisiert das Auswählen eines Einganges
 * @param {string} canvasMessage Nachricht, die kurz im Canvas angezeigt werden soll 
 * @param {function} returnFunc Funktion wird aufgerufen, wenn ein Canvas ausgewählt wurde
 */
function initEingangSelection(canvasMessage, returnFunc) {
    eingangSelectedReturnFunc = returnFunc;
    eingangSelectMessage = canvasMessage;
    selectEingang = true;

    // setze nur Eingänge als Clickable
    setClickable(false, true, false, false);

    // zeichne Hinweis ins Canvas
    drawCanvasOverlay();
}

/**
 * Zeichnet zusätzliches Overlay über Canvas
 */
function drawCanvasOverlay() {
    // render Hinweis, was
    if (selectEingang && ctx) {
        ctx.fillStyle = "#00000030";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = "32px Times New Roman";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(eingangSelectMessage, canvas.width / 2, canvas.height / 2);
    }
}
