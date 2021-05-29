# Changelog

All notable changes to the "SpoddyCoiner Google Sheets Addon" project will be documented in this file. 
Breaking changes between versions will be highligted.

## [1.2.2] - In progress

* Improved:
    * Added new tool - refresh selected cells
* Fixed:
    * Cache time not set to default on first install
    * Refresh functions now include cells that have wrapped spoddycoiner functions 

## [1.2.1] - 2021-05-27

* Improved:
    * Menu layout, added tools menu
    * Added some new tools...
        * convert cells to values :)
        * refresh all functions
    * Cache handling
    * Removed user Session usage
        * was used to lookup users current locale & set their default currency
        * default currency on first install therefore becomes 'USD'
        * reduces required permissions, increases user privacy
    * Removed RestCountries API currency code lookup (now covered by CMC API)
    * Modernised codebase for improved developer workflow
        * NPM + Webpack + eslint (airbnb)
        * clasp deployment
        * rebuild using ES6 classes
* Fixed:
    * Bug in RestCountries, breaking install
    * Props bug stopping API key error from showing

## [1.1.0] - 2021-05-16

* Breaking Change:
    * "percent_change_" attributes are now prefixed with "price_", eg: "price_percent_change_7d"
* Added:
    * tags_top_5 attribute
* Fixed: 
    * Percent_change attributes now reflect they are about prices
    * Dont treat FCAS grade not found as an error
    * Make all percent change attributes compatible with Google Sheets percent number format
    * Return date_added in native Gooogle Sheets date format
    * Make all FCAS attributes empty if coin not ranked

## [1.0.4] - 2021-05-16

* Added: missing supported attributes + descriptions to the docs

## [1.0.3] - 2021-05-16

* Added: a changelog
* Fixed: incorrect property key name for display_error_messages

## [1.0.2] - 2021-05-16

* Added: lots
* Notes: initial release
