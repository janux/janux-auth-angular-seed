'use strict';

var	_	 = require('lodash'),
	Promise  = require('bluebird');

var mongooseApp = require('../../db/mongo/connection').App;

//  variable to hold the singleton instance, if used in that manner
var userDAOInstance = undefined;

function UserDAO(mongoose) {

	this._mongoose = (mongoose)?mongoose:this.mongoose;
	
	// findByUsernameMatch = function (username, callback) {
	// findByName = function (name, callback) {
	// findByEmail = function (email, callback) {
	// findByPhone = function (number, callback) {
	// save = function (aUserObj) {
	// saveOrUpdate = function (aUserObj, callback) {
	// deleteUser = function (userObj, callback) {
	// clearData = function () {
}

// Default connection
UserDAO.prototype.mongoose = mongooseApp;

UserDAO.prototype.findById = function(userId, callback) {
	return new Promise(function(resolve,reject) {
		var users = this._mongoose.model('users');

		users.findOne({oid:userId}).lean().exec(function(err, user){
			if (err) throw err;
			resolve(user);
		});
	}).nodeify(callback);
};

UserDAO.prototype.findByUsername = function(username, callback) {
	return new Promise(function(resolve,reject) {

		var users = this._mongoose.model('users');

		users.findOne({username:username}).lean().exec(function(err, user){
			if (err) throw err;
			resolve(user);
		});
	}).nodeify(callback);
};

// Returns a new instance
exports.createInstance = function(mongoose) {
	return new UserDAO(mongoose);
};

// Returns the current stored instance (if it exists) or creates a new instance and stores
exports.singleton = function(mongoose) {
	// if the singleton has not yet been instantiated, do so
	if ( !_.isObject(userDAOInstance) ) {
		userDAOInstance = new UserDAO(mongoose);
	}

	return userDAOInstance;
};

// Returns the object that has not yet been instantiated
exports.object = function(mongoose) {
	// Sets the object connection
	UserDAO.prototype.mongoose = (mongoose) ? mongoose : UserDAO.prototype.mongoose;
	return UserDAO;
};