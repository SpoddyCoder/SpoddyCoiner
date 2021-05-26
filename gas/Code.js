
class SpoddyCoiner {
    /**
     * SpoddyCoiner Addon primary controller
     *
     * @param {string} instanceName     the variable name of the SpoddyCoiner instance
     */
    constructor( instanceName ) {
        /**
         * the cost of AppsScript menu bindings
         * addMenuItem() functionName's must be the string name of a function in the global scope
         */
        this.instanceName = instanceName;

        /**
         * Addon Name + Version
         */
        this.ADDON_NAME = 'SpoddyCoiner';
        this.VERSION = '1.2.0.77';

        /**
         * a loose MVC pattern
         */
        this.Controller = {};
        this.Model = {};
        this.View = {};

        this.Controller.CMC = new CMC( this );

        this.Model.GASProps = new GASProps( this );
        this.Model.APICache = new APICache( this );
        this.Model.CMCApi = new CMCApi( this );

        this.View.Menu = new Menu( this );
        this.View.Sheet = new Sheet( this );
    }

    /**
     * Model change handlers
     * update the View as props change
     */
    handleApiKeyChange() {
        this.View.Menu.addMenu();
    }

    handleCacheTimeChange() {
        this.View.Menu.addMenu();
    }

    handleDefaultCurrencyChange() {
        this.View.Menu.addMenu();
    }

    handleDisplayErrorMessagesChange() {
        this.View.Menu.addMenu();
    }

    /**
     * View event handlers
     */
    handleRefreshAllFunctionsConfirm() {
        this.View.Sheet.refreshAllFunctions();
    }
}


class CMC {
    /**
     * CoinMarketCap query controller
     *
     * @param {SpoddyCoiner} spoddycoiner  primary controller instance
     */
    constructor( spoddycoiner ) {
        /**
         * main controller class
         */
        this.SpoddyCoiner = spoddycoiner;
    }

