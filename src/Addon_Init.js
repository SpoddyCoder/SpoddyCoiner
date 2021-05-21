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
        Controller.SpoddyCoiner.startNoAuth();
        return;
    }
    Controller.SpoddyCoiner.start();
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
