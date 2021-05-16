Model.Props = {

  /**
   * Property key names
   */
  CMC_API_KEY: "cmc_api_key",
  DEFAULT_CURRENCY: "default_currency",
  API_CACHE_TIME: "api_cache_time",
  DISPLAY_ERROR_MESSAGES: "display_error_messages",


  /**
   * Get API Key from user props
   * if not defined set it ""
   * 
   * @param {boolean} masked              mask all but the first and last letter
   * 
   * @return {string}                     api key
   */
  getAPIKey: ( masked = false ) => {
    var user_props = PropertiesService.getUserProperties();
    var api_key = user_props.getProperty( Model.Props.CMC_API_KEY );
    if( masked ) {
      api_key = api_key.replace(/(?!^.?).(?!.{0}$)/gi, '*');
    }
    if ( ! api_key ) {
      api_key = "";
      user_props.setProperty( Props.CMC_API_KEY, api_key );
    }
    return api_key;
  },

  /**
   * Set API Key in user props
   * 
   * @return {boolean}                    was updated, true|false
   */
  setAPIKey: ( new_api_key ) => {
    var user_props = PropertiesService.getUserProperties();
    if ( typeof( new_api_key ) !== "string" ) {
      return false;
    }
    user_props.setProperty( Model.Props.CMC_API_KEY, new_api_key );
    View.Menu.addMenu();  // update the menu with new time
    return true;
  },

  /**
   * Get default currency from user props
   * if not defined set it currency looked up from users locale
   * 
   * @return {string}                     currency code
   */
  getDefaultCurrency: () => {
    var user_props = PropertiesService.getUserProperties();
    var currency = user_props.getProperty( Model.Props.DEFAULT_CURRENCY );
    if ( ! currency ) {
      currency = Model.RCApi.lookupCurrency();
      user_props.setProperty( Model.Props.DEFAULT_CURRENCY, currency );
    }
    return currency;
  },

  /**
   * Set default currency in user props
   * 
   * @return {boolean}                    was updated, true|false
   */
  setDefaultCurrency: ( new_currency_code ) => {
    var user_props = PropertiesService.getUserProperties();
    if ( typeof( new_currency_code ) !== "string" ) {
      return false;
    }
    if ( ! Model.RCApi.currencyCodeIsValid( new_currency_code ) ) {
      return false;
    }
    user_props.setProperty( 'default_currency', new_currency_code );
    // update menu & SpoddyCoiner functions on the active sheet
    View.Menu.addMenu();
    View.Sheet.refreshAllFunctions();
    return true;
  },

  /**
   * Get cache time from document props
   * if not defined set it to default value
   * 
   * @param {boolean} human_readable      return value in seconds or a human readable string
   * 
   * @return {mixed}                      cache time in seconds or h/m/s
   */
  getCacheTime: ( human_readable = false ) => {
    var doc_props = PropertiesService.getDocumentProperties();
    var cache_time = parseInt( doc_props.getProperty( Model.Props.API_CACHE_TIME ) );
    if ( isNaN( cache_time ) ) {
      cache_time = Model.Cache.DEFAULT_CACHE_TIME;
      doc_props.setProperty( Model.Props.API_CACHE_TIME, cache_time );
    }
    if ( human_readable ) {
      var text = "";
      var num_hrs = Math.floor( ( ( cache_time % 31536000 ) % 86400 ) / 3600 );
      var num_mins = Math.floor( ( ( ( cache_time % 31536000 ) % 86400 ) % 3600 ) / 60);
      var num_secs = ( ( ( cache_time % 31536000 ) % 86400 ) % 3600 ) % 60;
      if( num_hrs > 0 ) {
        text += num_hrs + "h ";
      }
      if( num_mins > 0 ) {
        text += num_mins + "m "
      }
      if( num_secs > 0 ) {
        text += num_secs + "s"
      }
      return text;
    }
    return cache_time;
  },

  /**
   * Set cache time in document props & update menu
   * 
   * @return {boolean}                    was updated, true|false
   */
  setCacheTime: ( new_time ) => {
    var doc_props = PropertiesService.getDocumentProperties();
    new_time = parseInt ( new_time );
    if ( isNaN(new_time) ) {
      return false;
    }
    if ( new_time > Model.Cache.MAX_CACHE_TIME ) {
      new_time = Model.Cache.MAX_CACHE_TIME;
    }
    doc_props.setProperty( Model.Props.API_CACHE_TIME, new_time);
    View.Menu.addMenu();  // update the menu with new time
    return true;
  },

  /**
   * Get Display Error Messages
   * if not defined set it to On
   * 
   * @param {boolean} human_readable      return value as boolean a human readable string
   * 
   * @return{boolean}                     was updated, true|false
   */
  getDisplayErrorMessages: ( human_readable = false ) => {
    var doc_props = PropertiesService.getDocumentProperties();
    var err_msgs = doc_props.getProperty( Model.Props.DISPLAY_ERROR_MESSAGES );
    if( ! err_msgs ) {
      err_msgs = "On";
      doc_props.setProperty( Model.Props.DISPLAY_ERROR_MESSAGES, err_msgs );
    }
    if ( ! human_readable ) {
      return ( err_msgs === "On" ) ? true : false;
    }
    return err_msgs;
  },

  /**
   * Toggle Error Messages
   * 
   * @return{boolean}                     was updated, true|false
   */
  toggleErrorMessages: () => {
    var doc_props = PropertiesService.getDocumentProperties();
    var err_msgs = Model.Props.getDisplayErrorMessages();
    err_msgs = ( err_msgs ) ? "Off" : "On"; // toggle
    doc_props.setProperty( Model.Props.DISPLAY_ERROR_MESSAGES, err_msgs );
    View.Menu.addMenu();  // update the menu with new value
    return true;
  },

};
