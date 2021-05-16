View.Menu = {

  /**
   * About SpoddyCoiner
   */
  ABOUT_TEXT: "Handy little functions to get data from the CoinMarketCap API.\n\nCaches the response to help reduce the number of API calls and keep within your rate-limits.\n\nhttps://github.com/SpoddyCoder/SpoddyCoiner",

  DOCS_FUNCTIONS_HEADING: "Custom Functions",
  DOCS_FUNCTIONS_TEXT: "Simply tap the function name into a cell to get more information.\n\n=SPODDYCOINER( coin, attribute, fiat )\n\n=SPODDYCOINER_CONVERT( coin, amount, coin )\nNB: currency ticker can be used instead of coin\n",
  DOCS_ATTRIBUTES_HEADING: "Coin Attributes",
  DOCS_ATTRIBUTES_TEXT: "",


  /**
   * Supported attributes and their descriptions
   */
  SUPPORTED_ATTRIBUTES: {
    "price": "latest price in fiat currency",
    "market_cap": "latest market capitalization in fiat currency",
    "volume_24h": "24h trading volume",
    "percent_change_1h": "1h trading volume change as a percentage",
    "percent_change_24h": "24h trading volume change as a percentage",
    "percent_change_7d": "7d trading volume change as a percentage",
    "percent_change_30d": "30d trading volume change as a percentage",
    "circulating_supply": "number of coins/tokens currently circulating",
    "total_supply": "total number of coins/tokens potentially available",
    "max_supply": "maximum number of coins/tokens that will ever be available (some coins do not have a max supply)",
    "fcas_score": "Fundamental Crypto Asset Score (0-1000), a measure of the fundamental health of crypto projects (only the top 300-400 coins are rated)",
    "fcas_grade": "FCAS Grade (S,A,B,C,E,F)",
    "fcas_grade_full": "Full FCAS Grade description (Superb,Attractive,Basic,Caution,Fragile)",
    "fcas_percent_change_24h": "24h change in score",
    "fcas_point_change_24h": "24h change in score as a percentage",
    "name": "coin name",
    "description": "full description of the project, history and purpose",
    "logo": "logo url",
    "date_added": "date added to CoinMarketCap (effectively the date it started)",
    "year_added": "year added to CoinMarketCap",
    "tags": "comma seperated list of all tags",
    "url_website": "primary website for the project (if more than 1, only 1st returned)",
    "url_technical_doc": "whitepaper tech document for the project (if more than 1, only 1st returned)",
    "url_explorer": "blockchain explorer for the coin/token (if more than 1, only 1st returned)",
    "url_source_code": "github url for the project source code (if available)",
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
    var ui = SpreadsheetApp.getUi();
    ui.createAddonMenu()
      .addSubMenu( ui.createMenu('CoinMarketCap API' )
        .addItem( 'API Key', 'View.Menu.updateCMCApiKey' )
        .addItem( 'Cache Time: ' + Model.Props.getCacheTime(human_readable = true), 'View.Menu.updateAPICacheTime' )
        .addItem( 'Clear Cache', 'View.Menu.clearAPICache' ) )
      .addSubMenu( ui.createMenu('Preferences' )
        .addItem( 'Default Currency: ' + Model.Props.getDefaultCurrency(), 'View.Menu.updateDefaultCurrency' )
        .addItem( 'Show Errors: ' + Model.Props.getDisplayErrorMessages( human_readable = true ), 'View.Menu.showErrors' ) )
      .addSeparator()
      .addSubMenu( ui.createMenu('Docs' )
        .addItem( 'Functions', 'View.Menu.docsFunctions' )
        .addItem( 'Attributes', 'View.Menu.docsAttributes' ) )
      .addItem( 'About', 'View.Menu.aboutSpoddyCoiner' )
      .addToUi();
  },

  /**
   * 'CoinMarketCap API Key' menu item
   */
  updateCMCApiKey: () => {
    var ui = SpreadsheetApp.getUi();
    var api_key = Model.Props.getAPIKey( masked = true) ;
    var prompt_label = ( api_key === "" ) ? "Enter your key" : "Current Key : " + api_key + "\n\nUpdate key";
    var result = ui.prompt( "CoinMarketCap API Key", prompt_label, ui.ButtonSet.OK_CANCEL );
    var button = result.getSelectedButton();
    var api_key = result.getResponseText();
    if ( button === ui.Button.OK ) {
      if( Model.Props.setAPIKey( api_key ) ) {
        ui.alert( "API Key Updated", ui.ButtonSet.OK );
      }
    }
  },

  /**
   * 'API Cache Time' menu item
   */
  updateAPICacheTime: () => {
    var ui = SpreadsheetApp.getUi();
    var result = ui.prompt( "API Cache Time", "New cache time in seconds (max " + Model.Cache.MAX_CACHE_TIME + ")", ui.ButtonSet.OK_CANCEL );
    var button = result.getSelectedButton();
    var new_time = result.getResponseText();
    if ( button === ui.Button.OK ) {
      if ( Model.Props.setCacheTime( new_time ) ) {
        ui.alert( "API Cache Time Updated", "New cache time : " + Model.Props.getCacheTime(human_readable = true), ui.ButtonSet.OK );
      }
    }
  },

  /**
   * 'Clear API Cache' menu item 
   */
  clearAPICache: () => {
    var ui = SpreadsheetApp.getUi();
    var result = ui.alert( Model.Cache.getNumItems() + " API calls currently cached.\n\nDo you want to reset the API cache?", ui.ButtonSet.YES_NO );
    if ( result === ui.Button.YES ) {
      Model.Cache.clear();
      var result = ui.alert( "API cache cleared.\n\nDo you want to re-run all the SPODDYCOINER functions on the active sheet?", ui.ButtonSet.YES_NO );
      if ( result === ui.Button.YES ) {
        View.Sheet.refreshAllFunctions();
      }
    }
  },

  /**
   * 'Default Currency' menu item
   */
  updateDefaultCurrency: () => {
    var ui = SpreadsheetApp.getUi();
    var result = ui.prompt( "Default Currency: " + Model.Props.getDefaultCurrency(), "Enter new 3 letter currency code (ISO 4217)", ui.ButtonSet.OK_CANCEL );
    var button = result.getSelectedButton();
    var new_currency_code = result.getResponseText();
    if ( button === ui.Button.CANCEL || button === ui.Button.CLOSE ) {
      return;
    }
    if ( button == ui.Button.OK ) {
      if ( Model.Props.setDefaultCurrency( new_currency_code ) ) {
        ui.alert( "Default Currency Updated", "New currency code : " + Model.Props.getDefaultCurrency(), ui.ButtonSet.OK );
      } else {
        ui.alert( "Currency code was not valid!", ui.ButtonSet.OK );
      }
    }
  },

  /**
   * 'Show Errors' menu item
   */
  showErrors: () => {
    var ui = SpreadsheetApp.getUi();
    var prompt = ( Model.Props.getDisplayErrorMessages() ) ? "Do you want to turn errors off?" : "Do you want to turn errors on?";
    var result = ui.alert( prompt, ui.ButtonSet.YES_NO );
    if ( result === ui.Button.YES ) {
      Model.Props.toggleErrorMessages();
      View.Sheet.refreshAllFunctions();
    }
  },
  
  /**
   * 'About' menu item
   */
  aboutSpoddyCoiner: () => {
    var ui = SpreadsheetApp.getUi();
    ui.alert( Controller.SpoddyCoiner.ADDON_NAME + ' v' + Controller.SpoddyCoiner.VERSION, View.Menu.ABOUT_TEXT, ui.ButtonSet.OK );
  },

  /**
   * 'Functions' menu item
   */
  docsFunctions: () => {
    var ui = SpreadsheetApp.getUi();
    ui.alert( View.Menu.DOCS_FUNCTIONS_HEADING, View.Menu.DOCS_FUNCTIONS_TEXT, ui.ButtonSet.OK );
  },

  /**
   * 'Supported Attributes' menu item
   */
  docsAttributes: () => {
    var ui = SpreadsheetApp.getUi();
    var supported_attrs ="";
    for ( var attr in View.Menu.SUPPORTED_ATTRIBUTES ) {
      supported_attrs += attr + "\n";
      // var desc = View.Menu.SUPPORTED_ATTRIBUTES[attr]
    }
    var text = View.Menu.DOCS_ATTRIBUTES_TEXT + supported_attrs;
    ui.alert( View.Menu.DOCS_ATTRIBUTES_HEADING, text, ui.ButtonSet.OK );
  },

};
