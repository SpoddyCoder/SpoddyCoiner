/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */

/**
 * Dev testing inside the GAS Editor
 */
function debug() {
    Logger.log( `${App.View.Menu.ABOUT_HEADING}` );
    Logger.log( `Default Currrency: ${App.Model.GASProps.getDefaultCurrency()}` );
    Logger.log( `Cache key prefix: ${App.Model.APICache.prefixKey( '' )}` );
    Logger.log( `Active Cells: ${App.View.Sheet.getActiveCells()}` );
}
function bustCache() {
    App.Model.APICache.clear();
}
function convertCellsToValues() {
    App.View.Sheet.convertCellsToValues();
}
function refreshSelectedCells() {
    App.View.Sheet.refreshSelectedCells();
}
// BTC
function BTC() {
    SPODDYCOINER( 'BTC' );
    SPODDYCOINER( 'BTC', 'market_cap' );
    SPODDYCOINER( 'BTC', 'tags_top_5' );
    SPODDYCOINER( 'BTC', 'tags_top_5' );
    SPODDYCOINER( 'BTC', 'description_short' );
}
// ETH
function ETH() {
    SPODDYCOINER( 'ETH' );
    SPODDYCOINER( 'ETH', 'price_percent_change_24h' );
    SPODDYCOINER( 'ETH', 'fcas_score' );
}
// LTC
function LTC() {
    SPODDYCOINER( 'LTC' );
    SPODDYCOINER( 'LTC', 'year_added' );
    SPODDYCOINER( 'LTC', 'description' );
}
// XMR
function XMR() {
    SPODDYCOINER( 'XMR' );
    SPODDYCOINER( 'XMR', 'volume_24h' );
    SPODDYCOINER( 'XMR', 'max_supply' );
}
