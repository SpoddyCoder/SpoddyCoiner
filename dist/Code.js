class SpoddyCoiner {
    constructor( menu ) {
        this.Menu = menu;
    }

    /**
     * Start in AuthMode FULL or LIMITED
     */
    start() {
        this.Menu.addMenu();
    }

    /**
     * Start in AuthMode NONE
     */
    startNoAuth() {
        this.Menu.addNoAuthMenu(); // renders the 'About' section only
    }

    /**
     * @param {string} coin         the coin ticker
     * @param {string} attribute    the attribute to get
     * @param {string} [fiat]       fiat to return the value in (required for some attributes)
     * @return {string|number}      the value of the attribute
     */
    getCoinAttribute( coin, attribute, fiat ) {
        return this.CMC.getCoinAttribute( coin, attribute, fiat );
    }

    /**
     * @param {number} amount       the amount to convert
     * @param {string} symbol       the coin/currency ticker to convert from
     * @param {string} convert      the coin/currnecy ticker to convert to
     * @return {number}             the converted value
     */
    convert( amount, symbol, convert ) {
        return this.CMC.convert( amount, symbol, convert );
    }
}


import * as Constants from '../controller/Constants';

class Menu {
    /**
     * SpoddyCoiner Addon Menu's
     * @param {SpoddyCoiner} Controller     the main controller class instance
     */
    constructor( Controller ) {
        this.Controller = Controller;
        this.Ui = SpreadsheetApp.getUi();
    }

    /**
     * Basic menu when no authorization has been given
     */
    addNoAuthMenu() {
        this.Ui
            .createAddonMenu()
            .addItem( 'About', 'App.Menu.aboutSpoddyCoiner')
            .addToUi();
    } 

    /**
     * 'About' menu item
     */
    aboutSpoddyCoiner() {
        this.Ui.alert(
            'Hello',
            Constants.ABOUT_TEXT,
            this.Ui.ButtonSet.OK,
        );
    }
}



/**
 * SpoddyCoiner controller class
 */

const App = new SpoddyCoiner(
    new Menu(),
);

/**
 * @OnlyCurrentDoc
 */
function onInstall( e ) {
    onOpen( e );
}

/**
 * @OnlyCurrentDoc
 */
function onOpen( e ) {
    if ( e && e.authMode === ScriptApp.AuthMode.NONE ) {
        App.startNoAuth();
        return;
    }
    App.startNoAuth();
}

/**
 * @OnlyCurrentDoc
 */
function onEdit( e ) {
    // stub atm
}

/**
 * @OnlyCurrentDoc
 */
function onSelectionChange( e ) {
    // stub atm
}
