/* global vorstellungen, getSelectedSeat, vorgang, objectsToLoad, selectedSeats, sitzplan, apiSchluessel */

var selectedDateIndex = 0;
var vorgangUnsavedChanges = false;

function loadUI() {
    objectsToLoad += 5;

    var query = parseQueryString(window.location.search.substring(1));
    if (query.nummer) {
        var vorgangsNr = query.nummer;

        ladeVorgang(vorgangsNr, function () {
            displayVorgangInformation();
            loadingComplete();
            if (vorgang.bezahlung === "bezahlt" || vorgang.bezahlung === "Abendkasse") {
                document.getElementById("kartenDrucken").disabled = false;
                document.getElementById("kartenDruckenMediumRes").disabled = false;
                document.getElementById("kartenDruckenLowRes").disabled = false;
            }
            document.getElementById("vorgangDrucken").disabled = false;
        });
    } else {
        var vorgangsNr = -1;

        ladeVorgang(vorgangsNr, function () {
            displayVorgangInformation();
            vorgangUnsavedChanges = true;
            loadingComplete();
            document.getElementById("vorgangLoeschen").disabled = true;
        });
    }

    eintrittskarteImage = new Image();
    eintrittskarteImage.src = "images/Eintrittskarte_Model.jpg";
    eintrittskarteImage.onload = loadingComplete();

    eintrittskarteImageMediumResolution = new Image();
    eintrittskarteImageMediumResolution.src = "images/Eintrittskarte_Model_medium_Resolution.jpg";
    eintrittskarteImageMediumResolution.onload = loadingComplete();

    eintrittskarteImageLowResolution = new Image();
    eintrittskarteImageLowResolution.src = "images/Eintrittskarte_Model_low_Resolution.jpg";
    eintrittskarteImageLowResolution.onload = loadingComplete();


    var xmlHttp1 = new XMLHttpRequest();
    if (xmlHttp1) {
        xmlHttp1.open('GET', "html/printImage.html", true);
        xmlHttp1.onreadystatechange = function () {
            if (xmlHttp1.readyState === 4) {
                printImageHtml = xmlHttp1.responseText;
                loadingComplete();
            }
        };
    }
    xmlHttp1.send(null);
}

function initUI() {
    var dateSelector = document.getElementById("date");
    for (var i = 0; i < vorstellungen.length; i++) {
        var opt = document.createElement("option");
        opt.text = vorstellungen[i].date + "  " + vorstellungen[i].time;
        dateSelector.options.add(opt);
    }
    dateSelector.options.selectedIndex = 0;

    // get date from URL query
    var query = parseQueryString(window.location.search.substring(1));
    if (query.date && query.time) {
        for (var i = 0; i < vorstellungen.length; i++) {
            if (vorstellungen[i].date === query.date && vorstellungen[i].time === query.time) {
                dateSelector.options.selectedIndex = i;
                selectedDateIndex = i;
            }
        }
    } else if (vorgang.nummer >= 0) {
        // get first occurency of belonging seats
        var vorstellungFound = false;
        for (var i = 0; i < vorstellungen.length && !vorstellungFound; i++) {
            for (var k = 0; k < sitzplan.plaetze.length && !vorstellungFound; k++) {
                if (vorstellungen[i][sitzplan.plaetze[k].ID] && vorstellungen[i][sitzplan.plaetze[k].ID].vorgangsNr === vorgang.nummer) {
                    dateSelector.options.selectedIndex = i;
                    selectedDateIndex = i;
                    vorstellungFound = true;
                }
            }
        }
    }

    adjustClickableSeats(true);

    // select seat from URL query
    if (vorgang.nummer < 0 && query.block && query.reihe && query.platz) {
        for (var i = 0; i < sitzplan.plaetze.length; i++) {
            if (sitzplan.plaetze[i].block == query.block && sitzplan.plaetze[i].reihe == query.reihe && sitzplan.plaetze[i].platz == query.platz) {
                if (isClickable(vorstellungen[selectedDateIndex][sitzplan.plaetze[i].ID]))
                    onSeatClicked(sitzplan.plaetze[i]);
            }
        }
    }

    displaySeatsInformation();
    document.getElementById("vorgangSpeichern").disabled = vorgang.nummer >= 0;
    draw();
}

