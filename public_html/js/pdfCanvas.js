/* global kartenConfig, vorlagePositionen, selectedConfig */

var canvas;
var tooltip;

var mouseHoveringElement = {
    config: "none",
    element: "lowerLeftCorner",
    cursor: "initial"
};
var mouseDown = false;
var helperLines = [];

var textWidths = {
    dateTextConfig: 0,
    timeTextConfig: 0,
    blockTextConfig: 0,
    reiheTextConfig: 0,
    platzTextConfig: 0,
    preisTextConfig: 0,
    bezahlstatusTextConfig: 0,
    vorgangsNummerTextConfig: 0
};

function initCanvas() {
    // Zeigen des Textes, wenn Maus darüber ist.
    canvas = document.getElementById("canvas");
    tooltip = document.getElementById("tooltip");

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
}


// -----------------
// | Nutzereingabe |
// -----------------

function onMouseMove(event) {
    var rect = canvas.getBoundingClientRect();
    var x = (event.clientX - rect.left);
    var y = canvas.height - (event.clientY - rect.top);

    // tooltip content
    var onText = false;
    vorlagePositionen.textOperators.forEach(function (textOperator) {
        if (textOperator.isOnText(x, y)) {
            tooltip.innerHTML = "Text: <b>" + textOperator.text + "</b><br/><i>Schriftart: " + textOperator.font + "</i>";
            onText = true;
        }
    });
    // move Tooltip
    tooltip.style.display = (onText && !mouseDown) ? "block" : "none";
    tooltip.style.left = (event.clientX + window.scrollX) + "px";
    tooltip.style.top = (event.clientY + window.scrollY) - tooltip.getBoundingClientRect().height + "px";

    // kartenConfig Elemente
    if (mouseDown) {
        helperLines = []; // Zurücksetzen, wenn weiter verwendet wird sie einfach wieder gesetzt
        switch (mouseHoveringElement.config) {
            case "qrCodeConfig":
            case "sitzplanConfig":
                calcRectanglePositioning({x: x, y: y});
                break;
            case "dateTextConfig":
            case "timeTextConfig":
            case "blockTextConfig":
            case "reiheTextConfig":
            case "platzTextConfig":
            case "preisTextConfig":
            case "bezahlstatusTextConfig":
            case "vorgangsNummerTextConfig":
                calcTextPositioning({x: x, y: y});
                break;
        }
        renderEverything();
    } else {
        setMouseHoveringElement(calcMouseHoveringElement({x: x, y: y}));
    }
}

/**
 * Berechnet das Element, über dem die Computermaus gerade hovert
 * @returns {{cursor: string|null, config: string, element: string}}
 */
