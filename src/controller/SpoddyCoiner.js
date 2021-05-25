const CMC = require( './CMC' );
const GASProps = require( '../model/GASProps' );
const APICache = require( '../model/APICache' );
const CMCApi = require( '../model/CMCApi' );
const RCApi = require( '../model/RCApi' );
const Menu = require( '../view/Menu' );
const Sheet = require( '../view/Sheet' );

class SpoddyCoiner {
    /**
     * SpoddyCoiner Addon
     *
     * @param {string} instanceName     the variable name of the SpoddyCoiner instance
     */
    constructor( instanceName ) {
        /**
         * the cost of AppsScript menu bindings
         * addMenuItem() functionName's must be the string name of a function in the global scope
         */
        this.instanceName = instanceName;

        /**
         * Addon Name + Version
         */
        this.ADDON_NAME = 'SpoddyCoiner';
        this.VERSION = '1.2.0.69';

        /**
         * a loose MVC pattern
         */
        this.Controller = {};
        this.Model = {};
        this.View = {};

        this.Controller.CMC = new CMC( this );

        this.Model.APICache = new APICache( this );
        this.Model.CMCApi = new CMCApi( this );
        this.Model.RCApi = new RCApi();
        this.Model.GASProps = new GASProps( this );

        this.View.Menu = new Menu( this );
        this.View.Sheet = new Sheet();
    }

    /**
     * Start in AuthMode FULL or LIMITED
     */
    start() {
        this.View.Menu.addMenu();
    }

    /**
     * Start in AuthMode NONE
     * Addon menu contains the 'About' section only
     */
    startNoAuth() {
        this.View.Menu.addNoAuthMenu();
    }

    /**
     * @param {string} coin         the coin ticker
     * @param {string} attribute    the attribute to get
     * @param {string} [fiat]       fiat to return the value in (required for some attributes)
     * @return {string|number}      the value of the attribute
     */
    getCoinAttribute( coin, attribute, fiat ) {
        return this.Controller.CMC.getCoinAttribute( coin, attribute, fiat );
    }

    /**
     * @param {number} amount       the amount to convert
     * @param {string} symbol       the coin/currency ticker to convert from
     * @param {string} convert      the coin/currnecy ticker to convert to
     * @return {number}             the converted value
     */
    convert( amount, symbol, convert ) {
        return this.Controller.CMC.convert( amount, symbol, convert );
    }

    /**
     * Model change handlers
     * update the View as props change
     */
    handleApiKeyChange() {
        this.View.Menu.addMenu();
        this.View.Sheet.refreshAllFunctions();
    }

    handleCacheTimeChange() {
        this.View.Menu.addMenu();
    }

    handleDefaultCurrencyChange() {
        this.View.Menu.addMenu();
        this.View.Sheet.refreshAllFunctions();
    }

    handleDisplayErrorMessagesChange() {
        this.View.Menu.addMenu();
        this.View.Sheet.refreshAllFunctions();
    }

    /**
     * View event handlers
     */
    handleRefreshAllFunctionsConfirm() {
        this.View.Sheet.refreshAllFunctions();
    }
}

module.exports = { SpoddyCoiner };
