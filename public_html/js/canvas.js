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
/* global selectedDateIndex, onSeatClicked, imagesUrl */

// Here are seat Images in different colors. Each variable is an Image Object with Image Data.
// It might happen that the Image Data is not loaded even after initialization.
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
var seatBlue;
var seatBlueHighlighted;
var seatBlueSelected;
var seatBlueHighlightedSelected;

/**
 * Function to load all resources (mostly images) for the Canvas.
 * Called from data.js after website is loaded.
 */
function loadCanvas() {
    objectsToLoad += 20;

    // load seatGray
    seatGray = new Image();
    seatGray.onload = loadingComplete();
    seatGray.src = imagesUrl + "seat_gray.png";

    seatGrayHighlighted = new Image();
    seatGrayHighlighted.onload = loadingComplete();
    seatGrayHighlighted.src = imagesUrl + "seat_gray_highlighted.png";

    seatGraySelected = new Image();
    seatGraySelected.onload = loadingComplete();
    seatGraySelected.src = imagesUrl + "seat_gray_selected.png";

    seatGrayHighlightedSelected = new Image();
    seatGrayHighlightedSelected.onload = loadingComplete();
    seatGrayHighlightedSelected.src = imagesUrl + "seat_gray_highlighted_selected.png";

    // load seatRed
    seatRed = new Image();
    seatRed.onload = loadingComplete();
    seatRed.src = imagesUrl + "seat_red.png";

    seatRedHighlighted = new Image();
    seatRedHighlighted.onload = loadingComplete();
    seatRedHighlighted.src = imagesUrl + "seat_red_highlighted.png";

    seatRedSelected = new Image();
    seatRedSelected.onload = loadingComplete();
    seatRedSelected.src = imagesUrl + "seat_red_selected.png";

    seatRedHighlightedSelected = new Image();
    seatRedHighlightedSelected.onload = loadingComplete();
    seatRedHighlightedSelected.src = imagesUrl + "seat_red_highlighted_selected.png";

    // load seatYellow
    seatYellow = new Image();
    seatYellow.onload = loadingComplete();
    seatYellow.src = imagesUrl + "seat_yellow.png";

    seatYellowHighlighted = new Image();
    seatYellowHighlighted.onload = loadingComplete();
    seatYellowHighlighted.src = imagesUrl + "seat_yellow_highlighted.png";

    seatYellowSelected = new Image();
    seatYellowSelected.onload = loadingComplete();
    seatYellowSelected.src = imagesUrl + "seat_yellow_selected.png";

    seatYellowHighlightedSelected = new Image();
    seatYellowHighlightedSelected.onload = loadingComplete();
    seatYellowHighlightedSelected.src = imagesUrl + "seat_yellow_highlighted_selected.png";

    // load seatGreen
    seatGreen = new Image();
    seatGreen.onload = loadingComplete();
    seatGreen.src = imagesUrl + "seat_green.png";

    seatGreenHighlighted = new Image();
    seatGreenHighlighted.onload = loadingComplete();
    seatGreenHighlighted.src = imagesUrl + "seat_green_highlighted.png";

    seatGreenSelected = new Image();
    seatGreenSelected.onload = loadingComplete();
    seatGreenSelected.src = imagesUrl + "seat_green_selected.png";

    seatGreenHighlightedSelected = new Image();
    seatGreenHighlightedSelected.onload = loadingComplete();
    seatGreenHighlightedSelected.src = imagesUrl + "seat_green_highlighted_selected.png";

    // load seatBlue
    seatBlue = new Image();
    seatBlue.onload = loadingComplete();
    seatBlue.src = imagesUrl + "seat_blue.png";

    seatBlueHighlighted = new Image();
    seatBlueHighlighted.onload = loadingComplete();
    seatBlueHighlighted.src = imagesUrl + "seat_blue_highlighted.png";

    seatBlueSelected = new Image();
    seatBlueSelected.onload = loadingComplete();
    seatBlueSelected.src = imagesUrl + "seat_blue_selected.png";

    seatBlueHighlightedSelected = new Image();
    seatBlueHighlightedSelected.onload = loadingComplete();
    seatBlueHighlightedSelected.src = imagesUrl + "seat_blue_highlighted_selected.png";
}


