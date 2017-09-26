"use strict";

var config = require("config").serverAppContext;
var dataSourceHandler = require('janux-persist').DataSourceHandler;
var userGenerator = require("./user-generator");
var lokiJsDBPath = config.db.lokiJsDBPath;
var mongoConnUrl = config.db.mongoConnUrl;
var dbEngine = config.db.dbEngine;
var path = dbEngine === dataSourceHandler.LOKIJS ? lokiJsDBPath : mongoConnUrl;

console.log('NODE_CONFIG: ' + config.util.getEnv('NODE_CONFIG'));

console.log("Inserting users at " + dbEngine + " in the path/url " + path);
console.log("Users are being generated");

userGenerator.UserGenerator.generateUserDateInTheDatabase(dbEngine, path)
    .then(function () {
    console.log("Users generated successfully");
    process.exit(0);
})
    .catch(function (error) {
    console.log("There was an error inserting the users.\n" + JSON.stringify(error));
    process.exit(-1);
});