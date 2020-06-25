var kartenConfigHistory = [];
var currentKartenConfigHistoryIndex = -1;

/**
 * Fügt die globale kartenConfig als neuen Eintrag zur History hinzu und setzt diese als aktuelle kartenConfig.
 * Sollte sich die letzte kartenConfig irgendwo mittig in der History befinden, wird die "zukünftige" History gelöscht und durch die aktuelle kartenConfig ersetzt
 */
function addKartenConfigHistoryEntry() {
    currentKartenConfigHistoryIndex ++;
    kartenConfigHistory = kartenConfigHistory.slice(0, currentKartenConfigHistoryIndex);
    kartenConfigHistory[currentKartenConfigHistoryIndex] = Object.clone(kartenConfig);
}

/**
 * geht einen Schritt in der History zurück, setzt die globale kartenConfig und lädt dies auch direkt hoch
 * @see uploadKartenConfig wird von hier aus aufgerufen mit dem Zusatz, nicht die kartenConfigHistory zu verändern
 */
function undoKartenConfig() {
    if (undoKartenConfigPossible()) {
        currentKartenConfigHistoryIndex --;
        kartenConfig = Object.clone(kartenConfigHistory[currentKartenConfigHistoryIndex]);
        uploadKartenConfig(false);
    }
}

/**
 * @return {boolean} Ob in der History ein Schritt zurück gegangen werden kann
 */
function undoKartenConfigPossible() {
    return currentKartenConfigHistoryIndex > 0;
}

/**
 * geht einen Schritt in der History nach vorne, setzt die globale kartenConfig und lädt dies auch direkt hoch
 * @see uploadKartenConfig wird von hier aus aufgerufen mit dem Zusatz, nicht die kartenConfigHistory zu verändern
 */
function redoKartenConfig() {
    if (redoKartenConfigPossible()) {
         currentKartenConfigHistoryIndex ++;
         kartenConfig = Object.clone(kartenConfigHistory[currentKartenConfigHistoryIndex]);
         uploadKartenConfig(false);
    }
}

/**
 * @return {boolean} Ob in der History ein Schritt nach vorne gegangen werden kann
 */
function redoKartenConfigPossible() {
    return currentKartenConfigHistoryIndex < kartenConfigHistory.length - 1;
}

/**
 * Liefert die aktuelle kartenConfig aus der History.
 * Nur notwendig, wenn die globale kartenConfig in einem Zwischenzustand ist, der sich von der in der History gespeicherten kartenConfig unterscheidet.
 * @return {*}
 */
function getCurrentKartenConfigInHistory() {
    return kartenConfigHistory[currentKartenConfigHistoryIndex];
}