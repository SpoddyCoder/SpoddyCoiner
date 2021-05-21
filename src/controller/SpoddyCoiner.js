/**
 * a loose 'static' MVC pattern
 */
const Controller = {};
const Model = {};
const View = {};

Controller.SpoddyCoiner = {

    /**
     * SpoddyCoiner Google Sheets Add-On
     */
    ADDON_NAME: 'SpoddyCoiner',

    /**
     * Version
     * incrementing will create fresh cache entries (the old ones will naturally expire)
     */
    VERSION: '1.2.0.3',

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
     * @param {string} coin         the coin ticker
     * @param {string} attribute    the attribute to get
     * @param {string} [fiat]       fiat to return the value in (required for some attributes)
     * @return {string|number}      the value of the attribute
     */
    getCoinAttribute: ( coin, attribute, fiat ) => {
        let coinData = {};
        let value;

        switch ( attribute ) {
            case 'price':
            case 'market_cap':
            case 'volume_24h':
                coinData = Model.CMCApi.getCryptoQuoteLatest( coin, fiat );
                if ( !coinData.error_message ) {
                    value = coinData.quote[fiat][attribute];
                    Logger.log( `${coin} ${attribute} : ${value} ${fiat}` );
                }
                break;

            case 'price_percent_change_1h':
            case 'price_percent_change_24h':
            case 'price_percent_change_7d':
            case 'price_percent_change_30d':
                coinData = Model.CMCApi.getCryptoQuoteLatest( coin, fiat );
                if ( !coinData.error_message ) {
                    value = coinData.quote[fiat][attribute.replace( 'price_', '' )] / 100; // make compatible with standard Google Sheets percentage format
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'circulating_supply':
            case 'total_supply':
            case 'max_supply':
                coinData = Model.CMCApi.getCryptoQuoteLatest( coin, fiat );
                if ( !coinData.error_message ) {
                    value = coinData[attribute];
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'fcas_grade':
            case 'fcas_grade_full':
                coinData = Model.CMCApi.getFCASQuoteLatest( coin );
                if ( !coinData.error_message ) {
                    value = ( attribute === 'fcas_grade' ) ? coinData.grade : Model.CMCApi.FCAS_GRADES[coinData.grade];
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'fcas_score':
            case 'fcas_percent_change_24h':
            case 'fcas_point_change_24h':
                coinData = Model.CMCApi.getFCASQuoteLatest( coin );
                if ( !coinData.error_message ) {
                    value = coinData[attribute.replace( 'fcas_', '' )];
                    if ( coinData.score === '' ) {
                        value = ''; // if there is no FCAS score, set all FCAS attributes to empty
                    } else {
                        value = ( attribute === 'fcas_percent_change_24h' ) ? value / 100 : value; // make compatible with standard Google Sheets percentage format
                    }
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'name':
            case 'description':
            case 'logo':
                coinData = Model.CMCApi.getCryptoMetadata( coin );
                if ( !coinData.error_message ) {
                    value = coinData[attribute];
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'date_added':
            case 'year_added':
                coinData = Model.CMCApi.getCryptoMetadata( coin );
                if ( !coinData.error_message ) {
                    value = new Date( coinData.date_added ); // convert to GS native date format
                    value = ( attribute === 'year_added' ) ? value.getFullYear() : value;
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            case 'tags':
            case 'tags_top_5':
                coinData = Model.CMCApi.getCryptoMetadata( coin );
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
                coinData = Model.CMCApi.getCryptoMetadata( coin );
                if ( !coinData.error_message ) {
                    value = coinData.urls[attribute.replace( 'url_', '' )][0]; // these can return many url's, just return the first for now (TODO)
                    Logger.log( `${coin} ${attribute} : ${value}` );
                }
                break;

            default:
                coinData.error_message = `Invalid attribute : ${attribute}`;
                break;
        }

        if ( coinData.error_message ) {
            Logger.log( `Error: ${coinData.error_message}` );
            return ( Model.Props.getDisplayErrorMessages() ) ? coinData.error_message : '';
        }
        return value;
    },

    /**
     * @param {number} amount       the amount to convert
     * @param {string} symbol       the coin/currency ticker to convert from
     * @param {string} convert      the coin/currnecy ticker to convert to
     * @return {number}             the converted value
     */
    convert: ( amount, symbol, convert ) => {
        const conversion_data = Model.CMCApi.priceConversion( amount, symbol, convert );
        if ( conversion_data.error_message ) {
            Logger.log( `Error: ${conversion_data.error_message}` );
            return conversion_data.error_message;
        }
        value = conversion_data[convert].price;
        Logger.log( `${amount} ${symbol} : ${value} ${convert}` );
        return value;
    },

};
