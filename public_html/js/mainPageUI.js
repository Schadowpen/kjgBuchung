/* global vorstellungen, getSelectedSeat, vorgang, urlForVorgangPage, sitzplan */

/**
 * Index of the date and time, which Vorstellung should be displayed
 * @type Number
 */
var selectedDateIndex = 0;

/**
 * Initializes the UI, called from data.js
 */
function initUI() {
    // init dateselector
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
            td1.innerHTML = additionalField.description + ":";
            var td2 = document.createElement("td");
            td2.id = "vorgang" + additionalField.fieldName;
            var tr = document.createElement("tr");
            tr.appendChild(td1);
            tr.appendChild(td2);
            vorgangTable.appendChild(tr);
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

        if (getSelectedSeat()) {
            setSelectedSeat(selectedDateIndex, getSelectedSeat().seat);

            displaySeatInformation();
        }
        draw();
    }
}

/**
 * Function called when a seat is clicked.
 * Marks this seat as the only selected one an displays information about this seat
 * @param {Object} clickedSeat
 */
function onSeatClicked(clickedSeat) {
    setSelectedSeat(selectedDateIndex, clickedSeat);
    displaySeatInformation();
}

/**
 * Swaps the seat status between "frei" and "gesperrt"
 */
function onSperrenClick() {
    var selection = getSelectedSeat();
    if (vorstellungen[selection.dateIndex][selection.seat.ID] != null) {
        var status = vorstellungen[selection.dateIndex][selection.seat.ID].status;
    } else {
        var status = "frei";
    }

    if (status === "frei") {
        document.getElementById("platzButtonGesperrt").disabled = true;
        setzePlatzStatus(vorstellungen[selection.dateIndex].date,
                vorstellungen[selection.dateIndex].time,
                selection.seat.block,
                selection.seat.reihe,
                selection.seat.platz,
                "gesperrt",
                displaySeatInformation);
    } else if (status === "gesperrt") {
        document.getElementById("platzButtonGesperrt").disabled = true;
        setzePlatzStatus(vorstellungen[selection.dateIndex].date,
                vorstellungen[selection.dateIndex].time,
                selection.seat.block,
                selection.seat.reihe,
                selection.seat.platz,
                "frei",
                displaySeatInformation);
    }
}

/**
 * Swaps the selected seat between "reserviert"/"gebucht" and "anwesend"
 */
function onAnwesendClick() {
    var selection = getSelectedSeat();
    if (vorstellungen[selection.dateIndex][selection.seat.ID] != null) {
        var status = vorstellungen[selection.dateIndex][selection.seat.ID].status;
    } else {
        var status = "frei";
    }

    if (status === "reserviert" || status === "gebucht") {
        document.getElementById("platzButtonAnwesend").disabled = true;
        setzePlatzStatus(vorstellungen[selection.dateIndex].date,
                vorstellungen[selection.dateIndex].time,
                selection.seat.block,
                selection.seat.reihe,
                selection.seat.platz,
                "anwesend",
                displaySeatInformation,
                vorgang.nummer);
    } else if (status === "anwesend") {
        document.getElementById("platzButtonAnwesend").disabled = true;
        console.log(selection);
        setzePlatzStatus(vorstellungen[selection.dateIndex].date,
                vorstellungen[selection.dateIndex].time,
                selection.seat.block,
                selection.seat.reihe,
                selection.seat.platz,
                (vorgang.bezahlung == "gebucht" ? "gebucht" : "reserviert"),
                displaySeatInformation,
                vorgang.nummer);
    }
}

/**
 * Updates the information about this seat
 */
function onUpdateDataFinished() {
    if (getSelectedSeat() != null)
        displaySeatInformation();
}

/**
 * whenever updateData detects changes, this function is triggered. This function must return, whether the status should be updated or not
 * @param {Number} dateIndex
 * @param {Object} platz
 * @param {{date: String, time: String, block: String, reihe: String, platz: Number, status: String, vorgangsNr: Number}} neuerStatus
 * @returns {Boolean}
 */
function onStatusUpdate(dateIndex, platz, neuerStatus) {
    // Wenn ein Sitzplatz von extern (z.B. der Scanner App) als anwesend markiert wurde, wähle diesen aus.
    if (neuerStatus.status === "anwesend") {
        if (vorstellungen[dateIndex][platz.ID] == null || vorstellungen[dateIndex][platz.ID].status !== "anwesend") {
            setSelectedSeat(dateIndex, platz);
            displaySeatInformation();

            // Animation, dass ein neuer Platz ausgewählt wurde wurde
            var platzUebersicht = document.getElementById("PlatzUebersicht");
            var platzUebersichtClass = platzUebersicht.className;
            platzUebersicht.className = platzUebersichtClass + " blueAnimation";
            setTimeout(function () {
                platzUebersicht.className = platzUebersichtClass;
            }, 2100);
        }
    }
    return true;
}

/**
 * Show information about this seat.
 * If this seat is attached to a Vorgang, also show information about this one.
 */
