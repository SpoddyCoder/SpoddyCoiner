/**
 * a loose 'static' MVC pattern
 */
const Controller = {};
const Model = {};
const View = {};

Controller.SpoddyCoiner = {

    /**
     * SpoddyCoiner Google Sheets Add-On
     */
    ADDON_NAME: 'SpoddyCoiner',

    /**
     * Version
     * incrementing will create fresh cache entries (the old ones will naturally expire)
     */
    VERSION: '1.2.0.16',

    /**
     * Start in AuthMode FULL or LIMITED
     */
    start: () => {
        View.Menu.addMenu();
    },

    /**
     * Start in AuthMode NONE
     */
    startNoAuth: () => {
        View.Menu.addNoAuthMenu(); // renders the 'About' section only
    },

    /**
     * @param {string} coin         the coin ticker
     * @param {string} attribute    the attribute to get
     * @param {string} [fiat]       fiat to return the value in (required for some attributes)
     * @return {string|number}      the value of the attribute
     */
    getCoinAttribute: ( coin, attribute, fiat ) => Controller.CMC.getCoinAttribute(
        coin,
        attribute,
        fiat,
    ),

    /**
     * @param {number} amount       the amount to convert
     * @param {string} symbol       the coin/currency ticker to convert from
     * @param {string} convert      the coin/currnecy ticker to convert to
     * @return {number}             the converted value
     */
    convert: ( amount, symbol, convert ) => Controller.CMC.convert(
        amount,
        symbol,
        convert,
    ),
};

module.exports = { Controller, Model, View };
