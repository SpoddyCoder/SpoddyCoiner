/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */

/**
 * SpoddyCoiner controller class
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
        App.startNoAuth();
        return;
    }
    App.start();
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