function onDateChanged() {
    var dateSelector = document.getElementById("date");
    var dateNumber = dateSelector.options.selectedIndex;
    if (dateNumber !== selectedDateIndex) {
        selectedDateIndex = dateNumber;
        draw();
    }
}

function onSeatClicked(clickedSeat) {
    if (vorgang.nummer >= 0) {
        setClickableSeats([]);
        var dateIndex = selectedDateIndex;
        if (isSelectedSeat(dateIndex, clickedSeat)) {
            var status = "frei";
            var nummer = null;
        } else {
            if (vorgang.bezahlung === "bezahlt")
                var status = "gebucht";
            else
                var status = "reserviert";
            var nummer = vorgang.nummer;
        }

        setzePlatzStatus(vorstellungen[dateIndex].date, vorstellungen[dateIndex].time, clickedSeat.block, clickedSeat.reihe, clickedSeat.platz, status, function (okay) {
            adjustClickableSeats(false);
            if (okay) {
                antiselectSeat(dateIndex, clickedSeat);
                displaySeatsInformation();
                berechneVorgangZugehoerigePlaetze();
                onVorgangCalculationChanged();
            }
        }, nummer);
    } else {
        antiselectSeat(selectedDateIndex, clickedSeat);
        if (vorstellungen[selectedDateIndex][clickedSeat.ID] == null)
            vorstellungen[selectedDateIndex][clickedSeat.ID] = {};
        vorstellungen[selectedDateIndex][clickedSeat.ID].status = "frei";
        if (isSelectedSeat(selectedDateIndex, clickedSeat))
            vorstellungen[selectedDateIndex][clickedSeat.ID].vorgangsNr = vorgang.nummer;
        else
            delete vorstellungen[selectedDateIndex][clickedSeat.ID].vorgangsNr;
        displaySeatsInformation();
        berechneVorgangZugehoerigePlaetze();
        onVorgangCalculationChanged();
    }
}

// whenever updateData detects changes, this function is triggered. This function must return, whether the status should be updated or not
function onStatusUpdate(dateIndex, platz, neuerStatus) {
    if (vorstellungen[dateIndex][platz.ID] == null) {
        return true;
    } else if (vorstellungen[dateIndex][platz.ID].vorgangsNr === vorgang.nummer) {
        if (neuerStatus == null) {
            return false;
        } else if (neuerStatus.vorgangsNr == null) {
            if (neuerStatus.status == "gesperrt") {
                setClickableSeats([]);
                window.alert("Der Platz " + platz.ID + " wurde für den " + vorstellungen[dateIndex].date + " " + vorstellungen[dateIndex].time + " gesperrt");
                vorgangUnsavedChanges = true;
                return true;
            } else {
                return false;
            }
        } else if (neuerStatus.vorgangsNr === vorgang.nummer) {
            return true;
        } else {
            setClickableSeats([]);
            window.alert("Der Platz " + platz.ID + " wurde für den " + vorstellungen[dateIndex].date + " " + vorstellungen[dateIndex].time + " bereits für einen anderen Vorgang genutzt");
            vorgangUnsavedChanges = true;
            return true;

        }
    } else {
        return true;
    }
}

function onUpdateDataFinished() {
    berechneVorgangZugehoerigePlaetze();
    selectedSeats = [];
    adjustClickableSeats(true);
    displaySeatsInformation();
    if (vorgangUnsavedChanges)
        onVorgangCalculationChanged();
}

// when something of Vorgang is edited
function onVorgangChanged() {
    document.getElementById("kartenDrucken").disabled = true;
    document.getElementById("kartenDruckenMediumRes").disabled = true;
    document.getElementById("kartenDruckenLowRes").disabled = true;
    document.getElementById("vorgangDrucken").disabled = true;
    document.getElementById("vorgangSpeichern").disabled = false;
    vorgangUnsavedChanges = true;
}

