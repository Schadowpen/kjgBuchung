/* global apiUrl */

window.addEventListener("load", function () {
    var xmlHttp;
    try {
        xmlHttp = new XMLHttpRequest();
    } catch (e) {
        // Fehlerbehandlung, wenn die Schnittstelle vom Browser nicht unterstützt wird.
        alert("XMLHttpRequest wird von ihrem Browser nicht unterstützt.");
    }
    if (xmlHttp) {
        xmlHttp.open('GET', apiUrl + "getUebersicht.php" + "?key=" + getKey(), true);
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.responseText.startsWith("Error:"))
                    throw xmlHttp.responseText;

                var uebersicht = JSON.parse(xmlHttp.responseText);
                document.getElementById("veranstaltung").innerHTML = uebersicht.veranstaltung;

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
                for (var i = 0; i < uebersicht.data.length; i++) {
                    gesamt.verfuegbar += uebersicht.data[i].verfuegbar;
                    gesamt.reserviert += uebersicht.data[i].reserviert;
                    gesamt.gebucht += uebersicht.data[i].gebucht;
                    gesamt.VIP += uebersicht.data[i].VIP;
                    gesamt.TripleA += uebersicht.data[i].TripleA;
                    gesamt.einnahmen += uebersicht.data[i].einnahmen;
                    gesamt.gezahlteEinnahmen += uebersicht.data[i].gezahlteEinnahmen;
                }
                var tbody = document.getElementById("gesamt");
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
                td.innerHTML = gesamt.einnahmen.toFixed(2) + "&euro; + " + uebersicht.postEinnahmen.toFixed(2) + "&euro; Post";
                tr.appendChild(td);

                var td = document.createElement("td");
                td.innerHTML = gesamt.gezahlteEinnahmen.toFixed(2) + "&euro; + " + uebersicht.postGezahlteEinnahmen.toFixed(2) + "&euro; Post";
                tr.appendChild(td);

                tbody.appendChild(tr);


                // Einzelübersicht
                var tbody = document.getElementById("einzel");
                for (var i = 0; i < uebersicht.data.length; i++) {
                    var tr = document.createElement("tr");

                    var td = document.createElement("td");
                    td.innerHTML = uebersicht.data[i].date + "  " + uebersicht.data[i].time;
                    tr.appendChild(td);

                    var td = document.createElement("td");
                    td.innerHTML = uebersicht.data[i].verfuegbar;
                    tr.appendChild(td);

                    var td = document.createElement("td");
                    td.innerHTML = uebersicht.data[i].verfuegbar - uebersicht.data[i].reserviert - uebersicht.data[i].gebucht - uebersicht.data[i].VIP - uebersicht.data[i].TripleA;
                    tr.appendChild(td);

                    var td = document.createElement("td");
                    td.innerHTML = uebersicht.data[i].reserviert;
                    tr.appendChild(td);

                    var td = document.createElement("td");
                    td.innerHTML = uebersicht.data[i].gebucht;
                    tr.appendChild(td);

                    var td = document.createElement("td");
                    td.innerHTML = uebersicht.data[i].VIP;
                    tr.appendChild(td);

                    var td = document.createElement("td");
                    td.innerHTML = uebersicht.data[i].TripleA;
                    tr.appendChild(td);

                    var td = document.createElement("td");
                    td.innerHTML = uebersicht.data[i].einnahmen.toFixed(2) + "&euro;";
                    tr.appendChild(td);

                    var td = document.createElement("td");
                    td.innerHTML = uebersicht.data[i].gezahlteEinnahmen.toFixed(2) + "&euro;";
                    tr.appendChild(td);

                    tbody.appendChild(tr);
                }
            }
        };
        xmlHttp.send(null);
    }
});