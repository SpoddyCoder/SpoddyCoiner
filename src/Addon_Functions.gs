/**
 * @customfunction
 * 
 * Returns coin price and other info from the CoinMarketCap API. Use the Addons -> SpoddyCoiner menu for more info.
 *
 * @param {"BTC"} coin            The coin ticker to lookup, default is BTC
 * @param {"price"} attribute     The attribute to return, default is "price", see docs for full list
 * @param {"GBP"} fiat            Optional: The fiat currency to return the value in (ISO 4217), default can be set in the Addons -> SpoddyCoiner menu
 * 
 * @return                        Latest data about a coin
 */
function SPODDYCOINER( coin = "BTC", attribute = "price", fiat = Model.Props.getDefaultCurrency() ) {
  var coin = ( coin + "" ) || "";
  var attribute = ( attribute + "" ) || "";
  var fiat = ( fiat + "" ) || "";
  return Controller.SpoddyCoiner.getCoinAttribute( coin, attribute, fiat );
}

/**
 * @customfunction
 * 
 * Uses the CoinMarketCap API to convert one crypto/curreny to another crypto/currency. Use the Addons -> SpoddyCoiner menu for more info.
 *
 * @param {0.00123456} amount     The amount to be converted
 * @param {"BTC"} symbol          The coin/currency ticker, default is BTC
 * @param {"GBP"} convert         The coin/currency ticker to convert to, defaults to the currency set in the Addons -> SpoddyCoiner menu
 * 
 * @return                        Converted amount
 */
function SPODDYCOINER_CONVERT( amount, symbol = "BTC", convert = Model.Props.getDefaultCurrency() ) {
  var amount = ( parseFloat(amount) ) || 0;
  var symbol = ( symbol + "" ) || "";
  var convert = ( convert + "" ) || "";
  return Controller.SpoddyCoiner.convert( amount, symbol, convert );
}
