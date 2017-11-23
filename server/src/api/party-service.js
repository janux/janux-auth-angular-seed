/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 11/23/17.
 */
var log4js  = require('log4js'),
	_       = require('lodash'),
	log     = log4js.getLogger('PartyService'),
	fixDate = require('../util/fix-date ');


// variable to hold the singleton instance, if used in that manner
var partyServiceServiceInstance = undefined;
var partyServiceImpl = undefined;

var createInstance = function (serviceReference) {
	partyServiceImpl = serviceReference;

	function PartyService() {

	}

	function fixDates(party) {
		party.dateCreated = fixDate(party.dateCreated);
		party.lastUpdate = fixDate(party.lastUpdate);
		return party;
	}

	PartyService.prototype = Object.create(null);
	PartyService.prototype.constructor = PartyService;

	PartyService.prototype.findByName = function (name, callback) {
		return partyServiceImpl.findByName(name).asCallback(callback);
	};

	PartyService.prototype.findByEmail = function (email, callback) {
		return partyServiceImpl.findByEmail(email).asCallback(callback);
	};

	PartyService.prototype.findByPhone = function (phone, callback) {
		return partyServiceImpl.findByPhone(phone).asCallback(callback);
	};

	PartyService.prototype.findPeople = function (callback) {
		return partyServiceImpl.findPeople().asCallback(callback);
	};

	PartyService.prototype.findOrganizations = function (callback) {
		return partyServiceImpl.findOrganizations().asCallback(callback);
	};

	PartyService.prototype.findOne = function (id, callback) {
		return partyServiceImpl.findOne(id).asCallback(callback);
	};

	PartyService.prototype.findByIds = function (ids, callback) {
		return partyServiceImpl.findByIds(ids).asCallback(callback);
	};

	PartyService.prototype.insert = function (party, callback) {
		//TODO, handle dates.
		var object = fixDates(party);
		return partyServiceImpl.insert(object).asCallback(callback);
	};

	PartyService.prototype.update = function (party, callback) {
		//TODO, handle dates.
		var object = fixDates(party);
		return partyServiceImpl.update(object).asCallback(callback);
	};

	PartyService.prototype.remove = function (id, callback) {
		return partyServiceImpl.remove(id);
	};

	PartyService.prototype.removeByIds = function (ids, callback) {
		return partyServiceImpl.removeByIds(ids);
	};

};


module.exports.create = function (PartyServiceImpl) {
	// if the instance does not exist, create it
	if (!_.isObject(partyServiceServiceInstance)) {
		// userServiceInstance = new UserService(aDAO);
		partyServiceServiceInstance = createInstance(PartyServiceImpl);
	}
	return partyServiceServiceInstance;
};