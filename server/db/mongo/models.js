'use strict';

// Corresponding mongoDB connection
var mongoose = require('mongoose');

// Specific data models
var modelApp = require('./model');

//
// Data Models Definition
//

module.exports = function(conn) {

	//
	// Pass correspondig mongoDB connection for each data model
	// to return the proper definition
	//
	return {
		App: modelApp(conn.Default)
	};
};