function calcMouseHoveringElement(mousePos) {
    // QR Code
    if (kartenConfig.qrCodeConfig != null) {
        if (isOverPoint(mousePos, kartenConfig.qrCodeConfig.lowerLeftCorner)) {
            return {
                config: "qrCodeConfig",
                element: "lowerLeftCorner",
                cursor: "sw-resize"
            }
        }
        if (isOverPoint(mousePos, kartenConfig.qrCodeConfig.lowerRightCorner)) {
            return {
                config: "qrCodeConfig",
                element: "lowerRightCorner",
                cursor: "se-resize"
            }
        }
        if (isOverPoint(mousePos, kartenConfig.qrCodeConfig.upperLeftCorner)) {
            return {
                config: "qrCodeConfig",
                element: "upperLeftCorner",
                cursor: "nw-resize",
            }
        }
        if (isOverLine(mousePos, kartenConfig.qrCodeConfig.upperLeftCorner, kartenConfig.qrCodeConfig.upperRightCorner)) {
            return {
                config: "qrCodeConfig",
                element: "upperLine",
                cursor: "n-resize",
                upperLeftCorner: Object.clone(kartenConfig.qrCodeConfig.upperLeftCorner),
                upperRightCorner: Object.clone(kartenConfig.qrCodeConfig.upperRightCorner)
            };
        }
        if (isOverLine(mousePos, kartenConfig.qrCodeConfig.lowerLeftCorner, kartenConfig.qrCodeConfig.lowerRightCorner)) {
            return {
                config: "qrCodeConfig",
                element: "lowerLine",
                cursor: "s-resize",
                lowerLeftCorner: Object.clone(kartenConfig.qrCodeConfig.lowerLeftCorner),
                lowerRightCorner: Object.clone(kartenConfig.qrCodeConfig.lowerRightCorner)
            };
        }
        if (isOverLine(mousePos, kartenConfig.qrCodeConfig.lowerLeftCorner, kartenConfig.qrCodeConfig.upperLeftCorner)) {
            return {
                config: "qrCodeConfig",
                element: "leftLine",
                cursor: "w-resize",
                lowerLeftCorner: Object.clone(kartenConfig.qrCodeConfig.lowerLeftCorner),
                upperLeftCorner: Object.clone(kartenConfig.qrCodeConfig.upperLeftCorner)
            };
        }
        if (isOverLine(mousePos, kartenConfig.qrCodeConfig.lowerRightCorner, kartenConfig.qrCodeConfig.upperRightCorner)) {
            return {
                config: "qrCodeConfig",
                element: "rightLine",
                cursor: "e-resize",
                lowerRightCorner: Object.clone(kartenConfig.qrCodeConfig.lowerRightCorner),
                upperRightCorner: Object.clone(kartenConfig.qrCodeConfig.upperRightCorner)
            };
        }
    }

    // Sitzplan
    if (kartenConfig.sitzplanConfig != null) {
        if (isOverPoint(mousePos, kartenConfig.sitzplanConfig.lowerLeftCorner)) {
            return {
                config: "sitzplanConfig",
                element: "lowerLeftCorner",
                cursor: "sw-resize"
            }
        }
        if (isOverPoint(mousePos, kartenConfig.sitzplanConfig.lowerRightCorner)) {
            return {
                config: "sitzplanConfig",
                element: "lowerRightCorner",
                cursor: "se-resize"
            }
        }
        if (isOverPoint(mousePos, kartenConfig.sitzplanConfig.upperLeftCorner)) {
            return {
                config: "sitzplanConfig",
                element: "upperLeftCorner",
                cursor: "nw-resize"
            }
        }
        if (isOverLine(mousePos, kartenConfig.sitzplanConfig.upperLeftCorner, kartenConfig.sitzplanConfig.upperRightCorner)) {
            return {
                config: "sitzplanConfig",
                element: "upperLine",
                cursor: "n-resize",
                upperLeftCorner: Object.clone(kartenConfig.sitzplanConfig.upperLeftCorner),
                upperRightCorner: Object.clone(kartenConfig.sitzplanConfig.upperRightCorner)
            };
        }
        if (isOverLine(mousePos, kartenConfig.sitzplanConfig.lowerLeftCorner, kartenConfig.sitzplanConfig.lowerRightCorner)) {
            return {
                config: "sitzplanConfig",
                element: "lowerLine",
                cursor: "s-resize",
                lowerLeftCorner: Object.clone(kartenConfig.sitzplanConfig.lowerLeftCorner),
                lowerRightCorner: Object.clone(kartenConfig.sitzplanConfig.lowerRightCorner)
            };
        }
        if (isOverLine(mousePos, kartenConfig.sitzplanConfig.lowerLeftCorner, kartenConfig.sitzplanConfig.upperLeftCorner)) {
            return {
                config: "sitzplanConfig",
                element: "leftLine",
                cursor: "w-resize",
                lowerLeftCorner: Object.clone(kartenConfig.sitzplanConfig.lowerLeftCorner),
                upperLeftCorner: Object.clone(kartenConfig.sitzplanConfig.upperLeftCorner)
            };
        }
        if (isOverLine(mousePos, kartenConfig.sitzplanConfig.lowerRightCorner, kartenConfig.sitzplanConfig.upperRightCorner)) {
            return {
                config: "sitzplanConfig",
                element: "rightLine",
                cursor: "e-resize",
                lowerRightCorner: Object.clone(kartenConfig.sitzplanConfig.lowerRightCorner),
                upperRightCorner: Object.clone(kartenConfig.sitzplanConfig.upperRightCorner)
            };
        }
    }

    // Textbausteine
    for (var i = 0; i < textConfigNames.length; i++) {
        var textConfigName = textConfigNames[i];
        if (isOverText(mousePos, textConfigName)) {
            return {
                config: textConfigName,
                cursor: "move",
                originalX: kartenConfig[textConfigName].position.x,
                originalY: kartenConfig[textConfigName].position.y,
                deltaX: mousePos.x - kartenConfig[textConfigName].position.x,
                deltaY: mousePos.y - kartenConfig[textConfigName].position.y
            }
        }
    }

    // Kein Element getroffen
    return {
        config: "none"
    };
}

