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
    "price": "",
    "market_cap": "",
    "volume_24h": "",
    "percent_change_1h": "",
    "percent_change_24h": "",
    "percent_change_7d": "",
    "percent_change_30d": "",
    "circulating_supply": "",
    "total_supply": "",
    "max_supply": "",
    "fcas_grade": "",
    "fcas_grade_full": "",
    "fcas_percent_change_24h": "",
    "fcas_point_change_24h": "",
    "name": "",
    "description": "",
    "logo": "",
    "date_added": "",
    "tags": "",
    "url_website": "",
    "url_technical_doc": "",
    "url_explorer": "",
    "url_source_code": "",
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
