/**
 * Klasse für eine Transformationsmatrix
 */
class Matrix {
    constructor(a, b, c, d, e, f) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
    }

    /**
     * Transformiert einen Punkt.<br/>
     * Entspricht <b>return p * this</b>
     * @param {{x: number, y: number}} p
     * @return {{x: number, y: number}}
     */
    transformPoint(p) {
        return {
            x: this.a * p.x + this.c * p.y + this.e,
            y: this.b * p.x + this.d * p.y + this.f
        };
    }

    /**
     * Verbindet zwei Transformationsmatritzen<br/>
     * Entspricht <b>return matrix * this</b>
     * @param {Matrix} matrix Anzuwendende Transformation
     * @return {Matrix} neue zusammengeführte Transformation
     */
    addTransformation(matrix) {
        return new Matrix(
            matrix.a * this.a + matrix.b * this.c,
            matrix.a * this.b + matrix.b * this.d,
            matrix.c * this.a + matrix.d * this.c,
            matrix.c * this.b + matrix.d * this.d,
            matrix.e * this.a + matrix.f * this.c + this.e,
            matrix.e * this.b + matrix.f * this.d + this.f
        );
    }

    /**
     * Berechnet die Inverse Matrix zur Transformationsmatrix.
     * Diese Matrix kann dan verwendet werden, um einen Punkt in Device Space in einen Punkt im User Space umzurechnen.
     * @return {Matrix} Invertierte Matrix
     */
    invers() {
        var determinante = this.a * this.d - this.b * this.c;
        return new Matrix(
            this.d / determinante,
            -this.b / determinante,
            -this.c / determinante,
            this.a / determinante,
            (this.c * this.f - this.d * this.e) / determinante,
            (this.b * this.e - this.a * this.f) / determinante
        );
    }
}