/**
 * Ob der Cursor über einer Linie hovert
 * @return {boolean}
 * @param cursorPos {{x: number, y: number}} Position des Cursors im PDF-Koordinatensystem
 * @param lineStart {{x: number, y: number}} Startpunkt der Linie im PDF-Koordinatensystem
 * @param lineEnd {{x: number, y: number}} Endpunkt der Linie im PDF-Koordinatensystem
 */
function isOverLine(cursorPos, lineStart, lineEnd) {
    var p = calcPositionRelativeToLine(cursorPos, lineStart, lineEnd);
    return (p.x >= 0 && p.x <= p.lineLength && p.y >= -3 && p.y <= 3);
}

/**
 * Ob der Cursor über einem Punkt hovert
 * @return {boolean}
 * @param cursorPos {{x: number, y: number}} Position des Cursors im PDF-Koordinatensystem
 * @param point {{x: number, y: number}} Position des Punktes im PDF-Koordinatensystem
 */
function isOverPoint(cursorPos, point) {
    var dx = point.x - cursorPos.x;
    var dy = point.y - cursorPos.y;
    return (dx >= -4 && dx <= 4 && dy >= -4 && dy <= 4);
}

/**
 * Ob der Cursor über der angegebenen Textkonfiguration hovert
 * @param cursorPos {{x: number, y: number}} Position des Cursors im PDF-Koordinatensystem
 * @param textConfigName {string} Name der Textkonfiguration in kartenConfig
 * @return {boolean}
 */
function isOverText(cursorPos, textConfigName) {
    var config = kartenConfig[textConfigName];
    if (config == null)
        return false;

    var dx = cursorPos.x - config.position.x;
    var dy = cursorPos.y - config.position.y;
    switch (config.alignment) {
        case 0:
            break;
        case 1:
            dx += .5 * textWidths[textConfigName];
            break;
        case 2:
            dx += textWidths[textConfigName];
            break;
    }
    return (dy >= 0 && dy <= config.fontSize && dx >= 0 && dx <= textWidths[textConfigName]);
}

