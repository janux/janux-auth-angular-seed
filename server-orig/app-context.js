var 
	config   = require('config'),
	log4js   = require('log4js')
;

/**
 * This file bootstraps node-config and makes it possible to make programmatic changes to the
 * configuration after the config file has been loaded; 
 * in particular, we use it to run the log4js configuration commands below
 */

// read the log4js config from node-config
log4js.configure(config.log4js.config);

// It is not possible to set the global log level via the log4js config, so we are forced to do this
// programatically; the downside is that it is not possible at this time to change this setting
// without restarting the server
log4js.setGlobalLogLevel(config.log4js.globalLogLevel);

// Watch for any changes to the customer configuration
// test how this works this at some point
// config.watch(config, null, function(object, propertyName, priorValue, newValue) {
//   console.log("Customer configuration " + propertyName + " changed from " + priorValue + " to " +
//   newValue);
// });

var log = log4js.getLogger("AppContext");

log.trace("Application Context is %j: ", config);

module.exports = config;

log.info("Application Context created");
