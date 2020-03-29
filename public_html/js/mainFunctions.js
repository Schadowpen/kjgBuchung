/* global apiSchluessel */

var apiUrl = "http://localhost:8000/";
var imagesUrl = "images/";
var htmlFilesUrl = "html/";
var urlForVorgangPage = "vorgang.html"; //"https://kjg-theater.de/login/vorgang/";

// Cross browser support
if (!String.prototype.startsWith) {
    console.log("String.startsWith unsupported");
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

/**
 * Standard Action if an error occurs
 * @param {type} meldung
 * @param {type} url
 * @param {type} zeile
 * @param {type} spalte
 * @param {type} errorObj
 */
window.onerror = function (meldung, url, zeile, spalte, errorObj) {
    if (document.getElementById("errorsAllowed") != null) {
        var txt = "Es ist ein Fehler aufgetreten!\n";
        txt += "Meldung:   " + meldung + "\n";
        txt += "URL:   " + url + "\n";
        txt += "Zeile:   " + zeile + "\n";
        txt += "Spalte:   " + spalte + "\n";
        //txt += "ErrorObj:   " + errorObj + "\n";
        txt += "\nWollen Sie den Fehler melden?";

        var report = window.confirm(txt);

        if (report) {
            var info = "Meldung:\n" + meldung + "\n\n";
            info += "URL:\n" + url + "\n\n";
            info += "Zeile:\n" + zeile + "\n\n";
            info += "Spalte:\n" + spalte + "\n\n";
            reportError(info);
        }
    }
};

/**
 * Meldet einen Fehler über die E-Mail des Nutzers
 * @param {String} fehlerinformation Informationen, die über den Fehler vorliegen. Bitte beachten, zwei Zeilenumbrüche am Ende anzufügen!
 */
function reportError(fehlerinformation) {
    var mail = "mailto:philipp.horwat@t-online.de?subject=Fehlerbericht kjg Webseite&body=";
    var body = "Fehlerbericht vom " + new Date().toLocaleString() + "\n\n";
    body += fehlerinformation;
    body += "Genutzter Webbrowser:\n\n\n";
    body += "Beschreibung des Fehlers:\n\n\n";
    body += "Wie der Fehler reproduziert werden kann:\n\n\n";
    body += "Informationen des Browsers:\n";
    body += "AppName: " + navigator.appName + "\n";
    body += "UserAgent: " + navigator.userAgent + "\n";
    body += "AppVersion: " + navigator.appVersion + "\n";
    body += "Webpage: " + window.location.href;
    mail += encodeURIComponent(body);
    // open E-Mail
    window.location.href = mail;
}

/**
 * Writes a Cookie to Disk
 * 
 * @param {String} name Name of the Cookie
 * @param {String} value Value of the Cookie
 * @param {Date} expires Date when the Cookie expires. If not set the Cookie expires when the Browser is closed
 * @param {String} domain Domain which has Access to the Cookie. Default is the domain of the HTML Page
 * @param {String} path The Path on the Webserver where Files are allowed to read the Cookie. Default is "/"
 * @param {bool} secure Should the Cookie only be read via a HTTPS-Connection?
 * @param {bool} httponly This Cookie cannot be read by Javascript
 */
function setCookie(name, value, expires, domain, path, secure, httponly) {
    var cook = name + "=" + encodeURIComponent(value);
    cook += (expires) ? "; expires=" + expires.toUTCString() : "";
    cook += (domain) ? "; domain=" + domain : "";
    cook += (path) ? "; path=" + path : "; path=/";
    cook += (secure) ? "; secure" : "";
    cook += (httponly) ? "; HttpOnly" : "";
    document.cookie = cook;
}

/**
 * Reads a Cookie from Disk
 * 
 * @param {String} name Name of the Cookie
 * @returns {String} Value of the Cookie
 */
function getCookie(name) {
    var suche = name + "=";
    var cookieArray = document.cookie.split(";");
    for (var i = 0; i < cookieArray.length; i++) {
        var cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }

        if (cookie.indexOf(suche) === 0) {
            return decodeURIComponent(cookie.substring(suche.length));
        }
    }
    return null;
}

/**
 * Deletes a Cookie from Disk
 * 
 * @param {String} name Name of the Cookie
 * @param {String} domain Domain which has Access to the Cookie. Default is the domain of the HTML Page
 * @param {String} path The Path on the Webserver where Files are allowed to read the Cookie. Default is "/"
 */
