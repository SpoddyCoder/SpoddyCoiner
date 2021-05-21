/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */

const { Model } = require( '../controller/SpoddyCoiner' );

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
        const currencyCode = jsonResponse.find( ( country ) => country.capital === capital )
            .currencies[0].code;
        return currencyCode;
    },

    /**
     * Use the RestCountries API to determine if a country code is valid ISO-4217
     *
     * @param {string} currencyCode     the currency code string to check
     *
     * @return {boolean}                is valid ISO-4217, true|false
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
