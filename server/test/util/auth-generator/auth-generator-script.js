"use strict";

var config = require("config").serverAppContext;
var dataSourceHandler = require('janux-persist').DataSourceHandler;
var authGenerator = require("./auth-generator");
var lokiJsDBPath = config.db.lokiJsDBPath;
var mongoConnUrl = config.db.mongoConnUrl;
var dbEngine = config.db.dbEngine;
var path = dbEngine === dataSourceHandler.LOKIJS ? lokiJsDBPath : mongoConnUrl;

console.log("Inserting authorization contexts and roles at " + dbEngine + " in the path/url " + path);
console.log("Authorization scheme is being generated");

authGenerator.AuthGenerator.generateAuthDataInTheDatabase(dbEngine, path)
.then(function () {
    console.log("Authorization contexts and roles generated successfully");
    process.exit(0);
})
.catch(function (error) {
    console.log("There was an error inserting the authorization scheme.\n" + JSON.stringify(error));
    process.exit(-1);
});