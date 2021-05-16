# SpoddyCoiner

Google Sheets Addon that gets data from the CoinMarketCap API - supports all your marginal crypto/coins/tokens/shitcoins/shillcoins/moonshots/deepddhonies. 

This Addon works 100% with *FREE* CoinMarketCap API accounts. Caches the response to help reduce the number of API calls and keep within your rate-limits, great for free CMC accounts which have the lowest rate-limits :)


## Custom Functions

These work just like any standard function in a cell...

* `SPODDYCOINER` - get latest coin prices, market cap, trading volume, token supply, FCAS grades & all sorts of other metadata
* `SPODDYCOINER_CONVERT` - convert an amount between two coins or currencies

### Notes

* All prices/quotes/conversions use CoinMarketCap latest market rates.
* Currently all SpoddyCoiner functions / attributes are available to *FREE* CoinMarketCap API accounts
    * We may support the premium CoinMarket API methods in later releases


## Usage

1. Install the SpoddyCoiner Addon (TODO instructions)
3. Get your CoinMarket API Key: https://coinmarketcap.com/api/pricing/
4. Enter the API Key in the Google Sheets addon menu (Addons -> SpoddyCoiner -> CoinMarketCap API -> Key)
5. Tap the SpoddyCoiner function into a cell, `=SPODDYCOINER(` and you will see a tooltip with more info
6. See the Addon menu further help and preferences (Addons -> SpoddyCoiner)


### Examples

* `=SPODDYCOINER( "BTC" )` - latest price of BTC in your default currency
* `=SPODDYCOINER( "DOGE", "price", "GBP" )` - latest price of DOGE in Great British Pounds
* `=SPODDYCOINER( "XRP", "market_cap", "JPY" )` - XRP market capitalization in Japanese Yen
* `=SPODDYCOINER( "NANO", "fcas_grade_full" )` - The FCAS Grade description for NANO
* `=SPODDYCOINER( A1 )` - latest price of coin in cell A1
* `=SPODDYCOINER_CONVERT( "XMR", 0.0456, "BTC" )` - convert 0.0456 XMR to BTC
* `=SPODDYCOINER_CONVERT( "ADA", 12, "GBP" )` - convert 12 ADA to GBP currency
* `=SPODDYCOINER_CONVERT( "USD", 100, A1 )` - convert $100 to the coin/currency in cell A1


### Coin Attributes

The `SPODDYCOINER` function supports the following `attributes`...

* `price` - latest price in fiat currency
* `market_cap` - latest market capitalization in fiat currency
* `volume_24h` - 24h trading volume
* `percent_change_1h` - 1h trading volume change as a percentage
* `percent_change_24h` - 24h trading volume change as a percentage
* `percent_change_7d` - 7d trading volume change as a percentage
* `percent_change_30d` - 30d trading volume change as a percentage
* `circulating_supply` - number of coins/tokens currently circulating
* `total_supply` - total number of coins/tokens potentially available
* `max_supply` - maximum number of coins/tokens that will ever be available (some coins do not have a max supply)
* `fcas_score` - Fundamental Crypto Asset Score (0-1000), a measure of the fundamental health of crypto projects (only the top 300-400 coins are rated)
* `fcas_grade` -  FCAS Grade (S,A,B,C,E,F)
* `fcas_grade_full` - Full FCAS Grade description (Superb,Attractive,Basic,Caution,Fragile)
* `fcas_point_change_24h` - 24h change in score
* `fcas_percent_change_24h` - 24h change in score as a percentage
* `name` - coin name
* `description` - full description of the project, history and purpose
* `logo` - the logo url
* `date_added` - date added to CoinMarketCap (effectively the date it started)
* `year_added` - year added to CoinMarketCap
* `tags` - comma seperated list of all tags
* `url_website` - primary website for the project (if more than 1, only 1st returned)
* `url_technical_doc` - whitepaper tech document for the project (if more than 1, only 1st returned)
* `url_explorer` - blockchain explorer for the coin/token (if more than 1, only 1st returned)
* `url_source_code` - github url for the project source code (if available)