function displaySeatInformation() {
    var selection = getSelectedSeat();
    if (vorstellungen[selection.dateIndex][selection.seat.ID] != null) {
        var status = vorstellungen[selection.dateIndex][selection.seat.ID].status;
        var vorgangsNr = vorstellungen[selection.dateIndex][selection.seat.ID].vorgangsNr;
    } else {
        var status = "frei";
        var vorgangsNr = null;
    }

    // Platz Übersicht anzeigen
    document.getElementById("platzBlock").innerHTML = selection.seat.block;
    document.getElementById("platzReihe").innerHTML = selection.seat.reihe;
    document.getElementById("platzPlatz").innerHTML = selection.seat.platz;
    document.getElementById("platzStatus").innerHTML = status;

    // Button für Statusänderung
    var buttonGesperrt = document.getElementById("platzButtonGesperrt");
    var buttonGesperrtText = buttonGesperrt.childNodes[buttonGesperrt.childNodes.length - 1];
    var buttonAnwesend = document.getElementById("platzButtonAnwesend");
    var buttonAnwesendText = buttonAnwesend.childNodes[buttonAnwesend.childNodes.length - 1];
    switch (status) {
        case "frei":
            buttonGesperrt.replaceChild(document.createTextNode("Platz als gesperrt markieren"), buttonGesperrtText);
            buttonGesperrt.disabled = false;
            buttonGesperrt.style.display = "inline-block";
            buttonAnwesend.style.display = "none";
            break;
        case "gesperrt":
            buttonGesperrt.replaceChild(document.createTextNode("Sperrung dieses Platzes löschen"), buttonGesperrtText);
            buttonGesperrt.disabled = false;
            buttonGesperrt.style.display = "inline-block";
            buttonAnwesend.style.display = "none";
            break;
        case "reserviert":
        case "gebucht":
            buttonGesperrt.style.display = "none";
            buttonAnwesend.replaceChild(document.createTextNode("Platz als anwesend markieren"), buttonAnwesendText);
            buttonAnwesend.disabled = false;
            buttonAnwesend.style.display = "inline-block";
            break;
        case "anwesend":
            buttonGesperrt.style.display = "none";
            buttonAnwesend.replaceChild(document.createTextNode("Platz nicht mehr als anwesend markieren"), buttonAnwesendText);
            buttonAnwesend.disabled = false;
            buttonAnwesend.style.display = "inline-block";
            break;
    }

    // Vorgang laden und anzeigen
    if (vorgangsNr != null) {
        document.getElementById("keinVorgang").style.display = "none";
        document.getElementById("vorgangLoading").style.display = "block";
        document.getElementById("vorgang").style.display = "none";

        ladeVorgang(vorgangsNr, function () {
            document.getElementById("vorgangNr").innerHTML = vorgang.nummer;
            document.getElementById("vorgangBlackDataInArchive").innerHTML = vorgang.blackDataInArchive ? "Ja" : "Nein";
            document.getElementById("vorgangVorname").innerHTML = vorgang.vorname ? vorgang.vorname : "";
            document.getElementById("vorgangNachname").innerHTML = vorgang.nachname ? vorgang.nachname : "";
            document.getElementById("vorgangEmail").innerHTML = vorgang.email ? vorgang.email : "";
            document.getElementById("vorgangEmail").href = "mailto:" + (vorgang.email ? vorgang.email : "");
            document.getElementById("vorgangTel").innerHTML = vorgang.telefon ? vorgang.telefon : "";
            document.getElementById("vorgangGesPreis").innerHTML = (vorgang.bezahlart === "VIP" || vorgang.bezahlart === "TripleA") ? "VIP" : vorgang.gesamtpreis.toFixed(2) + "&euro;";
            document.getElementById("vorgangBezahlart").innerHTML = vorgang.bezahlart ? vorgang.bezahlart : "";
            document.getElementById("vorgangBezahlung").innerHTML = vorgang.bezahlung ? vorgang.bezahlung : "";
            document.getElementById("vorgangVersand").innerHTML = vorgang.versandart ? vorgang.versandart : "";
            document.getElementById("vorgangAnschrift").innerHTML = vorgang.anschrift ? vorgang.anschrift : "";
            document.getElementById("vorgangKommentar").innerHTML = vorgang.kommentar ? vorgang.kommentar : "";
            if (sitzplan.additionalFieldsForVorgang != null) {
                for (var i = 0; i < sitzplan.additionalFieldsForVorgang.length; i++) {
                    var additionalField = sitzplan.additionalFieldsForVorgang[i];
                    var domElement = document.getElementById("vorgang" + additionalField.fieldName);
                    switch (additionalField.type) {
                        case "boolean":
                            if (vorgang[additionalField.fieldName] === true)
                                domElement.innerHTML = "Ja";
                            else if (vorgang[additionalField.fieldName] === false)
                                domElement.innerHTML = "Nein";
                            else
                                domElement.innerHTML = "";
                            break;
                        default:
                            domElement.innerHTML = vorgang[additionalField.fieldName] ? vorgang[additionalField.fieldName] : "";
                            break;
                    }
                }
            }

            document.getElementById("keinVorgang").style.display = "none";
            document.getElementById("vorgangLoading").style.display = "none";
            document.getElementById("vorgang").style.display = "block";
        });
    } else {
        document.getElementById("keinVorgang").style.display = "block";
        document.getElementById("vorgangLoading").style.display = "none";
        document.getElementById("vorgang").style.display = "none";

        ladeVorgang(null);
    }
}

/**
 * Returns the URL for making a new Vorgang.
 * The URL depends on whether a seat is actually selected
 * @returns {String}
 */
function urlFuerNeuenVorgang() {
    var selection = getSelectedSeat();
    var url = urlForVorgangPage;
    if (selection) {
        url += "?date=" + vorstellungen[selection.dateIndex].date;
        url += "&time=" + vorstellungen[selection.dateIndex].time;
        url += "&block=" + encodeURIComponent(selection.seat.block);
        url += "&reihe=" + encodeURIComponent(selection.seat.reihe);
        url += "&platz=" + selection.seat.platz;
    } else {
        url += "?date=" + vorstellungen[selectedDateIndex].date;
        url += "&time=" + vorstellungen[selectedDateIndex].time;
    }
    return url;
}

/**
 * Returns the URL vor editing the Vorgang of the selected seat.
 */
function urlFuerDiesenVorgang() {
    var url = urlForVorgangPage;
    url += "?nummer=" + vorgang.nummer;
    return url;
}