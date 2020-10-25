/**
 * This script provides drawing and Clicking functionality of the canvas. 
 * The canvas should be loaded and initialized by templateData.js because it refers to some of it's variables and functionality.
 * 
 * TODO Click functionality
 */


// globals from templateData.js
/* global bereiche, eingaenge, plaetze, platzGruppen, platzGruppenPlaetze, veranstaltung, objectsToLoad, selectedElement */
// globals from mainFunctions.js
/* global imagesUrl */
// globals from UI
/* global onElementClicked, drawCanvasOverlay */

// Here are seat Images in different colors. Each variable is an Image Object with Image Data.
// It might happen that the Image Data is not loaded even after initialization.
var seatGray;
var seatGrayHighlighted;
var seatGraySelected;
var seatGrayHighlightedSelected;

/**
 * Function to load all resources (mostly images) for the Canvas.
 * Called from data.js after website is loaded.
 */
function loadCanvas() {
    objectsToLoad += 4;

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
var elementMouseOver = {
    type: "None",
    ref: null
};

/**
 * Ratio between the resolution of the canvas in pixels and the resolution the content is rendered
 * @type Number
 */
var supersampling = 2; // supersampling beeinflusst die Rechenzeit nur geringfügig
/**
 * Function which draws the canvas' content
 */
function draw() {
    if (ctx) {
        // Initializing as empty canvas
        canvas.style.height = canvas.offsetWidth * (veranstaltung.raumLaenge / veranstaltung.raumBreite) + "px";
        canvas.width = canvas.offsetWidth * supersampling;
        canvas.height = canvas.offsetHeight * supersampling;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        // Calculating used variables
        var scaleFactor = canvas.width / veranstaltung.raumBreite;
        var sitzInPixel = Math.min(veranstaltung.sitzLaenge, veranstaltung.sitzBreite) * scaleFactor;
        var fontSize = Math.max(10 * supersampling, Math.min(32 * supersampling, sitzInPixel / 2));
        ctx.font = Math.floor(fontSize) + "px Times New Roman";

        // Maßstab anzeigen
        if (veranstaltung.laengenEinheit != null) {
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
            var text = "1 " + veranstaltung.laengenEinheit;
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
        for (var i = 0; i < bereiche.length; i++) {
            drawBereich(bereiche[i], scaleFactor);
        }

        // Eingaenge anzeigen
        for (var i = 0; i < eingaenge.length; i++) {
            var eingang = eingaenge[i];
            if (eingang.eingang != null) {
                var prevEingang = null;
                for (var k = 0; k < eingaenge.length; k++) {
                    if (eingaenge[k].id === eingang.eingang) {
                        prevEingang = eingaenge[k];
                        break;
                    }
                }
                ctx.lineWidth = veranstaltung.sitzBreite / 10 * scaleFactor;
                ctx.strokeStyle = "#FF000040";
                drawBezierLine(eingang.x0 * scaleFactor, eingang.y0 * scaleFactor,
                        (2 * eingang.x0 - eingang.x1) * scaleFactor, (2 * eingang.y0 - eingang.y1) * scaleFactor,
                        (2 * prevEingang.x3 - prevEingang.x2) * scaleFactor, (2 * prevEingang.y3 - prevEingang.y2) * scaleFactor,
                        prevEingang.x3 * scaleFactor, prevEingang.y3 * scaleFactor);
            }
            drawEingang(eingang, scaleFactor);
        }

        // Sitzplaetze anzeigen
        ctx.fillStyle = "black";
        var x = -veranstaltung.sitzBreite / 2 * scaleFactor,
                y = -veranstaltung.sitzLaenge / 2 * scaleFactor,
                w = veranstaltung.sitzBreite * scaleFactor,
                h = veranstaltung.sitzLaenge * scaleFactor;
        for (var i = 0; i < plaetze.length; i++) {
            ctx.save();
            ctx.translate(plaetze[i].xPos * scaleFactor, plaetze[i].yPos * scaleFactor);
            ctx.rotate(plaetze[i].rotation * Math.PI / 180);
            drawSeat(plaetze[i], x, y, w, h);
            // rotate text so it isn't upside down
            var rotateCorrect = -parseInt(plaetze[i].rotation / 90 + .5) * Math.PI / 2;
            ctx.rotate(rotateCorrect);
            ctx.fillText(plaetze[i].reihe + plaetze[i].platz, 0, 0);
            ctx.restore();
        }

        // PlatzGruppen anzeigen
        for (var i = 0; i < platzGruppenPlaetze.length; i++) {
            ctx.save();
            ctx.translate(platzGruppenPlaetze[i].xPos * scaleFactor, platzGruppenPlaetze[i].yPos * scaleFactor);
            ctx.rotate(platzGruppenPlaetze[i].rotation * Math.PI / 180);
            drawSeat(platzGruppenPlaetze[i], x, y, w, h);
            // rotate text so it isn't upside down
            var rotateCorrect = -parseInt(platzGruppenPlaetze[i].rotation / 90 + .5) * Math.PI / 2;
            ctx.rotate(rotateCorrect);
            ctx.fillText(platzGruppenPlaetze[i].reihe + platzGruppenPlaetze[i].platz, 0, 0);
            ctx.restore();
        }

        // Overlay anzeigen
        if (typeof drawCanvasOverlay === "function")
            drawCanvasOverlay();
    }
}

/**
 * Draws a Bereich
 * @param {type} bereich
 * @param {Number} scaleFactor
 */
function drawBereich(bereich, scaleFactor) {
    var highlighted = false;
    if (elementMouseOver.type === "Bereich" && elementMouseOver.ref.id === bereich.id)
        highlighted = true;
    var selected = false;
    if (selectedElement.type === "Bereich" && selectedElement.ref.id === bereich.id)
        selected = true;

    ctx.fillStyle = highlighted ? brighterColor(bereich.farbe, 64) : bereich.farbe;
    ctx.fillRect(bereich.xPos * scaleFactor,
            bereich.yPos * scaleFactor,
            bereich.breite * scaleFactor,
            bereich.laenge * scaleFactor);
    if (selected) {
        ctx.strokeStyle = "black";
        ctx.strokeRect(bereich.xPos * scaleFactor,
                bereich.yPos * scaleFactor,
                bereich.breite * scaleFactor,
                bereich.laenge * scaleFactor);
    }
    ctx.fillStyle = highlighted ? brighterColor(bereich.textFarbe, 64) : bereich.textFarbe;
    ctx.fillText(decodeEntities(bereich.text),
            (bereich.xPos + bereich.textXPos) * scaleFactor,
            (bereich.yPos + bereich.textYPos) * scaleFactor);

}
/**
 * Draws an Eingang
 * @param {type} eingang
 * @param {Number} scaleFactor
 */
function drawEingang(eingang, scaleFactor) {
    var lineWidth = veranstaltung.sitzBreite / 10 * scaleFactor;
    var highlighted = false;
    if (elementMouseOver.type === "Eingang" && elementMouseOver.ref.id === eingang.id)
        highlighted = true;

    var selected = false;
    if (selectedElement.type === "Eingang" && selectedElement.ref.id === eingang.id)
        selected = true;
    else if (selectedElement.type === "Platz" || selectedElement.type === "PlatzGruppe") {
        // show as selected when target seat is selected
        var platzEingang = selectedElement.ref.eingang;
        while (platzEingang != null) {
            if (platzEingang === eingang.id) {
                selected = true;
                break;
            }
            // go eingang chain upwards
            var newPlatzEingang = null;
            for (var i = 0; i < eingaenge.length; i++) {
                if (eingaenge[i].id === platzEingang) {
                    newPlatzEingang = eingaenge[i].eingang;
                    break;
                }
            }
            platzEingang = newPlatzEingang;
        }
    }

    // Kurve selbst
    if (selected) {
        ctx.lineWidth = lineWidth + 2 * supersampling;
        ctx.strokeStyle = "#000000";
        drawBezierLine(eingang.x0 * scaleFactor, eingang.y0 * scaleFactor,
                eingang.x1 * scaleFactor, eingang.y1 * scaleFactor,
                eingang.x2 * scaleFactor, eingang.y2 * scaleFactor,
                eingang.x3 * scaleFactor, eingang.y3 * scaleFactor);
    }
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = highlighted ? "#FF8080" : "#FF0000";
    drawBezierLine(eingang.x0 * scaleFactor, eingang.y0 * scaleFactor,
            eingang.x1 * scaleFactor, eingang.y1 * scaleFactor,
            eingang.x2 * scaleFactor, eingang.y2 * scaleFactor,
            eingang.x3 * scaleFactor, eingang.y3 * scaleFactor);

    // Pfeil am Ende der Kurve
    var previousPoint = {x: eingang.x2, y: eingang.y2};
    if (previousPoint.x === eingang.x3 && previousPoint.y === eingang.y3) {
        previousPoint = {x: eingang.x1, y: eingang.y1};
        if (previousPoint.x === eingang.x3 && previousPoint.y === eingang.y3) {
            previousPoint = {x: eingang.x0, y: eingang.y0};
        }
    }
    if (previousPoint.x !== eingang.x3 || previousPoint.y !== eingang.y3) {
        var dx = previousPoint.x - eingang.x3;
        var dy = previousPoint.y - eingang.y3;
        var distance = Math.sqrt(dx * dx + dy * dy);
        dx = dx / distance * veranstaltung.sitzLaenge / 2;
        dy = dy / distance * veranstaltung.sitzBreite / 2;

        if (selected) {
            ctx.lineWidth = lineWidth + 2 * supersampling;
            ctx.strokeStyle = "#000000";
            ctx.beginPath();
            ctx.moveTo((eingang.x3 + dx + dy) * scaleFactor,
                    (eingang.y3 + dy - dx) * scaleFactor);
            ctx.lineTo(eingang.x3 * scaleFactor,
                    eingang.y3 * scaleFactor);
            ctx.lineTo((eingang.x3 + dx - dy) * scaleFactor,
                    (eingang.y3 + dy + dx) * scaleFactor);
            ctx.stroke();
        }
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = highlighted ? "#FF8080" : "#FF0000";
        ctx.beginPath();
        ctx.moveTo((eingang.x3 + dx + dy) * scaleFactor,
                (eingang.y3 + dy - dx) * scaleFactor);
        ctx.lineTo(eingang.x3 * scaleFactor,
                eingang.y3 * scaleFactor);
        ctx.lineTo((eingang.x3 + dx - dy) * scaleFactor,
                (eingang.y3 + dy + dx) * scaleFactor);
        ctx.stroke();
    }

    // Punkte 1 und 2 anzeigen
    if (highlighted || selected) {
        ctx.fillStyle = highlighted ? "#808080" : "#000000";
        ctx.fillRect(eingang.x1 * scaleFactor - 3 * supersampling,
                eingang.y1 * scaleFactor - 3 * supersampling,
                6 * supersampling,
                6 * supersampling);
        ctx.fillRect(eingang.x2 * scaleFactor - 3 * supersampling,
                eingang.y2 * scaleFactor - 3 * supersampling,
                6 * supersampling,
                6 * supersampling);
    }

    // text
    if (eingang.text != null) {
        ctx.fillStyle = highlighted ? "grey" : "black";
        ctx.fillText(decodeEntities(eingang.text), eingang.textXPos * scaleFactor, eingang.textYPos * scaleFactor);
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
    var highlighted = false;
    if (elementMouseOver.type === "Platz" && seat.platzGruppe == null)
        highlighted = seatIdentical(elementMouseOver.ref, seat);
    else if (elementMouseOver.type === "PlatzGruppe" && seat.platzGruppe != null)
        highlighted = elementMouseOver.ref.id === seat.platzGruppe.id;
    var selected = false;
    if (selectedElement.type === "Platz" && seat.platzGruppe == null)
        selected = seatIdentical(selectedElement.ref, seat);
    else if (selectedElement.type === "PlatzGruppe" && seat.platzGruppe != null)
        selected = selectedElement.ref.id === seat.platzGruppe.id;

    if (highlighted) {
        if (selected)
            ctx.drawImage(seatGrayHighlightedSelected, x, y, w, h);
        else
            ctx.drawImage(seatGrayHighlighted, x, y, w, h);
    } else {
        if (selected)
            ctx.drawImage(seatGraySelected, x, y, w, h);
        else
            ctx.drawImage(seatGray, x, y, w, h);
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
        canvas.style.height = canvas.offsetWidth * (veranstaltung.raumLaenge / veranstaltung.raumBreite) + "px";
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
        canvas.style.height = canvas.offsetWidth * (veranstaltung.raumLaenge / veranstaltung.raumBreite) + "px";
        draw();
    }
});

var clickable = {
    bereiche: true,
    eingaenge: true,
    plaetze: true,
    platzGruppen: true
};

/**
 * Sets what Elements should be clickable. Then checks if the seat the mouse is over is still clickable.
 * @param {Bool} bereicheClickable If all bereiche are clickable
 * @param {Bool} eingaengeClickable If all bereiche are clickable
 * @param {Bool} plaetzeClickable If all plaetze are clickable
 * @param {Bool} platzGruppenClickable If all platzGruppen are clickable
 */
function setClickable(bereicheClickable, eingaengeClickable, plaetzeClickable, platzGruppenClickable) {
    clickable = {
        bereiche: bereicheClickable,
        eingaenge: eingaengeClickable,
        plaetze: plaetzeClickable,
        platzGruppen: platzGruppenClickable
    };
    getElementMouseOver();
}


function onMouseMove(event) {
    mousePos = getMousePos(event);
    getElementMouseOver();
}

function getElementMouseOver() {
    var foundElement = {
        type: "None",
        ref: null
    };

    // check Bereiche
    for (var i = 0; i < bereiche.length && clickable.bereiche; i++) {
        var bereich = bereiche[i];
        if (mousePos.x >= bereich.xPos && mousePos.x <= bereich.xPos + bereich.breite
                && mousePos.y >= bereich.yPos && mousePos.y <= bereich.yPos + bereich.laenge) {
            foundElement = {
                type: "Bereich",
                ref: bereich
            }
        }
    }

    // check Eingaenge
    for (var i = 0; i < eingaenge.length && clickable.eingaenge; i++) {
        var eingang = eingaenge[i];
        if (isMouseOverBezier(eingang.x0, eingang.y0,
                eingang.x1, eingang.y1,
                eingang.x2, eingang.y2,
                eingang.x3, eingang.y3,
                mousePos, veranstaltung.sitzBreite / 5)) {
            foundElement = {
                type: "Eingang",
                ref: eingang
            };
        }
    }

    // check PlatzGruppe
    for (var i = 0; i < platzGruppenPlaetze.length && clickable.platzGruppen; i++) {
        if (isOverSeat(mousePos, platzGruppenPlaetze[i])) {
            foundElement = {
                type: "PlatzGruppe",
                ref: platzGruppenPlaetze[i].platzGruppe
            };
        }
    }

    // check Plaetze
    for (var i = 0; i < plaetze.length && clickable.plaetze; i++) {
        if (isOverSeat(mousePos, plaetze[i])) {
            foundElement = {
                type: "Platz",
                ref: plaetze[i]
            };
        }
    }

    if (foundElement.ref !== elementMouseOver.ref) {
        elementMouseOver = foundElement;
        draw();
    }
}

/**
 * Checks if mouse position is over seat
 * @param {{x: Number, y: Number}} mousePos
 * @param {Object} seat
 * @returns {Boolean}
 */
function isOverSeat(mousePos, seat) {
    var relX = mousePos.x - seat.xPos;
    var relY = mousePos.y - seat.yPos;
    var rot = seat.rotation * Math.PI / 180;
    var inSeatX = Math.cos(rot) * relX + Math.sin(rot) * relY;
    var inSeatY = -Math.sin(rot) * relX + Math.cos(rot) * relY;
    return inSeatX < veranstaltung.sitzBreite / 2 && inSeatX > -veranstaltung.sitzBreite / 2 && inSeatY < veranstaltung.sitzLaenge / 2 && inSeatY > -veranstaltung.sitzLaenge / 2;
}

function onMouseClick(event) {
    console.log("clicked at x=" + mousePos.x + " y=" + mousePos.y);
    if (typeof onElementClicked === "function") {
        onElementClicked(elementMouseOver);
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
        x: (event.clientX - rect.left) / (rect.right - rect.left) * veranstaltung.raumBreite,
        y: (event.clientY - rect.top) / (rect.bottom - rect.top) * veranstaltung.raumLaenge
    };
}


/**
 * Converts a RGB Color to a Hex String
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @returns {String}
 */
function rgbToHex(r, g, b) {
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/**
 * Converts a Hex Color String to a RGB Color
 * @param {String} hexString
 * @returns {{r: Number, g: Number, b: Number} | null}
 */
function hexToRgb(hexString) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexString);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Makes a color brighter
 * @param {String} colorString Hex Color String
 * @param {Number} amount Value how much it gets brighter 
 * @returns {String} Hex Color String
 */
function brighterColor(colorString, amount) {
    var rgb = hexToRgb(colorString);
    if (rgb === null)
        return "#FFFFFF";
    if (rgb.r > 255 - amount && rgb.g > 255 - amount && rgb.b > 255 - amount) {
        // too bright to make brighter, make darker
        rgb.r = rgb.r - amount;
        rgb.g = rgb.g - amount;
        rgb.b = rgb.b - amount;
    } else {
        rgb.r = rgb.r + amount;
        if (rgb.r > 255)
            rgb.r = 255;
        rgb.g = rgb.g + amount;
        if (rgb.g > 255)
            rgb.g = 255;
        rgb.b = rgb.b + amount;
        if (rgb.b > 255)
            rgb.b = 255;
    }
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}