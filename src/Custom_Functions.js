/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */

/**
 * Returns coin price and other info from the CoinMarketCap API.
 * Use the Addons -> SpoddyCoiner menu for more info.
 *
 * @param {"BTC"} coin          Coin ticker to lookup, default is BTC
 * @param {"price"} attribute   Attribute to return, default is "price", see docs for full list
 * @param {"GBP"} [fiat]        Fiat currency to return (ISO 4217), set default in SpoddyCoiner menu
 * @return                      Latest data about a coin
 * @customfunction
 */
function SPODDYCOINER( coin = 'BTC', attribute = 'price', fiat = App.Model.GASProps.getDefaultCurrency() ) {
    return App.Controller.CMC.getCoinAttribute(
        ( coin.toString() ) || '',
        ( attribute.toString() ) || '',
        ( fiat.toString() ) || '',
    );
}

/**
 * Uses the CoinMarketCap API to convert one crypto/curreny to another crypto/currency.
 * sUse the Addons -> SpoddyCoiner menu for more info.
 *
 * @param {0.00123456} amount   Amount to be converted
 * @param {"BTC"} symbol        Coin/currency ticker, default is BTC
 * @param {"GBP"} [convert]     Coin/currency ticker to convert to, set default in SpoddyCoiner menu
 * @return                      Converted amount
 * @customfunction
 */
function SPODDYCOINER_CONVERT( amount, symbol = 'BTC', convert = App.Model.GASProps.getDefaultCurrency() ) {
    return App.Controller.CMC.convert(
        ( parseFloat( amount ) ) || 0,
        ( symbol.toString() ) || '',
        ( convert.toString() ) || '',
    );
}
