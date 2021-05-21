View.Menu = {

    /**
     * About SpoddyCoiner
     */
    ABOUT_TEXT: 'Handy little functions to get data from the CoinMarketCap API.\n\nCaches the response to help reduce the number of API calls and keep within your rate-limits.\n\nhttps://github.com/SpoddyCoder/SpoddyCoiner',

    DOCS_FUNCTIONS_HEADING: 'Custom Functions',
    DOCS_FUNCTIONS_TEXT: 'Simply tap the function name into a cell to get more information.\n\n=SPODDYCOINER( coin, attribute, fiat )\n\n=SPODDYCOINER_CONVERT( coin, amount, coin )\nNB: currency ticker can be used instead of coin\n',
    DOCS_ATTRIBUTES_HEADING: 'Coin Attributes',
    DOCS_ATTRIBUTES_TEXT: '',

    /**
     * Supported attributes and their descriptions
     */
    SUPPORTED_ATTRIBUTES: {
        price: 'latest price in fiat currency',
        price_percent_change_1h: 'price change over last 1h',
        price_percent_change_24h: 'price change over last 24h',
        price_percent_change_7d: 'price change over last 7d',
        price_percent_change_30d: 'price change over last 30d',
        market_cap: 'latest market capitalization in fiat currency',
        volume_24h: '24h trading volume',
        circulating_supply: 'number of coins/tokens currently circulating',
        total_supply: 'total number of coins/tokens potentially available',
        max_supply: 'maximum number of coins/tokens that will ever be available (some coins do not have a max supply)',
        fcas_score: 'Fundamental Crypto Asset Score (0-1000), a measure of the fundamental health of crypto projects (only the top 300-400 coins are rated)',
        fcas_grade: 'FCAS Grade (S,A,B,C,E,F)',
        fcas_grade_full: 'Full FCAS Grade description (Superb,Attractive,Basic,Caution,Fragile)',
        fcas_percent_change_24h: '24h change in score',
        fcas_point_change_24h: '24h change in score as a percentage',
        name: 'coin name',
        description: 'full description of the project, history and purpose',
        logo: 'logo url (Tip: wrap this in the Google Sheets IMAGE function to show it in the cell)',
        date_added: 'date added to CoinMarketCap (effectively the date it started)',
        year_added: 'year added to CoinMarketCap',
        tags: 'comma seperated list of all tags',
        tags_top_5: 'comma seperated list of the first 5 tags',
        url_website: 'primary website for the project (if more than 1, only 1st returned)',
        url_technical_doc: 'whitepaper tech document for the project (if more than 1, only 1st returned)',
        url_explorer: 'blockchain explorer for the coin/token (if more than 1, only 1st returned)',
        url_source_code: 'github url for the project source code (if available)',
    },

    /**
     * Basic menu when no authorization has been given
     */
    addNoAuthMenu: () => {
        SpreadsheetApp.getUi()
            .createAddonMenu()
            .addItem( 'About', 'View.Menu.aboutSpoddyCoiner' )
            .addToUi();
    },

    /**
     * Full SpoddyCoiner menu
     */
    addMenu: () => {
        const ui = SpreadsheetApp.getUi();
        ui.createAddonMenu()
            .addSubMenu( ui.createMenu( 'CoinMarketCap API' )
                .addItem( 'API Key', 'View.Menu.updateCMCApiKey' )
                .addItem( `Cache Time: ${Model.Props.getCacheTime( human_readable = true )}`, 'View.Menu.updateAPICacheTime' )
                .addItem( 'Clear Cache', 'View.Menu.clearAPICache' ) )
            .addSubMenu( ui.createMenu( 'Preferences' )
                .addItem( `Default Currency: ${Model.Props.getDefaultCurrency()}`, 'View.Menu.updateDefaultCurrency' )
                .addItem( `Show Errors: ${Model.Props.getDisplayErrorMessages( human_readable = true )}`, 'View.Menu.showErrors' ) )
            .addSeparator()
            .addSubMenu( ui.createMenu( 'Docs' )
                .addItem( 'Functions', 'View.Menu.docsFunctions' )
                .addItem( 'Attributes', 'View.Menu.docsAttributes' ) )
            .addItem( 'About', 'View.Menu.aboutSpoddyCoiner' )
            .addToUi();
    },

    /**
     * 'CoinMarketCap API Key' menu item
     */
    updateCMCApiKey: () => {
        const ui = SpreadsheetApp.getUi();
        let apiKey = Model.Props.getAPIKey( true );
        const promptLabel = ( apiKey === '' ) ? 'Enter your key' : `Current Key : ${apiKey}\n\nUpdate key`;
        const result = ui.prompt( 'CoinMarketCap API Key', promptLabel, ui.ButtonSet.OK_CANCEL );
        const button = result.getSelectedButton();
        apiKey = result.getResponseText();
        if ( button === ui.Button.OK ) {
            if ( Model.Props.setAPIKey( apiKey ) ) {
                ui.alert( 'API Key Updated', ui.ButtonSet.OK );
            }
        }
    },

    /**
     * 'API Cache Time' menu item
     */
    updateAPICacheTime: () => {
        const ui = SpreadsheetApp.getUi();
        const result = ui.prompt( 'API Cache Time', `New cache time in seconds (max ${Model.Cache.MAX_CACHE_TIME})`, ui.ButtonSet.OK_CANCEL );
        const button = result.getSelectedButton();
        const newTime = result.getResponseText();
        if ( button === ui.Button.OK ) {
            if ( Model.Props.setCacheTime( newTime ) ) {
                ui.alert( 'API Cache Time Updated', `New cache time : ${Model.Props.getCacheTime( true )}`, ui.ButtonSet.OK );
            }
        }
    },

    /**
     * 'Clear API Cache' menu item
     */
    clearAPICache: () => {
        const ui = SpreadsheetApp.getUi();
        const result = ui.alert( `${Model.Cache.getNumItems()} API calls currently cached.\n\nDo you want to reset the API cache?`, ui.ButtonSet.YES_NO );
        if ( result === ui.Button.YES ) {
            Model.Cache.clear();
            const result2 = ui.alert( 'API cache cleared.\n\nDo you want to re-run all the SPODDYCOINER functions on the active sheet?', ui.ButtonSet.YES_NO );
            if ( result2 === ui.Button.YES ) {
                View.Sheet.refreshAllFunctions();
            }
        }
    },

    /**
     * 'Default Currency' menu item
     */
    updateDefaultCurrency: () => {
        const ui = SpreadsheetApp.getUi();
        const result = ui.prompt( `Default Currency: ${Model.Props.getDefaultCurrency()}`, 'Enter new 3 letter currency code (ISO 4217)', ui.ButtonSet.OK_CANCEL );
        const button = result.getSelectedButton();
        const newCurrencyCode = result.getResponseText();
        if ( button === ui.Button.CANCEL || button === ui.Button.CLOSE ) {
            return;
        }
        if ( button === ui.Button.OK ) {
            if ( Model.Props.setDefaultCurrency( newCurrencyCode ) ) {
                ui.alert( 'Default Currency Updated', `New currency code : ${Model.Props.getDefaultCurrency()}`, ui.ButtonSet.OK );
            } else {
                ui.alert( 'Currency code was not valid!', ui.ButtonSet.OK );
            }
        }
    },

    /**
     * 'Show Errors' menu item
     */
    showErrors: () => {
        const ui = SpreadsheetApp.getUi();
        const prompt = ( Model.Props.getDisplayErrorMessages() ) ? 'Do you want to turn errors off?' : 'Do you want to turn errors on?';
        const result = ui.alert( prompt, ui.ButtonSet.YES_NO );
        if ( result === ui.Button.YES ) {
            Model.Props.toggleErrorMessages();
            View.Sheet.refreshAllFunctions();
        }
    },

    /**
     * 'About' menu item
     */
    aboutSpoddyCoiner: () => {
        const ui = SpreadsheetApp.getUi();
        ui.alert(
            `${Controller.SpoddyCoiner.ADDON_NAME} v${Controller.SpoddyCoiner.VERSION}`,
            View.Menu.ABOUT_TEXT,
            ui.ButtonSet.OK, 
        );
    },

    /**
     * 'Functions' menu item
     */
    docsFunctions: () => {
        const ui = SpreadsheetApp.getUi();
        ui.alert(
            View.Menu.DOCS_FUNCTIONS_HEADING,
            View.Menu.DOCS_FUNCTIONS_TEXT,
            ui.ButtonSet.OK,
        );
    },

    /**
   * 'Supported Attributes' menu item
   */
    docsAttributes: () => {
        const ui = SpreadsheetApp.getUi();
        let supportedAttrs = '';

        const attributesArray = Object.values( View.Menu.SUPPORTED_ATTRIBUTES );
        attributesArray.forEach( ( desc, attr ) => {
            supportedAttrs += `${attr}\n`;
        } );
        const text = View.Menu.DOCS_ATTRIBUTES_TEXT + supportedAttrs;
        ui.alert( View.Menu.DOCS_ATTRIBUTES_HEADING, text, ui.ButtonSet.OK );
    },

};
