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
function priceBTC() {
    SPODDYCOINER( 'BTC' );
}
function marketCapBTC() {
    SPODDYCOINER( 'BTC', 'market_cap' );
}
function tagsBTC() {
    SPODDYCOINER( 'BTC', 'tags_top_5' );
}
// ETH
function priceETH() {
    SPODDYCOINER( 'ETH' );
}
function priceChange24ETH() {
    SPODDYCOINER( 'ETH', 'price_percent_change_24h' );
}
function fcasETH() {
    SPODDYCOINER( 'ETH', 'fcas_score' );
}
// LTC
function priceLTC() {
    SPODDYCOINER( 'LTC' );
}
function yearAddedLTC() {
    SPODDYCOINER( 'LTC', 'year_added' );
}
function descriptionLTC() {
    SPODDYCOINER( 'LTC', 'description' );
}
// XMR
function priceXMR() {
    SPODDYCOINER( 'XMR' );
}
function volumeXMR() {
    SPODDYCOINER( 'XMR', 'volume_24h' );
}
function maxSupplyXMR() {
    SPODDYCOINER( 'XMR', 'max_supply' );
}
