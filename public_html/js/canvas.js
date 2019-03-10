/**
 * This script provides drawing and Clicking functionality of the canvas. 
 * The canvas should be loaded and initialized by data.js because it refers to some of it's variables and functionality.
 * 
 * This script calls the function onSeatClicked(seatMouseOver); when a seat is clicked. This function need to be overwritten in the UI script.
 * 
 * This script uses the function isselectedSeat from data.js. 
 * The seats that can be clicked can be defined via setting clickableSeats to a new Array containing the possible status and/or undefined.
 */


// globals from data.js
/* global sitzplan, vorstellungen, objectsToLoad */
// globals from mainPageUI.js
/* global selectedDateIndex, onSeatClicked */

var seatGray;
var seatGrayHighlighted;
var seatGraySelected;
var seatGrayHighlightedSelected;
var seatRed;
var seatRedHighlighted;
var seatRedSelected;
var seatRedHighlightedSelected;
var seatYellow;
var seatYellowHighlighted;
var seatYellowSelected;
var seatYellowHighlightedSelected;
var seatGreen;
var seatGreenHighlighted;
var seatGreenSelected;
var seatGreenHighlightedSelected;

function loadCanvas() {
    objectsToLoad += 16;

    // load seatGray
    seatGray = new Image();
    seatGray.src = "images/seat_gray.png";
    seatGray.onload = loadingComplete();

    // load seatGrayHighlighted
    seatGrayHighlighted = new Image();
    seatGrayHighlighted.src = "images/seat_gray_highlighted.png";
    seatGrayHighlighted.onload = loadingComplete();

    // load seatGraySelected
    seatGraySelected = new Image();
    seatGraySelected.src = "images/seat_gray_selected.png";
    seatGraySelected.onload = loadingComplete();

    // load seatGrayHighlighted
    seatGrayHighlightedSelected = new Image();
    seatGrayHighlightedSelected.src = "images/seat_gray_highlighted_selected.png";
    seatGrayHighlightedSelected.onload = loadingComplete();

    // load seatRed
    seatRed = new Image();
    seatRed.src = "images/seat_red.png";
    seatRed.onload = loadingComplete();

    // load seatRedHighlighted
    seatRedHighlighted = new Image();
    seatRedHighlighted.src = "images/seat_red_highlighted.png";
    seatRedHighlighted.onload = loadingComplete();

    // load seatRedSelected
    seatRedSelected = new Image();
    seatRedSelected.src = "images/seat_red_selected.png";
    seatRedSelected.onload = loadingComplete();

    // load seatRedHighlightedSelected
    seatRedHighlightedSelected = new Image();
    seatRedHighlightedSelected.src = "images/seat_red_highlighted_selected.png";
    seatRedHighlightedSelected.onload = loadingComplete();

    // load seatYellow
    seatYellow = new Image();
    seatYellow.src = "images/seat_yellow.png";
    seatYellow.onload = loadingComplete();

    // load seatYellowHighlighted
    seatYellowHighlighted = new Image();
    seatYellowHighlighted.src = "images/seat_yellow_highlighted.png";
    seatYellowHighlighted.onload = loadingComplete();

    // load seatYellowSelected
    seatYellowSelected = new Image();
    seatYellowSelected.src = "images/seat_yellow_selected.png";
    seatYellowSelected.onload = loadingComplete();

    // load seatYellowHighlightedSelected
    seatYellowHighlightedSelected = new Image();
    seatYellowHighlightedSelected.src = "images/seat_yellow_highlighted_selected.png";
    seatYellowHighlightedSelected.onload = loadingComplete();

    // load seatGreen
    seatGreen = new Image();
    seatGreen.src = "images/seat_green.png";
    seatGreen.onload = loadingComplete();

    // load seatGreenHighlighted
    seatGreenHighlighted = new Image();
    seatGreenHighlighted.src = "images/seat_green_highlighted.png";
    seatGreenHighlighted.onload = loadingComplete();

    // load seatGreenSelected
    seatGreenSelected = new Image();
    seatGreenSelected.src = "images/seat_green_selected.png";
    seatGreenSelected.onload = loadingComplete();

    // load seatGreenHighlightedSelected
    seatGreenHighlightedSelected = new Image();
    seatGreenHighlightedSelected.src = "images/seat_green_highlighted_selected.png";
    seatGreenHighlightedSelected.onload = loadingComplete();
}


var canvas;
var ctx;

var mousePos = {"x": 0, "y": 0};
var seatMouseOver = null;