// calculates Changes that affect the whole Vorgang
function onVorgangCalculationChanged() {
    onVorgangChanged();

    vorgang.preis = parseFloat(document.getElementById("vorgangPreis").value);
    vorgang.bezahlart = document.getElementById("vorgangBezahlart").value;
    vorgang.bezahlung = document.getElementById("vorgangBezahlung").value;
    vorgang.versandart = document.getElementById("vorgangVersand").value;
    berechneVorgangGesamtpreis();

    // display data global changes
    if (vorgang.bezahlart === "VIP" || vorgang.bezahlart === "TripleA") {
        // Preis änderbar
        document.getElementById("vorgangPreisIsVIP").style.display = "block";
        document.getElementById("vorgangPreisNoVIP").style.display = "none";
        // bezahlung Änderbar
        document.getElementById("vorgangBezahlung").options[0].disabled = false;
        document.getElementById("vorgangBezahlung").options[1].disabled = false;
        document.getElementById("vorgangBezahlung").options[2].disabled = true;
        if (vorgang.bezahlung === "Abendkasse") {
            vorgang.bezahlung = "offen";
            document.getElementById("vorgangBezahlung").options.selectedIndex = 0;
        }
        // per Post verschicken
        document.getElementById("vorgangVersand").options[1].disabled = false;

    } else if (vorgang.bezahlart === "Abendkasse") {
        // Preis änderbar
        document.getElementById("vorgangPreisIsVIP").style.display = "none";
        document.getElementById("vorgangPreisNoVIP").style.display = "block";
        // bezahlung Änderbar
        vorgang.bezahlung = "Abendkasse";
        document.getElementById("vorgangBezahlung").options[0].disabled = true;
        document.getElementById("vorgangBezahlung").options[1].disabled = true;
        document.getElementById("vorgangBezahlung").options[2].disabled = false;
        document.getElementById("vorgangBezahlung").options.selectedIndex = 2;
        // per Post verschicken
        document.getElementById("vorgangVersand").options[1].disabled = true;
        if (vorgang.versandart === "Post") {
            vorgang.versandart = "Abholung";
            document.getElementById("vorgangVersand").value = "Abholung";
            berechneVorgangGesamtpreis();
        }

    } else {
        // Preis änderbar
        document.getElementById("vorgangPreisIsVIP").style.display = "none";
        document.getElementById("vorgangPreisNoVIP").style.display = "block";
        // bezahlung Änderbar
        document.getElementById("vorgangBezahlung").options[0].disabled = false;
        document.getElementById("vorgangBezahlung").options[1].disabled = false;
        document.getElementById("vorgangBezahlung").options[2].disabled = true;
        if (vorgang.bezahlung === "Abendkasse") {
            vorgang.bezahlung = "offen";
            document.getElementById("vorgangBezahlung").options.selectedIndex = 0;
        }
        // per Post verschicken
        document.getElementById("vorgangVersand").options[1].disabled = false;
    }
    document.getElementById("vorgangGesPreis").innerHTML = vorgang.gesamtpreis.toFixed(2) + "&euro;";

    // reserviert/gebucht
    if (vorgang.bezahlung === "bezahlt") {
        var status = "gebucht";
    } else {
        var status = "reserviert";
    }
    for (var i = 0; i < selectedSeats.length; i++) {
        vorstellungen[selectedSeats[i].dateIndex][selectedSeats[i].seat.ID].status = status;
    }
    draw();
}

