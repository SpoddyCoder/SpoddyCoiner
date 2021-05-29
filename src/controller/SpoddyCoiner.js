const CMC = require( './CMC' );
const GASProps = require( '../model/GASProps' );
const APICache = require( '../model/APICache' );
const CMCApi = require( '../model/CMCApi' );
const Menu = require( '../view/Menu' );
const Sheet = require( '../view/Sheet' );

class SpoddyCoiner {
    /**
     * SpoddyCoiner Addon primary controller
     *
     * @param {string} instanceName     var name of SpoddyCoiner instance (must be in global scope)
     */
    constructor( instanceName ) {
        /**
         * Addon Name + Version
         */
        this.ADDON_NAME = 'SpoddyCoiner';
        this.VERSION = '1.2.2';

        /**
         * the cost of AppsScript menu bindings
         * addMenuItem() functionName's must be the string name of a function in the global scope
         */
        this.instanceName = instanceName;

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
     *
     * TODO: the C should bind these to the M's & V's
     */
    handleApiKeyChange() {
        this.View.Menu.addMenu();
    }

    handleCacheTimeChange() {
        this.View.Menu.addMenu();
    }

    handleDefaultCurrencyChange() {
        this.View.Menu.addMenu();
    }

    handleDisplayErrorMessagesChange() {
        this.View.Menu.addMenu();
    }

    /**
     * View event handlers
     */
    handleConfirmRefreshAllFunctions() {
        this.View.Sheet.refreshAllFunctions();
    }

    handleConfirmConvertCellsToValues() {
        this.View.Sheet.convertCellsToValues();
    }

    handleConfirmRefreshSelectedCells() {
        this.View.Sheet.refreshSelectedCells();
    }
}

module.exports = { SpoddyCoiner };
