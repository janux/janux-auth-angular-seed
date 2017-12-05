/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 12/4/17.
 */
var _ = require('lodash');
var log4js = require('log4js'),
	log    = log4js.getLogger('party-group-service');

var partyGroupServiceInstance = undefined;
var partyGroupServiceReferenceInstance = undefined;

var createInstance = function (partyGroupServiceReference) {
	partyGroupServiceReferenceInstance = partyGroupServiceReference;

	function PartyGroupService() {

	}

	PartyGroupService.prototype = Object.create(null);
	PartyGroupService.prototype.constructor = PartyGroupService;

	PartyGroupService.prototype.findPropertiesByType = function (type, callback) {
		return partyGroupServiceReference.findPropertiesByType(type).asCallback(callback);
	};

	PartyGroupService.prototype.findPropertiesOwnedByPartyAndTypes = function (partyId, types, callback) {
		return partyGroupServiceReference.findPropertiesOwnedByPartyAndTypes(partyId, types).asCallback(callback);
	};

	PartyGroupService.prototype.findOne = function (code, callback) {
		return partyGroupServiceReference.findOne(code).asCallback(callback);
	};

	PartyGroupService.prototype.findOneOwnedByPartyAndType = function (partyId, type, callback) {
		return partyGroupServiceReference.findOneOwnedByPartyAndType(partyId, type).asCallback(callback);
	};

	PartyGroupService.prototype.findByTypes = function (types, callback) {
		return partyGroupServiceReference.findByTypes(types).asCallback(callback);
	};

	PartyGroupService.prototype.insert = function (group, callback) {
		return partyGroupServiceReference.insert(group).asCallback(callback);
	};

	PartyGroupService.prototype.update = function (group, callback) {
		return partyGroupServiceReference.update(group).asCallback(callback);
	};

	PartyGroupService.prototype.remove = function (code, callback) {
		return partyGroupServiceReference.remove(code).asCallback(callback);
	};

	PartyGroupService.prototype.addItem = function (code, item, callback) {
		//The item contains a party as json data, not as a party instance. Now, we don't need
		// to transform it because we only need the id.
		return partyGroupServiceReference.addItem(code, item).asCallback(callback);
	};

	PartyGroupService.prototype.removeItem = function (code, party, callback) {
		//The party comes as json, not as a party instance. Now, we don't need
		// to transform it because e only need the id.
		return partyGroupServiceReference.removeItem(code, party).asCallback(callback);
	};

	return new PartyGroupService();

};

module.exports.create = function (partyGroupServiceReference) {
	// if the instance does not exist, create it
	if (!_.isObject(partyGroupServiceInstance)) {
		// userServiceInstance = new UserService(aDAO);
		partyGroupServiceInstance = createInstance(partyGroupServiceReference);
	}
	return partyGroupServiceInstance;
};