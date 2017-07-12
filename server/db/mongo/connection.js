'use strict';

var	config   = require('config'),
    mongoose = require('mongoose'),
    mongooseModels 	 = require('./models');

// var MONGO_STRING = config.serverAppContext.mongoString;

// var conn = {
// 	Default: mongoose.createConnection(MONGO_STRING)
// };

// module.exports = mongooseModels(conn);