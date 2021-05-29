class Sheet {
    /**
     * Active Sheet view
     *
     * @param {SpoddyCoiner} spoddycoiner   primary controller instance
     */
    constructor( spoddycoiner ) {
        /**
         * main controller class
         */
        this.SpoddyCoiner = spoddycoiner;

        /**
         * SpoddyCoiner spreeadsheet functions
         * these are defined in Custom_Functions.js
         */
        this.FUNCTIONS = [
            'SPODDYCOINER',
            'SPODDYCOINER_CONVERT',
        ];
        this.FUNCTIONS_SEARCH_TERM = 'SPODDYCOINER';

        /**
         * Active sheet
         */
        this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    }

    /**
     * Refresh all SPODDYCOINER functions on the active spreadsheet
     * These refresh functions use a hackly little workaround:
     * write a temp value then write the actual value - seems to be the only approach...
     * https://tanaikech.github.io/2019/10/28/automatic-recalculation-of-custom-function-on-spreadsheet-part-2/
     */
    refreshAllFunctions() {
        const temp = Utilities.getUuid();
        this.FUNCTIONS.forEach( ( functionName ) => {
            this.spreadsheet.createTextFinder( `=${functionName}` )
                .matchFormulaText( true )
                .replaceAllWith( temp );
            this.spreadsheet.createTextFinder( temp )
                .matchFormulaText( true )
                .replaceAllWith( `=${functionName}` );
        } );
    }

    /**
     * Refresh SPODDYCOINER functionsin the active range
     */
    refreshSelectedCells() {
        const cells = this.spreadsheet.getActiveRange();
        const values = cells.getValues();
        const formulas = cells.getFormulas();

        const temp = Utilities.getUuid();
        const replacementValues = [];
        formulas.forEach( ( formulasRow, formulasRowIndex ) => {
            const newRow = [];
            formulasRow.forEach( ( formula, formulasColumnIndex ) => {
                const value = values[formulasRowIndex][formulasColumnIndex];
                let finalValue = '';
                if ( formula.includes( this.FUNCTIONS_SEARCH_TERM ) ) {
                    finalValue = `${temp}${formula}`;
                } else {
                    finalValue = ( formula !== '' ) ? formula : value;
                }
                newRow.push( finalValue );
            } );
            replacementValues.push( newRow );
        } );
        cells.setValues( replacementValues );
        SpreadsheetApp.flush();

        replacementValues.forEach( ( row, rowIndex ) => {
            row.forEach( ( column, columnIndex ) => {
                let curValue = replacementValues[rowIndex][columnIndex];
                if ( typeof curValue === 'string' ) {
                    curValue = curValue.replace( temp, '' );
                    replacementValues[rowIndex][columnIndex] = curValue;
                }
            } );
        } );
        cells.setValues( replacementValues );
        SpreadsheetApp.flush();
    }

    /**
     * Convert cells containing any "=SPODDYCOINER" functions to their static value
     *
     * NB: this is just an includes() check
     * so will match functions that contain the SPODDYCOINER functions
     * this may or may not be desirable TODO: add option?
     */
    convertCellsToValues() {
        const cells = this.spreadsheet.getActiveRange();
        const values = cells.getValues();
        const formulas = cells.getFormulas();

        const replacementValues = [];
        formulas.forEach( ( formulasRow, formulasRowIndex ) => {
            const newRow = [];
            formulasRow.forEach( ( formula, formulasColumnIndex ) => {
                const value = values[formulasRowIndex][formulasColumnIndex];
                const finalValue = ( formula.includes( this.FUNCTIONS_SEARCH_TERM ) || formula === '' ) ? value : formula;
                newRow.push( finalValue );
            } );
            replacementValues.push( newRow );
        } );
        cells.setValues( replacementValues );
    }

    /**
     * Currently selected cell range in human readable format
     *
     * @returns {string}    currently selected cells in A1 notation
     */
    getActiveCells() {
        return this.spreadsheet.getActiveRange().getA1Notation();
    }
}

module.exports = { Sheet };
