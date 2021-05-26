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

module.exports = { GASProps };
