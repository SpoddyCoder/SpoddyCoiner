Model.RCApi = {
  
  /**
   * RestCountries API Endpoint
   */
  BASE_URL: "https://restcountries.eu/rest/v2/lang/",


  /**
   * Use the RestCountries API to lookup users preferred currency based on their locale
   * 
   * @return {string}                     ISO-4127 currency code
   */
  lookupCurrency: () => {
    var user_country = Session.getActiveUserLocale();
    var time_zone = Session.getScriptTimeZone();
    var region = time_zone.split("/")[0];
    var capital = time_zone.split("/")[1];
    var response = UrlFetchApp.fetch(RCApi.BASE_URL  + user_country ).getContentText();
    var json_response = JSON.parse(response);
    var currency_code = json_response.find( (country) => { return country.capital == capital } ).currencies[0].code;
    return currency_code;
  },

  /**
   * Use the RestCountries API to determine if a country code is valid ISO-4217
   * 
   * @param {string} currency_code        the currency code string to check
   * 
   * @return {boolean}                    is valid ISO-4217, true|false
   */
  currencyCodeIsValid: ( currency_code ) => {
    var user_country = Session.getActiveUserLocale();
    var response = UrlFetchApp.fetch( RCApi.BASE_URL + user_country ).getContentText();
    var json_response = JSON.parse(response);
    var is_valid = false;
    for (var countryid in json_response) {
      for (var currencyid in json_response[countryid].currencies) {
        if( json_response[countryid].currencies[currencyid].code === currency_code ) {
          is_valid = true;
        }
      }
    }
    return is_valid;
  },

};