    /**
     * Get a coin attribute from the Cache or CMC API
     *
     * @param {string} coin         the coin ticker
     * @param {string} attribute    the attribute to get
     * @param {string} [fiat]       fiat to return the value in (required for some attributes)
     * @returns {string|number}     the value of the attribute
     */
    getCoinAttribute( coin, attribute, fiat ) {
        let coinData = {};
        let value;

        switch ( attribute ) {
            case 'price':
            case 'market_cap':
            case 'volume_24h':
                coinData = this.SpoddyCoiner.Model.CMCApi.getCryptoQuoteLatest( coin, fiat );
                if ( !coinData.error_message ) {
                    value = coinData.quote[fiat][attribute];
                    Logger.log( `${coin} ${attribute} : ${value} ${fiat}` );
                }
                break;

            case 'price_percent_change_1h':
            case 'price_percent_change_24h':
            case 'price_percent_change_7d':
            case 'price_percent_change_30d':
                coinData = this.SpoddyCoiner.Model.CMCApi.getCryptoQuoteLatest( coin, fiat );
                if ( !coinData.error_message ) {
                    value = coinData.quote[fiat][attribute.replace( 'price_', '' )] / 100; // make compatible with standard Google Sheets percentage format
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'circulating_supply':
            case 'total_supply':
            case 'max_supply':
                coinData = this.SpoddyCoiner.Model.CMCApi.getCryptoQuoteLatest( coin, fiat );
                if ( !coinData.error_message ) {
                    value = coinData[attribute];
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'fcas_grade':
            case 'fcas_grade_full':
                coinData = this.SpoddyCoiner.Model.CMCApi.getFCASQuoteLatest( coin );
                if ( !coinData.error_message ) {
                    value = ( attribute === 'fcas_grade' ) ? coinData.grade : this.SpoddyCoiner.Model.CMCApi.FCAS_GRADES[coinData.grade];
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'fcas_score':
            case 'fcas_percent_change_24h':
            case 'fcas_point_change_24h':
                coinData = this.SpoddyCoiner.Model.CMCApi.getFCASQuoteLatest( coin );
                if ( !coinData.error_message ) {
                    value = coinData[attribute.replace( 'fcas_', '' )];
                    if ( coinData.score === '' ) {
                        value = ''; // if there is no FCAS score, set to empty for all FCAS attributes
                    } else {
                        value = ( attribute === 'fcas_percent_change_24h' ) ? value / 100 : value; // convert to native GS percent format
                    }
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'name':
            case 'description':
            case 'logo':
                coinData = this.SpoddyCoiner.Model.CMCApi.getCryptoMetadata( coin );
                if ( !coinData.error_message ) {
                    value = coinData[attribute];
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'date_added':
            case 'year_added':
                coinData = this.SpoddyCoiner.Model.CMCApi.getCryptoMetadata( coin );
                if ( !coinData.error_message ) {
                    value = new Date( coinData.date_added ); // convert to GS native date format
                    value = ( attribute === 'year_added' ) ? value.getFullYear() : value;
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'tags':
            case 'tags_top_5':
                coinData = this.SpoddyCoiner.Model.CMCApi.getCryptoMetadata( coin );
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
                coinData = this.SpoddyCoiner.Model.CMCApi.getCryptoMetadata( coin );
                if ( !coinData.error_message ) {
                    const { urls } = coinData;
                    const { [attribute.replace( 'url_', '' )]: urlWebsite } = urls;
                    [value] = urlWebsite; // just return the first for now (TODO)
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            default:
                coinData.error_message = `Invalid attribute : ${attribute}`;
                break;
        }

        if ( coinData.error_message ) {
            Logger.log( `Error: ${coinData.error_message}` );
            return ( this.SpoddyCoiner.Model.GASProps.getDisplayErrorMessages() ) ? coinData.error_message : '';
        }
        return value;
    }

    /**
     * Converst a coin/currency amount to another
     *
     * @param {number} amount       the amount to convert
     * @param {string} symbol       the coin/currency ticker to convert from
     * @param {string} convert      the coin/currnecy ticker to convert to
     * @returns {number}            the converted value
     */
    convert( amount, symbol, convert ) {
        const conversionData = this.SpoddyCoiner.Model.CMCApi.priceConversion(
            amount,
            symbol,
            convert,
        );
        if ( conversionData.error_message ) {
            Logger.log( `Error: ${conversionData.error_message}` );
            return conversionData.error_message;
        }
        const value = conversionData[convert].price;
        Logger.log( `${amount} ${symbol} : ${value} ${convert}` );
        return value;
    }

    /**
     * Determine if a curency code is a valid ISO-4217 currency code
     *
     * @param {string} currencyCode     the currency code to check
     * @returns {boolean}               is valid ISO-4217 country code
     */
    currencyCodeIsValid( currencyCode ) {
        const currencyCodeToCheck = currencyCode.toString() || '';
        if ( currencyCodeToCheck === '' ) {
            return false;
        }
        const fiatMap = this.SpoddyCoiner.Model.CMCApi.getFiatMap();
        if ( fiatMap.error_message !== '' ) {
            return false;
        }
        let isValid = false;
        Object.values( fiatMap.data ).forEach( ( fiatObject ) => {
            if ( fiatObject.symbol === currencyCodeToCheck ) {
                isValid = true;
            }
        } );
        return isValid;
    }
}


class GASProps {
    /**
     * GAS Properties Service model
     *
     * @param {SpoddyCoiner} SpoddyCoiner   primary controller instance
     */
    constructor( spoddycoiner ) {
        /**
         * main controller class
         */
        this.SpoddyCoiner = spoddycoiner;

        /**
         * Default values
         */
        this.DEFAULT_CACHE_TIME = 3600;
        this.DEFAULT_DEFAULT_CURRENCY = 'USD';

        /**
         * Property key names
         */
        // userProps
        this.CMC_API_KEY_KEY = 'cmc_api_key';
        this.DEFAULT_CURRENCY_KEY = 'default_currency';
        // docProps
        this.API_CACHE_TIME_KEY = 'api_cache_time';
        this.DISPLAY_ERROR_MESSAGES_KEY = 'display_error_messages';
        this.CACHE_BUST_PREFIX = 'cache_bust_prefix';

        /**
         * GAS Properties Services
         */
        this.userProps = PropertiesService.getUserProperties();
        this.docProps = PropertiesService.getDocumentProperties();
    }

    /**
     * Get API Key from user props
     * if not defined set it ""
     *
     * @param {boolean} masked  mask all but the first and last letter
     * @returns {string}        api key
     */
    getAPIKey( masked = false ) {
        let apiKey = this.userProps.getProperty( this.CMC_API_KEY_KEY );
        if ( !apiKey ) {
            apiKey = '';
            this.userProps.setProperty( this.CMC_API_KEY_KEY, apiKey );
        }
        if ( masked ) {
            apiKey = apiKey.replace( /(?!^.?).(?!.{0}$)/gi, '*' );
        }
        return apiKey;
    }

    /**
     * Set API Key in user props
     *
     * @returns {boolean}   was updated
     */
    setAPIKey( newApiKey ) {
        if ( typeof ( newApiKey ) !== 'string' ) {
            return false;
        }
        if ( !this.userProps.setProperty( this.CMC_API_KEY_KEY, newApiKey ) ) {
            return false;
        }
        this.SpoddyCoiner.handleApiKeyChange( newApiKey );
        return true;
    }

    /**
     * Get default currency from user props
     * if not defined set it currency looked up from users locale
     *
     * @returns {string}    currency code
     */
    getDefaultCurrency() {
        let currency = this.userProps.getProperty( this.DEFAULT_CURRENCY_KEY );
        if ( !currency ) {
            currency = this.DEFAULT_DEFAULT_CURRENCY;
            this.userProps.setProperty( this.DEFAULT_CURRENCY_KEY, currency );
        }
        return currency;
    }

    /**
     * Set default currency in user props
     *
     * @returns {boolean}   was updated
     */
    setDefaultCurrency( newCurrencyCode ) {
        if ( typeof ( newCurrencyCode ) !== 'string' ) {
            return false;
        }
        if ( !this.SpoddyCoiner.Controller.CMC.currencyCodeIsValid( newCurrencyCode ) ) {
            return false;
        }
        if ( !this.userProps.setProperty( 'default_currency', newCurrencyCode ) ) {
            return false;
        }
        this.SpoddyCoiner.handleDefaultCurrencyChange( newCurrencyCode );
        return true;
    }

    /**
     * Get cache time from document props
     * if not defined set it to default value
     *
     * @param {boolean} humanReadable   return value in seconds or a human readable string
     * @returns {mixed}                 cache time in seconds or h/m/s
     */
    getCacheTime( humanReadable = false ) {
        let cacheTime = parseFloat( this.docProps.getProperty( this.API_CACHE_TIME_KEY ) );
        if ( cacheTime.isNaN ) {
            cacheTime = this.DEFAULT_CACHE_TIME;
            this.docProps.setProperty( this.API_CACHE_TIME_KEY, cacheTime );
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
    }

    /**
     * Set cache time (in seconds) in document props
     *
     * @returns {boolean}   was updated
     */
    setCacheTime( time ) {
        let newTime = parseFloat( time );
        if ( newTime.isNaN ) {
            return false;
        }
        if ( newTime > this.SpoddyCoiner.Model.APICache.MAX_CACHE_TIME ) {
            newTime = this.SpoddyCoiner.Model.APICache.MAX_CACHE_TIME;
        }
        if ( !this.docProps.setProperty( this.API_CACHE_TIME_KEY, newTime ) ) {
            return false;
        }
        this.SpoddyCoiner.handleCacheTimeChange( newTime );
        return true;
    }

    /**
     * Get Display Error Messages from doc props
     * if not defined set it to On
     *
     * @param {boolean} humanReadable   return value as boolean or human readable string
     * @returns {boolean}               was updated
     */
    getDisplayErrorMessages( humanReadable = false ) {
        let errMsgs = this.docProps.getProperty( this.DISPLAY_ERROR_MESSAGES_KEY );
        if ( !errMsgs ) {
            errMsgs = 'On';
            this.docProps.setProperty( this.DISPLAY_ERROR_MESSAGES_KEY, errMsgs );
        }
        if ( !humanReadable ) {
            // convert to bool, the string value is stored in the props object
            return ( errMsgs === 'On' );
        }
        return errMsgs;
    }

    /**
     * Toggle Error Messages
     *
     * @returns {boolean}   was updated
     */
    toggleErrorMessages() {
        let dispErrMsgs = this.getDisplayErrorMessages();
        dispErrMsgs = ( dispErrMsgs ) ? 'Off' : 'On'; // toggle
        if ( !this.docProps.setProperty( this.DISPLAY_ERROR_MESSAGES_KEY, dispErrMsgs ) ) {
            return false;
        }
        this.SpoddyCoiner.handleDisplayErrorMessagesChange( dispErrMsgs );
        return true;
    }

    /**
     * Get cache bust prefix from document props
     * if not defined set it to 1
     *
     * @returns {number}
     */
    getCacheBustPrefix() {
        let prefix = parseFloat( this.docProps.getProperty( this.CACHE_BUST_PREFIX ) );
        if ( prefix.isNaN ) {
            prefix = 1;
            this.docProps.setProperty( this.CACHE_BUST_PREFIX, prefix );
        }
        return prefix;
    }

    /**
     * Increment cache bust prefix by 1
     *
     * @returns {boolean}
     */
    incrementCacheBustPrefix() {
        let prefix = this.getCacheBustPrefix();
        prefix += 1;
        if ( prefix > 99 ) {
            prefix = 1; // stop this increment from slowly eating bytes in the user objects
        }
        return this.docProps.setProperty( this.CACHE_BUST_PREFIX, prefix );
    }
}


class APICache {
    /**
     * API Cache model
     *
     * @param {SpoddyCoiner} spoddycoiner   primary controller instance
     */
    constructor( spoddycoiner ) {
        /**
         * main controller class
         */
        this.SpoddyCoiner = spoddycoiner;

        /**
         * max cache time in seconds
         */
        this.MAX_CACHE_TIME = 21600;

        /**
         * GAS user cache service
         */
        this.userCache = CacheService.getUserCache();
    }

    /**
     * Put string or JSON object into cache by key name
     *
     * @param {string} key  key name
     * @param {string} obj  object/string to store
     * @returns {boolean}   succesfully added
     */
    put( key, obj ) {
        const prefixedKey = this.prefixKey( key );
        let returnObj = obj;
        if ( typeof ( obj ) !== 'string' ) {
            returnObj = JSON.stringify( obj );
        }
        return this.userCache.put(
            prefixedKey,
            returnObj,
            this.SpoddyCoiner.Model.GASProps.getCacheTime(),
        );
    }

    /**
     * Get String or JSON object from cache by key name
     *
     * @param {string} key          key name
     * @returns {object|string}     the JSON object/string/null
     */
    get( key ) {
        const prefixedKey = this.prefixKey( key );
        const obj = this.userCache.get( prefixedKey );
        let returnObj = obj;
        if ( obj !== null ) {
            // object in the cache
            try {
                returnObj = JSON.parse( obj );
            } catch ( e ) {
                return returnObj; // string
            }
        }
        return returnObj; // object or null
    }

    /**
     * Prefix all cache keys with VERSION & GASProps.CACHE_BUST_PREFIX to facilitate invalidation
     *
     * @param {string} key  the base key name to apply prefix
     * @returns {string}    the prefixed key name
     */
    prefixKey( key ) {
        const prefix = `${this.SpoddyCoiner.VERSION}.${this.SpoddyCoiner.Model.GASProps.getCacheBustPrefix()}_`;
        if ( key.includes( prefix ) ) {
            return key;
        }
        return `${prefix}${key}`;
    }

    /**
     * Clear the cache by incrementing the GASProps.CACHE_BUST_PREFIX
     *
     * @returns {boolean}   cleared OK
     */
    clear() {
        return this.SpoddyCoiner.Model.GASProps.incrementCacheBustPrefix();
    }
}


class CMCApi {
    /**
     * CoinMarketAPI model
     *
     * @param {SpoddyCoiner} spoddycoiner   primary controller instance
     */
    constructor( spoddycoiner ) {
        /**
         * main controller class
         */
        this.SpoddyCoiner = spoddycoiner;

        /**
         * CMC API Endpoints
         */
        this.BASE_URL = 'https://pro-api.coinmarketcap.com';

        // free plan
        this.CRYPTOCURRENCY_MAP = '/v1/cryptocurrency/map';
        this.CRYPTOCURRENCY_METADATA = '/v1/cryptocurrency/info';
        this.CRYPTOCURRENCY_LISTINGS_LATEST = '/v1/cryptocurrency/listings/latest';
        this.CRYPTOCURRENCY_QUOTES_LATEST = '/v1/cryptocurrency/quotes/latest';
        this.FIAT_MAP = '/v1/fiat/map';
        this.GLOBAL_METRICS_LATEST = '/v1/global-metrics/quotes/latest';
        this.TOOLS_PRICE_CONVERSION = '/v1/tools/price-conversion';
        this.PARTNERS_FCAS_LISTINGS_LATEST = '/v1/partners/flipside-crypto/fcas/listings/latest';
        this.PARTNERS_FCAS_QUOTES_LATEST = '/v1/partners/flipside-crypto/fcas/quotes/latest';
        this.KEY_INFO = '/v1/key/info';

        /**
         * FCAS Grades lookup
         */
        this.FCAS_GRADES = {
            S: 'Superb',
            A: 'Attractive',
            B: 'Basic',
            C: 'Caution',
            F: 'Fragile',
        };
    }

    /**
     * Make an API call to CRYPTOCURRENCY_METADATA
     *
     * @param {string} slug     the CMC crypto slug
     * @returns {object}        JSON Object
     */
    getCryptoMetadata( symbol ) {
        const query = `symbol=${symbol.toUpperCase()}`;
        return this.call( this.CRYPTOCURRENCY_METADATA, query );
    }

    /**
     * Make an API call to CRYPTOCURRENCY_QUOTES_LATEST
     *
     * @param {string} symbol   the crypto symbol
     * @param {string} fiat     fiat currency to use for the lookup
     * @returns {object}        JSON Object
     */
    getCryptoQuoteLatest( symbol, fiat ) {
        const query = `symbol=${symbol.toUpperCase()}&convert=${fiat.toUpperCase()}`;
        return this.call( this.CRYPTOCURRENCY_QUOTES_LATEST, query );
    }

    /**
     * Make an API call to PARTNERS_FCAS_QUOTES_LATEST
     *
     * @param {string} slug     the crypto symbol
     * @returns {object}        JSON Object
     */
    getFCASQuoteLatest( symbol ) {
        const query = `symbol=${symbol.toUpperCase()}`;
        const returnData = this.call( this.PARTNERS_FCAS_QUOTES_LATEST, query );
        if ( returnData.error_message.includes( 'No data found' ) ) {
            returnData.error_message = ''; // not expecting all coins to be supported, so suppress this error
            returnData.score = '';
        }
        return returnData;
    }

    /**
     * Make an API call to TOOLS_PRICE_CONVERSION
     *
     * @param {number} amount   the amount to convert
     * @param {string} symbol   the coin/currency to convert from
     * @param {string} convert  the coin/currnecy to convert to
     * @returns {Object}        JSON Object
     */
    priceConversion( amount, symbol, convert ) {
        const query = `amount=${amount}&symbol=${symbol.toUpperCase()}&convert=${convert.toUpperCase()}`;
        return this.call( this.TOOLS_PRICE_CONVERSION, query );
    }

    /**
     * Make an API call to FIAT_MAP
     *
     * @returns {Object}        JSON Object
     */
    getFiatMap() {
        const query = 'start=1&limit=1000'; // all listed fiats
        return this.call( this.FIAT_MAP, query );
    }

    /**
     * Make an API call to the CMC API (only if necessary, will fetch from cache if available)
     * handle errors, cahe + return the result
     *
     * @param {string} endpoint     CMC query endpoint
     * @param {string} query        query to run (not including the API key)
     * @returns {object}            JSON Object, "error_message" value is empty if no error occurred
     */
    call( endpoint, query ) {
        const fullQuery = `${endpoint}?${query}`;
        Logger.log( `Running query: ${fullQuery}` );

        const cacheData = this.SpoddyCoiner.Model.APICache.get( fullQuery );
        if ( cacheData ) {
            Logger.log( 'Result fetched from cache' );
            Logger.log( cacheData );
            return cacheData;
        }

        Logger.log( 'Not found in cache, fetching result from API...' );
        const response = UrlFetchApp.fetch(
            this.BASE_URL + fullQuery,
            {
                contentType: 'application/json',
                muteHttpExceptions: true,
                headers: {
                    'X-CMC_PRO_API_KEY': this.SpoddyCoiner.Model.GASProps.getAPIKey(),
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

        let returnData = {};
        switch ( endpoint ) {
            case this.FIAT_MAP:
                returnData.data = responseJson.data;
                returnData.error_message = ''; // no error
                // NB: we dont cache this call, infrequent and would use a lot of the cache space
                break;
            default:
                // all other API calls...
                // get first item (all our outer methods are meant to return 1 coin/item atm)
                // discard the status object
                // cache & return
                [returnData] = Object.values( responseJson.data ); // 1st element
                returnData.error_message = ''; // no error
                this.SpoddyCoiner.Model.APICache.put( fullQuery, returnData );
                break;
        }
        Logger.log( returnData );
        return returnData;
    }
}


class Menu {
    /**
     * SpoddyCoiner Addon Menu view
     *
     * @param {SpoddyCoiner} spoddycoiner   primary controller instance
     */
    constructor( spoddycoiner ) {
        /**
         * main controller class
         */
        this.SpoddyCoiner = spoddycoiner;

        /**
         * SpoddyCoiner var name in the gloabl scope
         * needed for addMenuItem functionName's
         */
        this.app = this.SpoddyCoiner.instanceName;

        /**
         * Menu item labels
         */
        this.MENU_ABOUT_LABEL = 'About';
        this.MENU_CMC_API_KEY_LABEL = 'CoinMarketCap API Key';
        this.MENU_PREFERENCES_LABEL = 'Preferences';
        this.MENU_TOOLS_LABEL = 'Tools';
        this.MENU_REFRESH_ALL_FUNCTIONS_LABEL = 'Refresh All Functions';
        this.MENU_DEFAULT_CURRENCY_LABEL = 'Default Currency:';
        this.MENU_CACHE_TIME_LABEL = 'Cache Time:';
        this.MENU_CLEAR_CACHE_LABEL = 'Clear Cache';
        this.MENU_SHOW_ERRORS_LABEL = 'Show Errors:';
        this.MENU_DOCS_LABEL = 'Docs';
        this.MENU_FUNCTIONS_LABEL = 'Functions';
        this.MENU_ATTRIBUTES_LABEL = 'Attributes';

        /**
         * Dialogue headings / texts / labels
         */
        this.ABOUT_HEADING = `${this.SpoddyCoiner.ADDON_NAME} v${this.SpoddyCoiner.VERSION}`;
        this.ABOUT_TEXT = 'Handy little functions to get data from the CoinMarketCap API.\n\nCaches the response to help reduce the number of API calls and keep within your rate-limits.\n\nhttps://github.com/SpoddyCoder/SpoddyCoiner';
        this.DOCS_FUNCTIONS_HEADING = 'Custom Functions';
        this.DOCS_FUNCTIONS_TEXT = 'Simply tap the function name into a cell to get more information.\n\n=SPODDYCOINER( coin, attribute, fiat )\n\n=SPODDYCOINER_CONVERT( coin, amount, coin )\nNB: currency ticker can be used instead of coin\n';
        this.DOCS_ATTRIBUTES_HEADING = 'Coin Attributes';
        this.DOCS_ATTRIBUTES_TEXT = '';
        this.ENTER_API_KEY_PROMPT = 'Enter your API key';
        this.CURRENT_KEY_LABEL = 'Current Key :';
        this.API_KEY_UPDATED_LABEL = 'API Key Updated';
        this.API_CACHE_TIME_HEADING = 'API Cache Time';
        this.API_CACHE_KEY_PROMPT = `New cache time in seconds (max ${this.SpoddyCoiner.Model.APICache.MAX_CACHE_TIME})`;
        this.API_CACHE_TIME_UPDATED_LABEL = 'API Cache Time Updated';
        this.NEW_CACHE_TIME_LABEL = 'New cache time :';
        this.NUM_CACHE_ITEMS_LABEL = ' API calls currently cached';
        this.CLEAR_CACHE_PROMPT = 'Do you want to reset the API cache?';
        this.API_CACHE_CLEARED_LABEL = 'API cache cleared.';
        this.REFRESH_ALL_FUNCTIONS_NOTE = 'NB: this does not clear the cache.';
        this.REFRESH_ALL_FUNCTIONS_PROMPT = 'Do you want to re-run all the SPODDYCOINER functions on the active sheet?';
        this.NEW_CURRENCY_CODE_HEADING = 'Enter new 3 letter currency code (ISO 4217)';
        this.DEFAULT_CURRENCY_UPDATED_LABEL = 'Default Currency Updated';
        this.NEW_CURRENCY_LABEL = 'New currency code :';
        this.CURRENCY_CODE_NOT_VALID_LABEL = 'Currency code was not valid!';
        this.TURN_ERRORS_OFF_PROMPT = 'Do you want to turn errors off?';
        this.TURN_ERRORS_ON_PROMPT = 'Do you want to turn errors on?';
        this.GENERIC_ERROR_MESSAGE = 'There was a problem, please try again.';

        /**
         * Supported attributes and their descriptions
         */
        this.SUPPORTED_ATTRIBUTES = {
            price: 'Latest price, in fiat currency',
            price_percent_change_1h: 'Price change over last 1h, as a percentage',
            price_percent_change_24h: 'Price change over last 24h, as a percentage',
            price_percent_change_7d: 'Price change over last 7d, as a percentage',
            price_percent_change_30d: 'Price change over last 30d, as a percentage',
            market_cap: 'Latest market capitalization, in fiat currency',
            volume_24h: '24h trading volume, in fiat currency',
            circulating_supply: 'Number of coins/tokens currently circulating',
            total_supply: 'Total number of coins/tokens potentially available',
            max_supply: 'Maximum number of coins/tokens that will ever be available (some coins do not have a max supply)',
            fcas_score: 'Fundamental Crypto Asset Score (0-1000), a measure of the fundamental health of crypto projects (only the top 300-400 coins are rated)',
            fcas_grade: 'FCAS Grade (S,A,B,C,E,F)',
            fcas_grade_full: 'Full FCAS Grade description (Superb,Attractive,Basic,Caution,Fragile)',
            fcas_percent_change_24h: '24h change in score',
            fcas_point_change_24h: '24h change in score, as a percentage',
            name: 'The cryptocurrency name',
            description: 'Full description of the project.',
            logo: 'The coin logo url (Tip: wrap this in the Google Sheets IMAGE function to show it in the cell)',
            date_added: 'Date added to CoinMarketCap (effectively the date it started)',
            year_added: 'Year added to CoinMarketCap',
            tags: 'A comma seperated list of all tags',
            tags_top_5: 'A comma seperated list of the first 5 tags',
            url_website: 'Primary website for the project (if more than 1, only 1st returned)',
            url_technical_doc: 'Whitepaper tech document for the project (if more than 1, only 1st returned)',
            url_explorer: 'Blockchain explorer for the coin/token (if more than 1, only 1st returned)',
            url_source_code: 'Project source code (github URL, if available)',
        };
    }

    /**
     * Basic menu when no authorization has been given
     */
    addNoAuthMenu() {
        const ui = SpreadsheetApp.getUi();
        ui.createAddonMenu()
            .addItem( this.MENU_ABOUT_LABEL, `${this.app}.View.Menu.about` )
            .addToUi();
    }

    /**
     * Full SpoddyCoiner menu
     */
    addMenu() {
        const ui = SpreadsheetApp.getUi();
        ui.createAddonMenu()
            .addItem( this.MENU_CMC_API_KEY_LABEL, `${this.app}.View.Menu.updateCMCApiKey` )
            .addSubMenu( ui.createMenu( this.MENU_TOOLS_LABEL )
                .addItem( this.MENU_REFRESH_ALL_FUNCTIONS_LABEL, `${this.app}.View.Menu.refreshCustomFunctions` )
                .addItem( this.MENU_CLEAR_CACHE_LABEL, `${this.app}.View.Menu.clearAPICache` ) )
            .addSubMenu( ui.createMenu( this.MENU_PREFERENCES_LABEL )
                .addItem( `${this.MENU_DEFAULT_CURRENCY_LABEL} ${this.SpoddyCoiner.Model.GASProps.getDefaultCurrency()}`, `${this.app}.View.Menu.updateDefaultCurrency` )
                .addItem( `${this.MENU_CACHE_TIME_LABEL} ${this.SpoddyCoiner.Model.GASProps.getCacheTime( true )}`, `${this.app}.View.Menu.updateAPICacheTime` )
                .addItem( `${this.MENU_SHOW_ERRORS_LABEL}  ${this.SpoddyCoiner.Model.GASProps.getDisplayErrorMessages( true )}`, `${this.app}.View.Menu.showErrors` ) )
            .addSeparator()
            .addSubMenu( ui.createMenu( this.MENU_DOCS_LABEL )
                .addItem( this.MENU_FUNCTIONS_LABEL, `${this.app}.View.Menu.docsFunctions` )
                .addItem( this.MENU_ATTRIBUTES_LABEL, `${this.app}.View.Menu.docsAttributes` ) )
            .addItem( this.MENU_ABOUT_LABEL, `${this.app}.View.Menu.about` )
            .addToUi();
    }

    /**
     * 'CoinMarketCap API Key' menu item
     */
    updateCMCApiKey() {
        const ui = SpreadsheetApp.getUi();
        let apiKey = this.SpoddyCoiner.Model.GASProps.getAPIKey( true ); // masked
        const promptLabel = ( apiKey === '' ) ? this.ENTER_API_KEY_PROMPT : `${this.CURRENT_KEY_LABEL} ${apiKey}\n\n${this.ENTER_API_KEY_PROMPT}`;
        const result = ui.prompt(
            this.MENU_CMC_API_KEY_LABEL,
            promptLabel,
            ui.ButtonSet.OK_CANCEL,
        );
        const button = result.getSelectedButton();
        apiKey = result.getResponseText();
        if ( button === ui.Button.OK ) {
            if ( !this.SpoddyCoiner.Model.GASProps.setAPIKey( apiKey ) ) {
                ui.alert( this.GENERIC_ERROR_MESSAGE, ui.ButtonSet.OK );
                return;
            }
            this.promptRefreshAllFunctions( this.API_KEY_UPDATED_LABEL );
        }
    }

    /**
     * 'API Cache Time' menu item
     */
    updateAPICacheTime() {
        const ui = SpreadsheetApp.getUi();
        const result = ui.prompt(
            this.API_CACHE_TIME_HEADING,
            this.API_CACHE_KEY_PROMPT,
            ui.ButtonSet.OK_CANCEL,
        );
        const button = result.getSelectedButton();
        const newTime = result.getResponseText();
        if ( button === ui.Button.OK ) {
            if ( !this.SpoddyCoiner.Model.GASProps.setCacheTime( newTime ) ) {
                ui.alert( this.GENERIC_ERROR_MESSAGE, ui.ButtonSet.OK );
                return;
            }
            ui.alert(
                this.API_CACHE_TIME_UPDATED_LABEL,
                `${this.NEW_CACHE_TIME_LABEL} ${this.SpoddyCoiner.Model.GASProps.getCacheTime( true )}`,
                ui.ButtonSet.OK,
            );
        }
    }

    /**
     * 'Clear API Cache' menu item
     */
    clearAPICache() {
        const ui = SpreadsheetApp.getUi();
        const result = ui.alert(
            this.MENU_CLEAR_CACHE_LABEL,
            this.CLEAR_CACHE_PROMPT,
            ui.ButtonSet.YES_NO,
        );
        if ( result === ui.Button.YES ) {
            if ( !this.SpoddyCoiner.Model.APICache.clear() ) {
                ui.alert( this.GENERIC_ERROR_MESSAGE, ui.ButtonSet.OK );
                return;
            }
            this.promptRefreshAllFunctions( this.API_CACHE_CLEARED_LABEL );
        }
    }

    /**
     * 'Default Currency' menu item
     */
    updateDefaultCurrency() {
        const ui = SpreadsheetApp.getUi();
        const result = ui.prompt(
            `${this.MENU_DEFAULT_CURRENCY_LABEL} ${this.SpoddyCoiner.Model.GASProps.getDefaultCurrency()}`,
            this.NEW_CURRENCY_CODE_HEADING,
            ui.ButtonSet.OK_CANCEL,
        );
        const button = result.getSelectedButton();
        const newCurrencyCode = result.getResponseText();
        if ( button === ui.Button.CANCEL || button === ui.Button.CLOSE ) {
            return;
        }
        if ( button === ui.Button.OK ) {
            if ( !this.SpoddyCoiner.Model.GASProps.setDefaultCurrency( newCurrencyCode ) ) {
                ui.alert( this.CURRENCY_CODE_NOT_VALID_LABEL, ui.ButtonSet.OK );
                return;
            }
            this.promptRefreshAllFunctions(
                `${this.DEFAULT_CURRENCY_UPDATED_LABEL}`,
                `${this.NEW_CURRENCY_LABEL} ${this.SpoddyCoiner.Model.GASProps.getDefaultCurrency()}`,
            );
        }
    }

    /**
     * 'Show Errors' menu item
     */
    showErrors() {
        const ui = SpreadsheetApp.getUi();
        let prompt = this.TURN_ERRORS_ON_PROMPT;
        if ( this.SpoddyCoiner.Model.GASProps.getDisplayErrorMessages() ) {
            prompt = this.TURN_ERRORS_OFF_PROMPT;
        }
        const result = ui.alert(
            `${this.MENU_SHOW_ERRORS_LABEL}  ${this.SpoddyCoiner.Model.GASProps.getDisplayErrorMessages( true )}`,
            prompt,
            ui.ButtonSet.YES_NO,
        );
        if ( result === ui.Button.YES ) {
            this.SpoddyCoiner.Model.GASProps.toggleErrorMessages();
            this.promptRefreshAllFunctions(
                `${this.MENU_SHOW_ERRORS_LABEL}  ${this.SpoddyCoiner.Model.GASProps.getDisplayErrorMessages( true )}`,
            );
        }
    }

    /**
     * 'Functions' menu item
     */
    docsFunctions() {
        const ui = SpreadsheetApp.getUi();
        ui.alert(
            this.DOCS_FUNCTIONS_HEADING,
            this.DOCS_FUNCTIONS_TEXT,
            ui.ButtonSet.OK,
        );
    }

    /**
     * 'Supported Attributes' menu item
     */
    docsAttributes() {
        const ui = SpreadsheetApp.getUi();
        let supportedAttrs = '';
        Object.entries( this.SUPPORTED_ATTRIBUTES ).forEach( ( [k, v] ) => {
            supportedAttrs += `"${k}"\n ${v}\n\n`;
        } );
        const text = `${this.DOCS_ATTRIBUTES_TEXT}${supportedAttrs}`;
        ui.alert( this.DOCS_ATTRIBUTES_HEADING, text, ui.ButtonSet.OK );
    }

    /**
     * 'About' menu item
     */
    about() {
        const ui = SpreadsheetApp.getUi();
        ui.alert(
            this.ABOUT_HEADING,
            this.ABOUT_TEXT,
            ui.ButtonSet.OK,
        );
    }

    /**
     * 'Refresh all functions' menu item
     */
    refreshCustomFunctions() {
        this.promptRefreshAllFunctions(
            this.MENU_REFRESH_ALL_FUNCTIONS_LABEL,
            this.REFRESH_ALL_FUNCTIONS_NOTE,
        );
    }

    /**
     * Refresh all SPODDYCOINER functions dialogue
     *
     * @param {string} title    title text
     * @param {string} text     additional text above the update functions prompt
     * @returns {boolean}       confirmed OK
     */
    promptRefreshAllFunctions( title = '', text = '' ) {
        const ui = SpreadsheetApp.getUi();
        const confirmText = ( text !== '' ) ? `${text}\n\n${this.REFRESH_ALL_FUNCTIONS_PROMPT}` : this.REFRESH_ALL_FUNCTIONS_PROMPT;
        const result = ui.alert(
            title,
            confirmText,
            ui.ButtonSet.YES_NO,
        );
        if ( result === ui.Button.YES ) {
            this.SpoddyCoiner.handleRefreshAllFunctionsConfirm();
            return true;
        }
        return false;
    }
}


class Sheet {
    /**
     * Active Sheet view
     *
     * @param {SpoddyCoiner} spoddycoiner   primary controller instance
     */
    constructor( spoddycoiner ) {
        /**
         * main controller class
         */
        this.SpoddyCoiner = spoddycoiner;

        /**
         * SpoddyCoiner spreeadsheet functions
         * these are defined in Addon_Functions.gs
         */
        this.FUNCTIONS = [
            'SPODDYCOINER',
            'SPODDYCOINER_CONVERT',
        ];
    }

    /**
     * Refresh all SpoddyCoiner functions on the active sheet
     *
     * https://tanaikech.github.io/2019/10/28/automatic-recalculation-of-custom-function-on-spreadsheet-part-2/
     */
    refreshAllFunctions() {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const temp = Utilities.getUuid();
        this.FUNCTIONS.forEach( ( e ) => {
            ss.createTextFinder( `=${e}` )
                .matchFormulaText( true )
                .replaceAllWith( temp );
            ss.createTextFinder( temp )
                .matchFormulaText( true )
                .replaceAllWith( `=${e}` );
        } );
    }
}



/**
 * SpoddyCoiner global scope reference
 */

const App = new SpoddyCoiner( 'App' );

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
        // Start in AuthMode NONE - addon menu contains the 'About' section only
        App.View.Menu.addNoAuthMenu();
        return;
    }
    // Start in AuthMode FULL or LIMITED - full menu
    App.View.Menu.addMenu();
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