var supersampling = 2; // supersampling beeinflusst die Rechenzeit nur geringfügig
function draw() {
    if (ctx) {
        canvas.width = canvas.offsetWidth * supersampling;
        canvas.height = canvas.offsetHeight * supersampling;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        var scaleFactor = canvas.width / sitzplan.raumBreite;
        ctx.font = (16.0 * supersampling) + "px Times New Roman";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Maßstab anzeigen
        if (sitzplan.laengenEinheit != null) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 20);
            ctx.moveTo(scaleFactor, 0);
            ctx.lineTo(scaleFactor, 20);
            ctx.moveTo(0, 10);
            ctx.lineTo(scaleFactor, 10);
            ctx.moveTo(7, 3);
            ctx.lineTo(0, 10);
            ctx.lineTo(7, 17);
            ctx.moveTo(scaleFactor - 7, 3);
            ctx.lineTo(scaleFactor - 0, 10);
            ctx.lineTo(scaleFactor - 7, 17);
            ctx.stroke();
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText("1 " + sitzplan.laengenEinheit, 0.5 * scaleFactor, 20);
        }

        // Bereiche anzeigen
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (var i = 0; i < sitzplan.bereiche.length; i++) {
            ctx.fillStyle = sitzplan.bereiche[i].farbe;
            ctx.fillRect(sitzplan.bereiche[i].xPos * scaleFactor,
                    sitzplan.bereiche[i].yPos * scaleFactor,
                    sitzplan.bereiche[i].breite * scaleFactor,
                    sitzplan.bereiche[i].laenge * scaleFactor);
            ctx.fillStyle = sitzplan.bereiche[i].textFarbe;
            ctx.fillText(decodeEntities(sitzplan.bereiche[i].text),
                    (sitzplan.bereiche[i].xPos + sitzplan.bereiche[i].textXPos) * scaleFactor,
                    (sitzplan.bereiche[i].yPos + sitzplan.bereiche[i].textYPos) * scaleFactor);
        }

        // Sitzplaetze anzeigen
        ctx.fillStyle = "black";
        for (var i = 0; i < sitzplan.plaetze.length; i++) {
            ctx.save();
            ctx.translate(sitzplan.plaetze[i].xPos * scaleFactor, sitzplan.plaetze[i].yPos * scaleFactor);
            ctx.rotate(sitzplan.plaetze[i].rotation * Math.PI / 180);
            drawSeat(sitzplan.plaetze[i], -sitzplan.sitzBreite / 2 * scaleFactor, -sitzplan.sitzLaenge / 2 * scaleFactor, sitzplan.sitzBreite * scaleFactor, sitzplan.sitzLaenge * scaleFactor);
            // rotate text so it isn't upside down
            var rotateCorrect = -parseInt(sitzplan.plaetze[i].rotation / 90 + .5) * Math.PI / 2;
            ctx.rotate(rotateCorrect);
            ctx.fillText(sitzplan.plaetze[i].reihe + sitzplan.plaetze[i].platz, 0, 0);
            ctx.restore();
        }
    }
}

function drawSeat(seat, x, y, w, h) {
    if (vorstellungen[selectedDateIndex][seat.ID]) {
        switch (vorstellungen[selectedDateIndex][seat.ID].status) {
            case "frei":
                if (seat === seatMouseOver) {
                    if (isSelectedSeat(selectedDateIndex, seat))
                        ctx.drawImage(seatGrayHighlightedSelected, x, y, w, h);
                    else
                        ctx.drawImage(seatGrayHighlighted, x, y, w, h);
                } else {
                    if (isSelectedSeat(selectedDateIndex, seat))
                        ctx.drawImage(seatGraySelected, x, y, w, h);
                    else
                        ctx.drawImage(seatGray, x, y, w, h);
                }
                break;
            case "reserviert":
                if (seat === seatMouseOver) {
                    if (isSelectedSeat(selectedDateIndex, seat))
                        ctx.drawImage(seatYellowHighlightedSelected, x, y, w, h);
                    else
                        ctx.drawImage(seatYellowHighlighted, x, y, w, h);
                } else {
                    if (isSelectedSeat(selectedDateIndex, seat))
                        ctx.drawImage(seatYellowSelected, x, y, w, h);
                    else
                        ctx.drawImage(seatYellow, x, y, w, h);
                }
                break;
            case "gebucht":
                if (seat === seatMouseOver) {
                    if (isSelectedSeat(selectedDateIndex, seat))
                        ctx.drawImage(seatGreenHighlightedSelected, x, y, w, h);
                    else
                        ctx.drawImage(seatGreenHighlighted, x, y, w, h);
                } else {
                    if (isSelectedSeat(selectedDateIndex, seat))
                        ctx.drawImage(seatGreenSelected, x, y, w, h);
                    else
                        ctx.drawImage(seatGreen, x, y, w, h);
                }
                break;
            case "gesperrt":
                if (seat === seatMouseOver) {
                    if (isSelectedSeat(selectedDateIndex, seat))
                        ctx.drawImage(seatRedHighlightedSelected, x, y, w, h);
                    else
                        ctx.drawImage(seatRedHighlighted, x, y, w, h);
                } else {
                    if (isSelectedSeat(selectedDateIndex, seat))
                        ctx.drawImage(seatRedSelected, x, y, w, h);
                    else
                        ctx.drawImage(seatRed, x, y, w, h);
                }
                break;
        }
    } else {
        if (seat === seatMouseOver) {
            if (isSelectedSeat(selectedDateIndex, seat))
                ctx.drawImage(seatGrayHighlightedSelected, x, y, w, h);
            else
                ctx.drawImage(seatGrayHighlighted, x, y, w, h);
        } else {
            if (isSelectedSeat(selectedDateIndex, seat))
                ctx.drawImage(seatGraySelected, x, y, w, h);
            else
                ctx.drawImage(seatGray, x, y, w, h);
        }
    }
}

