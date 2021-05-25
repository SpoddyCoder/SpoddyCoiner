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
     * @param {string} coin         the coin ticker
     * @param {string} attribute    the attribute to get
     * @param {string} [fiat]       fiat to return the value in (required for some attributes)
     * @return {string|number}      the value of the attribute
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
     * @param {number} amount       the amount to convert
     * @param {string} symbol       the coin/currency ticker to convert from
     * @param {string} convert      the coin/currnecy ticker to convert to
     * @return {number}             the converted value
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
     * Determine if a curency code is valid
     * @param {string} currencyCode     the currency code to check
     * @return {boolean}                is valid ISO-4217 country code
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

module.exports = { CMC };
