View.Sheet = {

  /**
   * SpoddyCoiner spreeadsheet functions
   * these are defined in Addon_Functions.gs
   */
  FUNCTIONS: [
    'SPODDYCOINER', 
    'SPODDYCOINER_CONVERT', 
  ],


  /**
   * Refresh all SpoddyCoiner functions on the active sheet
   * 
   * https://tanaikech.github.io/2019/10/28/automatic-recalculation-of-custom-function-on-spreadsheet-part-2/
   */
  refreshAllFunctions: () => {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var temp = Utilities.getUuid();
    View.Sheet.FUNCTIONS.forEach(function(e) {
      ss.createTextFinder("=" + e)
        .matchFormulaText(true)
        .replaceAllWith(temp);
      ss.createTextFinder(temp)
        .matchFormulaText(true)
        .replaceAllWith("=" + e);
    });
  },

};
