/* global objectsToLoad, apiUrl, urlForVorgangPage, vorstellungen, archiveDatabase, sitzplan, urlForArchiv */

/**
 * Index of the date and time, which Vorstellung should be displayed
 * @type Number
 */
var selectedDateIndex = 0;

/**
 * Daten über die gesamte Veranstaltung
 * @type Object
 */
var veranstaltung = null;

/**
 * Alle Vorgänge für die Veranstaltung
 * @type Array
 */
var vorgaenge = null;

/**
 * Daten für die Gesamtübersicht
 * @type Object
 */
var uebersichtData = null;

/**
 * Vorgang, der angezeigt wird. null, wenn kein Vorgang angezeigt wird.
 * @type Object|null
 */
var selectedVorgang = null;

/**
 * Lädt Daten zusätzlich zu data.js
 */
function loadUI() {
    objectsToLoad += 3;
    
    if (archiveDatabase == null) {
        location.href = urlForArchiv;
        return;
    }
    
    var xmlHttp1;
    try {
        xmlHttp1 = new XMLHttpRequest();
    } catch (e) {
        // Fehlerbehandlung, wenn die Schnittstelle vom Browser nicht unterstützt wird.
        alert("XMLHttpRequest wird von ihrem Browser nicht unterstützt.");
    }
    if (xmlHttp1) {
        // lade Veranstaltung
        xmlHttp1.open('GET', apiUrl + "getVeranstaltung.php" + "?archive=" + encodeURIComponent(archiveDatabase), true);
        xmlHttp1.onreadystatechange = function () {
            if (xmlHttp1.readyState === 4) {
                if (xmlHttp1.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp1.status;
                if (xmlHttp1.responseText.startsWith("Error:"))
                    throw xmlHttp1.responseText;

                veranstaltung = JSON.parse(xmlHttp1.responseText);
                loadingComplete();
            }
        };
        xmlHttp1.send(null);

        // lade Vorgänge
        var xmlHttp2 = new XMLHttpRequest();
        xmlHttp2.open('GET', apiUrl + "getVorgaengeWithInfo.php" + "?archive=" + encodeURIComponent(archiveDatabase) + "&key=" + getKey(), true);
        xmlHttp2.onreadystatechange = function () {
            if (xmlHttp2.readyState === 4) {
                if (xmlHttp2.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp2.status;
                if (xmlHttp2.responseText.startsWith("Error:"))
                    throw xmlHttp2.responseText;

                vorgaenge = JSON.parse(xmlHttp2.responseText);
                loadingComplete();
            }
        };
        xmlHttp2.send(null);


        // lade Übersicht
        var xmlHttp3 = new XMLHttpRequest();
        xmlHttp3.open('GET', apiUrl + "getUebersicht.php" + "?archive=" + encodeURIComponent(archiveDatabase) + "&key=" + getKey(), true);
        xmlHttp3.onreadystatechange = function () {
            if (xmlHttp3.readyState === 4) {
                if (xmlHttp3.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp3.status;
                if (xmlHttp3.responseText.startsWith("Error:"))
                    throw xmlHttp3.responseText;

                uebersichtData = JSON.parse(xmlHttp3.responseText);
                loadingComplete();
            }
        };
        xmlHttp3.send(null);
    }
}

/**
 * Initializes the UI, called from data.js
 */
function initUI() {
    // Date Selector
    var dateSelector = document.getElementById("date");
    for (var i = 0; i < vorstellungen.length; i++) {
        var opt = document.createElement("option");
        opt.text = vorstellungen[i].date + "  " + vorstellungen[i].time;
        dateSelector.options.add(opt);
    }
    dateSelector.options.selectedIndex = 0;


    // init additional vorgang fields
    if (sitzplan.additionalFieldsForVorgang != null) {
        var vorgangTable = document.getElementById("vorgangTable");
        for (i = 0; i < sitzplan.additionalFieldsForVorgang.length; i++) {
            var additionalField = sitzplan.additionalFieldsForVorgang[i];
            var td1 = document.createElement("td");
            td1.innerHTML = additionalField.description.escapeHTML() + ":";
            var td2 = document.createElement("td");
            td2.id = "vorgang" + additionalField.fieldName;
            var tr = document.createElement("tr");
            tr.appendChild(td1);
            tr.appendChild(td2);
            vorgangTable.appendChild(tr);
        }
    }
    

    // Suche
    // Vorstellungen selektieren
    var vorgangVorstellung = document.getElementById("sucheVorgangVorstellung");
    for (var i = 0; i < vorstellungen.length; i++) {
        var opt = document.createElement("option");
        opt.text = vorstellungen[i].date + "  " + vorstellungen[i].time;
        vorgangVorstellung.options.add(opt);
    }
    vorgangVorstellung.options.selectedIndex = 0;

    // alle Vorgänge in DOM einfügen
    var liste = document.getElementById("vorgangListe");
    while (liste.firstChild) {
        liste.removeChild(liste.firstChild);
    }
    for (var i = 0; i < vorgaenge.length; i++) {
        addVorgangToDOM(liste, vorgaenge[i]);
    }

    // add Event Listener
    document.getElementById("sucheVorgangNummer").addEventListener("input", onSearchChanged);
    document.getElementById("sucheVorgangVorname").addEventListener("input", onSearchChanged);
    document.getElementById("sucheVorgangNachname").addEventListener("input", onSearchChanged);
    document.getElementById("sucheVorgangVorstellung").addEventListener("change", onSearchChanged);

    // react on changes before load
    var a = document.getElementById("sucheVorgangNummer").value;
    var b = document.getElementById("sucheVorgangVorname").value;
    var c = document.getElementById("sucheVorgangNachname").value;
    var d = document.getElementById("sucheVorgangVorstellung").options.selectedIndex;
    if ((a != null && a != "" && a != 0) || (b != null && b != "") || (c != null && c != "") || d != 0)
        onSearchChanged();


    // Gesamtübersicht
    var gesamt = {
        "verfuegbar": 0,
        "reserviert": 0,
        "gebucht": 0,
        "VIP": 0,
        "TripleA": 0,
        "einnahmen": 0,
        "gezahlteEinnahmen": 0
    };
    for (var i = 0; i < uebersichtData.data.length; i++) {
        gesamt.verfuegbar += uebersichtData.data[i].verfuegbar;
        gesamt.reserviert += uebersichtData.data[i].reserviert;
        gesamt.gebucht += uebersichtData.data[i].gebucht;
        gesamt.VIP += uebersichtData.data[i].VIP;
        gesamt.TripleA += uebersichtData.data[i].TripleA;
        gesamt.einnahmen += uebersichtData.data[i].einnahmen;
        gesamt.gezahlteEinnahmen += uebersichtData.data[i].gezahlteEinnahmen;
    }
    var tbody = document.getElementById("uebersichtGesamt");
    var tr = document.createElement("tr");

    var td = document.createElement("td");
    td.innerHTML = "Gesamt";
    tr.appendChild(td);

    var td = document.createElement("td");
    td.innerHTML = gesamt.verfuegbar;
    tr.appendChild(td);

    var td = document.createElement("td");
    td.innerHTML = gesamt.verfuegbar - gesamt.reserviert - gesamt.gebucht - gesamt.VIP - gesamt.TripleA;
    tr.appendChild(td);

    var td = document.createElement("td");
    td.innerHTML = gesamt.reserviert;
    tr.appendChild(td);

    var td = document.createElement("td");
    td.innerHTML = gesamt.gebucht;
    tr.appendChild(td);

    var td = document.createElement("td");
    td.innerHTML = gesamt.VIP;
    tr.appendChild(td);

    var td = document.createElement("td");
    td.innerHTML = gesamt.TripleA;
    tr.appendChild(td);

    var td = document.createElement("td");
    td.innerHTML = gesamt.einnahmen.toFixed(2) + "&euro; + " + uebersichtData.postEinnahmen.toFixed(2) + "&euro; Post";
    tr.appendChild(td);

    var td = document.createElement("td");
    td.innerHTML = gesamt.gezahlteEinnahmen.toFixed(2) + "&euro; + " + uebersichtData.postGezahlteEinnahmen.toFixed(2) + "&euro; Post";
    tr.appendChild(td);

    tbody.appendChild(tr);


    // Einzelübersicht
    var tbody = document.getElementById("uebersichtEinzel");
    for (var i = 0; i < uebersichtData.data.length; i++) {
        var tr = document.createElement("tr");

        var td = document.createElement("td");
        td.innerHTML = uebersichtData.data[i].date + "  " + uebersichtData.data[i].time;
        tr.appendChild(td);

        var td = document.createElement("td");
        td.innerHTML = uebersichtData.data[i].verfuegbar;
        tr.appendChild(td);

        var td = document.createElement("td");
        td.innerHTML = uebersichtData.data[i].verfuegbar - uebersichtData.data[i].reserviert - uebersichtData.data[i].gebucht - uebersichtData.data[i].VIP - uebersichtData.data[i].TripleA;
        tr.appendChild(td);

        var td = document.createElement("td");
        td.innerHTML = uebersichtData.data[i].reserviert;
        tr.appendChild(td);

        var td = document.createElement("td");
        td.innerHTML = uebersichtData.data[i].gebucht;
        tr.appendChild(td);

        var td = document.createElement("td");
        td.innerHTML = uebersichtData.data[i].VIP;
        tr.appendChild(td);

        var td = document.createElement("td");
        td.innerHTML = uebersichtData.data[i].TripleA;
        tr.appendChild(td);

        var td = document.createElement("td");
        td.innerHTML = uebersichtData.data[i].einnahmen.toFixed(2) + "&euro;";
        tr.appendChild(td);

        var td = document.createElement("td");
        td.innerHTML = uebersichtData.data[i].gezahlteEinnahmen.toFixed(2) + "&euro;";
        tr.appendChild(td);

        tbody.appendChild(tr);
    }
}


/**
 * Fügt Daten zu einem Vorgang ins DOM ein
 * @param {DOMElement} liste
 * @param {Object} vorgang
 */
function addVorgangToDOM(liste, vorgang) {
    var div = document.createElement("div");
    div.className = "vorgang";
    div.addEventListener("dblclick", function () {
        selectedVorgang = vorgang;
        displayVorgang();
        draw();
    });
    vorgang.domElement = div;
    var table = document.createElement("table");
    table.className = "sucheTable";

    var tr = document.createElement("tr");
    var td1 = document.createElement("td");
    td1.innerHTML = "Vorgang: ";
    td1.className = "shrink";
    var td2 = document.createElement("td");
    td2.innerHTML = vorgang.nummer;
    td2.className = "expand";
    var td3 = document.createElement("td");
    td3.innerHTML = "Vorname: ";
    td3.className = "shrink";
    var td4 = document.createElement("td");
    td4.innerHTML = vorgang.vorname.escapeHTML();
    td4.className = "expand";
    var td5 = document.createElement("td");
    td5.innerHTML = "Nachname: ";
    td5.className = "shrink";
    var td6 = document.createElement("td");
    td6.innerHTML = vorgang.nachname.escapeHTML();
    td6.className = "expand";
    var td7 = document.createElement("td");
    td7.innerHTML = "Vorstellung: ";
    td7.className = "shrink";
    var td8 = document.createElement("td");
    var vorstellungen = "";
    for (var i = 0; i < vorgang.vorstellungen.length; i++) {
        vorstellungen += vorgang.vorstellungen[i].date + "&nbsp;&nbsp;" + vorgang.vorstellungen[i].time + (i + 1 === vorgang.vorstellungen.length ? "" : "<br/>");
    }
    td8.innerHTML = vorstellungen;
    td8.className = "expand";
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);
    tr.appendChild(td6);
    tr.appendChild(td7);
    tr.appendChild(td8);
    table.appendChild(tr);

    var tr = document.createElement("tr");
    var td1 = document.createElement("td");
    td1.innerHTML = "E-Mail: ";
    td1.className = "shrink";
    var td2 = document.createElement("td");
    td2.innerHTML = vorgang.email ? "<a href='mailto:" + vorgang.email + "'>" + vorgang.email.escapeHTML() + "</a>" : "";
    td2.className = "expand";
    var td3 = document.createElement("td");
    td3.innerHTML = "Telefon: ";
    td3.className = "shrink";
    var td4 = document.createElement("td");
    td4.innerHTML = vorgang.telefon ? vorgang.telefon.escapeHTML() : "";
    td4.className = "expand";
    var td5 = document.createElement("td");
    td5.innerHTML = "Anschrift: ";
    td5.className = "shrink";
    var td6 = document.createElement("td");
    td6.innerHTML = vorgang.anschrift ? vorgang.anschrift.escapeHTML() : "";
    td6.className = "expand";
    var td7 = document.createElement("td");
    td7.innerHTML = "Preis pro Karte: ";
    td7.className = "shrink";
    var td8 = document.createElement("td");
    td8.innerHTML = vorgang.bezahlart === "VIP" ? "VIP" : vorgang.bezahlart === "TripleA" ? "Triple A" : vorgang.preis.toFixed(2) + "&euro;";
    td8.className = "expand";
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);
    tr.appendChild(td6);
    tr.appendChild(td7);
    tr.appendChild(td8);
    table.appendChild(tr);

    var tr = document.createElement("tr");
    var td1 = document.createElement("td");
    td1.innerHTML = "Bezahlart: ";
    td1.className = "shrink";
    var td2 = document.createElement("td");
    td2.innerHTML = vorgang.bezahlart ? vorgang.bezahlart : "";
    td2.className = "expand";
    var td3 = document.createElement("td");
    td3.innerHTML = "Bezahlung: ";
    td3.className = "shrink";
    var td4 = document.createElement("td");
    td4.innerHTML = vorgang.bezahlung ? vorgang.bezahlung : "";
    td4.className = "expand";
    var td5 = document.createElement("td");
    td5.innerHTML = "Versandart: ";
    td5.className = "shrink";
    var td6 = document.createElement("td");
    td6.innerHTML = vorgang.versandart ? vorgang.versandart : "";
    td6.className = "expand";
    var td7 = document.createElement("td");
    td7.innerHTML = "Gesamtpreis: ";
    td7.className = "shrink";
    var td8 = document.createElement("td");
    vorgang.gesamtpreis = vorgang.bezahlart === "VIP" ? 0 : vorgang.anzahlPlaetze * vorgang.preis;
    if (vorgang.versandart === "Post") {
        vorgang.gesamtpreis += veranstaltung.versandPreis;
    }
    td8.innerHTML = vorgang.gesamtpreis.toFixed(2) + "&euro;";
    td8.className = "expand";
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);
    tr.appendChild(td6);
    tr.appendChild(td7);
    tr.appendChild(td8);
    table.appendChild(tr);

    var tr = document.createElement("tr");
    var td1 = document.createElement("td");
    td1.innerHTML = "Anzahl Pl&aumltze: ";
    td1.className = "shrink";
    var td2 = document.createElement("td");
    td2.innerHTML = vorgang.anzahlPlaetze ? vorgang.anzahlPlaetze : "";
    td2.className = "expand";
    var td3 = document.createElement("td");
    td3.innerHTML = "Kommentar: ";
    td3.className = "shrink";
    var td4 = document.createElement("td");
    td4.innerHTML = vorgang.kommentar ? vorgang.kommentar.escapeHTML() : "";
    td4.colSpan = "5";
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    table.appendChild(tr);

    div.appendChild(table);
    liste.appendChild(div);
}


