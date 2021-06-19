# Contributing

Contributions and pull requests welcome. Please note the guidelines...

* PR should add a new feature related to the core purpose of the project
    * or addresses a known / open issue
    * or improves reliability / robustness / maintainability
* Follow the source coding style
    * JSdoc blocks, tab indents, comments / TODO's when appropriate, etc.
* Be hygenic - ensure all secondary tasks are done
    * sanitization / validation, robustness checks, update menus, readme, changelog, etc.
* Version num will be incremented when the PR is merged


## Dev Setup

* Install clasp & clone this repo
* Create your own `.clasp.json` file

```
{
    "scriptId":"yourgooglesappscriptid",
    "rootDir": "gas"
}
```

* Run `clasp push` to push the latest `gas/` build to the remote script
    * Should leave you with a `gas/appsscript.json` file on your local
* `npm run build && npm run deploy` to do a dev build to `gas/` & push it to your remote script
* `npm run publish` to do a prod build to `dist/`
* Feel free to ask questions in the Github issue tracker