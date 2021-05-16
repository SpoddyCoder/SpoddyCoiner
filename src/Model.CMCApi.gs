Model.CMCApi = {

  /**
   * CMC API Endpoints
   */
  BASE_URL:                           "https://pro-api.coinmarketcap.com",

  // free plan
  CRYPTOCURRENCY_MAP:                 "/v1/cryptocurrency/map",
  CRYPTOCURRENCY_METADATA:            "/v1/cryptocurrency/info",
  CRYPTOCURRENCY_LISTINGS_LATEST:     "/v1/cryptocurrency/listings/latest",
  CRYPTOCURRENCY_QUOTES_LATEST:       "/v1/cryptocurrency/quotes/latest",
  FIAT_MAP:                           "/v1/fiat/map",
  GLOBAL_METRICS_LATEST:              "/v1/global-metrics/quotes/latest",
  TOOLS_PRICE_CONVERSION:             "/v1/tools/price-conversion",
  PARTNERS_FCAS_LISTINGS_LATEST:      "/v1/partners/flipside-crypto/fcas/listings/latest",
  PARTNERS_FCAS_QUOTES_LATEST:        "/v1/partners/flipside-crypto/fcas/quotes/latest",
  KEY_INFO:                           "/v1/key/info",

  /**
   * FCAS Grades
   */
  FCAS_GRADES: {
    "S": "Superb",
    "A": "Attractive",
    "B": "Basic",
    "C": "Caution",
    "F": "Fragile",
    "": "N/A"
  },


  /**
   * Make an API call to CRYPTOCURRENCY_METADATA
   * 
   * @param {string}slug                the CMC crypto slug
   * 
   * @return {object}                   JSON Object
   */
  getCryptoMetadata: ( symbol ) => {
    var query = "symbol=" + symbol.toUpperCase();
    return Model.CMCApi.call( Model.CMCApi.CRYPTOCURRENCY_METADATA, query );
  },

  /**
   * Make an API call to CRYPTOCURRENCY_QUOTES_LATEST
   * 
   * @param {string}symbol              the crypto symbol
   * @param {string}fiat                fiat currency to use for the lookup
   * 
   * @return {object}                   JSON Object
   */
  getCryptoQuoteLatest: ( symbol, fiat ) => {
    var query = "symbol=" + symbol.toUpperCase() + "&convert=" + fiat.toUpperCase();
    return Model.CMCApi.call( Model.CMCApi.CRYPTOCURRENCY_QUOTES_LATEST, query );
  },

  /**
   * Make an API call to PARTNERS_FCAS_QUOTES_LATEST
   * 
   * @param {string}slug                the crypto symbol
   * 
   * @return {object}                   JSON Object
   */
  getFCASQuoteLatest: ( symbol ) => {
    var query = "symbol=" + symbol.toUpperCase();
    var return_data = Model.CMCApi.call( Model.CMCApi.PARTNERS_FCAS_QUOTES_LATEST, query );
    if ( return_data.error_message.includes( "No data found" ) ) {
      return_data.error_message = "";   // not expecting all coins to be supported, so don't show this as an error
      return_data.grade = "";
    }
    return return_data;
  },

  /**
   * Make an API call to TOOLS_PRICE_CONVERSION
   * 
   * @param {number} amount             the amount to convert
   * @param {string} symbol             the coin/currency to convert from
   * @param {string} convert            the coin/currnecy to convert to
   * 
   * @return {Object}                   JSON Object
   */
  priceConversion: ( amount, symbol, convert ) => {
    var query = "amount=" + amount + "&symbol=" + symbol.toUpperCase() + "&convert=" + convert.toUpperCase();
    return Model.CMCApi.call( Model.CMCApi.TOOLS_PRICE_CONVERSION, query );
  },

  /**
   * Make an API call to the CMC API (only if necessary, will fetch from cache if available)
   * handle errors, cahe + return the result
   * 
   * @param {string}endpoint            CMC query endpoint
   * @param {string}query               query to run (not including the API key)
   * 
   * @return {object}                   JSON Object, "error_message" key contains error detail ("" if no error occurred)
   */
  call: ( endpoint, query ) => {

    query = endpoint + "?" + query;
    Logger.log( "Running query: " + query );

    var data = Model.Cache.get( query );
    if ( data ) {
      Logger.log( "Result fetched from cache" );
      console.log( data );
      return data;
    }

    Logger.log( "Not found in cache, fetching result from API..." );
    var response = UrlFetchApp.fetch( 
      Model.CMCApi.BASE_URL + query, 
      {
        contentType: "application/json",
        muteHttpExceptions: true,
        headers: {
          "X-CMC_PRO_API_KEY": Model.Props.getAPIKey(),
          "Accept": "application/json"
        }
      } 
    );
    var response_json = JSON.parse( response.getContentText() );

    var err_msg = "";
    if ( response.getResponseCode() !== 200 ) {
      if ( typeof( response_json.status ) === "undefined" ) {
        // uncontrolled error
        err_msg = "! Unexpected CMC API Response";
      }
      // controlled error
      err_msg = ( err_msg ) || response_json.status.error_message;
      response_json = { "error_message": err_msg };
      Logger.log( response_json );
      return response_json;       // dont cache error reponses
    }

    // get first item in the packet (all our calls currently return 1 coin/item)
    // discard the status object
    // cache & return
    var data = response_json.data;
    for ( var id in data ) {
      var return_data = data[id];
    }
    return_data.error_message = "";     // no error
    Model.Cache.put( query, return_data );
    console.log( return_data );
    return return_data;

  },

};