function calcRectanglePositioning(cursorPos) {
    var positionResult, inversMatrix;
    var config = kartenConfig[mouseHoveringElement.config];

    function calcUpperRightCorner() {
        config.upperRightCorner.x = config.upperLeftCorner.x + config.lowerRightCorner.x - config.lowerLeftCorner.x;
        config.upperRightCorner.y = config.upperLeftCorner.y + config.lowerRightCorner.y - config.lowerLeftCorner.y;
    }

    switch (mouseHoveringElement.element) {
        case "lowerLeftCorner":
            config.lowerLeftCorner = cursorPos;
            calcUpperRightCorner();
            break;
        case "lowerRightCorner":
            positionResult = calcPositionRelativeToLine(cursorPos, config.lowerLeftCorner, config.upperLeftCorner);
            if (positionResult.x >= -3 && positionResult.x <= 3) {
                // Hilfslinie für rechteckigen Bereich
                config.lowerRightCorner = positionResult.matrix.invers().transformPoint({x: 0, y: positionResult.y});
                helperLines = [{
                    startPos: config.lowerLeftCorner,
                    endPos: config.lowerRightCorner
                }];
            } else {
                config.lowerRightCorner = cursorPos;
            }
            calcUpperRightCorner();
            break;
        case "upperLeftCorner":
            // Hilfslinie für rechteckigen Bereich
            positionResult = calcPositionRelativeToLine(cursorPos, config.lowerLeftCorner, config.lowerRightCorner);
            if (positionResult.x >= -3 && positionResult.x <= 3) {
                config.upperLeftCorner = positionResult.matrix.invers().transformPoint({x: 0, y: positionResult.y});
                helperLines = [{
                    startPos: config.lowerLeftCorner,
                    endPos: config.upperLeftCorner
                }];
            } else {
                config.upperLeftCorner = cursorPos;
            }
            calcUpperRightCorner();
            break;
        case "lowerLine":
            positionResult = calcPositionRelativeToLine(cursorPos, mouseHoveringElement.lowerLeftCorner, mouseHoveringElement.lowerRightCorner);
            inversMatrix = positionResult.matrix.invers();
            config.lowerLeftCorner = inversMatrix.transformPoint({x: 0, y: positionResult.y});
            config.lowerRightCorner = inversMatrix.transformPoint({x: positionResult.lineLength, y: positionResult.y});
            break;
        case "upperLine":
            positionResult = calcPositionRelativeToLine(cursorPos, mouseHoveringElement.upperLeftCorner, mouseHoveringElement.upperRightCorner);
            inversMatrix = positionResult.matrix.invers();
            config.upperLeftCorner = inversMatrix.transformPoint({x: 0, y: positionResult.y});
            config.upperRightCorner = inversMatrix.transformPoint({x: positionResult.lineLength, y: positionResult.y});
            break;
        case "leftLine":
            positionResult = calcPositionRelativeToLine(cursorPos, mouseHoveringElement.lowerLeftCorner, mouseHoveringElement.upperLeftCorner);
            inversMatrix = positionResult.matrix.invers();
            config.lowerLeftCorner = inversMatrix.transformPoint({x: 0, y: positionResult.y});
            config.upperLeftCorner = inversMatrix.transformPoint({x: positionResult.lineLength, y: positionResult.y});
            break;
        case "rightLine":
            positionResult = calcPositionRelativeToLine(cursorPos, mouseHoveringElement.lowerRightCorner, mouseHoveringElement.upperRightCorner);
            inversMatrix = positionResult.matrix.invers();
            config.lowerRightCorner = inversMatrix.transformPoint({x: 0, y: positionResult.y});
            config.upperRightCorner = inversMatrix.transformPoint({x: positionResult.lineLength, y: positionResult.y});
            break;
    }
}

function calcTextPositioning(cursorPos) {
    var config = kartenConfig[mouseHoveringElement.config];
    var targetX = cursorPos.x - mouseHoveringElement.deltaX;
    var targetY = cursorPos.y - mouseHoveringElement.deltaY;

    // Horizontale Hilfslinie zur vorherigen Position
    if (targetY - mouseHoveringElement.originalY >= -3 && targetY - mouseHoveringElement.originalY <= 3) {
        helperLines = [{
            startPos: {x: mouseHoveringElement.originalX, y: mouseHoveringElement.originalY},
            endPos: {x: targetX, y: mouseHoveringElement.originalY}
        }];
        targetY = mouseHoveringElement.originalY;
    }
    // kombinierbar mit vertikaler Hilfslinie

    // Vertikale Hilfslinie zur vorherigen Position
    if (targetX - mouseHoveringElement.originalX >= -3 && targetX - mouseHoveringElement.originalX <= 3) {
        helperLines.push({
            startPos: {x: mouseHoveringElement.originalX, y: mouseHoveringElement.originalY},
            endPos: {x: mouseHoveringElement.originalX, y: targetY}
        });
        config.position = {
            x: mouseHoveringElement.originalX,
            y: targetY
        };

    } else {
        // Vertikale Hilfslinie zu einer anderen Textkonfiguration finden
        var lowestXDistance = 3.01;
        var nearestTextConfig = null;
        textConfigNames.forEach(function (textConfigName) {
            if (kartenConfig[textConfigName] == null || mouseHoveringElement.config === textConfigName)
                return;
            var dx = Math.abs(targetX - kartenConfig[textConfigName].position.x);
            if (dx < lowestXDistance) {
                lowestXDistance = dx;
                nearestTextConfig = textConfigName;
            }
        });

        // Vertikale Hilfslinie nutzen
        if (nearestTextConfig != null) {
            helperLines.push({
                startPos: kartenConfig[nearestTextConfig].position,
                endPos: {x: kartenConfig[nearestTextConfig].position.x, y: targetY}
            });
            config.position = {
                x: kartenConfig[nearestTextConfig].position.x,
                y: targetY
            };

        } else {
            // ohne vertikale Hilfslinie
            config.position = {
                x: targetX,
                y: targetY
            }
        }
    }
}


