/* 
 * Platziert den HTML-Block mit der ID "userElements" neben das Canvas, wenn dort mehr als 350px platz sind.
 */


window.addEventListener("resize", positionUserElements);
window.addEventListener("load", positionUserElements);

function positionUserElements() {
    var canvasRect = document.getElementById("canvas").getBoundingClientRect();
    var canvasTop = canvasRect.top + window.scrollY;
    var canvasRight = canvasRect.right + window.scrollX;

    if (canvasRight + 440 <= window.innerWidth) {
        document.getElementById("userElements").style.position = "absolute";
        document.getElementById("userElements").style.top = (canvasTop) + "px";
        document.getElementById("userElements").style.left = (canvasRight + 30) + "px";
    } else {
        document.getElementById("userElements").style.position = "static";
    }
}