function onVorgangSave() {
    // Check for Valid
    vorgang.vorname = document.getElementById("vorgangVorname").value;
    if (vorgang.vorname == null || vorgang.vorname == "") {
        displayErrorMessage("&uArr; Dieses Feld muss ausgef&uuml;llt werden!", document.getElementById("vorgangVorname"), 4000);
        return;
    }
    vorgang.nachname = document.getElementById("vorgangNachname").value;
    if (vorgang.nachname == null || vorgang.nachname == "") {
        displayErrorMessage("&uArr; Dieses Feld muss ausgef&uuml;llt werden!", document.getElementById("vorgangNachname"), 4000);
        return;
    }
    vorgang.email = document.getElementById("vorgangEmail").value;
    vorgang.telefon = document.getElementById("vorgangTel").value;
    if ((vorgang.email == null || vorgang.email == "") && (vorgang.telefon == null || vorgang.telefon == "")) {
        displayErrorMessage("&uArr; Entweder E-Mail oder Telefon muss ausgef&uuml;llt werden!", document.getElementById("vorgangTel"), 4000);
        return;
    }
    vorgang.versandart = document.getElementById("vorgangVersand").value;
    vorgang.anschrift = document.getElementById("vorgangAnschrift").value;
    if (vorgang.versandart === "Post" && (vorgang.anschrift == null || vorgang.anschrift == "")) {
        displayErrorMessage("&uArr; Bei Versendung per Post muss Anschrift ausgef&uuml;llt werden!", document.getElementById("vorgangAnschrift"), 4000);
        return;
    }
    if (vorgang.versandart === "E-Mail" && (vorgang.email == null || vorgang.email == "")) {
        displayErrorMessage("&uArr; Bei Versendung per E-Mail muss die E-Mail Adresse ausgef&uuml;llt werden!", document.getElementById("vorgangEmail"), 4000);
        return;
    }

    // read missing Data
    vorgang.preis = parseFloat(document.getElementById("vorgangPreis").value);
    vorgang.bezahlart = document.getElementById("vorgangBezahlart").value;
    vorgang.bezahlung = document.getElementById("vorgangBezahlung").value;
    vorgang.kommentar = document.getElementById("vorgangKommentar").value;
    document.getElementById("vorgangSpeichern").disabled = true;
    document.getElementById("kartenDrucken").disabled = true;
    document.getElementById("kartenDruckenMediumRes").disabled = true;
    document.getElementById("kartenDruckenLowRes").disabled = true;
    document.getElementById("vorgangDrucken").disabled = true;
    document.getElementById("vorgangLoeschen").disabled = true;
    var firstSave = vorgang.nummer < 0;

    // Upload
    speichereVorgang(function (success) {
        if (success) {
            if (firstSave) {
                // change url
                var query = parseQueryString(window.location.search.substring(1));
                query.nummer = vorgang.nummer;
                var newurl = window.location.origin + window.location.pathname + "?" + getURLQuery(query);
                window.history.replaceState('', '', newurl);
                //window.history.pushState({path: newurl}, '', newurl);

                // reserviert/gebucht
                if (vorgang.bezahlung === "bezahlt") {
                    var status = "gebucht";
                } else {
                    var status = "reserviert";
                }
                for (var i = 0; i < selectedSeats.length; i++) {
                    vorstellungen[selectedSeats[i].dateIndex][selectedSeats[i].seat.ID].status = status;
                }
                draw();
            }
            displayVorgangInformation();
            if (vorgang.bezahlung === "bezahlt" || vorgang.bezahlung === "Abendkasse") {
                document.getElementById("kartenDrucken").disabled = false;
                document.getElementById("kartenDruckenMediumRes").disabled = false;
                document.getElementById("kartenDruckenLowRes").disabled = false;
            }
            document.getElementById("vorgangDrucken").disabled = false;
            document.getElementById("vorgangLoeschen").disabled = false;
            vorgangUnsavedChanges = false;
        } else {
            document.getElementById("vorgangSpeichern").disabled = false;
            document.getElementById("vorgangLoeschen").disabled = false;
            vorgangUnsavedChanges = true;
        }
    });
}

function displayErrorMessage(message, parent, time) {
    var errorMsg = document.createElement("p");
    errorMsg.className = "error";
    errorMsg.style = "line-height: 100% !important; position: absolute; margin: 0px !important; ";
    errorMsg.innerHTML = message;

    var parentRect = parent.getBoundingClientRect();
    errorMsg.style.top = (parentRect.bottom + window.scrollY) + "px";
    //errorMsg.style.right = (parentRect.right + window.scrollX) + "px";
    errorMsg.style.left = (parentRect.left + window.scrollX) + "px";

    document.body.appendChild(errorMsg);
    setTimeout(function () {
        document.body.removeChild(errorMsg);
    }, time);
}

