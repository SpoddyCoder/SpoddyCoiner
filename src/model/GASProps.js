class GASProps {
    /**
     * GAS Properties Service
     */
    constructor( controller ) {
        /**
         * MVC references
         */
        this.Controller = controller;
        this.Model = this.Controller.Model;

        /**
         * Default values
         */
        this.DEFAULT_CACHE_TIME = 3600;
        this.DEFAULT_DEFAULT_CURRENCY = 'USD';

        /**
         * Property key names
         */
        this.CMC_API_KEY_KEY = 'cmc_api_key';
        this.DEFAULT_CURRENCY_KEY = 'default_currency';
        this.API_CACHE_TIME_KEY = 'api_cache_time';
        this.DISPLAY_ERROR_MESSAGES_KEY = 'display_error_messages';

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
     * @return {string}         api key
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
     * @return {boolean}    was updated
     */
    setAPIKey( newApiKey ) {
        if ( typeof ( newApiKey ) !== 'string' ) {
            return false;
        }
        if ( !this.userProps.setProperty( this.CMC_API_KEY_KEY, newApiKey ) ) {
            return false;
        }
        this.Controller.handleApiKeyChange( newApiKey );
        return true;
    }

    /**
     * Get default currency from user props
     * if not defined set it currency looked up from users locale
     *
     * @return {string}     currency code
     */
    getDefaultCurrency() {
        let currency = this.userProps.getProperty( this.DEFAULT_CURRENCY_KEY );
        if ( !currency ) {
            currency = this.DEFAULT_DEFAULT_CURRENCY; // TODO: re-implement RCApi?
            this.userProps.setProperty( this.DEFAULT_CURRENCY_KEY, currency );
        }
        return currency;
    }

    /**
     * Set default currency in user props
     *
     * @return {boolean}    was updated
     */
    setDefaultCurrency( newCurrencyCode ) {
        if ( typeof ( newCurrencyCode ) !== 'string' ) {
            return false;
        }
        if ( !this.Model.RCApi.currencyCodeIsValid( newCurrencyCode ) ) {
            return false;
        }
        if ( !this.userProps.setProperty( 'default_currency', newCurrencyCode ) ) {
            return false;
        }
        this.Controller.handleDefaultCurrencyChange( newCurrencyCode );
        return true;
    }

    /**
     * Get cache time from document props
     * if not defined set it to default value
     *
     * @param {boolean} humanReadable   return value in seconds or a human readable string
     * @return {mixed}                  cache time in seconds or h/m/s
     */
    getCacheTime( humanReadable = false ) {
        let cacheTime = parseInt( this.docProps.getProperty( this.API_CACHE_TIME_KEY ), 10 );
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
     * @return {boolean}    was updated
     */
    setCacheTime( time ) {
        let newTime = parseInt( time, 10 );
        if ( newTime.isNaN ) {
            return false;
        }
        if ( newTime > this.Model.APICache.MAX_CACHE_TIME ) {
            newTime = this.Model.APICache.MAX_CACHE_TIME;
        }
        if ( !this.docProps.setProperty( this.API_CACHE_TIME_KEY, newTime ) ) {
            return false;
        }
        this.Controller.handleCacheTimeChange( newTime );
        return true;
    }

    /**
     * Get Display Error Messages from doc props
     * if not defined set it to On
     *
     * @param {boolean} humanReadable   return value as boolean or human readable string
     * @return {boolean}                was updated
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
     * @return {boolean}    was updated
     */
    toggleErrorMessages() {
        let dispErrMsgs = this.getDisplayErrorMessages();
        dispErrMsgs = ( dispErrMsgs ) ? 'Off' : 'On'; // toggle
        if ( !this.docProps.setProperty( this.DISPLAY_ERROR_MESSAGES_KEY, dispErrMsgs ) ) {
            return false;
        }
        this.Controller.handleDisplayErrorMessagesChange( dispErrMsgs );
        return true;
    }
}

module.exports = { GASProps };