function onMouseDown(event) {
    mouseDown = true;
    if (mouseHoveringElement.config !== "none")
        setSelectedConfig(mouseHoveringElement.config);
}


function onMouseUp(event) {
    mouseDown = false;
    helperLines = [];
    if (!Object.equals(kartenConfig, getCurrentKartenConfigInHistory())) {
        switch (mouseHoveringElement.config) {
            case "qrCodeConfig":
                changeQrCodeConfig();
                break;
            case "sitzplanConfig":
                changeSitzplanConfig();
                break;
            case "dateTextConfig":
            case "timeTextConfig":
            case "blockTextConfig":
            case "reiheTextConfig":
            case "platzTextConfig":
            case "preisTextConfig":
            case "bezahlstatusTextConfig":
            case "vorgangsNummerTextConfig":
                changeTextConfig(mouseHoveringElement.config);
                break;
        }
    }
}


function onMouseLeave() {
    tooltip.style.display = "none";
    setMouseHoveringElement({
        config: "none"
    });
}


/**
 * Setzt das Element, über welches die Computermaus gerade hovert. Zeichnet bei Bedarf das Canvas neu
 * @param mhe {{config: string, element: string, cursor: string}} Die neuen Daten über das Element
 */
function setMouseHoveringElement(mhe) {
    if (!Object.equals(mouseHoveringElement, mhe)) {
        mouseHoveringElement = mhe;
        canvas.style.cursor = mhe.cursor != null ? mhe.cursor : "initial";
        drawCanvas();
    }
}


// -----------------------
// | Zeichnen des Canvas |
// -----------------------

