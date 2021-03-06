# SpoddyCoiner

Google Sheets Addon that gets cryptocurrency prices, market & meta data from the CoinMarketCap API...

* Supports all cryptos / fiats listed on https://coinmarketcap.com/
    * Covers all your marginal coins/tokens/alts/shitcoins/shillcoins/moonshots/deepDDhonies
* Works 100% with *FREE* CoinMarketCap API accounts
    * Caches API responses & provides some handy tools to help reduce the number of calls and keep within your rate-limits
    * Great for free-tier accounts which have the lowest rate-limits
    * https://coinmarketcap.com/api/pricing/
* Supports over 25 coin attributes
    * Latest prices and % change over 1h, 24h, 7d & 30d ranges
    * Latest market cap and 24h trading volume
    * Tokenomics
    * Latest FCAS scores and grades
    * And all sorts of other metadata
* Convert prices between any crypto / fiat combination

SpodyCoiner pulls data only, it does not push data anywhwere, at any time. And it never will. Ever. See [a relative link](POLICY.md) for further info.


## Custom Functions

These work just like any standard function in Sheets...

* `=SPODDYCOINER(coin, [attribute], [fiat])`
    * Get latest `coin` prices / data / metadata
    * Default `attribute` is `"price"`. See below for full list of supported attributes.
    * Some attribues (such as `"price"` or `"market_cap"`) will be returned in `fiat` currency
    * Default `fiat` currency can be set in the Addons -> SpoddyCoiner menu

* `=SPODDYCOINER_CONVERT(coin, amount, coin)`
    * Convert an `amount` from one `coin` (or fiat) to another `coin` or (fiat)

All prices/quotes/conversions use CoinMarketCap latest market rates.


## Installation + Usage

1. Install the SpoddyCoiner Addon (manual process, trying to get this submitted to the google apps store)
    1. In your spreadsheet goto the menu "Extensions -> Add Ons"
    2. A new AppsScript editor window will open, delete the default `myFunction` code
    3. Copy and paste the SpoddyCoiner code from here: https://raw.githubusercontent.com/SpoddyCoder/SpoddyCoiner/master/dist/Code.js
    4. Give the script a name like "SpoddyCoiner" (what the app will be displayed as in the extensions toolbar)
    5. Click the "Save" icon in the toolbar
    6. Click "Run" and you will be asked to review permissions
        1. You will see a warning that this app isn't verified, click "Advanced" to allow
        2. The warnning is because this app reaches out to the CoinMarket API to get data - but it is perfectly safe, your data is always private to you
        3. Please see the Policy for more information: https://github.com/SpoddyCoder/SpoddyCoiner/blob/master/POLICY.md
    8. Click the link at the bottom to goto your spreadhseet, review the permissions and click "Allow"
    9. You can now close the script editor window
    10. Go back to your spreadhseet and the extension should now be available in the "Extensions" menu
    11. NOTE: would like to get this app listed in the Google Apps store, but my limited understanding indicates this will require an authentication server (time + money) - if you are an AppScript developer and think you can help here, please consider contributing.
3. Get your CoinMarket API Key: https://coinmarketcap.com/api/pricing/
4. Enter the API Key in the Google Sheets addon menu (Extensions -> SpoddyCoiner -> CoinMarketCap API Key)
5. Tap the SpoddyCoiner function into a cell, you'll get a tooltip with more info: `=SPODDYCOINER(`
6. See the SpoddyCoiner Addon menu for further help, preferences & tools (Addons -> SpoddyCoiner)


### Examples

* `=SPODDYCOINER( "BTC" )` - latest price of BTC in your default currency
* `=SPODDYCOINER( "DOGE", "price", "GBP" )` - latest price of DOGE in Great British Pounds
* `=SPODDYCOINER( "XRP", "market_cap", "JPY" )` - XRP market capitalization in Japanese Yen
* `=SPODDYCOINER( "NANO", "fcas_grade_full" )` - The FCAS Grade description for NANO
* `=SPODDYCOINER( A1 )` - latest price of coin in cell A1

* `=SPODDYCOINER_CONVERT( "XMR", 0.0456, "BTC" )` - convert 0.0456 XMR to BTC
* `=SPODDYCOINER_CONVERT( "ADA", 12, "GBP" )` - convert 12 ADA to GBP currency
* `=SPODDYCOINER_CONVERT( "USD", 100, A1 )` - convert $100 to the coin/currency in cell A1