/**
 * The Canvas where the seating plan shall be drawn. 
 * @type Canvas
 */
var canvas;
/**
 * Rendering Context of canvas, used for drawing
 * @type CanvasRenderingContext2D
 */
var ctx;

/**
 * Position of the mouse in the canvas
 * @type |x,y
 */
var mousePos = {"x": 0, "y": 0};
/**
 * Seat over which the mouse is currently hovering.
 * @type Seat
 */
var seatMouseOver = null;

/**
 * Ratio between the resolution of the canvas in pixels and the resolution the content is rendered
 * @type Number
 */
var supersampling = 2; // supersampling beeinflusst die Rechenzeit nur geringf??gig
/**
 * Function which draws the canvas' content
 */
function draw() {
    if (ctx) {
        // Initializing as empty canvas
        canvas.width = canvas.offsetWidth * supersampling;
        canvas.height = canvas.offsetHeight * supersampling;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        // Calculating used variables
        var scaleFactor = canvas.width / sitzplan.raumBreite;
        var sitzInPixel = Math.min(sitzplan.sitzLaenge, sitzplan.sitzBreite) * scaleFactor;
        var fontSize = Math.max(10 * supersampling, Math.min(32 * supersampling, sitzInPixel / 2));
        ctx.font = Math.floor(fontSize) + "px Times New Roman";

        // Ma??stab anzeigen
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
            var text = "1 " + sitzplan.laengenEinheit;
            if (ctx.measureText(text).width >= scaleFactor) { // don't overshoot left
                ctx.textAlign = "left";
                ctx.fillText(text, 0, 20);
            } else {
                ctx.fillText(text, 0.5 * scaleFactor, 20);
            }
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

/**
 * Draws a Seat at the given Position.
 * This function selects the seat color itself. Translation and rotation should be done before
 * @param {Seat} seat Seat to be drawn
 * @param {Number} x X-Position of the upper left corner in Pixels
 * @param {Number} y Y-Position of the upper left corner in Pixels
 * @param {Number} w Width of the Seat image in Pixels
 * @param {Number} h Height of the Seat image in Pixels
 */
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
            case "anwesend":
                if (seat === seatMouseOver) {
                    if (isSelectedSeat(selectedDateIndex, seat))
                        ctx.drawImage(seatBlueHighlightedSelected, x, y, w, h);
                    else
                        ctx.drawImage(seatBlueHighlighted, x, y, w, h);
                } else {
                    if (isSelectedSeat(selectedDateIndex, seat))
                        ctx.drawImage(seatBlueSelected, x, y, w, h);
                    else
                        ctx.drawImage(seatBlue, x, y, w, h);
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

/**
 * Initializes the canvas and draws its content the first time.
 * Will be called from data.js after all data is loaded.
 */
function initCanvas() {
    canvas = document.getElementById('canvas');
    // check for browser support
    if (canvas && canvas.getContext) {
        canvas.style.height = canvas.offsetWidth * (sitzplan.raumLaenge / sitzplan.raumBreite) + "px";
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

/**
 * This function resizes the canvas every time the window is resized to match the canvas size to the room size.
 * @type function
 */
window.addEventListener("resize", function () {
    // Groesse der Ansicht
    if (canvas) {
        canvas.style.height = canvas.offsetWidth * (sitzplan.raumLaenge / sitzplan.raumBreite) + "px";
        draw();
    }
});

// Default every Seat can be selected
/**
 * Array of seats and/or seat status that are allowed to click onto.
 * @type Array
 */
var clickableSeats = [undefined, "frei", "gebucht", "reserviert", "anwesend", "gesperrt"];

/**
 * Sets the clickableSeats to the given array. Then checks if the seat the mouse is over is still clickable.
 * @param {Array} cS Array of seats and/or seat status that are allowed to click onto.
 */
function setClickableSeats(cS) {
    clickableSeats = cS;
    getSeatMouseOver();
}

/**
 * Returns if this seat is clickable. See also clickableSeats.
 * @param {Seat} seatStatus
 * @returns {boolean}
 */
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
