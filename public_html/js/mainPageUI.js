/* global vorstellungen, getSelectedSeat, vorgang */

var selectedDateIndex = 0;

function initUI() {
    var dateSelector = document.getElementById("date");
    for (var i = 0; i < vorstellungen.length; i++) {
        var opt = document.createElement("option");
        opt.text = vorstellungen[i].date + "  " + vorstellungen[i].time;
        dateSelector.options.add(opt);
    }
    dateSelector.options.selectedIndex = 0;
    
    document.getElementById("platzButton").disabled = true;
}

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

function onSeatClicked(clickedSeat) {
    setSelectedSeat(selectedDateIndex, clickedSeat);
    displaySeatInformation();
}

function onSperrenClick() {
    var selection = getSelectedSeat();
    if (vorstellungen[selection.dateIndex][selection.seat.ID] != null) {
        var status = vorstellungen[selection.dateIndex][selection.seat.ID].status;
    } else {
        var status = "frei";
    }

    if (status === "frei") {
        document.getElementById("platzButton").disabled = true;
        setzePlatzStatus(vorstellungen[selection.dateIndex].date,
                vorstellungen[selection.dateIndex].time,
                selection.seat.block,
                selection.seat.reihe,
                selection.seat.platz,
                "gesperrt",
                displaySeatInformation);
    } else if (status === "gesperrt") {
        document.getElementById("platzButton").disabled = true;
        setzePlatzStatus(vorstellungen[selection.dateIndex].date,
                vorstellungen[selection.dateIndex].time,
                selection.seat.block,
                selection.seat.reihe,
                selection.seat.platz,
                "frei",
                displaySeatInformation);
    }
}

function onUpdateDataFinished() {
	if (getSelectedSeat() != null)
		displaySeatInformation();
}

function displaySeatInformation() {
    var selection = getSelectedSeat();
    if (vorstellungen[selection.dateIndex][selection.seat.ID] != null) {
        var status = vorstellungen[selection.dateIndex][selection.seat.ID].status;
        var vorgangsNr = vorstellungen[selection.dateIndex][selection.seat.ID].vorgangsNr;
    } else {
        var status = "frei";
        var vorgangsNr = null;
    }

    document.getElementById("platzBlock").innerHTML = selection.seat.block;
    document.getElementById("platzReihe").innerHTML = selection.seat.reihe;
    document.getElementById("platzPlatz").innerHTML = selection.seat.platz;
    document.getElementById("platzStatus").innerHTML = status;

    var button = document.getElementById("platzButton");
    var buttonText = button.childNodes[button.childNodes.length - 1];
    if (status === "frei") {
        button.replaceChild(document.createTextNode("Platz als gesperrt markieren"), buttonText)
        button.disabled = false;
    } else if (status === "gesperrt") {
        button.replaceChild(document.createTextNode("Sperrung dieses Platzes löschen"), buttonText)
        button.disabled = false;
    } else {
        button.replaceChild(document.createTextNode("Platz als gesperrt markieren"), buttonText)
        button.disabled = true;
    }

    // Vorgang laden und anzeigen
    if (vorgangsNr != null) {
        document.getElementById("keinVorgang").style.display = "none";
        document.getElementById("vorgangLoading").style.display = "block";
        document.getElementById("vorgang").style.display = "none";

        ladeVorgang(vorgangsNr, function () {
            document.getElementById("vorgangNr").innerHTML = vorgang.nummer;
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


function urlFuerNeuenVorgang() {
    var selection = getSelectedSeat();
    var url = "vorgang.html";
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

function urlFuerDiesenVorgang() {
    var url = "vorgang.html";
    url += "?nummer=" + vorgang.nummer;
    return url;
}