NB: the functions only take a single cell range at present (eg A1).
The next major release will allow full ranges as input (eg: A1:6, A1:F1)


### Coin Attributes

The `SPODDYCOINER` function supports the following `attributes`...

* `price` - latest price in fiat currency
* `price_percent_change_1h` - price change over last 1h
* `price_percent_change_24h` - price change over last 24h
* `price_percent_change_7d` - price change over last 7d
* `price_percent_change_30d` - price change over last 30d
* `market_cap` - latest market capitalization in fiat currency
* `volume_24h` - 24h trading volume
* `circulating_supply` - number of coins/tokens currently circulating
* `total_supply` - total number of coins/tokens potentially available
* `max_supply` - maximum number of coins/tokens that will ever be available (some coins do not have a max supply)
* `fcas_score` - Fundamental Crypto Asset Score (0-1000), a measure of the fundamental health of crypto projects (only the top 300-400 coins are rated)
* `fcas_grade` -  FCAS Grade (S,A,B,C,E,F)
* `fcas_grade_full` - Full FCAS Grade description (Superb,Attractive,Basic,Caution,Fragile)
* `fcas_point_change_24h` - 24h change in FCAS score
* `fcas_percent_change_24h` - 24h change in FCAS score as a percentage
* `name` - coin name
* `description` - description of the crypto, including tokenomicsa & latest market data.
* `description_short` - first sentence of description (dropping tokenomics and market data)
* `logo` - logo url
    * Tip: wrap this in the Google Sheets `IMAGE` function to show it in the cell
    * eg: `=IMAGE(SPODDYCOINER("BTC", "logo"))`
* `date_added` - date added to CoinMarketCap (effectively the date it started)
* `year_added` - year added to CoinMarketCap
* `tags` - comma seperated list of all tags
* `tags_top_5` - comma seperated list of the first 5 tags
* `url_website` - primary website for the project (if more than 1, only 1st returned)
* `url_technical_doc` - whitepaper tech document for the project (if more than 1, only 1st returned)
* `url_explorer` - blockchain explorer for the coin/token (if more than 1, only 1st returned)
* `url_source_code` - github url for the project source code (if available)


### Tools

The SpoddyCoiner extension menu has a number of useful tools...

* #### Refresh Selected Cells
    * Refreshes the `SPODDYCOINER` functions in the selected cells
    * Super useful if you hit an API rate limit error, simply wait a minute and refresh the cell(s)
* #### Refresh All Functions
    * Much like above but does a refresh of all `SPODDYCOINER` functions across the whole spreadsheet
    * On large sheets with lots of SpoddyCoiner function calls, you probably want to avoid refreshing all functions and instead focus on selected cells
* #### Convert Cells to Values
    * Converts the selected cells to the raw value if they contain a `SPODDYCOINR` function
    * Useful for cells containing coin attributes that are not expected to change (eg: `max_supply`, `year_added` etc.)
    * The value will obviously never update again, but this will save you API calls
* #### Clear Cahce
    * Resets the API Cache - allowing you to get the latest value from the CoinMarketCap API
    * NB: functions on the spreadsheet will not immediately update, but you will be asked if you wish to refresh all functions

        
### About the API Cache

The API cache is your friend. It stops API calls being repeated unecessarily, helping to keep inside your rate-limit. 
Free CoinMarketCap API accounts have the lowest rate-limits, but you may purchase a higher tier to increase this.

* Default cache time is `1 hour` - the data you see may be up to 1 hour old
* Cache time can be changed in the Extennsions -> SpoddyCoiner menu, the maximum is 6 hours (21600 seconds)
* Cache can be cleared at any time in the Extensions -> SpoddyCoiner menu


### Errors

* Error messages from the CoinMarketCap API are shown in the cell
    * This can be turned off in the preferences
    * `symbol` is interchangeable for `coin` in error messages
* Common errors:
    * `Exceeded rate limit`
        * CoinMarketCap API rate limits are relatively low on their free-tier accounts
        * You can purchase a higher tier to increase rate-limits
        * Rate-limits are reset every minute
        * See the Extensions -> SpoddyCoiner -> Tools menu for a handy way to refresh the `SPODDYCOINER` functions
    * `Invalid value for symbol` or `symbol is not allowed to be empty`
        * The coin ticker/symbol you've entered is not correct
        * If you're using a cell reference, check it's accurate.