function drawCanvas() {
    // Einstellen und Zeichnen des Canvas
    canvas.width = vorlagePositionen.cropBox.upperRightX - vorlagePositionen.cropBox.lowerLeftX;
    canvas.height = vorlagePositionen.cropBox.upperRightY - vorlagePositionen.cropBox.lowerLeftY;
    var ctx = canvas.getContext('2d');
    ctx.save();

    // Zeichnen der Bilder
    vorlagePositionen.imageOperators.forEach(function (imageOperator) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.beginPath();
        ctx.moveTo(imageOperator.lowerLeftCorner.x, canvas.height - imageOperator.lowerLeftCorner.y);
        ctx.lineTo(imageOperator.lowerRightCorner.x, canvas.height - imageOperator.lowerRightCorner.y);
        ctx.lineTo(imageOperator.upperRightCorner.x, canvas.height - imageOperator.upperRightCorner.y);
        ctx.lineTo(imageOperator.upperLeftCorner.x, canvas.height - imageOperator.upperLeftCorner.y);
        ctx.lineTo(imageOperator.lowerLeftCorner.x, canvas.height - imageOperator.lowerLeftCorner.y);
        ctx.stroke();
        ctx.fillText(
            imageOperator.name,
            (imageOperator.lowerLeftCorner.x + imageOperator.lowerRightCorner.x + imageOperator.upperRightCorner.x + imageOperator.upperLeftCorner.x) / 4.0,
            canvas.height - (imageOperator.lowerLeftCorner.y + imageOperator.lowerRightCorner.y + imageOperator.upperRightCorner.y + imageOperator.upperLeftCorner.y) / 4.0
        );
    });

    // Zeichnen der Texte
    vorlagePositionen.textOperators.forEach(function (textOperator) {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(textOperator.startPoint.x, canvas.height - textOperator.startPoint.y);
        ctx.lineTo(textOperator.endPoint.x, canvas.height - textOperator.endPoint.y);
        ctx.stroke();
    });

    // Zeichnen der Konfiguration
    drawKartenConfigRectangle("qrCodeConfig", ctx);
    drawKartenConfigRectangle("sitzplanConfig", ctx);
    drawKartenConfigText("dateTextConfig", ctx, "Datum");
    drawKartenConfigText("timeTextConfig", ctx, "Uhrzeit");
    drawKartenConfigText("blockTextConfig", ctx, "Block");
    drawKartenConfigText("reiheTextConfig", ctx, "Reihe");
    drawKartenConfigText("platzTextConfig", ctx, "Platz");
    drawKartenConfigText("preisTextConfig", ctx, "Preis");
    drawKartenConfigText("bezahlstatusTextConfig", ctx, "Bezahlstatus");
    drawKartenConfigText("vorgangsNummerTextConfig", ctx, "Vorgangsnummer");

    // Zeichnen der Hilfslinien
    helperLines.forEach(function (helperLine) {
        var intersectionsWithBorder = [
            calcLineIntersection(helperLine.startPos, helperLine.endPos, {x: 0, y: 0}, {x: canvas.width, y: 0}),
            calcLineIntersection(helperLine.startPos, helperLine.endPos, {x: 0, y: canvas.height}, {
                x: canvas.width,
                y: canvas.height
            }),
            calcLineIntersection(helperLine.startPos, helperLine.endPos, {x: 0, y: 0}, {x: 0, y: canvas.height}),
            calcLineIntersection(helperLine.startPos, helperLine.endPos, {x: canvas.width, y: 0}, {
                x: canvas.width,
                y: canvas.height
            })
        ];
        var intersectionCount = 0;
        var lowestIntersectionIndex;
        var lowestIntersectionValue = Number.POSITIVE_INFINITY;
        var highestIntersectionIndex;
        var highestIntersectionValue = Number.NEGATIVE_INFINITY;
        intersectionsWithBorder.forEach(function (intersectionResult, i) {
            if (intersectionResult.intersect) {
                intersectionCount++;
                if (intersectionResult.t1 < lowestIntersectionValue) {
                    lowestIntersectionValue = intersectionResult.t1;
                    lowestIntersectionIndex = i;
                }
                if (intersectionResult.t1 > highestIntersectionValue) {
                    highestIntersectionValue = intersectionResult.t1;
                    highestIntersectionIndex = i;
                }
            }
        });
        ctx.fillStyle = "green";
        ctx.strokeStyle = "green";
        ctx.lineWidth = 1;
        if (intersectionCount === 4) {
            var middleIntersections = intersectionsWithBorder.filter(function (value, index) {
                return index !== lowestIntersectionIndex && index !== highestIntersectionIndex;
            });
            ctx.beginPath();
            ctx.moveTo(middleIntersections[0].x, canvas.height - middleIntersections[0].y);
            ctx.lineTo(middleIntersections[1].x, canvas.height - middleIntersections[1].y);
            ctx.stroke();
        } else if (intersectionCount > 1) {
            ctx.beginPath();
            ctx.moveTo(intersectionsWithBorder[lowestIntersectionIndex].x, canvas.height - intersectionsWithBorder[lowestIntersectionIndex].y);
            ctx.lineTo(intersectionsWithBorder[highestIntersectionIndex].x, canvas.height - intersectionsWithBorder[highestIntersectionIndex].y);
            ctx.stroke();
        }
        ctx.fillRect(helperLine.startPos.x - 4, canvas.height - helperLine.startPos.y - 4, 8, 8);
    });
    ctx.restore();
}

