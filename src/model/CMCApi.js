class CMCApi {
    constructor( controller ) {
        /**
         * MVC references
         */
        this.Controller = controller;
        this.Model = this.Controller.Model;

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
         * FCAS Grades
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
     * @return {object}         JSON Object
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
     * @return {object}         JSON Object
     */
    getCryptoQuoteLatest( symbol, fiat ) {
        const query = `symbol=${symbol.toUpperCase()}&convert=${fiat.toUpperCase()}`;
        return this.call( this.CRYPTOCURRENCY_QUOTES_LATEST, query );
    }

    /**
     * Make an API call to PARTNERS_FCAS_QUOTES_LATEST
     *
     * @param {string} slug     the crypto symbol
     * @return {object}         JSON Object
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
     * @return {Object}         JSON Object
     */
    priceConversion( amount, symbol, convert ) {
        const query = `amount=${amount}&symbol=${symbol.toUpperCase()}&convert=${convert.toUpperCase()}`;
        return this.call( this.TOOLS_PRICE_CONVERSION, query );
    }

    /**
     * Make an API call to the CMC API (only if necessary, will fetch from cache if available)
     * handle errors, cahe + return the result
     *
     * @param {string} endpoint     CMC query endpoint
     * @param {string} query        query to run (not including the API key)
     * @return {object}             JSON Object, "error_message" value is empty if no error occurred
     */
    call( endpoint, query ) {
        const fullQuery = `${endpoint}?${query}`;
        Logger.log( `Running query: ${fullQuery}` );

        let data = this.Model.APICache.get( fullQuery );
        if ( data ) {
            Logger.log( 'Result fetched from cache' );
            Logger.log( data );
            return data;
        }

        Logger.log( 'Not found in cache, fetching result from API...' );
        const response = UrlFetchApp.fetch(
            this.BASE_URL + fullQuery,
            {
                contentType: 'application/json',
                muteHttpExceptions: true,
                headers: {
                    'X-CMC_PRO_API_KEY': this.Model.GASProps.getAPIKey(),
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
        this.Model.APICache.put( fullQuery, returnData );
        Logger.log( returnData );
        return returnData;
    }
}

module.exports = { CMCApi };