function onVorgangDelete() {
    if (vorgang.nummer < 0)
        return;

    var confirmed = window.confirm("Möchtest du diesen Vorgang wirklich löschen?");
    if (!confirmed)
        return;

    document.getElementById("vorgangSpeichern").disabled = true;
    document.getElementById("kartenDrucken").disabled = true;
    document.getElementById("kartenDruckenMediumRes").disabled = true;
    document.getElementById("kartenDruckenLowRes").disabled = true;
    document.getElementById("vorgangDrucken").disabled = true;
    document.getElementById("vorgangLoeschen").disabled = true;

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', "http://localhost:8000/deleteVorgang.php" + "?key=" + getKey() + "&nummer=" + vorgang.nummer, true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {

            if (xmlHttp.status === 200 && !xmlHttp.responseText.startsWith("Error:")) {
                location.href = "main.html";
            } else {
                alert("Löschen nicht erfolgreich!\n\n" + xmlHttp.responseText);
                if (vorgangUnsavedChanges) {
                    document.getElementById("vorgangSpeichern").disabled = true;
                    document.getElementById("vorgangLoeschen").disabled = true;
                } else {
                    if (vorgang.bezahlung === "bezahlt" || vorgang.bezahlung === "Abendkasse") {
                        document.getElementById("kartenDrucken").disabled = false;
                        document.getElementById("kartenDruckenMediumRes").disabled = false;
                        document.getElementById("kartenDruckenLowRes").disabled = false;
                    }
                    document.getElementById("vorgangDrucken").disabled = false;
                    document.getElementById("vorgangLoeschen").disabled = false;
                }
            }
        }
    };
    xmlHttp.send(null);
}

function adjustClickableSeats(select) {
    var clickableSeats = [undefined, "frei"];
    for (var i = 0; i < vorstellungen.length; i++) {
        for (var k = 0; k < sitzplan.plaetze.length; k++) {
            var status = vorstellungen[i][sitzplan.plaetze[k].ID];
            if (status != null && status.vorgangsNr === vorgang.nummer) {
                clickableSeats.push(status);
                if (select)
                    selectSeat(i, sitzplan.plaetze[k]);
            }
        }
    }
    setClickableSeats(clickableSeats);
}

function displaySeatsInformation() {
    sortSelectedSeats();
    var dateIndex = -1;

    var table = document.getElementById("platzTable");
    table.innerHTML = "";
    for (var i = 0; i < selectedSeats.length; i++) {
        var selection = selectedSeats[i];

        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.innerHTML = vorstellungen[selection.dateIndex].date + " " + vorstellungen[selection.dateIndex].time;
        var td2 = document.createElement("td");
        td2.innerHTML = selection.seat.block;
        var td3 = document.createElement("td");
        td3.innerHTML = selection.seat.reihe;
        var td4 = document.createElement("td");
        td4.innerHTML = selection.seat.platz;

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        table.appendChild(tr);

        if (dateIndex < selection.dateIndex) {
            dateIndex = selection.dateIndex;
            td1.style.borderTop = "1px solid";
            td2.style.borderTop = "1px solid";
            td3.style.borderTop = "1px solid";
            td4.style.borderTop = "1px solid";
        }
    }
}

function displayVorgangInformation() {
    document.getElementById("vorgangNr").innerHTML = vorgang.nummer >= 0 ? vorgang.nummer : "Noch nicht gespeichert";
    document.getElementById("vorgangVorname").value = vorgang.vorname ? vorgang.vorname : "";
    document.getElementById("vorgangNachname").value = vorgang.nachname ? vorgang.nachname : "";
    document.getElementById("vorgangEmail").value = vorgang.email ? vorgang.email : "";
    document.getElementById("vorgangTel").value = vorgang.telefon ? vorgang.telefon : "";
    if (vorgang.bezahlart === "VIP" || vorgang.bezahlart === "TripleA") {
        document.getElementById("vorgangPreisIsVIP").style.display = "block";
        document.getElementById("vorgangPreisNoVIP").style.display = "none";
    } else {
        document.getElementById("vorgangPreis").value = vorgang.preis ? vorgang.preis : sitzplan.kartenPreis;
        document.getElementById("vorgangPreisIsVIP").style.display = "none";
        document.getElementById("vorgangPreisNoVIP").style.display = "block";
    }
    document.getElementById("vorgangGesPreis").innerHTML = vorgang.gesamtpreis.toFixed(2) + "&euro;";
    document.getElementById("vorgangBezahlart").value = vorgang.bezahlart ? vorgang.bezahlart : "Bar";
    document.getElementById("vorgangBezahlung").value = vorgang.bezahlung ? vorgang.bezahlung : "offen";
    document.getElementById("vorgangVersand").value = vorgang.versandart ? vorgang.versandart : "Abholung";
    document.getElementById("vorgangAnschrift").value = vorgang.anschrift ? vorgang.anschrift : "";
    document.getElementById("vorgangKommentar").value = vorgang.kommentar ? vorgang.kommentar : "";

}