function drawKartenConfigRectangle(configName, ctx) {
    if (selectedConfig === configName) {
        ctx.fillStyle = "red";
        ctx.strokeStyle = "red";
    } else {
        ctx.fillStyle = "blue";
        ctx.strokeStyle = "blue";
    }
    var config = kartenConfig[configName];
    if (config == null)
        return;

    ctx.lineWidth = 2;

    if (mouseHoveringElement.config === configName) {
        ctx.lineWidth = mouseHoveringElement.element === "leftLine" ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(config.lowerLeftCorner.x, canvas.height - config.lowerLeftCorner.y);
        ctx.lineTo(config.upperLeftCorner.x, canvas.height - config.upperLeftCorner.y);
        ctx.stroke();

        ctx.lineWidth = mouseHoveringElement.element === "upperLine" ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(config.upperLeftCorner.x, canvas.height - config.upperLeftCorner.y);
        ctx.lineTo(config.upperRightCorner.x, canvas.height - config.upperRightCorner.y);
        ctx.stroke();

        ctx.lineWidth = mouseHoveringElement.element === "rightLine" ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(config.upperRightCorner.x, canvas.height - config.upperRightCorner.y);
        ctx.lineTo(config.lowerRightCorner.x, canvas.height - config.lowerRightCorner.y);
        ctx.stroke();

        ctx.lineWidth = mouseHoveringElement.element === "lowerLine" ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(config.lowerRightCorner.x, canvas.height - config.lowerRightCorner.y);
        ctx.lineTo(config.lowerLeftCorner.x, canvas.height - config.lowerLeftCorner.y);
        ctx.stroke();

        if (mouseHoveringElement.element === "lowerLeftCorner")
            ctx.fillRect(config.lowerLeftCorner.x - 4, canvas.height - config.lowerLeftCorner.y - 4, 8, 8);
        else
            ctx.fillRect(config.lowerLeftCorner.x - 3, canvas.height - config.lowerLeftCorner.y - 3, 6, 6);

        if (mouseHoveringElement.element === "lowerRightCorner")
            ctx.fillRect(config.lowerRightCorner.x - 4, canvas.height - config.lowerRightCorner.y - 4, 8, 8);
        else
            ctx.fillRect(config.lowerRightCorner.x - 3, canvas.height - config.lowerRightCorner.y - 3, 6, 6);

        if (mouseHoveringElement.element === "upperLeftCorner")
            ctx.fillRect(config.upperLeftCorner.x - 4, canvas.height - config.upperLeftCorner.y - 4, 8, 8);
        else
            ctx.fillRect(config.upperLeftCorner.x - 3, canvas.height - config.upperLeftCorner.y - 3, 6, 6);

    } else {
        ctx.beginPath();
        ctx.moveTo(config.lowerLeftCorner.x, canvas.height - config.lowerLeftCorner.y);
        ctx.lineTo(config.upperLeftCorner.x, canvas.height - config.upperLeftCorner.y);
        ctx.lineTo(config.upperRightCorner.x, canvas.height - config.upperRightCorner.y);
        ctx.lineTo(config.lowerRightCorner.x, canvas.height - config.lowerRightCorner.y);
        ctx.lineTo(config.lowerLeftCorner.x, canvas.height - config.lowerLeftCorner.y);
        ctx.stroke();

        ctx.fillRect(config.lowerLeftCorner.x - 3, canvas.height - config.lowerLeftCorner.y - 3, 6, 6);
        ctx.fillRect(config.lowerRightCorner.x - 3, canvas.height - config.lowerRightCorner.y - 3, 6, 6);
        ctx.fillRect(config.upperLeftCorner.x - 3, canvas.height - config.upperLeftCorner.y - 3, 6, 6);
    }
}

function drawKartenConfigText(configName, ctx, showingText) {
    if (selectedConfig === configName) {
        ctx.fillStyle = "red";
        ctx.strokeStyle = "red";
    } else {
        ctx.fillStyle = "blue";
        ctx.strokeStyle = "blue";
    }
    var config = kartenConfig[configName];
    if (config == null)
        return;

    ctx.font = config.fontSize + "px " + config.font;
    switch (config.alignment) {
        case 0:
            ctx.textAlign = "left";
            break;
        case 1:
            ctx.textAlign = "center";
            break;
        case 2:
            ctx.textAlign = "right";
            break;
    }
    ctx.textBaseline = "alphabetic";
    ctx.lineWidth = 2;

    if (mouseHoveringElement.config === configName) {
        ctx.fillRect(config.position.x - 4, canvas.height - config.position.y - 4, 8, 8);
    } else {
        ctx.fillRect(config.position.x - 3, canvas.height - config.position.y - 3, 6, 6);
    }
    ctx.fillText(showingText, config.position.x, canvas.height - config.position.y);
    textWidths[configName] = ctx.measureText(showingText).width;
}


