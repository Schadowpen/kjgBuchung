/* global vorstellungen, getSelectedSeat, vorgang, objectsToLoad, selectedSeats, sitzplan, apiSchluessel, apiUrl, htmlFilesUrl */

var selectedDateIndex = 0;
var vorgangUnsavedChanges = false;
var theaterkarteUpdateAllowed = false;

function loadUI() {
    objectsToLoad += 1;

    var query = parseQueryString(window.location.search.substring(1));
    if (query.nummer) {
        var vorgangsNr = query.nummer;

        ladeVorgang(vorgangsNr, function () {
            displayVorgangInformation();
            loadingComplete();
            if (vorgang.bezahlung === "bezahlt" || vorgang.bezahlung === "Abendkasse")
                disableEintrittskartenUI(false)
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

/**
 * Enabled das gesamte Menü, um Theaterkarten auszudrucken und anderes
 * @param {bool} disabled
 */
function disableEintrittskartenUI(disabled) {
    var blockedByCORSPolicy = vorgang.theaterkarte != null && getURLOrigin(vorgang.theaterkarte) !== location.origin;

    document.getElementById("eintrittskartenUI").disabled = disabled;
    document.getElementById("kartenOeffnen").disabled = disabled;
    document.getElementById("kartenLinkKopieren").disabled = disabled;
    document.getElementById("kartenHerunterladen").disabled = disabled || blockedByCORSPolicy;
    document.getElementById("kartenDrucken").disabled = disabled || blockedByCORSPolicy;
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
    // Bereits gespeicherte Vorgang
    if (vorgang.nummer >= 0) {
        if (vorgang.theaterkarte != null && !theaterkarteUpdateAllowed) {
            if (!window.confirm("Für diesen Vorgang wurden bereits Theaterkarten erstellt. Ein Ändern der Sitzplätze würde die Theaterkarten neu erstellen.\n\nTrotzdem fortfahren?"))
                return;
            else
                theaterkarteUpdateAllowed = true;
        }

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

        // Noch nicht gespeicherter Vorgang
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
    disableEintrittskartenUI(true);
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

    displaySeatStatus();
}

function onVorgangSave() {
    // Check for Ticket regeneration
    if (vorgang.theaterkarte != null && !theaterkarteUpdateAllowed) {
        if (!window.confirm("Für diesen Vorgang wurden bereits Theaterkarten erstellt. Jegliche Änderungen würden diese Theaterkarten neu erstellen.\n\nTrotzdem fortfahren?")) {
            document.getElementById("vorgangSpeichern").disabled = true;
            document.getElementById("vorgangDrucken").disabled = true;
            document.getElementById("vorgangLoeschen").disabled = true;
            disableEintrittskartenUI(true);
            ladeVorgang(vorgang.nummer, function (success) {
                if (success) {
                    displayVorgangInformation();
                    displaySeatStatus();
                    if (vorgang.bezahlung === "bezahlt" || vorgang.bezahlung === "Abendkasse")
                        disableEintrittskartenUI(false);
                    document.getElementById("vorgangDrucken").disabled = false;
                    document.getElementById("vorgangLoeschen").disabled = false;
                    vorgangUnsavedChanges = false;
                } else {
                    document.getElementById("vorgangSpeichern").disabled = false;
                    document.getElementById("vorgangLoeschen").disabled = false;
                    vorgangUnsavedChanges = true;
                }
            });
            return;
        } else {
            theaterkarteUpdateAllowed = true;
        }
    }

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
    var firstSave = vorgang.nummer < 0;

    // disable Buttons while upload
    document.getElementById("vorgangSpeichern").disabled = true;
    document.getElementById("vorgangDrucken").disabled = true;
    document.getElementById("vorgangLoeschen").disabled = true;
    disableEintrittskartenUI(true);

    // Upload
    speichereVorgang(function (success) {
        if (success) {
            if (firstSave) {
                // change url
                var query = parseQueryString(window.location.search.substring(1));
                query.nummer = vorgang.nummer;
                var newurl = window.location.origin + window.location.pathname + "?" + getURLQuery(query);
                window.history.replaceState('', '', newurl);

                displaySeatStatus();
            }
            displayVorgangInformation();
            if (vorgang.bezahlung === "bezahlt" || vorgang.bezahlung === "Abendkasse")
                disableEintrittskartenUI(false);
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
    disableEintrittskartenUI(true);
    document.getElementById("vorgangDrucken").disabled = true;
    document.getElementById("vorgangLoeschen").disabled = true;

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', apiUrl + "deleteVorgang.php" + "?key=" + getKey() + "&nummer=" + vorgang.nummer, true);
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
                    if (vorgang.bezahlung === "bezahlt" || vorgang.bezahlung === "Abendkasse")
                        disableEintrittskartenUI(false);
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

function displaySeatStatus() {
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


function onVorgangDrucken() {
    var printWindow = window.open(htmlFilesUrl + 'printVorgang.html', 'to_print', 'height=600,width=800');
    printWindow.apiSchluessel = apiSchluessel;
    printWindow.focus();
    printWindow.addEventListener("load", function () {
        printWindow.druckeVorgang(vorgang.nummer);
    });
}

function onKartenOeffnen() {
    disableEintrittskartenUI(true);
    erstelleVorgangTheaterkarte(function (success) {
        if (!success)
            return;

        window.open(vorgang.theaterkarte);

        if (vorgang.bezahlung === "bezahlt" || vorgang.bezahlung === "Abendkasse")
            disableEintrittskartenUI(false);
    });
}

function onKartenLinkKopieren() {
    disableEintrittskartenUI(true);
    erstelleVorgangTheaterkarte(function (success) {
        if (!success)
            return;

        // Create text element and copy content
        var link = document.createElement("input");
        document.body.appendChild(link);
        link.value = vorgang.theaterkarte;
        link.focus();
        link.select();
        var successfull = document.execCommand("copy");

        // Show success message
        if (successfull)
            alert("Link zur Theaterkarte wurde in die Zwischenablage kopiert");
        else
            alert("Folgender Link konnte nicht in die Zwischenanlage kopiert werden:\n\n" + vorgang.theaterkarte)
        // remove actually visible text element from DOM
        link.remove();
        delete link;

        if (vorgang.bezahlung === "bezahlt" || vorgang.bezahlung === "Abendkasse")
            disableEintrittskartenUI(false);
    });
}

function onKartenDownload() {
    disableEintrittskartenUI(true);
    erstelleVorgangTheaterkarte(function (success) {
        if (!success)
            return;

        if (getURLOrigin(vorgang.theaterkarte) !== location.origin) {
            window.alert("Direktes Herunterladen wird nicht unterstützt. Als Ausweichlösung werden die Theaterkarten in einem neuen Tab geöffnet!");
            window.open(vorgang.theaterkarte);

        } else {
            var filename = decodeURIComponent(vorgang.theaterkarte.substr(vorgang.theaterkarte.lastIndexOf('/') + 1));

            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open('GET', vorgang.theaterkarte, true);
			xmlHttp.responseType = "arraybuffer";
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState === 4) {
					var file = new Blob([xmlHttp.response], {type: "application/pdf"});
					if (window.navigator.msSaveOrOpenBlob) // IE10+
						window.navigator.msSaveOrOpenBlob(file, filename);
					else { // Others
						var a = document.createElement("a")
						var url = URL.createObjectURL(file);
						a.href = url;
						a.download = filename;
						document.body.appendChild(a);
						a.click();
						setTimeout(function () {
							document.body.removeChild(a);
							window.URL.revokeObjectURL(url);
						}, 0);
					}
                }
            };
            xmlHttp.send(null);
        }

        if (vorgang.bezahlung === "bezahlt" || vorgang.bezahlung === "Abendkasse")
            disableEintrittskartenUI(false);
    });
}

function onKartenDrucken() {
    disableEintrittskartenUI(true);
    erstelleVorgangTheaterkarte(function (success) {
        if (!success)
            return;

        if (getURLOrigin(vorgang.theaterkarte) !== location.origin) {
            window.alert("Direktes Drucken wird nicht unterstützt. Als Ausweichlösung werden die Theaterkarten in einem neuen Tab geöffnet!");
            window.open(vorgang.theaterkarte);

        } else {
            var iframe = this._printIframe;
            if (!this._printIframe) {
                iframe = this._printIframe = document.createElement('iframe');
                document.body.appendChild(iframe);
                iframe.style.display = 'none';
                iframe.onload = function () {
                    setTimeout(function () {
						try {
                        iframe.focus();
                        iframe.contentWindow.print();
						} catch (error) {
							window.alert("Direktes Drucken wird nicht unterstützt. Als Ausweichlösung werden die Theaterkarten in einem neuen Tab geöffnet!");
							window.open(vorgang.theaterkarte);
						}
                    }, 1);
                };
            }
            iframe.src = vorgang.theaterkarte;
        }

        if (vorgang.bezahlung === "bezahlt" || vorgang.bezahlung === "Abendkasse")
            disableEintrittskartenUI(false);
    });
}

window.onbeforeunload = function (event) {
    if (vorgangUnsavedChanges) {
        displayErrorMessage("&uArr; Speichern nicht vergessen!", document.getElementById("vorgangSpeichern"), 5000);
        event.returnValue = "Es gibt nicht gespeicherte Änderungen.";
        return "Es gibt nicht gespeicherte Änderungen.";
    }
};