/**
 * Zeige die Daten für den Vorgang mit vorgangIndex an.
 * Zeigt auch die zugehörigen Sitzplätze im Sitzplan an.
 * Zeigt keinen Vorgang an, wenn kein Vorgang angezeigt werden soll.
 */
function displayVorgang() {
    if (selectedVorgang == null) {
        document.getElementById("keinVorgang").style.display = "block";
        document.getElementById("vorgang").style.display = "none";

    } else {
        document.getElementById("keinVorgang").style.display = "none";
        document.getElementById("vorgang").style.display = "block";

        document.getElementById("vorgangNr").innerHTML = selectedVorgang.nummer;
        document.getElementById("vorgangBlackDataInArchive").innerHTML = selectedVorgang.blackDataInArchive ? "Ja" : "Nein";
        document.getElementById("vorgangVorname").innerHTML = selectedVorgang.vorname ? selectedVorgang.vorname.escapeHTML() : "";
        document.getElementById("vorgangNachname").innerHTML = selectedVorgang.nachname ? selectedVorgang.nachname.escapeHTML() : "";
        document.getElementById("vorgangEmail").innerHTML = selectedVorgang.email ? selectedVorgang.email.escapeHTML() : "";
        document.getElementById("vorgangEmail").href = "mailto:" + (selectedVorgang.email ? selectedVorgang.email.escapeHTML() : "");
        document.getElementById("vorgangTel").innerHTML = selectedVorgang.telefon ? selectedVorgang.telefon.escapeHTML() : "";
        document.getElementById("vorgangGesPreis").innerHTML = (selectedVorgang.bezahlart === "VIP" || selectedVorgang.bezahlart === "TripleA") ? "VIP" : selectedVorgang.gesamtpreis.toFixed(2) + "&euro;";
        document.getElementById("vorgangBezahlart").innerHTML = selectedVorgang.bezahlart ? selectedVorgang.bezahlart : "";
        document.getElementById("vorgangBezahlung").innerHTML = selectedVorgang.bezahlung ? selectedVorgang.bezahlung : "";
        document.getElementById("vorgangVersand").innerHTML = selectedVorgang.versandart ? selectedVorgang.versandart : "";
        document.getElementById("vorgangAnschrift").innerHTML = selectedVorgang.anschrift ? selectedVorgang.anschrift.escapeHTML() : "";
        document.getElementById("vorgangKommentar").innerHTML = selectedVorgang.kommentar ? selectedVorgang.kommentar.escapeHTML() : "";
        var vorstellungenString = "";
        for (var i = 0; i < selectedVorgang.vorstellungen.length; i++)
            vorstellungenString += selectedVorgang.vorstellungen[i].date + "&nbsp;&nbsp;" + selectedVorgang.vorstellungen[i].time + (i + 1 === selectedVorgang.vorstellungen.length ? "" : "<br/>");
        document.getElementById("vorgangVorstellungen").innerHTML = vorstellungenString;
            if (sitzplan.additionalFieldsForVorgang != null) {
                for (var i = 0; i < sitzplan.additionalFieldsForVorgang.length; i++) {
                    var additionalField = sitzplan.additionalFieldsForVorgang[i];
                    var domElement = document.getElementById("vorgang" + additionalField.fieldName);
                    switch (additionalField.type) {
                        case "boolean":
                            if (selectedVorgang[additionalField.fieldName] === true)
                                domElement.innerHTML = "Ja";
                            else if (selectedVorgang[additionalField.fieldName] === false)
                                domElement.innerHTML = "Nein";
                            else
                                domElement.innerHTML = "";
                            break;
                        case "string":
                        case "longString":
                            domElement.innerHTML = selectedVorgang[additionalField.fieldName] ? selectedVorgang[additionalField.fieldName].escapeHTML() : "";
                            break;
                        default:
                            domElement.innerHTML = selectedVorgang[additionalField.fieldName] ? selectedVorgang[additionalField.fieldName] : "";
                            break;
                    }
                }
            }

        // finde selected Seats
        selectedSeats = [];
        for (var i = 0; i < vorstellungen.length; i++) {
            for (var k = 0; k < sitzplan.plaetze.length; k++) {
                var status = vorstellungen[i][sitzplan.plaetze[k].ID];
                if (status && status.vorgangsNr == selectedVorgang.nummer) {
                    selectSeat(i, sitzplan.plaetze[k]);
                }
            }
        }
    }
}

