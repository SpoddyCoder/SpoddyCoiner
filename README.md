# SpoddyCoiner

Google Sheets Addon to get data from the CoinMarketCap API - supports all your marginal crypto/coins/tokens/shitcoins/shillcoins/moonshots/deepddhonies.

Provides custom functions which can be used just like any standard function (forumala) in a cell...

* `SPODDYCOINER` - get coin prices, stats, metadata etc. 
* `SPODDYCOINER_CONVERT` - convert an amount between two coins or currencies

Caches the response to help reduce the number of API calls and keep within your rate-limits - great for free CMC accounts :)


## Usage

1. Install the SpoddyCoiner Addon (TODO instructions)
3. Get your CoinMarket API Key: https://coinmarketcap.com/api/pricing/
4. Enter the API Key in the google Sheets addon menu (Addons -> SpoddyCoiner -> CoinMarketCap -> API Key)
5. Tap the SpoddyCoiner function into a cell, you will see a tooltip with more info: `=SPODDYCOINER(`
6. See the Addon menu for further help on the available functions and coin attributes you can fetch (Addons -> SpoddyCoiner -> Docs)


### Examples

* `=SPODDYCOINER( "BTC" )` - latest price of BTC in your default currency (using CoinMarketCap latest market rates)
* `=SPODDYCOINER( "DOGE", "price", "GBP" )` - latest price of DOGE in Great British Pounds
* `=SPODDYCOINER( "XRP", "market_cap", "JPY" )` - XRP market capitalization in Japanese Yen
* `=SPODDYCOINER( "NANO", "fcas_grade_full" )` - The FCAS Grade description for NANO
* `=SPODDYCOINER( A1 )` - latest price of coin in cell A1

* `=SPODDYCOINER_CONVERT( "XMR", 0.0456, "BTC" )` - convert 0.0456 XMR to BTC (using CoinMarketCap latest market rates)
* `=SPODDYCOINER_CONVERT( "ADA", 12, "GBP" )` - convert 12 ADA to GBP currency
* `=SPODDYCOINER_CONVERT( "USD", 100, A1 )` - convert $100 to the coin/currency in cell A1


### Coin Attributes

The `SPODDYCOINER` function can get the following coin attributes...

* price
* market_cap
* volume_24h
* percent_change_1h
* percent_change_24h
* percent_change_7d
* percent_change_30d
* circulating_supply
* total_supply
* max_supply
* fcas_grade
* fcas_grade_full
* fcas_percent_change_24h
* fcas_point_change_24h
* name
* description
* logo
* date_added
* tags
* url_website
* url_technical_doc
* url_explorer
* url_source_code