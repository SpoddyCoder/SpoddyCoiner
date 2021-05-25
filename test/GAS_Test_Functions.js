/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */

/**
 * Useful functions for testing inside the GAS script editor
 */
function testLogCacheKeys() {
    App.Model.APICache.logCacheKeys();
}
// BTC
function testBTCPrice() {
    SPODDYCOINER( 'BTC' );
}
function testBTCMarketCap() {
    SPODDYCOINER( 'BTC', 'market_cap' );
}
function testBTCTags() {
    SPODDYCOINER( 'BTC', 'tags_top_5' );
}
// ETH
function testETHPrice() {
    SPODDYCOINER( 'ETH' );
}
function testETHMarketCap() {
    SPODDYCOINER( 'ETH', 'market_cap' );
}
function testETHTags() {
    SPODDYCOINER( 'ETH', 'tags_top_5' );
}
// LTC
function testLTCPrice() {
    SPODDYCOINER( 'LTC' );
}
function testLTCMarketCap() {
    SPODDYCOINER( 'LTC', 'market_cap' );
}
function testLTCTags() {
    SPODDYCOINER( 'LTC', 'tags_top_5' );
}
// XMR
function testXMRPrice() {
    SPODDYCOINER( 'XMR' );
}
function testXMRMarketCap() {
    SPODDYCOINER( 'XMR', 'market_cap' );
}
function testXMRTags() {
    SPODDYCOINER( 'XMR', 'tags_top_5' );
}
