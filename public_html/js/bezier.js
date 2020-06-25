/* global ctx */

/**
 * Draws a Bezier Line. 
 * lineWidth and strokeStyle have to be set to ctx before
 * @param {Number} x0
 * @param {Number} y0
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} x2
 * @param {Number} y2
 * @param {Number} x3
 * @param {Number} y3
 */
function drawBezierLine(x0, y0, x1, y1, x2, y2, x3, y3) {
    /**
     * Generates a point with x and y position
     * @param {Number} x position of the point
     * @param {Number} y position of the point
     * @returns {P} the new Point
     */
    function P(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * calculate the distance between two points
     * @param {P} P0
     * @param {P} P1
     * @returns {Number} the distance between both points
     */
    function distance(P0, P1) {
        var dx = P1.x - P0.x;
        var dy = P1.y - P0.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    /**
     * Draws the bezier line for four points
     * @param {{x: Number, y: Number}} P0
     * @param {{x: Number, y: Number}} P1
     * @param {{x: Number, y: Number}} P2
     * @param {{x: Number, y: Number}} P3
     */
    function bezier4(P0, P1, P2, P3) {
        if (distance(P0, P3) < 2 && distance(P0, P1) < 1 && distance(P1, P2) < 1 && distance(P2, P3) < 1)
            ctx.lineTo(P3.x, P3.y);
        else {
            var P01 = new P(0.5 * (P0.x + P1.x), 0.5 * (P0.y + P1.y));
            var P12 = new P(0.5 * (P1.x + P2.x), 0.5 * (P1.y + P2.y));
            var P23 = new P(0.5 * (P2.x + P3.x), 0.5 * (P2.y + P3.y));

            var P012 = new P(0.5 * (P01.x + P12.x), 0.5 * (P01.y + P12.y));
            var P123 = new P(0.5 * (P12.x + P23.x), 0.5 * (P12.y + P23.y));

            var P0123 = new P(0.5 * (P012.x + P123.x), 0.5 * (P012.y + P123.y));

            bezier4(P0, P01, P012, P0123);
            bezier4(P0123, P123, P23, P3);
        }
    }

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    bezier4(new P(x0, y0), new P(x1, y1), new P(x2, y2), new P(x3, y3));
    ctx.stroke();
}

/**
 * Checks if the Mouse is over a bezier line
 * @param {Number} x0
 * @param {Number} y0
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} x2
 * @param {Number} y2
 * @param {Number} x3
 * @param {Number} y3
 * @param {{x: Number, y: Number} mousePos
 * @param {Number} bezierThickness 
 * @returns {Boolean}
 */
function isMouseOverBezier(x0, y0, x1, y1, x2, y2, x3, y3, mousePos, bezierThickness) {
    // basic functionality: get Points all over the line and draw a circle around them
    function P(x, y) {
        this.x = x;
        this.y = y;
    }
    function distance(P0, P1) {
        var dx = P1.x - P0.x;
        var dy = P1.y - P0.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    var circleRadius = bezierThickness / 2;
    var maxD = bezierThickness / 4;
    function isOverBezier(P0, P1, P2, P3) {
        if (distance(P0, P3) < maxD && distance(P0, P1) < maxD && distance(P1, P2) < maxD && distance(P2, P3) < maxD)
            return distance(P3, mousePos) < circleRadius;
        else {
            var P01 = new P(0.5 * (P0.x + P1.x), 0.5 * (P0.y + P1.y));
            var P12 = new P(0.5 * (P1.x + P2.x), 0.5 * (P1.y + P2.y));
            var P23 = new P(0.5 * (P2.x + P3.x), 0.5 * (P2.y + P3.y));

            var P012 = new P(0.5 * (P01.x + P12.x), 0.5 * (P01.y + P12.y));
            var P123 = new P(0.5 * (P12.x + P23.x), 0.5 * (P12.y + P23.y));

            var P0123 = new P(0.5 * (P012.x + P123.x), 0.5 * (P012.y + P123.y));

            if (isOverBezier(P0, P01, P012, P0123))
                return true;
            return isOverBezier(P0123, P123, P23, P3);
        }
    }
    
    if (distance(new P(x0, y0), mousePos) < bezierThickness / 2)
        return true;
    return isOverBezier(new P(x0, y0), new P(x1, y1), new P(x2, y2), new P(x3, y3));
}