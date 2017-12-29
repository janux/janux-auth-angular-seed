/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 11/23/17.
 */
var log4js           = require('log4js'),
	_                = require('lodash'),
	Promise          = require('bluebird'),
	PartyServiceImplClass = require('janux-persist').PartyServiceImpl,
	log              = log4js.getLogger('PartyService'),
	fixDate          = require('../util/fix-date').fixDate;


// variable to hold the singleton instance, if used in that manner
var partyServiceServiceInstance = undefined;
var partyServiceImpl = undefined;

var createInstance = function (serviceReference) {
	partyServiceImpl = serviceReference;

	function PartyService() {

	}

	PartyService.prototype = Object.create(null);
	PartyService.prototype.constructor = PartyService;

	function fixDates(party) {
		party.dateCreated = fixDate(party.dateCreated);
		party.lastUpdate = fixDate(party.lastUpdate);
		return party;
	}

	function toJSONMany(records) {
		return _.map(records, function (o) {
			return PartyServiceImplClass.toJSON(o);
		})
	}

	/**
	 * Find all contacts by name.
	 * @param name
	 * @param callback
	 * @return {*}
	 */
	PartyService.prototype.findByName = function (name, callback) {
		log.debug("Call to findByName with name: %j", name);
		return partyServiceImpl.findByName(name)
			.then(function (result) {
				return Promise.resolve(toJSONMany(result)).asCallback(callback);
			});
	};

	/**
	 * Find all by email.
	 * @param email
	 * @param callback
	 */
	PartyService.prototype.findByEmail = function (email, callback) {
		log.debug("Call to findByEmail with email: %j", email);
		return partyServiceImpl.findByEmail(email)
			.then(function (result) {
				return Promise.resolve(toJSONMany(result)).asCallback(callback);
			});
	};

	/**
	 * Find all people.
	 * @param callback
	 */
	PartyService.prototype.findPeople = function (callback) {
		log.debug("Call to findPeople");
		return partyServiceImpl.findPeople()
			.then(function (result) {
				return Promise.resolve(toJSONMany(result)).asCallback(callback);
			});
	};

	/**
	 * Find all organizations.
	 * @param callback
	 */
	PartyService.prototype.findOrganizations = function (callback) {
		log.debug("Call to findOrganizations");
		return partyServiceImpl.findOrganizations()
			.then(function (result) {
				return Promise.resolve(toJSONMany(result)).asCallback(callback);
			});
	};

	/**
	 * Find one by id
	 * @param id
	 * @param callback
	 */
	PartyService.prototype.findOne = function (id, callback) {
		log.debug("Call to findOne with id: %j", id);
		return partyServiceImpl.findOne(id)
			.then(function (result) {
				return Promise.resolve(PartyServiceImplClass.toJSON(result)).asCallback(callback);
			});
	};

	/**
	 * Find all by ids.
	 * @param ids
	 * @param callback
	 */
	PartyService.prototype.findByIds = function (ids, callback) {
		log.debug("Call to findByIds with ids: %j", ids);
		return partyServiceImpl.findByIds(ids)
			.then(function (result) {
				return Promise.resolve(toJSONMany(result)).asCallback(callback);
			});
	};

	/**
	 * Insert a new party.
	 * @param party
	 * @param callback
	 * @return {*}
	 */
	PartyService.prototype.insert = function (party, callback) {
		log.debug("Call to insert with party %j", party);
		object = PartyServiceImplClass.fromJSON(party);
		return partyServiceImpl.insert(object)
			.then(function (result) {
				return Promise.resolve(PartyServiceImplClass.toJSON(result)).asCallback(callback);
			});
	};

	/**
	 * Update a party.
	 * @param party
	 * @param callback
	 */
	PartyService.prototype.update = function (party, callback) {
		log.debug("Call to update with party %j", party);
		object = PartyServiceImplClass.fromJSON(party);
		return partyServiceImpl.update(object)
			.then(function (result) {
				return Promise.resolve(PartyServiceImplClass.toJSON(result)).asCallback(callback);
			});
	};

	/**
	 * Remove a party.
	 * @param id
	 * @param callback
	 */
	PartyService.prototype.remove = function (id, callback) {
		log.debug("Call to remove with id %j", id);
		return partyServiceImpl.remove(id).asCallback(callback);
	};

	return new PartyService();
};


module.exports.create = function (PartyServiceImpl) {
	// if the instance does not exist, create it
	if (!_.isObject(partyServiceServiceInstance)) {
		partyServiceServiceInstance = createInstance(PartyServiceImpl);
	}
	return partyServiceServiceInstance;
};