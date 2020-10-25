/* global apiUrl, urlForVorgangPage */


/**
 * Allgemeine Informationen über die Veranstaltung
 * @type {veranstaltung: string, raumLaenge: number, raumBreite: number, laengenEinheit: LE, sitzLaenge: number, sitzBreite: number, kartenPreis: number, versandPreis: number}
 */
var veranstaltung;
/**
 * Alle Vorstellungen dieser Veranstaltung
 * @type {date: string, time: string}[]
 */
var vorstellungen;
/**
 * Alle Vorgänge zu dieser Veranstaltung
 * @type {nummer: number, preis: number, bezahlart: string, bezahlung: string, versandart: string, vorname: string, nachname: string, email: string, telefon: string, anschrift: string, kommentar: string, theaterkarte: ?string, anzahlPlaetze: number, vorstellungen: {date: string, time: string}[]}[]
 */
var vorgaenge;

/**
 * Geht alle Vorgaenge durch und setzt diese auf sichtbar / nicht sichtbar, je nach Sucheinstellung
 */
function onSearchChanged() {
    // Suchkriterien
    var nummer = document.getElementById("vorgangNummer").value;
    var vorname = document.getElementById("vorgangVorname").value;
    var nachname = document.getElementById("vorgangNachname").value;
    var vorstellungNr = document.getElementById("vorgangVorstellung").options.selectedIndex;

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
 * Lädt alle benötigten Daten für die Suche und fügt sie ins DOM ein
 */
window.addEventListener("load", function () {
    // load vorstellungen
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
            }
        };
        xmlHttp1.send(null);
        
        
        // load vorstellungen
        var xmlHttp2 = new XMLHttpRequest();
        xmlHttp2.open('GET', apiUrl + "getVorstellungen.php", true);
        xmlHttp2.onreadystatechange = function () {
            if (xmlHttp2.readyState === 4) {
                if (xmlHttp2.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp2.status;
                if (xmlHttp2.responseText.startsWith("Error:"))
                    throw xmlHttp2.responseText;

                vorstellungen = JSON.parse(xmlHttp2.responseText);
                var vorgangVorstellung = document.getElementById("vorgangVorstellung");
                for (var i = 0; i < vorstellungen.length; i++) {
                    var opt = document.createElement("option");
                    opt.text = vorstellungen[i].date + "  " + vorstellungen[i].time;
                    vorgangVorstellung.options.add(opt);
                }
                vorgangVorstellung.options.selectedIndex = 0;
            }
        };
        xmlHttp2.send(null);


        // load vorgaenge
        var xmlHttp3 = new XMLHttpRequest();
        xmlHttp3.open('GET', apiUrl + "getVorgaengeWithInfo.php" + "?key="+getKey(), true);
        xmlHttp3.onreadystatechange = function () {
            if (xmlHttp3.readyState === 4) {
                if (xmlHttp3.status !== 200)
                    throw "Could not connect to Server. Server sent status code " + xmlHttp3.status;
                if (xmlHttp3.responseText.startsWith("Error:"))
                    throw xmlHttp3.responseText;

                vorgaenge = JSON.parse(xmlHttp3.responseText);

                // add all to DOM tree
                var liste = document.getElementById("liste");
                while (liste.firstChild) {
                    liste.removeChild(liste.firstChild);
                }
                for (var i = 0; i < vorgaenge.length; i++) {
                    addVorgang(liste, vorgaenge[i]);
                }

                // add Event Listener
                document.getElementById("vorgangNummer").addEventListener("input", onSearchChanged);
                document.getElementById("vorgangVorname").addEventListener("input", onSearchChanged);
                document.getElementById("vorgangNachname").addEventListener("input", onSearchChanged);
                document.getElementById("vorgangVorstellung").addEventListener("change", onSearchChanged);

                // react on changes before load
                var a = document.getElementById("vorgangNummer").value;
                var b = document.getElementById("vorgangVorname").value;
                var c = document.getElementById("vorgangNachname").value;
                var d = document.getElementById("vorgangVorstellung").options.selectedIndex;
                if ((a != null && a != "" && a != 0) || (b != null && b != "") || (c != null && c != "") || d != 0)
                    onSearchChanged();
            }
        };
        xmlHttp3.send(null);
    }
});

/**
 * Fügt Daten zu einem Vorgang ins DOM ein
 * @param {DOMElement} liste
 * @param {Object} vorgang
 */
function addVorgang(liste, vorgang) {
    var div = document.createElement("div");
    div.className = "vorgang";
    div.addEventListener("dblclick", function () {
        location.href = urlForVorgangPage + "?nummer=" + vorgang.nummer;
    });
    vorgang.domElement = div;
    var table = document.createElement("table");

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