/**
 * Function called when another date is selected.
 * Displays the booking plan for this date and also updates the information of the selected seat
 */
function onDateChanged() {
    var dateSelector = document.getElementById("date");
    var dateNumber = dateSelector.options.selectedIndex;
    if (dateNumber !== selectedDateIndex) {
        selectedDateIndex = dateNumber;
        draw();
    }
}

/**
 * Function called when a seat is clicked.
 * Marks this seat as the only selected one an displays information about this seat
 * @param {Object} clickedSeat
 */
function onSeatClicked(clickedSeat) {
    var seatStatus = vorstellungen[selectedDateIndex][clickedSeat.ID];
    var vorgangsNr = seatStatus ? seatStatus.vorgangsNr : null;
    if (vorgangsNr == null) {
        setSelectedSeat(selectedDateIndex, clickedSeat);
        selectedVorgang = null;
    } else {
        // finde Vorgang
        for (var i = 0; i < vorgaenge.length; i++) {
            if (vorgaenge[i].nummer == vorgangsNr) {
                selectedVorgang = vorgaenge[i];
                break;
            }
        }
    }
    displayVorgang();
}


/**
 * Geht alle Vorgaenge durch und setzt diese auf sichtbar / nicht sichtbar, je nach Sucheinstellung
 */
function onSearchChanged() {
    // Suchkriterien
    var nummer = document.getElementById("sucheVorgangNummer").value;
    var vorname = document.getElementById("sucheVorgangVorname").value;
    var nachname = document.getElementById("sucheVorgangNachname").value;
    var vorstellungNr = document.getElementById("sucheVorgangVorstellung").options.selectedIndex;

    // Vorgangsnummer eingegeben -> Ein einziger Vorgang mit dieser Nummer
    if (nummer && nummer > 0) {
        for (var i = 0; i < vorgaenge.length; i++) {
            if (vorgaenge[i].nummer == nummer)
                vorgaenge[i].domElement.style.display = "block";
            else
                vorgaenge[i].domElement.style.display = "none";
        }

        // Keine Vorstellung angegeben, suche nur nach Vorname und Nachname
    } else if (vorstellungNr === 0) {
        for (var i = 0; i < vorgaenge.length; i++) {
            if (vorgaenge[i].vorname.toLowerCase().indexOf(vorname.toLowerCase()) !== -1 && vorgaenge[i].nachname.toLowerCase().indexOf(nachname.toLowerCase()) !== -1)
                vorgaenge[i].domElement.style.display = "block";
            else
                vorgaenge[i].domElement.style.display = "none";
        }

        // suche nach Vorname, nachname und Veranstaltung
    } else {
        var vorstellung = vorstellungen[vorstellungNr - 1];
        for (var i = 0; i < vorgaenge.length; i++) {
            var richtigeVorstellung = false;
            for (var k = 0; k < vorgaenge[i].vorstellungen.length; k++) {
                if (vorgaenge[i].vorstellungen[k].date === vorstellung.date && vorgaenge[i].vorstellungen[k].time === vorstellung.time)
                    richtigeVorstellung = true;
            }
            if (richtigeVorstellung && vorgaenge[i].vorname.toLowerCase().indexOf(vorname.toLowerCase()) !== -1 && vorgaenge[i].nachname.toLowerCase().indexOf(nachname.toLowerCase()) !== -1)
                vorgaenge[i].domElement.style.display = "block";
            else
                vorgaenge[i].domElement.style.display = "none";
        }
    }
}


/**
 * Ein / Ausklappen eines Bereiches. 
 * Die Anzeigelogik ist über CSS geregelt, es muss nur die Klasse verändert werden.
 * @param {String} areaName Name des Bereiches, der ein-/ausgeklappt werden soll
 */
function shrinkOrExpandArea(areaName) {
    var classList = document.getElementById(areaName + "Surrounder").classList;
    if (classList.contains("expanded")) {
        classList.remove("expanded");
    } else {
        classList.add("expanded");
    }
}