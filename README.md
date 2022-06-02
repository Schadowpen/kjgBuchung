# About
Dies ist das Frontend des KjG Theater Ticketing Systems.
Das Backend befindet sich unter https://github.com/Schadowpen/kjgDatabaseAPI.
Software um einen QR- und Barcode- Scanner anzusprechen befindet sich unter https://github.com/Schadowpen/kjgBuchungScanner.

Es ist geplant, das Projekt als WordPress-Plugin komplett neu zu schreiben.


# IDE
Als Entwicklungsumgebung wird NetBeans empfohlen


# TODO
- Herunterladen der Excel-Dateien auch für Archive
- Genauere Warnung, wenn Eingaben die Theaterkarten verändern würden (aktuell wird bei allen Änderungen gewarnt, auch z.B. bei Adresse wo faktisch keine Änderungen an den Karten gemacht werden)
- Zurück-Button auf Vorgangs-Seite
- Bessere E-Mail bei Fehlern, die den Nutzer dazu auffordert, einige Textfelder auszufüllen und andere unbearbeitet zu lassen
- Multi-Select, um mehrere Plätze gleichzeitig zu sperren
- Bugfix: ButtonImages werden in "Sitzplan bearbeiten" manchmal nicht angezeigt
- Bugfix: Wenn Eingang gelöscht wird im Saalplan-Editor, überprüfen ob ein anderer Eingang auf diesen verweist


# Schritte, um ein Update auf den KjG Theater Webserver zu spielen
Die HTML-Seiten müssen geteilt werden in den Body- und den Header-Teil.

Schreibe die Links um, dass sie für den Webserver gelten und nicht mehr für die IDEs. Diese befinden sich in 
- HTML-Headern
- Bilder im HTML-Code
- separate HTML Seiten
- Generelle Routen in mainFunctions.js
- url() Angaben in CSS-Dateien
Füge für die Javascript-Dateien eine Query ?version=XXX an, um Caching vorzubeugen.

Im HTML-Code der Webseiten ist ein Skript mit dem apiSchluessel enthalten. 
Dieser muss so geändert werden, dass der apiSchluessel nicht vordefiniert ist, sondern von WordPress durch PHP-Code eingebaut wird.

Im PHP-Code müssen drei Skripte angepasst werden:
config/config.php               - Konfiguration anpassen
autoload.php                    - Autoloader anpassen, weil Webserver kein \ in Dateipfaden unterstützt
security/securityFunctions.php  - "abc" als gültigen Datenbankschlüssel entfernen

Die Wordpress-Seiten gehören in den Wordpress-Editor, jeweils in die Domain 
kjg-theater.de/login/Dateiname/
Stelle dazu den Wordpress-Editor auf HTML um, jage den HTML-Code durch einen Minifier und kopiere dieses Ergebnis in den Editor
Die zugehörigen Head-Seiten sind für das HiFi-Plugin von Wordpress.
Schütze die Webseiten mithilfe von Simple Wordpress Membership.
Um im Menü in der richtigen Reihenfolge zu erscheinen, setze Order (rechtes Menü) auf einen hochzählenden Zahlenwert.


ZIELURLS und ZIELDATEIPFADE

Für die Seiten:
https://kjg-theater.de/login/Dateiname/

Für Code und Ressourcen:
https://kjg-theater.de/custom-code/...
/WordPress_01/custom-code/...

Für die Datenbank:
/kjg_Ticketing_database/current/

Für die erstellten Theaterkarten:
https://kjg-theater.de/karten/
/WordPress_01/karten/