function onVorgangDrucken() {
    var printWindow = window.open('html/printVorgang.html', 'to_print', 'height=600,width=800');
    printWindow.apiSchluessel = apiSchluessel;
    printWindow.focus();
    printWindow.addEventListener("load", function () {
        printWindow.druckeVorgang(vorgang.nummer);
    });
}

var eintrittskarteImage;
var eintrittskarteImageMediumResolution;
var eintrittskarteImageLowResolution;
var printImageHtml;

function onKartenDrucken() {
    document.getElementById("kartenDrucken").disabled = true;
    document.getElementById("kartenDruckenMediumRes").disabled = true;
    document.getElementById("kartenDruckenLowRes").disabled = true;
    var imagesHtml = "";
    for (var i = 0; i < vorgang.plaetze.length; i++) {
        var canvas = document.createElement("canvas");
        canvas.style.display = "none";
        canvas.width = eintrittskarteImage.width;
        canvas.height = eintrittskarteImage.height;

        //Draw to Canvas
        var ctx = canvas.getContext("2d");
        ctx.drawImage(eintrittskarteImage, 0, 0);

        // add text
        ctx.font = "50px Times New Roman";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(decodeEntities(vorgang.plaetze[i].date), 1970, 391);
        ctx.fillText(decodeEntities(vorgang.plaetze[i].time), 1970, 550);
        ctx.fillText(decodeEntities(vorgang.plaetze[i].block), 1970, 750);
        ctx.fillText(decodeEntities(vorgang.plaetze[i].reihe), 1970, 917);
        ctx.fillText(vorgang.plaetze[i].platz, 1970, 1088);
        ctx.fillText((vorgang.bezahlart === "VIP" ? "VIP" : (vorgang.preis ? vorgang.preis : sitzplan.kartenPreis).toFixed(2) + "€"), 1970, 1260);
        ctx.fillText(vorgang.bezahlung === "bezahlt" ? "bezahlt" : (vorgang.bezahlung === "Abendkasse" ? "zahlt an der Abendkasse" : "offen"), 1970, 1378);
        ctx.fillText(vorgang.nummer, 1970, 1647);

        //From the canvas you can create a data URL
        var url = canvas.toDataURL();
        imagesHtml += '<img src="' + url + '" /><br/>';
    }
    var html = printImageHtml;
    var html = html.replace('<img src="image.jpg" />', imagesHtml);

    var printWindow = window.open('', 'to_print', 'height=600,width=800');

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    if (vorgang.bezahlung === "bezahlt" || vorgang.bezahlung === "Abendkasse") {
        document.getElementById("kartenDrucken").disabled = false;
        document.getElementById("kartenDruckenMediumRes").disabled = false;
        document.getElementById("kartenDruckenLowRes").disabled = false;
    }
}

