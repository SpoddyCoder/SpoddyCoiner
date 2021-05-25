/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */

/**
 * SpoddyCoiner global scope reference
 */
const SpoddyCoiner = require( './controller/SpoddyCoiner' );

const App = new SpoddyCoiner( 'App' );

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
        // Start in AuthMode NONE - addon menu contains the 'About' section only
        App.View.Menu.addNoAuthMenu();
        return;
    }
    // Start in AuthMode FULL or LIMITED - full menu
    App.View.Menu.addMenu();
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
