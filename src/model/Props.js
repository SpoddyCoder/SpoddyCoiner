const { Model } = require( '../controller/SpoddyCoiner' );
const { View } = require( '../controller/SpoddyCoiner' );

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
        docProps.setProperty( Model.Props.API_CACHE_TIME, newTime );
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
