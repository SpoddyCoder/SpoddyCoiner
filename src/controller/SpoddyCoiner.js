const CMC = require( './CMC' );
const GASProps = require( '../model/GASProps' );
const APICache = require( '../model/APICache' );
const CMCApi = require( '../model/CMCApi' );
const Menu = require( '../view/Menu' );
const Sheet = require( '../view/Sheet' );

/**
 * Primary controller
 */
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
        this.VERSION = '1.2.0.70';

        /**
         * a loose MVC pattern
         */
        this.Controller = {};
        this.Model = {};
        this.View = {};

        this.Controller.CMC = new CMC( this );

        this.Model.GASProps = new GASProps( this );
        this.Model.APICache = new APICache( this );
        this.Model.CMCApi = new CMCApi( this );

        this.View.Menu = new Menu( this );
        this.View.Sheet = new Sheet( this );
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