function onKartenDruckenMediumRes() {
    document.getElementById("kartenDrucken").disabled = true;
    document.getElementById("kartenDruckenMediumRes").disabled = true;
    document.getElementById("kartenDruckenLowRes").disabled = true;
    var imagesHtml = "";
    for (var i = 0; i < vorgang.plaetze.length; i++) {
        var canvas = document.createElement("canvas");
        canvas.style.display = "none";
        canvas.width = eintrittskarteImageMediumResolution.width;
        canvas.height = eintrittskarteImageMediumResolution.height;

        //Draw to Canvas
        var ctx = canvas.getContext("2d");
        ctx.drawImage(eintrittskarteImageMediumResolution, 0, 0);

        // add text
        ctx.font = "25px Times New Roman";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(decodeEntities(vorgang.plaetze[i].date), 985, 195);
        ctx.fillText(decodeEntities(vorgang.plaetze[i].time), 985, 275);
        ctx.fillText(decodeEntities(vorgang.plaetze[i].block), 985, 375);
        ctx.fillText(decodeEntities(vorgang.plaetze[i].reihe), 985, 460);
        ctx.fillText(vorgang.plaetze[i].platz, 985, 544);
        ctx.fillText((vorgang.bezahlart === "VIP" ? "VIP" : (vorgang.preis ? vorgang.preis : sitzplan.kartenPreis).toFixed(2) + "€"), 985, 630);
        ctx.fillText(vorgang.bezahlung === "bezahlt" ? "bezahlt" : (vorgang.bezahlung === "Abendkasse" ? "zahlt an der Abendkasse" : "offen"), 985, 684);
        ctx.fillText(vorgang.nummer, 985, 824);

        //From the canvas you can create a data URL
        var url = canvas.toDataURL();
        imagesHtml += '<img src="' + url + '" /><br/>';
    }
    var html = printImageHtml;
    var html = html.replace('<img src="image.jpg" />', imagesHtml);

    var printWindow = window.open('', 'to_print', 'height=600,width=800');

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    if (vorgang.bezahlung === "bezahlt" || vorgang.bezahlung === "Abendkasse") {
        document.getElementById("kartenDrucken").disabled = false;
        document.getElementById("kartenDruckenMediumRes").disabled = false;
        document.getElementById("kartenDruckenLowRes").disabled = false;
    }
}

function onKartenDruckenLowRes() {
    document.getElementById("kartenDrucken").disabled = true;
    document.getElementById("kartenDruckenMediumRes").disabled = true;
    document.getElementById("kartenDruckenLowRes").disabled = true;
    var imagesHtml = "";
    for (var i = 0; i < vorgang.plaetze.length; i++) {
        var canvas = document.createElement("canvas");
        canvas.style.display = "none";
        canvas.width = eintrittskarteImageLowResolution.width;
        canvas.height = eintrittskarteImageLowResolution.height;

        //Draw to Canvas
        var ctx = canvas.getContext("2d");
        ctx.drawImage(eintrittskarteImageLowResolution, 0, 0);

        // add text
        ctx.font = "13px Times New Roman";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(decodeEntities(vorgang.plaetze[i].date), 493, 97);
        ctx.fillText(decodeEntities(vorgang.plaetze[i].time), 493, 137);
        ctx.fillText(decodeEntities(vorgang.plaetze[i].block), 493, 187);
        ctx.fillText(decodeEntities(vorgang.plaetze[i].reihe), 493, 230);
        ctx.fillText(vorgang.plaetze[i].platz, 493, 272);
        ctx.fillText((vorgang.bezahlart === "VIP" ? "VIP" : (vorgang.preis ? vorgang.preis : sitzplan.kartenPreis).toFixed(2) + "€"), 493, 315);
        ctx.fillText(vorgang.bezahlung === "bezahlt" ? "bezahlt" : (vorgang.bezahlung === "Abendkasse" ? "zahlt an der Abendkasse" : "offen"), 493, 342);
        ctx.fillText(vorgang.nummer, 493, 412);

        //From the canvas you can create a data URL
        var url = canvas.toDataURL();
        imagesHtml += '<img src="' + url + '" /><br/>';
    }
    var html = printImageHtml;
    var html = html.replace('<img src="image.jpg" />', imagesHtml);

    var printWindow = window.open('', 'to_print', 'height=600,width=800');

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    if (vorgang.bezahlung === "bezahlt" || vorgang.bezahlung === "Abendkasse") {
        document.getElementById("kartenDrucken").disabled = false;
        document.getElementById("kartenDruckenMediumRes").disabled = false;
        document.getElementById("kartenDruckenLowRes").disabled = false;
    }
}

window.onbeforeunload = function (event) {
    if (vorgangUnsavedChanges) {
        displayErrorMessage("&uArr; Speichern nicht vergessen!", document.getElementById("vorgangSpeichern"), 5000);
        event.returnValue = "Es gibt nicht gespeicherte Änderungen.";
        return "Es gibt nicht gespeicherte Änderungen.";
    }
};