// --------------------
// | Helferfunktionen |
// --------------------

/**
 * Berechnet die Position relativ zu einer angegebenen Linie.
 * Zudem wird die Transformationsmatrix zurückgegeben, mit der Punkte relativ zur Linie berechnet werden können,
 * sowie die Länge der durch die zwei Punkte gebildeten Linie.
 * @param position {{x: number, y: number}} Position im PDF-Koordinatensystem
 * @param lineStart {{x: number, y: number}} Startpunkt der Linie im PDF-Koordinatensystem
 * @param lineEnd {{x: number, y: number}} Endpunkt der Linie im PDF-Koordinatensystem
 * @return {{x: number, y: number, lineLength: number, matrix: Matrix}}
 */
function calcPositionRelativeToLine(position, lineStart, lineEnd) {
    var lineDX = lineEnd.x - lineStart.x;
    var lineDY = lineEnd.y - lineStart.y;
    var lineLength = Math.sqrt(lineDX * lineDX + lineDY * lineDY);
    var matrix = new Matrix(lineDX / lineLength, -lineDY / lineLength, lineDY / lineLength, lineDX / lineLength, 0, 0).addTransformation(
        new Matrix(1, 0, 0, 1, -lineStart.x, -lineStart.y));

    var positionRelativeToLine = matrix.transformPoint(position);
    return {
        x: positionRelativeToLine.x,
        y: positionRelativeToLine.y,
        lineLength: lineLength,
        matrix: matrix
    };
}

/**
 * @param line1Start
 * @param line1End
 * @param line2Start
 * @param line2End
 * @return {{intersect: boolean}|{intersect: boolean, x: *, y: *, t1: number, t2: number}}
 */
/**
 * Berechnet den Schnittpunkt zweier Geraden.
 * Durch die Rückgabewerte intersectOnLine1 und intersectOnLine2 kann auch überprüft werden, ob die beiden Linien sich schneiden.
 * @param line1Start {{x: number, y: number}} Startpunkt von Linie 1
 * @param line1End {{x: number, y: number}} Endpunkt von Linie 1
 * @param line2Start {{x: number, y: number}} Startpunkt von Linie 2
 * @param line2End {{x: number, y: number}} Endpunkt von Linie 2
 * @return {{intersectOnLine1: boolean, intersect: boolean, intersectOnLine2: boolean}|{intersectOnLine1: boolean, intersect: boolean, x: number, y: number, t1: number, t2: number, intersectOnLine2: boolean}}
 */
function calcLineIntersection(line1Start, line1End, line2Start, line2End) {
    var denominator = (line1Start.x - line1End.x) * (line2Start.y - line2End.y) - (line1Start.y - line1End.y) * (line2Start.x - line2End.x);
    if (denominator === 0) {
        return {
            intersect: false,
            intersectOnLine1: false,
            intersectOnLine2: false
        }
    } else {
        var t1 = ((line1Start.x - line2Start.x) * (line2Start.y - line2End.y) - (line1Start.y - line2Start.y) * (line2Start.x - line2End.x)) / denominator;
        var t2 = ((line1Start.x - line1End.x) * (line1Start.y - line2Start.y) - (line1Start.y - line1End.y) * (line1Start.x - line2Start.x)) / denominator;
        return {
            intersect: true,
            x: line1Start.x + t1 * (line1End.x - line1Start.x),
            y: line1Start.y + t1 * (line1End.y - line1Start.y),
            t1: t1,
            intersectOnLine1: (t1 >= 0 && t1 <= 1),
            t2: t2,
            intersectOnLine2: (t2 >= 0 && t2 <= 1)
        }
    }
}