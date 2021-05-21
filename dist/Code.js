/**
 * a loose 'static' MVC pattern
 */
const Controller = {};
const Model = {};
const View = {};

Controller.SpoddyCoiner = {

    /**
     * SpoddyCoiner Google Sheets Add-On
     */
    ADDON_NAME: 'SpoddyCoiner',

    /**
     * Version
     * incrementing will create fresh cache entries (the old ones will naturally expire)
     */
    VERSION: '1.2.0.3',

    /**
     * Start in AuthMode FULL or LIMITED
     */
    start: () => {
        View.Menu.addMenu();
    },

    /**
     * Start in AuthMode NONE
     */
    startNoAuth: () => {
        View.Menu.addNoAuthMenu(); // renders the 'About' section only
    },

    /**
     * @param {string} coin         the coin ticker
     * @param {string} attribute    the attribute to get
     * @param {string} [fiat]       fiat to return the value in (required for some attributes)
     * @return {string|number}      the value of the attribute
     */
    getCoinAttribute: ( coin, attribute, fiat ) => {
        let coinData = {};
        let value;

        switch ( attribute ) {
            case 'price':
            case 'market_cap':
            case 'volume_24h':
                coinData = Model.CMCApi.getCryptoQuoteLatest( coin, fiat );
                if ( !coinData.error_message ) {
                    value = coinData.quote[fiat][attribute];
                    Logger.log( `${coin} ${attribute} : ${value} ${fiat}` );
                }
                break;

            case 'price_percent_change_1h':
            case 'price_percent_change_24h':
            case 'price_percent_change_7d':
            case 'price_percent_change_30d':
                coinData = Model.CMCApi.getCryptoQuoteLatest( coin, fiat );
                if ( !coinData.error_message ) {
                    value = coinData.quote[fiat][attribute.replace( 'price_', '' )] / 100; // make compatible with standard Google Sheets percentage format
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'circulating_supply':
            case 'total_supply':
            case 'max_supply':
                coinData = Model.CMCApi.getCryptoQuoteLatest( coin, fiat );
                if ( !coinData.error_message ) {
                    value = coinData[attribute];
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'fcas_grade':
            case 'fcas_grade_full':
                coinData = Model.CMCApi.getFCASQuoteLatest( coin );
                if ( !coinData.error_message ) {
                    value = ( attribute === 'fcas_grade' ) ? coinData.grade : Model.CMCApi.FCAS_GRADES[coinData.grade];
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'fcas_score':
            case 'fcas_percent_change_24h':
            case 'fcas_point_change_24h':
                coinData = Model.CMCApi.getFCASQuoteLatest( coin );
                if ( !coinData.error_message ) {
                    value = coinData[attribute.replace( 'fcas_', '' )];
                    if ( coinData.score === '' ) {
                        value = ''; // if there is no FCAS score, set all FCAS attributes to empty
                    } else {
                        value = ( attribute === 'fcas_percent_change_24h' ) ? value / 100 : value; // make compatible with standard Google Sheets percentage format
                    }
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'name':
            case 'description':
            case 'logo':
                coinData = Model.CMCApi.getCryptoMetadata( coin );
                if ( !coinData.error_message ) {
                    value = coinData[attribute];
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'date_added':
            case 'year_added':
                coinData = Model.CMCApi.getCryptoMetadata( coin );
                if ( !coinData.error_message ) {
                    value = new Date( coinData.date_added ); // convert to GS native date format
                    value = ( attribute === 'year_added' ) ? value.getFullYear() : value;
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'tags':
            case 'tags_top_5':
                coinData = Model.CMCApi.getCryptoMetadata( coin );
                if ( !coinData.error_message ) {
                    let { tags } = coinData;
                    tags = ( attribute === 'tags_top_5' ) ? tags.slice( 0, 5 ) : tags;
                    value = tags.join( ', ' ); // return a CSV list
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'url_website':
            case 'url_technical_doc':
            case 'url_explorer':
            case 'url_source_code':
                coinData = Model.CMCApi.getCryptoMetadata( coin );
                if ( !coinData.error_message ) {
                    value = coinData.urls[attribute.replace( 'url_', '' )][0]; // these can return many url's, just return the first for now (TODO)
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            default:
                coinData.error_message = `Invalid attribute : ${attribute}`;
                break;
        }

        if ( coinData.error_message ) {
            Logger.log( `Error: ${coinData.error_message}` );
            return ( Model.Props.getDisplayErrorMessages() ) ? coinData.error_message : '';
        }
        return value;
    },

    /**
     * @param {number} amount       the amount to convert
     * @param {string} symbol       the coin/currency ticker to convert from
     * @param {string} convert      the coin/currnecy ticker to convert to
     * @return {number}             the converted value
     */
    convert: ( amount, symbol, convert ) => {
        const conversion_data = Model.CMCApi.priceConversion( amount, symbol, convert );
        if ( conversion_data.error_message ) {
            Logger.log( `Error: ${conversion_data.error_message}` );
            return conversion_data.error_message;
        }
        value = conversion_data[convert].price;
        Logger.log( `${amount} ${symbol} : ${value} ${convert}` );
        return value;
    },

};

Model.Cache = {

    /**
     * Cache time in seconds
     */
    DEFAULT_CACHE_TIME: 3600,
    MAX_CACHE_TIME: 21600,

    /**
     * The cache key for the Cache Keys Tracker
     */
    CACHE_KEYS: 'cache_keys',

    /**
     * Put string or JSON object into cache by key name
     *
     * @param {string} key  key name
     * @param {string} obj  object/string to store
     * @return {boolean}    succesfully added
     */
    put: ( key, obj ) => {
        const cache = CacheService.getUserCache();
        const prefixedKey = Model.Cache.prefixKey( key );
        let returnObj = obj;
        if ( typeof ( obj ) !== 'string' ) {
            returnObj = JSON.stringify( obj );
        }
        if ( key !== Model.Cache.CACHE_KEYS ) {
            Model.Cache.addToCacheKeysTracker( prefixedKey );
        }
        return cache.put( prefixedKey, returnObj, Model.Props.getCacheTime() );
    },

    /**
     * Get String or JSON object from cache by key name
     *
     * @param {string} key      key name
     * @return {object|string}  the JSON object/string/null
     */
    get: ( key ) => {
        const cache = CacheService.getUserCache();
        const prefixedKey = Model.Cache.prefixKey( key );
        const obj = cache.get( prefixedKey );
        let returnObj = obj;
        try {
            returnObj = JSON.parse( obj );
        } catch ( e ) {
            return returnObj; // string
        }
        // init the cache_keys tracker when it's needed (can expire outside the scope of the script)
        if ( key === Model.Cache.CACHE_KEYS && obj === null ) {
            Model.Cache.put( Model.Cache.CACHE_KEYS, [] );
            return [];
        }
        return returnObj; // object or null
    },

    /**
     * Clear the cache, using our cache_keys tracker
     *
     * @return {boolean}    cleared OK
     */
    clear: () => {
        const cache = CacheService.getUserCache();
        const cacheKeys = Model.Cache.get( Model.Cache.CACHE_KEYS );
        if ( cacheKeys ) {
            cache.removeAll( cacheKeys );
            Model.Cache.put( Model.Cache.CACHE_KEYS, [] );
            return true;
        }
        return false;
    },

    /**
     * Get number of items stored in cache
     *
     * @return {number}     the number of items currently cached
     */
    getNumItems: () => {
        const cacheKeys = Model.Cache.get( Model.Cache.CACHE_KEYS );
        return cacheKeys.length;
    },

    /**
     * Prefix all cache keys with VERSION to facilitate invalidation
     *
     * @param {string} key  the base key name to apply prefix
     * @return {string}     the prefixed key name
     */
    prefixKey: ( key ) => {
        if ( key.includes( `${Controller.SpoddyCoiner.VERSION}_` ) ) {
            return key;
        }
        return `${Controller.SpoddyCoiner.VERSION}_${key}`;
    },

    /**
     * Add key to "cache_keys" tracker array
     *
     * @param {string} key              key name
     * @return {boolean}                was added, true|false
     */
    addToCacheKeysTracker: ( key ) => {
        const cacheKeys = Model.Cache.get( Model.Cache.CACHE_KEYS );
        if ( cacheKeys.indexOf( key ) === -1 ) {
            cacheKeys.push( key );
            return Model.Cache.put( Model.Cache.CACHE_KEYS, cacheKeys );
        }
        return false;
    },

};

Model.CMCApi = {

    /**
     * CMC API Endpoints
     */
    BASE_URL: 'https://pro-api.coinmarketcap.com',

    // free plan
    CRYPTOCURRENCY_MAP: '/v1/cryptocurrency/map',
    CRYPTOCURRENCY_METADATA: '/v1/cryptocurrency/info',
    CRYPTOCURRENCY_LISTINGS_LATEST: '/v1/cryptocurrency/listings/latest',
    CRYPTOCURRENCY_QUOTES_LATEST: '/v1/cryptocurrency/quotes/latest',
    FIAT_MAP: '/v1/fiat/map',
    GLOBAL_METRICS_LATEST: '/v1/global-metrics/quotes/latest',
    TOOLS_PRICE_CONVERSION: '/v1/tools/price-conversion',
    PARTNERS_FCAS_LISTINGS_LATEST: '/v1/partners/flipside-crypto/fcas/listings/latest',
    PARTNERS_FCAS_QUOTES_LATEST: '/v1/partners/flipside-crypto/fcas/quotes/latest',
    KEY_INFO: '/v1/key/info',

    /**
     * FCAS Grades
     */
    FCAS_GRADES: {
        S: 'Superb',
        A: 'Attractive',
        B: 'Basic',
        C: 'Caution',
        F: 'Fragile',
    },

    /**
     * Make an API call to CRYPTOCURRENCY_METADATA
     *
     * @param {string} slug     the CMC crypto slug
     * @return {object}         JSON Object
     */
    getCryptoMetadata: ( symbol ) => {
        const query = `symbol=${symbol.toUpperCase()}`;
        return Model.CMCApi.call( Model.CMCApi.CRYPTOCURRENCY_METADATA, query );
    },

    /**
     * Make an API call to CRYPTOCURRENCY_QUOTES_LATEST
     *
     * @param {string} symbol   the crypto symbol
     * @param {string} fiat     fiat currency to use for the lookup
     * @return {object}         JSON Object
     */
    getCryptoQuoteLatest: ( symbol, fiat ) => {
        const query = `symbol=${symbol.toUpperCase()}&convert=${fiat.toUpperCase()}`;
        return Model.CMCApi.call( Model.CMCApi.CRYPTOCURRENCY_QUOTES_LATEST, query );
    },

    /**
     * Make an API call to PARTNERS_FCAS_QUOTES_LATEST
     *
     * @param {string} slug     the crypto symbol
     * @return {object}         JSON Object
     */
    getFCASQuoteLatest: ( symbol ) => {
        const query = `symbol=${symbol.toUpperCase()}`;
        const returnData = Model.CMCApi.call( Model.CMCApi.PARTNERS_FCAS_QUOTES_LATEST, query );
        if ( returnData.error_message.includes( 'No data found' ) ) {
            returnData.error_message = ''; // not expecting all coins to be supported, so suppress this error
            returnData.score = '';
        }
        return returnData;
    },

    /**
     * Make an API call to TOOLS_PRICE_CONVERSION
     *
     * @param {number} amount   the amount to convert
     * @param {string} symbol   the coin/currency to convert from
     * @param {string} convert  the coin/currnecy to convert to
     * @return {Object}         JSON Object
     */
    priceConversion: ( amount, symbol, convert ) => {
        const query = `amount=${amount}&symbol=${symbol.toUpperCase()}&convert=${convert.toUpperCase()}`;
        return Model.CMCApi.call( Model.CMCApi.TOOLS_PRICE_CONVERSION, query );
    },

    /**
     * Make an API call to the CMC API (only if necessary, will fetch from cache if available)
     * handle errors, cahe + return the result
     *
     * @param {string} endpoint     CMC query endpoint
     * @param {string} query        query to run (not including the API key)
     * @return {object}             JSON Object, "error_message" value is empty if no error occurred
     */
    call: ( endpoint, query ) => {
        const fullQuery = `${endpoint}?${query}`;
        Logger.log( `Running query: ${fullQuery}` );

        let data = Model.Cache.get( fullQuery );
        if ( data ) {
            Logger.log( 'Result fetched from cache' );
            Logger.log( data );
            return data;
        }

        Logger.log( 'Not found in cache, fetching result from API...' );
        const response = UrlFetchApp.fetch(
            Model.CMCApi.BASE_URL + fullQuery,
            {
                contentType: 'application/json',
                muteHttpExceptions: true,
                headers: {
                    'X-CMC_PRO_API_KEY': Model.Props.getAPIKey(),
                    Accept: 'application/json',
                },
            },
        );
        let responseJson = JSON.parse( response.getContentText() );

        let errMsg = '';
        if ( response.getResponseCode() !== 200 ) {
            if ( typeof ( responseJson.status ) === 'undefined' ) {
                // uncontrolled error
                errMsg = '! Unexpected CMC API Response';
            }
            // controlled error
            errMsg = ( errMsg ) || responseJson.status.error_message;
            responseJson = { error_message: errMsg };
            Logger.log( responseJson );
            return responseJson; // dont cache error reponses
        }

        // get first item in the packet (all our calls currently return 1 coin/item)
        // discard the status object
        // cache & return
        data = responseJson.data;
        const returnData = Object.values( data )[0];
        returnData.error_message = ''; // no error
        Model.Cache.put( fullQuery, returnData );
        Logger.log( returnData );
        return returnData;
    },

};

Model.Props = {

    /**
     * Property key names
     */
    CMC_API_KEY: 'cmc_api_key',
    DEFAULT_CURRENCY: 'default_currency',
    API_CACHE_TIME: 'api_cache_time',
    DISPLAY_ERROR_MESSAGES: 'display_error_messages',

    /**
     * Get API Key from user props
     * if not defined set it ""
     *
     * @param {boolean} masked  mask all but the first and last letter
     * @return {string}         api key
     */
    getAPIKey: ( masked = false ) => {
        const userProps = PropertiesService.getUserProperties();
        let apiKey = userProps.getProperty( Model.Props.CMC_API_KEY );
        if ( masked ) {
            apiKey = apiKey.replace( /(?!^.?).(?!.{0}$)/gi, '*' );
        }
        if ( !apiKey ) {
            apiKey = '';
            userProps.setProperty( Model.Props.CMC_API_KEY, apiKey );
        }
        return apiKey;
    },

    /**
     * Set API Key in user props
     *
     * @return {boolean}    was updated
     */
    setAPIKey: ( newApiKey ) => {
        const userProps = PropertiesService.getUserProperties();
        if ( typeof ( newApiKey ) !== 'string' ) {
            return false;
        }
        userProps.setProperty( Model.Props.CMC_API_KEY, newApiKey );
        View.Menu.addMenu(); // update the menu with new time
        return true;
    },

    /**
     * Get default currency from user props
     * if not defined set it currency looked up from users locale
     *
     * @return {string}     currency code
     */
    getDefaultCurrency: () => {
        const userProps = PropertiesService.getUserProperties();
        let currency = userProps.getProperty( Model.Props.DEFAULT_CURRENCY );
        if ( !currency ) {
            currency = Model.RCApi.lookupCurrency();
            userProps.setProperty( Model.Props.DEFAULT_CURRENCY, currency );
        }
        return currency;
    },

    /**
     * Set default currency in user props
     *
     * @return {boolean}    was updated
     */
    setDefaultCurrency: ( newCurrencyCode ) => {
        const userProps = PropertiesService.getUserProperties();
        if ( typeof ( newCurrencyCode ) !== 'string' ) {
            return false;
        }
        if ( !Model.RCApi.currencyCodeIsValid( newCurrencyCode ) ) {
            return false;
        }
        userProps.setProperty( 'default_currency', newCurrencyCode );
        // update menu & SpoddyCoiner functions on the active sheet
        View.Menu.addMenu();
        View.Sheet.refreshAllFunctions();
        return true;
    },

    /**
     * Get cache time from document props
     * if not defined set it to default value
     *
     * @param {boolean} humanReadable   return value in seconds or a human readable string
     * @return {mixed}                  cache time in seconds or h/m/s
     */
    getCacheTime: ( humanReadable = false ) => {
        const docProps = PropertiesService.getDocumentProperties();
        let cacheTime = parseInt( docProps.getProperty( Model.Props.API_CACHE_TIME ), 10 );
        if ( cacheTime.isNaN ) {
            cacheTime = Model.Cache.DEFAULT_CACHE_TIME;
            docProps.setProperty( Model.Props.API_CACHE_TIME, cacheTime );
        }
        if ( humanReadable ) {
            let text = '';
            const numHrs = Math.floor( ( ( cacheTime % 31536000 ) % 86400 ) / 3600 );
            const numMins = Math.floor( ( ( ( cacheTime % 31536000 ) % 86400 ) % 3600 ) / 60 );
            const numSecs = ( ( ( cacheTime % 31536000 ) % 86400 ) % 3600 ) % 60;
            if ( numHrs > 0 ) {
                text += `${numHrs}h `;
            }
            if ( numMins > 0 ) {
                text += `${numMins}m `;
            }
            if ( numSecs > 0 ) {
                text += `${numSecs}s`;
            }
            return text;
        }
        return cacheTime;
    },

    /**
     * Set cache time (in seconds) in document props & update menu
     *
     * @return {boolean}    was updated
     */
    setCacheTime: ( time ) => {
        const docProps = PropertiesService.getDocumentProperties();
        let newTime = parseInt( time, 10 );
        if ( newTime.isNaN ) {
            return false;
        }
        if ( newTime > Model.Cache.MAX_CACHE_TIME ) {
            newTime = Model.Cache.MAX_CACHE_TIME;
        }
        docProps.setProperty( Model.Props.API_CACHE_TIME, new_time );
        View.Menu.addMenu(); // update the menu with new time
        return true;
    },

    /**
     * Get Display Error Messages
     * if not defined set it to On
     *
     * @param {boolean} humanReadable   return value as boolean a human readable string
     * @return {boolean}                was updated
     */
    getDisplayErrorMessages: ( humanReadable = false ) => {
        const docProps = PropertiesService.getDocumentProperties();
        let errMsgs = docProps.getProperty( Model.Props.DISPLAY_ERROR_MESSAGES );
        if ( !errMsgs ) {
            errMsgs = 'On';
            docProps.setProperty( Model.Props.DISPLAY_ERROR_MESSAGES, errMsgs );
        }
        if ( !humanReadable ) {
            return ( errMsgs === 'On' );
        }
        return errMsgs;
    },

    /**
     * Toggle Error Messages
     *
     * @return {boolean}    was updated, true|false
     */
    toggleErrorMessages: () => {
        const docProps = PropertiesService.getDocumentProperties();
        let errMsgs = Model.Props.getDisplayErrorMessages();
        errMsgs = ( errMsgs ) ? 'Off' : 'On'; // toggle
        docProps.setProperty( Model.Props.DISPLAY_ERROR_MESSAGES, errMsgs );
        View.Menu.addMenu(); // update the menu with new value
        return true;
    },

};

Model.RCApi = {

    /**
   * RestCountries API Endpoint
   */
    BASE_URL: 'https://restcountries.eu/rest/v2/lang/',

    /**
   * Use the RestCountries API to lookup users preferred currency based on their locale
   *
   * @return {string}   ISO-4127 currency code
   */
    lookupCurrency: () => {
        const userCountry = Session.getActiveUserLocale();
        const timeZone = Session.getScriptTimeZone();
        // const region = timeZone.split( '/' )[0];
        const capital = timeZone.split( '/' )[1];
        const response = UrlFetchApp.fetch( Model.RCApi.BASE_URL + userCountry ).getContentText();
        const jsonResponse = JSON.parse( response );
        const currencyCode = jsonResponse.find( ( country ) => country.capital == capital ).currencies[0].code;
        return currencyCode;
    },

    /**
     * Use the RestCountries API to determine if a country code is valid ISO-4217
     *
     * @param {string} currencyCode        the currency code string to check
     *
     * @return {boolean}                    is valid ISO-4217, true|false
     */
    currencyCodeIsValid: ( currencyCode ) => {
        const userCountry = Session.getActiveUserLocale();
        const response = UrlFetchApp.fetch( Model.RCApi.BASE_URL + userCountry ).getContentText();
        const jsonResponse = JSON.parse( response );
        let isValid = false;
        for ( const countryid in jsonResponse ) {
            for ( const currencyid in jsonResponse[countryid].currencies ) {
                if ( jsonResponse[countryid].currencies[currencyid].code === currencyCode ) {
                    isValid = true;
                }
            }
        }
        return isValid;
    },

};

View.Menu = {

    /**
     * About SpoddyCoiner
     */
    ABOUT_TEXT: 'Handy little functions to get data from the CoinMarketCap API.\n\nCaches the response to help reduce the number of API calls and keep within your rate-limits.\n\nhttps://github.com/SpoddyCoder/SpoddyCoiner',

    DOCS_FUNCTIONS_HEADING: 'Custom Functions',
    DOCS_FUNCTIONS_TEXT: 'Simply tap the function name into a cell to get more information.\n\n=SPODDYCOINER( coin, attribute, fiat )\n\n=SPODDYCOINER_CONVERT( coin, amount, coin )\nNB: currency ticker can be used instead of coin\n',
    DOCS_ATTRIBUTES_HEADING: 'Coin Attributes',
    DOCS_ATTRIBUTES_TEXT: '',

    /**
     * Supported attributes and their descriptions
     */
    SUPPORTED_ATTRIBUTES: {
        price: 'latest price in fiat currency',
        price_percent_change_1h: 'price change over last 1h',
        price_percent_change_24h: 'price change over last 24h',
        price_percent_change_7d: 'price change over last 7d',
        price_percent_change_30d: 'price change over last 30d',
        market_cap: 'latest market capitalization in fiat currency',
        volume_24h: '24h trading volume',
        circulating_supply: 'number of coins/tokens currently circulating',
        total_supply: 'total number of coins/tokens potentially available',
        max_supply: 'maximum number of coins/tokens that will ever be available (some coins do not have a max supply)',
        fcas_score: 'Fundamental Crypto Asset Score (0-1000), a measure of the fundamental health of crypto projects (only the top 300-400 coins are rated)',
        fcas_grade: 'FCAS Grade (S,A,B,C,E,F)',
        fcas_grade_full: 'Full FCAS Grade description (Superb,Attractive,Basic,Caution,Fragile)',
        fcas_percent_change_24h: '24h change in score',
        fcas_point_change_24h: '24h change in score as a percentage',
        name: 'coin name',
        description: 'full description of the project, history and purpose',
        logo: 'logo url (Tip: wrap this in the Google Sheets IMAGE function to show it in the cell)',
        date_added: 'date added to CoinMarketCap (effectively the date it started)',
        year_added: 'year added to CoinMarketCap',
        tags: 'comma seperated list of all tags',
        tags_top_5: 'comma seperated list of the first 5 tags',
        url_website: 'primary website for the project (if more than 1, only 1st returned)',
        url_technical_doc: 'whitepaper tech document for the project (if more than 1, only 1st returned)',
        url_explorer: 'blockchain explorer for the coin/token (if more than 1, only 1st returned)',
        url_source_code: 'github url for the project source code (if available)',
    },

    /**
     * Basic menu when no authorization has been given
     */
    addNoAuthMenu: () => {
        SpreadsheetApp.getUi()
            .createAddonMenu()
            .addItem( 'About', 'View.Menu.aboutSpoddyCoiner' )
            .addToUi();
    },

    /**
     * Full SpoddyCoiner menu
     */
    addMenu: () => {
        const ui = SpreadsheetApp.getUi();
        ui.createAddonMenu()
            .addSubMenu( ui.createMenu( 'CoinMarketCap API' )
                .addItem( 'API Key', 'View.Menu.updateCMCApiKey' )
                .addItem( `Cache Time: ${Model.Props.getCacheTime( human_readable = true )}`, 'View.Menu.updateAPICacheTime' )
                .addItem( 'Clear Cache', 'View.Menu.clearAPICache' ) )
            .addSubMenu( ui.createMenu( 'Preferences' )
                .addItem( `Default Currency: ${Model.Props.getDefaultCurrency()}`, 'View.Menu.updateDefaultCurrency' )
                .addItem( `Show Errors: ${Model.Props.getDisplayErrorMessages( human_readable = true )}`, 'View.Menu.showErrors' ) )
            .addSeparator()
            .addSubMenu( ui.createMenu( 'Docs' )
                .addItem( 'Functions', 'View.Menu.docsFunctions' )
                .addItem( 'Attributes', 'View.Menu.docsAttributes' ) )
            .addItem( 'About', 'View.Menu.aboutSpoddyCoiner' )
            .addToUi();
    },

    /**
     * 'CoinMarketCap API Key' menu item
     */
    updateCMCApiKey: () => {
        const ui = SpreadsheetApp.getUi();
        let apiKey = Model.Props.getAPIKey( true );
        const promptLabel = ( apiKey === '' ) ? 'Enter your key' : `Current Key : ${apiKey}\n\nUpdate key`;
        const result = ui.prompt( 'CoinMarketCap API Key', promptLabel, ui.ButtonSet.OK_CANCEL );
        const button = result.getSelectedButton();
        apiKey = result.getResponseText();
        if ( button === ui.Button.OK ) {
            if ( Model.Props.setAPIKey( apiKey ) ) {
                ui.alert( 'API Key Updated', ui.ButtonSet.OK );
            }
        }
    },

    /**
     * 'API Cache Time' menu item
     */
    updateAPICacheTime: () => {
        const ui = SpreadsheetApp.getUi();
        const result = ui.prompt( 'API Cache Time', `New cache time in seconds (max ${Model.Cache.MAX_CACHE_TIME})`, ui.ButtonSet.OK_CANCEL );
        const button = result.getSelectedButton();
        const newTime = result.getResponseText();
        if ( button === ui.Button.OK ) {
            if ( Model.Props.setCacheTime( newTime ) ) {
                ui.alert( 'API Cache Time Updated', `New cache time : ${Model.Props.getCacheTime( true )}`, ui.ButtonSet.OK );
            }
        }
    },

    /**
     * 'Clear API Cache' menu item
     */
    clearAPICache: () => {
        const ui = SpreadsheetApp.getUi();
        const result = ui.alert( `${Model.Cache.getNumItems()} API calls currently cached.\n\nDo you want to reset the API cache?`, ui.ButtonSet.YES_NO );
        if ( result === ui.Button.YES ) {
            Model.Cache.clear();
            const result2 = ui.alert( 'API cache cleared.\n\nDo you want to re-run all the SPODDYCOINER functions on the active sheet?', ui.ButtonSet.YES_NO );
            if ( result2 === ui.Button.YES ) {
                View.Sheet.refreshAllFunctions();
            }
        }
    },

    /**
     * 'Default Currency' menu item
     */
    updateDefaultCurrency: () => {
        const ui = SpreadsheetApp.getUi();
        const result = ui.prompt( `Default Currency: ${Model.Props.getDefaultCurrency()}`, 'Enter new 3 letter currency code (ISO 4217)', ui.ButtonSet.OK_CANCEL );
        const button = result.getSelectedButton();
        const newCurrencyCode = result.getResponseText();
        if ( button === ui.Button.CANCEL || button === ui.Button.CLOSE ) {
            return;
        }
        if ( button === ui.Button.OK ) {
            if ( Model.Props.setDefaultCurrency( newCurrencyCode ) ) {
                ui.alert( 'Default Currency Updated', `New currency code : ${Model.Props.getDefaultCurrency()}`, ui.ButtonSet.OK );
            } else {
                ui.alert( 'Currency code was not valid!', ui.ButtonSet.OK );
            }
        }
    },

    /**
     * 'Show Errors' menu item
     */
    showErrors: () => {
        const ui = SpreadsheetApp.getUi();
        const prompt = ( Model.Props.getDisplayErrorMessages() ) ? 'Do you want to turn errors off?' : 'Do you want to turn errors on?';
        const result = ui.alert( prompt, ui.ButtonSet.YES_NO );
        if ( result === ui.Button.YES ) {
            Model.Props.toggleErrorMessages();
            View.Sheet.refreshAllFunctions();
        }
    },

    /**
     * 'About' menu item
     */
    aboutSpoddyCoiner: () => {
        const ui = SpreadsheetApp.getUi();
        ui.alert(
            `${Controller.SpoddyCoiner.ADDON_NAME} v${Controller.SpoddyCoiner.VERSION}`,
            View.Menu.ABOUT_TEXT,
            ui.ButtonSet.OK, 
        );
    },

    /**
     * 'Functions' menu item
     */
    docsFunctions: () => {
        const ui = SpreadsheetApp.getUi();
        ui.alert(
            View.Menu.DOCS_FUNCTIONS_HEADING,
            View.Menu.DOCS_FUNCTIONS_TEXT,
            ui.ButtonSet.OK,
        );
    },

    /**
   * 'Supported Attributes' menu item
   */
    docsAttributes: () => {
        const ui = SpreadsheetApp.getUi();
        let supportedAttrs = '';

        const attributesArray = Object.values( View.Menu.SUPPORTED_ATTRIBUTES );
        attributesArray.forEach( ( desc, attr ) => {
            supportedAttrs += `${attr}\n`;
        } );
        const text = View.Menu.DOCS_ATTRIBUTES_TEXT + supportedAttrs;
        ui.alert( View.Menu.DOCS_ATTRIBUTES_HEADING, text, ui.ButtonSet.OK );
    },

};

View.Sheet = {

    /**
     * SpoddyCoiner spreeadsheet functions
     * these are defined in Addon_Functions.gs
     */
    FUNCTIONS: [
        'SPODDYCOINER',
        'SPODDYCOINER_CONVERT',
    ],

    /**
     * Refresh all SpoddyCoiner functions on the active sheet
     *
     * https://tanaikech.github.io/2019/10/28/automatic-recalculation-of-custom-function-on-spreadsheet-part-2/
     */
    refreshAllFunctions: () => {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const temp = Utilities.getUuid();
        View.Sheet.FUNCTIONS.forEach( ( e ) => {
            ss.createTextFinder( `=${e}` )
                .matchFormulaText( true )
                .replaceAllWith( temp );
            ss.createTextFinder( temp )
                .matchFormulaText( true )
                .replaceAllWith( `=${e}` );
        } );
    },

};

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

/**
 * Returns coin price and other info from the CoinMarketCap API. Use the Addons -> SpoddyCoiner menu for more info.
 *
 * @param {"BTC"} coin          Coin ticker to lookup, default is BTC
 * @param {"price"} attribute   Attribute to return, default is "price", see docs for full list
 * @param {"GBP"} [fiat]        Fiat currency to return (ISO 4217), set default in SpoddyCoiner menu
 * @return                      Latest data about a coin
 * @customfunction
 */
function SPODDYCOINER( coin = 'BTC', attribute = 'price', fiat = Model.Props.getDefaultCurrency() ) {
    const coinString = ( `${coin}` ) || '';
    const attributeString = ( `${attribute}` ) || '';
    const fiatString = ( `${fiat}` ) || '';
    return Controller.SpoddyCoiner.getCoinAttribute( coinString, attributeString, fiatString );
}

/**
 * Uses the CoinMarketCap API to convert one crypto/curreny to another crypto/currency. Use the Addons -> SpoddyCoiner menu for more info.
 *
 * @param {0.00123456} amount   Amount to be converted
 * @param {"BTC"} symbol        Coin/currency ticker, default is BTC
 * @param {"GBP"} [convert]     Coin/currency ticker to convert to, set default in SpoddyCoiner menu
 * @return                      Converted amount
 * @customfunction
 */
function SPODDYCOINER_CONVERT( amount, symbol = 'BTC', convert = Model.Props.getDefaultCurrency() ) {
    const amountNumber = ( parseFloat( amount ) ) || 0;
    const symbolString = ( `${symbol}` ) || '';
    const convertString = ( `${convert}` ) || '';
    return Controller.SpoddyCoiner.convert( amountNumber, symbolString, convertString );
}
