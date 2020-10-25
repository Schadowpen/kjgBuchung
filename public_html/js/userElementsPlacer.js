/* 
 * Platziert den HTML-Block mit der ID "userElements" neben das Canvas, wenn dort mehr als 350px platz sind.
 */

function positionUserElements() {
    var canvasRect = document.getElementById("canvas").getBoundingClientRect();
    var canvasTop = canvasRect.top + window.scrollY;
    var canvasRight = canvasRect.right + window.scrollX;

    if (canvasRight + 440 <= window.innerWidth) {
        document.getElementById("userElements").style.position = "absolute";
        document.getElementById("userElements").style.top = (canvasTop) + "px"; // (canvasTop - 50) + "px";
        document.getElementById("userElements").style.left = (canvasRight + 30) + "px";
    } else {
        document.getElementById("userElements").style.position = "static";
    }
    expandSite();
}

window.addEventListener("resize", positionUserElements);
window.addEventListener("load", positionUserElements);

/*
 * Optional: Erweitern der Seite mithilfe des siteExpander -divs, wenn userElements zu lang werden
 */
function expandSite() {
    if (document.getElementById("siteExpander") == null)
        return;

    // shrink if userElements are in page
    var userElements = document.getElementById("userElements");
    var siteExpander = document.getElementById("siteExpander");
    if (userElements.style.position !== "absolute") {
        siteExpander.style.height = "0px";
        return;
    }
    // get userElements size
    var userElementsRect = userElements.getBoundingClientRect();
    var userElementsBottom = userElementsRect.top + userElementsRect.height + window.scrollY;

    // get Site expander size
    var siteExpanderRect = siteExpander.getBoundingClientRect();
    var siteExpanderTop = siteExpanderRect.top + window.scrollY;
    var siteExpanderHeight = siteExpanderRect.height;

    // expand if necessary
    if (siteExpanderTop + siteExpanderHeight < userElementsBottom) {
        siteExpander.style.height = (userElementsBottom - siteExpanderTop) + "px";
    }
}

window.addEventListener("load", function () {
    var userElements = document.getElementById("userElements");
    var resizeObserver = new ResizeObserver(expandSite);
    resizeObserver.observe(userElements);
});
