const Constants = require( '../controller/SpoddyCoiner' );

class Menu {
    /**
     * SpoddyCoiner Addon Menu's
     * @param {SpoddyCoiner} Controller     the main controller class instance
     */
    constructor( Controller ) {
        this.Controller = Controller;
        this.Ui = SpreadsheetApp.getUi();
    }

    /**
     * Basic menu when no authorization has been given
     */
    addNoAuthMenu() {
        this.Ui
            .createAddonMenu()
            .addItem( 'About', 'App.Menu.aboutSpoddyCoiner')
            .addToUi();
    } 

    /**
     * 'About' menu item
     */
    aboutSpoddyCoiner() {
        this.Ui.alert(
            'Hello',
            Constants.ABOUT_TEXT,
            this.Ui.ButtonSet.OK,
        );
    }
}

module.exports = { Menu };
