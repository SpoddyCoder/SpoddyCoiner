/**
 * Spreadsheet display + interactions
 */
class Sheet {
    constructor() {
        /**
         * SpoddyCoiner spreeadsheet functions
         * these are defined in Addon_Functions.gs
         */
        this.FUNCTIONS = [
            'SPODDYCOINER',
            'SPODDYCOINER_CONVERT',
        ];
    }

    /**
     * Refresh all SpoddyCoiner functions on the active sheet
     *
     * https://tanaikech.github.io/2019/10/28/automatic-recalculation-of-custom-function-on-spreadsheet-part-2/
     */
    refreshAllFunctions() {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const temp = Utilities.getUuid();
        this.FUNCTIONS.forEach( ( e ) => {
            ss.createTextFinder( `=${e}` )
                .matchFormulaText( true )
                .replaceAllWith( temp );
            ss.createTextFinder( temp )
                .matchFormulaText( true )
                .replaceAllWith( `=${e}` );
        } );
    }
}

module.exports = { Sheet };
