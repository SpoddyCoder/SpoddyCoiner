# Changelog

All notable changes to the "SpoddyCoiner Google Sheets Addon" project will be documented in this file. 
Breaking changes between versions will be highligted.

## [1.1.0] - 2021-05-16

* Breaking Changes: "percent_change_" attributes are now prefixed with "price_", eg: "price_percent_change_7d"
* Added: tags_top_5 attribute
* Fixed: percent_change attributes now reflect they are about prices
* Fixed: dont treat FCAS grade not found as an error
* Fixed: make all percent change attributes compatible with Google Sheets percent number format
* Fixed: return date_added in native Gooogle Sheets date format
* Fixed: make all FCAS attributes empty if coin not ranked

## [1.0.4] - 2021-05-16

* Breaking Changes: none
* Added: missing supported attributes + descriptions to the docs
* Fixed: 
* Notes: 

## [1.0.3] - 2021-05-16

* Breaking Changes: none
* Added: a changelog
* Fixed: incorrect property key name for display_error_messages
* Notes: 

## [1.0.2] - 2021-05-16

* Breaking Changes: none
* Added: lots
* Fixed: 
* Notes: initial release
