Controller.SpoddyCoiner = {

  /**
   * SpoddyCoiner Google Sheets Add-On
   */ 
  ADDON_NAME: "SpoddyCoiner",

  /**
   * Version
   * incrementing will create fresh cache entries (the old ones will naturally expire)
   */
  VERSION: "1.0.4",
  

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
   * @param {string} coin             the coin ticker
   * @param {string} attribute        the attribute to get
   * @param {string} fiat             optional: the fiat to return the value in (only required for some attributes)
   * 
   * @return {mixed}                  the value of the attribute (String/Number)
   */
  getCoinAttribute: ( coin, attribute, fiat ) => {

    var coin_data = {};
    var value;

    switch ( attribute ) {

      case 'price':
      case 'market_cap': 
      case 'volume_24h': 
        coin_data = Model.CMCApi.getCryptoQuoteLatest( coin, fiat );
        if( ! coin_data.error_message ) {
          value = coin_data.quote[fiat][attribute];
          Logger.log( `${coin} ${attribute} : ${value} ${fiat}` ); 
        }
        break;

      case 'price_percent_change_1h':
      case 'price_percent_change_24h': 
      case 'price_percent_change_7d': 
      case 'price_percent_change_30d': 
        coin_data = Model.CMCApi.getCryptoQuoteLatest( coin, fiat );
        if( ! coin_data.error_message ) {
          value = coin_data.quote[fiat][attribute.replace( 'price_', '' )] / 100;   // make compatible with standard Google Sheets percentage format
          Logger.log( `${coin} ${attribute} : ${value}` ); 
        }
        break;

      case 'circulating_supply':
      case 'total_supply':
      case 'max_supply':
        var coin_data = Model.CMCApi.getCryptoQuoteLatest( coin, fiat );
        if( ! coin_data.error_message ) {
          value = coin_data[attribute];
          Logger.log( `${coin} ${attribute} : ${value}` ); 
        }
        break;

      case 'fcas_grade':
      case 'fcas_grade_full':
        var coin_data = Model.CMCApi.getFCASQuoteLatest( coin );
        if( ! coin_data.error_message ) {
          value = ( attribute === 'fcas_grade' ) ? coin_data.grade : Model.CMCApi.FCAS_GRADES[coin_data.grade];
          Logger.log( `${coin} ${attribute} : ${value}` ); 
        }
        break;

      case 'fcas_score':
      case 'fcas_percent_change_24h':
      case 'fcas_point_change_24h':
        var coin_data = Model.CMCApi.getFCASQuoteLatest( coin );
        if( ! coin_data.error_message ) {
          value = coin_data[attribute.replace( 'fcas_', '' )];
          Logger.log( `${coin} ${attribute} : ${value}` ); 
        }
        break;      

      case 'name':
      case 'description':
      case 'logo':
      case 'date_added':
        var coin_data = Model.CMCApi.getCryptoMetadata( coin );
        if( ! coin_data.error_message ) {
          value = coin_data[attribute];
          Logger.log( `${coin} ${attribute} : ${value}` ); 
        }
        break;

      case 'year_added':
        var coin_data = Model.CMCApi.getCryptoMetadata( coin );
        if( ! coin_data.error_message ) {
          value = new Date(coin_data['date_added']).getFullYear();
          Logger.log( `${coin} ${attribute} : ${value}` ); 
        }
        break;

      case 'tags':
        var coin_data = Model.CMCApi.getCryptoMetadata( coin );
        if( ! coin_data.error_message ) {
          value = coin_data[attribute].join(", ");   // return a CSV list of all the tags
          Logger.log( `${coin} ${attribute} : ${value}` ); 
        }
        break; 

      case 'url_website':
      case 'url_technical_doc':
      case 'url_explorer':
      case 'url_source_code':
        var coin_data = Model.CMCApi.getCryptoMetadata( coin );
        if( ! coin_data.error_message ) {
          value = coin_data.urls[attribute.replace('url_', '')][0];   // these can return many url's, just return the first for now (TODO)
          Logger.log( `${coin} ${attribute} : ${value}` ); 
        }
        break;   

      default:
        coin_data.error_message = 'Invalid attribute : ' + attribute;
        break;

    }

    if( coin_data.error_message ) {
      Logger.log( "Error: " + coin_data.error_message );
      return ( Model.Props.getDisplayErrorMessages() ) ? coin_data.error_message : "";
    }
    return value;

  },

  /**
   * @param {Number} amount             the amount to convert
   * @param {String} symbol             the coin/currency ticker to convert from
   * @param {String} convert            the coin/currnecy ticker to convert to
   * 
   * @return                            the converted value
   */
  convert: ( amount, symbol, convert ) => {

    var conversion_data = Model.CMCApi.priceConversion( amount, symbol, convert );
    if( conversion_data.error_message ) {
      Logger.log( "Error: " + conversion_data.error_message );
      return conversion_data.error_message;
    }
    value = conversion_data[convert].price;
    Logger.log( `${amount} ${symbol} : ${value} ${convert}` );
    return value;

  },

};