function deleteCookie(name, domain, path) {
    var cook = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    cook += (domain) ? "; domain=" + domain : "";
    cook += (path) ? "; path=" + path : "; path=/";
    document.cookie = cook;
}

/**
 * Writes a Cookie containing a JSON String to disk
 * 
 * @param {String} name Name of the Cookie
 * @param {String} object A Javascript Object that should be written into the Cookie
 * @param {Date} expires Date when the Cookie expires. If not set the Cookie expires when the Browser is closed
 * @param {String} domain Domain which has Access to the Cookie. Default is the domain of the HTML Page
 * @param {String} path The Path on the Webserver where Files are allowed to read the Cookie. Default is "/"
 * @param {bool} secure Should the Cookie only be read via a HTTPS-Connection?
 * @param {bool} httponly This Cookie cannot be read by Javascript
 */
function setJsonCookie(name, object, expires, domain, path, secure, httponly) {
    setCookie(name, JSON.stringify(object), expires, domain, path, secure, httponly);
}

/**
 * Writes a parameter of a JSON Object into the Cookie.
 * The Cookie should contain a JSON Object before this method call.
 * 
 * @param {String} name Name of the Cookie
 * @param {String} attribute Name of the Attribute in the JSON Object 
 * @param {String} value Value of the Attribute in the JSON Object
 * @param {Date} expires Date when the Cookie expires. If not set the Cookie expires when the Browser is closed
 * @param {String} domain Domain which has Access to the Cookie. Default is the domain of the HTML Page
 * @param {String} path The Path on the Webserver where Files are allowed to read the Cookie. Default is "/"
 * @param {bool} secure Should the Cookie only be read via a HTTPS-Connection?
 */
function setJsonCookieAttribute(name, attribute, value, expires, domain, path, secure) {
    var json = getJsonCookie(name);
    if (json === null)
        json = {};
    json[attribute] = value;
    setJsonCookie(name, json, expires, domain, path, secure);
}

/**
 * Reads a Cookie from Disk and parses it to a Javascript Object
 * 
 * @param {type} name Name of the Cookie
 * @returns {Array|Object} The Javascript Object in the Cookie
 */
function getJsonCookie(name) {
    return JSON.parse(getCookie(name));
}

/**
 * reads a Cookie containing a JSON String and returns the value of the given attribute
 * 
 * @param {type} name Name of the Cookie
 * @param {type} attribute Name of the Attribute in the JSON Object 
 * @returns {unknown|null} Whatever this Attribute contains, or null if attribute or Cookie don't exist.
 */
function getJsonCookieAttribute(name, attribute) {
    var json = getJsonCookie(name);
    if (json === null)
        return null;
    else
        return json[attribute];
}

/**
 * Decodes html Entities like &amp;uuml; to normal Characters
 * 
 * @param {String} str String to decode
 * @returns {String} decoded String 
 */
var decodeEntities = (function () {
    // this prevents any overhead from creating the object each time
    var element = document.createElement('div');

    function decodeHTMLEntities(str) {
        if (str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
    }

    return decodeHTMLEntities;
})();

/**
 * parses the Query from the URL (without the ? at the beginning of the query) to a Javascript object
 * 
 * @param {String} query
 * @returns {Object}
 */
function parseQueryString(query) {
    var vars = query.split("&");
    var query_string = {};
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        var key = decodeURIComponent(pair[0]);
        var value = decodeURIComponent(pair[1]);
        query_string[key] = decodeURIComponent(value);
    }
    return query_string;
}

/**
 * Parses a Javascript Object to the Query for an URL (without the ? at the beginning of the query)
 * 
 * @param {Object} object
 * @returns {String}
 */
function getURLQuery(object) {
    var str = "";
    for (var key in object) {
        var value = object[key];
        str += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(value);
    }
    return str.substring(1);
}

/**
 * Returns the origin-Part of a given URL.
 * @param {string} url Web URL
 * @returns {string} origin of the url
 */
function getURLOrigin(url) {
    var pathArray = url.split('/');
    var protocol = pathArray[0];
    var host = pathArray[2];
    return protocol + '//' + host;
}

/**
 * returns the Key needed to access the database
 * @returns {String}
 */
function getKey() {
    var key = apiSchluessel;
    key += new Date().toISOString().substring(0, 16);
    return forge_sha256(key);
}
