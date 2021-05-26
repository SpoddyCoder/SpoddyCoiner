class Menu {
    /**
     * SpoddyCoiner Addon Menu view
     *
     * @param {SpoddyCoiner} spoddycoiner   primary controller instance
     */
    constructor( spoddycoiner ) {
        /**
         * main controller class
         */
        this.SpoddyCoiner = spoddycoiner;

        /**
         * SpoddyCoiner var name in the gloabl scope
         * needed for addMenuItem functionName's
         */
        this.app = this.SpoddyCoiner.instanceName;

        /**
         * Menu item labels
         */
        this.MENU_ABOUT_LABEL = 'About';
        this.MENU_CMC_API_KEY_LABEL = 'CoinMarketCap API Key';
        this.MENU_PREFERENCES_LABEL = 'Preferences';
        this.MENU_DEFAULT_CURRENCY_LABEL = 'Default Currency:';
        this.MENU_CACHE_TIME_LABEL = 'Cache Time:';
        this.MENU_CLEAR_CACHE_LABEL = 'Clear Cache';
        this.MENU_SHOW_ERRORS_LABEL = 'Show Errors:';
        this.MENU_DOCS_LABEL = 'Docs';
        this.MENU_FUNCTIONS_LABEL = 'Functions';
        this.MENU_ATTRIBUTES_LABEL = 'Attributes';

        /**
         * Dialogue headings / texts / labels
         */
        this.ABOUT_HEADING = `${this.SpoddyCoiner.ADDON_NAME} v${this.SpoddyCoiner.VERSION}`;
        this.ABOUT_TEXT = 'Handy little functions to get data from the CoinMarketCap API.\n\nCaches the response to help reduce the number of API calls and keep within your rate-limits.\n\nhttps://github.com/SpoddyCoder/SpoddyCoiner';
        this.DOCS_FUNCTIONS_HEADING = 'Custom Functions';
        this.DOCS_FUNCTIONS_TEXT = 'Simply tap the function name into a cell to get more information.\n\n=SPODDYCOINER( coin, attribute, fiat )\n\n=SPODDYCOINER_CONVERT( coin, amount, coin )\nNB: currency ticker can be used instead of coin\n';
        this.DOCS_ATTRIBUTES_HEADING = 'Coin Attributes';
        this.DOCS_ATTRIBUTES_TEXT = '';
        this.ENTER_API_KEY_PROMPT = 'Enter your API key';
        this.CURRENT_KEY_LABEL = 'Current Key :';
        this.API_KEY_UPDATED_LABEL = 'API Key Updated';
        this.API_CACHE_TIME_HEADING = 'API Cache Time';
        this.API_CACHE_KEY_PROMPT = `New cache time in seconds (max ${this.SpoddyCoiner.Model.APICache.MAX_CACHE_TIME})`;
        this.API_CACHE_TIME_UPDATED_LABEL = 'API Cache Time Updated';
        this.NEW_CACHE_TIME_LABEL = 'New cache time :';
        this.NUM_CACHE_ITEMS_LABEL = ' API calls currently cached';
        this.CLEAR_CACHE_PROMPT = 'Do you want to reset the API cache?';
        this.CACHE_CLEAR_UPDATE_FUNCTIONS_PROMPT = 'API cache cleared.\n\nDo you want to re-run all the SPODDYCOINER functions on the active sheet?';
        this.NEW_CURRENCY_CODE_HEADING = 'Enter new 3 letter currency code (ISO 4217)';
        this.DEFAULT_CURRENCY_UPDATED_LABEL = 'Default Currency Updated';
        this.NEW_CURRENCY_LABEL = 'New currency code :';
        this.CURRENCY_CODE_NOT_VALID_LABEL = 'Currency code was not valid!';
        this.TURN_ERRORS_OFF_PROMPT = 'Do you want to turn errors off?';
        this.TURN_ERRORS_ON_PROMPT = 'Do you want to turn errors on?';
        this.GENERIC_ERROR_MESSAGE = 'There was a problem, please try again.';

        /**
         * Supported attributes and their descriptions
         */
        this.SUPPORTED_ATTRIBUTES = {
            price: 'Latest price, in fiat currency',
            price_percent_change_1h: 'Price change over last 1h, as a percentage',
            price_percent_change_24h: 'Price change over last 24h, as a percentage',
            price_percent_change_7d: 'Price change over last 7d, as a percentage',
            price_percent_change_30d: 'Price change over last 30d, as a percentage',
            market_cap: 'Latest market capitalization, in fiat currency',
            volume_24h: '24h trading volume, in fiat currency',
            circulating_supply: 'Number of coins/tokens currently circulating',
            total_supply: 'Total number of coins/tokens potentially available',
            max_supply: 'Maximum number of coins/tokens that will ever be available (some coins do not have a max supply)',
            fcas_score: 'Fundamental Crypto Asset Score (0-1000), a measure of the fundamental health of crypto projects (only the top 300-400 coins are rated)',
            fcas_grade: 'FCAS Grade (S,A,B,C,E,F)',
            fcas_grade_full: 'Full FCAS Grade description (Superb,Attractive,Basic,Caution,Fragile)',
            fcas_percent_change_24h: '24h change in score',
            fcas_point_change_24h: '24h change in score, as a percentage',
            name: 'The cryptocurrency name',
            description: 'Full description of the project.',
            logo: 'The coin logo url (Tip: wrap this in the Google Sheets IMAGE function to show it in the cell)',
            date_added: 'Date added to CoinMarketCap (effectively the date it started)',
            year_added: 'Year added to CoinMarketCap',
            tags: 'A comma seperated list of all tags',
            tags_top_5: 'A comma seperated list of the first 5 tags',
            url_website: 'Primary website for the project (if more than 1, only 1st returned)',
            url_technical_doc: 'Whitepaper tech document for the project (if more than 1, only 1st returned)',
            url_explorer: 'Blockchain explorer for the coin/token (if more than 1, only 1st returned)',
            url_source_code: 'Project source code (github URL, if available)',
        };
    }

    /**
     * Basic menu when no authorization has been given
     */
    addNoAuthMenu() {
        const ui = SpreadsheetApp.getUi();
        ui.createAddonMenu()
            .addItem( this.MENU_ABOUT_LABEL, `${this.app}.View.Menu.about` )
            .addToUi();
    }

    /**
     * Full SpoddyCoiner menu
     */
    addMenu() {
        const ui = SpreadsheetApp.getUi();
        ui.createAddonMenu()
            .addItem( this.MENU_CMC_API_KEY_LABEL, `${this.app}.View.Menu.updateCMCApiKey` )
            .addSubMenu( ui.createMenu( this.MENU_PREFERENCES_LABEL )
                .addItem( `${this.MENU_DEFAULT_CURRENCY_LABEL} ${this.SpoddyCoiner.Model.GASProps.getDefaultCurrency()}`, `${this.app}.View.Menu.updateDefaultCurrency` )
                .addItem( `${this.MENU_CACHE_TIME_LABEL} ${this.SpoddyCoiner.Model.GASProps.getCacheTime( true )}`, `${this.app}.View.Menu.updateAPICacheTime` )
                .addItem( this.MENU_CLEAR_CACHE_LABEL, `${this.app}.View.Menu.clearAPICache` )
                .addItem( `${this.MENU_SHOW_ERRORS_LABEL}  ${this.SpoddyCoiner.Model.GASProps.getDisplayErrorMessages( true )}`, `${this.app}.View.Menu.showErrors` ) )
            .addSeparator()
            .addSubMenu( ui.createMenu( this.MENU_DOCS_LABEL )
                .addItem( this.MENU_FUNCTIONS_LABEL, `${this.app}.View.Menu.docsFunctions` )
                .addItem( this.MENU_ATTRIBUTES_LABEL, `${this.app}.View.Menu.docsAttributes` ) )
            .addItem( this.MENU_ABOUT_LABEL, `${this.app}.View.Menu.about` )
            .addToUi();
    }

    /**
     * 'CoinMarketCap API Key' menu item
     */
    updateCMCApiKey() {
        const ui = SpreadsheetApp.getUi();
        let apiKey = this.SpoddyCoiner.Model.GASProps.getAPIKey( true ); // masked
        const promptLabel = ( apiKey === '' ) ? this.ENTER_API_KEY_PROMPT : `${this.CURRENT_KEY_LABEL} ${apiKey}\n\n${this.ENTER_API_KEY_PROMPT}`;
        const result = ui.prompt(
            this.MENU_CMC_API_KEY_LABEL,
            promptLabel,
            ui.ButtonSet.OK_CANCEL,
        );
        const button = result.getSelectedButton();
        apiKey = result.getResponseText();
        if ( button === ui.Button.OK ) {
            if ( !this.SpoddyCoiner.Model.GASProps.setAPIKey( apiKey ) ) {
                ui.alert( this.GENERIC_ERROR_MESSAGE, ui.ButtonSet.OK );
                return;
            }
            ui.alert( this.API_KEY_UPDATED_LABEL, ui.ButtonSet.OK );
        }
    }

    /**
     * 'API Cache Time' menu item
     */
    updateAPICacheTime() {
        const ui = SpreadsheetApp.getUi();
        const result = ui.prompt(
            this.API_CACHE_TIME_HEADING,
            this.API_CACHE_KEY_PROMPT,
            ui.ButtonSet.OK_CANCEL,
        );
        const button = result.getSelectedButton();
        const newTime = result.getResponseText();
        if ( button === ui.Button.OK ) {
            if ( !this.SpoddyCoiner.Model.GASProps.setCacheTime( newTime ) ) {
                ui.alert( this.GENERIC_ERROR_MESSAGE, ui.ButtonSet.OK );
                return;
            }
            ui.alert(
                this.API_CACHE_TIME_UPDATED_LABEL,
                `${this.NEW_CACHE_TIME_LABEL} ${this.SpoddyCoiner.Model.GASProps.getCacheTime( true )}`,
                ui.ButtonSet.OK,
            );
        }
    }

    /**
     * 'Clear API Cache' menu item
     */
    clearAPICache() {
        const ui = SpreadsheetApp.getUi();
        let result = ui.alert(
            this.MENU_CLEAR_CACHE_LABEL,
            this.CLEAR_CACHE_PROMPT,
            ui.ButtonSet.YES_NO,
        );
        if ( result === ui.Button.YES ) {
            if ( !this.SpoddyCoiner.Model.APICache.clear() ) {
                ui.alert( this.GENERIC_ERROR_MESSAGE, ui.ButtonSet.OK );
                return;
            }
            result = ui.alert(
                this.CACHE_CLEAR_UPDATE_FUNCTIONS_PROMPT,
                ui.ButtonSet.YES_NO,
            );
            if ( result === ui.Button.YES ) {
                this.SpoddyCoiner.handleRefreshAllFunctionsConfirm();
            }
        }
    }

    /**
     * 'Default Currency' menu item
     */
    updateDefaultCurrency() {
        const ui = SpreadsheetApp.getUi();
        const result = ui.prompt(
            `${this.MENU_DEFAULT_CURRENCY_LABEL} ${this.SpoddyCoiner.Model.GASProps.getDefaultCurrency()}`,
            this.NEW_CURRENCY_CODE_HEADING,
            ui.ButtonSet.OK_CANCEL,
        );
        const button = result.getSelectedButton();
        const newCurrencyCode = result.getResponseText();
        if ( button === ui.Button.CANCEL || button === ui.Button.CLOSE ) {
            return;
        }
        if ( button === ui.Button.OK ) {
            if ( !this.SpoddyCoiner.Model.GASProps.setDefaultCurrency( newCurrencyCode ) ) {
                ui.alert( this.CURRENCY_CODE_NOT_VALID_LABEL, ui.ButtonSet.OK );
                return;
            }
            ui.alert(
                this.DEFAULT_CURRENCY_UPDATED_LABEL,
                `${this.NEW_CURRENCY_LABEL} ${this.SpoddyCoiner.Model.GASProps.getDefaultCurrency()}`,
                ui.ButtonSet.OK,
            );
        }
    }

    /**
     * 'Show Errors' menu item
     */
    showErrors() {
        const ui = SpreadsheetApp.getUi();
        let prompt = this.TURN_ERRORS_ON_PROMPT;
        if ( this.SpoddyCoiner.Model.GASProps.getDisplayErrorMessages() ) {
            prompt = this.TURN_ERRORS_OFF_PROMPT;
        }
        const result = ui.alert(
            `${this.MENU_SHOW_ERRORS_LABEL}  ${this.SpoddyCoiner.Model.GASProps.getDisplayErrorMessages( true )}`,
            prompt,
            ui.ButtonSet.YES_NO,
        );
        if ( result === ui.Button.YES ) {
            this.SpoddyCoiner.Model.GASProps.toggleErrorMessages();
        }
    }

    /**
     * 'Functions' menu item
     */
    docsFunctions() {
        const ui = SpreadsheetApp.getUi();
        ui.alert(
            this.DOCS_FUNCTIONS_HEADING,
            this.DOCS_FUNCTIONS_TEXT,
            ui.ButtonSet.OK,
        );
    }

    /**
     * 'Supported Attributes' menu item
     */
    docsAttributes() {
        const ui = SpreadsheetApp.getUi();
        let supportedAttrs = '';
        Object.entries( this.SUPPORTED_ATTRIBUTES ).forEach( ( [k, v] ) => {
            supportedAttrs += `"${k}"\n ${v}\n\n`;
        } );
        const text = `${this.DOCS_ATTRIBUTES_TEXT}${supportedAttrs}`;
        ui.alert( this.DOCS_ATTRIBUTES_HEADING, text, ui.ButtonSet.OK );
    }

    /**
     * 'About' menu item
     */
    about() {
        const ui = SpreadsheetApp.getUi();
        ui.alert(
            this.ABOUT_HEADING,
            this.ABOUT_TEXT,
            ui.ButtonSet.OK,
        );
    }
}

module.exports = { Menu };