function initCanvas() {
    canvas = document.getElementById('canvas');
    // check for browser support
    if (canvas && canvas.getContext) {
        canvasAspectRatio = sitzplan.raumLaenge / sitzplan.raumBreite;
        canvas.style.height = canvas.offsetWidth * canvasAspectRatio + "px";
        canvas.addEventListener("click", onMouseClick);
        canvas.addEventListener("mousemove", onMouseMove);

        ctx = canvas.getContext('2d');
        draw();
        setTimeout(draw, 300); // wird manchmal beim ersten Draw nicht angezeigt whyever
        setTimeout(draw, 600);
        setTimeout(draw, 900);
        setTimeout(draw, 1200);
    }
}

var canvasAspectRatio;
window.addEventListener("resize", function () {
    // Groesse der Ansicht
    if (canvas) {
        canvas.style.height = canvas.offsetWidth * canvasAspectRatio + "px";
        draw();
    }
});

// Default every Seat can be selected
var clickableSeats = [undefined, "frei", "gebucht", "reserviert", "gesperrt"];

function setClickableSeats(cS) {
    clickableSeats = cS;
    getSeatMouseOver();
}

function isClickable(seatStatus) {
    return clickableSeats.indexOf(seatStatus) !== -1
            || (seatStatus != null && clickableSeats.indexOf(seatStatus.status) !== -1);
}

function onMouseMove(event) {
    mousePos = getMousePos(event);
    getSeatMouseOver();
}

function getSeatMouseOver() {
    var foundSeat = null;
    for (var i = 0; i < sitzplan.plaetze.length; i++) {
        var relX = mousePos.x - sitzplan.plaetze[i].xPos;
        var relY = mousePos.y - sitzplan.plaetze[i].yPos;
        var rot = sitzplan.plaetze[i].rotation * Math.PI / 180;
        var inSeatX = Math.cos(rot) * relX + Math.sin(rot) * relY;
        var inSeatY = -Math.sin(rot) * relX + Math.cos(rot) * relY;
        var clickable = isClickable(vorstellungen[selectedDateIndex][sitzplan.plaetze[i].ID]);
        if (clickable && inSeatX < sitzplan.sitzBreite / 2 && inSeatX > -sitzplan.sitzBreite / 2 && inSeatY < sitzplan.sitzLaenge / 2 && inSeatY > -sitzplan.sitzLaenge / 2) {
            foundSeat = sitzplan.plaetze[i];
        }
    }
    if (seatMouseOver !== foundSeat) {
        seatMouseOver = foundSeat;
        draw();
    }
}

function onMouseClick(event) {
    console.log("clicked at x=" + mousePos.x + " y=" + mousePos.y);
    if (seatMouseOver != null && typeof onSeatClicked === "function") {
        onSeatClicked(seatMouseOver);
        draw();
    }
}

/**
 * Returns the Mouse position in room coordinates
 * 
 * @param {MouseEvent} event
 * @returns {x,y} mouse position in room coordinates
 */
function getMousePos(event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) / (rect.right - rect.left) * sitzplan.raumBreite,
        y: (event.clientY - rect.top) / (rect.bottom - rect.top) * sitzplan.raumLaenge
    };
}
