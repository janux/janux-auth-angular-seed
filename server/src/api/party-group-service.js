var _ = require('lodash');
var PartyGroupServiceStatic = require('janux-persist').PartyGroupServiceImpl;
var PartyServiceImplClass = require('janux-persist').PartyServiceImpl;
var log4js = require('log4js');
var Promise = require('bluebird');
var log = log4js.getLogger('party-group-service');

var partyGroupServiceInstance = undefined;
var partyGroupServiceReferenceInstance = undefined;

var createInstance = function (partyGroupServiceReference) {
	partyGroupServiceReferenceInstance = partyGroupServiceReference;

	function PartyGroupService() {

	}

	// function toJsonMany(values) {
	// 	return _.map(values, function (o) {
	// 		return PartyGroupServiceStatic.toJSON(o);
	// 	})
	// }

	PartyGroupService.prototype = Object.create(null);
	PartyGroupService.prototype.constructor = PartyGroupService;

	PartyGroupService.prototype.findPropertiesByType = function (type, callback) {
		return partyGroupServiceReferenceInstance.findPropertiesByType(type).asCallback(callback);
	};

	PartyGroupService.prototype.findPropertiesOwnedByPartyAndTypes = function (partyId, types, callback) {
		return partyGroupServiceReferenceInstance.findPropertiesOwnedByPartyAndTypes(partyId, types).asCallback(callback);
	};

	PartyGroupService.prototype.findOne = function (code, callback) {
		return partyGroupServiceReferenceInstance.findOne(code).asCallback(callback);
		// .then(function (result) {
		// 	return Promise.resolve(PartyGroupServiceStatic.toJSON(result)).asCallback(callback);
		// });
	};

	PartyGroupService.prototype.findOneOwnedByPartyAndType = function (partyId, type, createOne, callback) {
		return partyGroupServiceReferenceInstance.findOneOwnedByPartyAndType(partyId, type, createOne).asCallback(callback);

		// .then(function (result) {
		// 	return Promise.resolve(PartyGroupServiceStatic.toJSON(result)).asCallback(callback);
		// });
	};

	PartyGroupService.prototype.findByTypes = function (types, callback) {
		return partyGroupServiceReferenceInstance.findByTypes(types).asCallback(callback);
		// .then(function (result) {
		// 	return Promise.resolve(toJsonMany(result)).asCallback(callback);
		// });;
	};

	PartyGroupService.prototype.insert = function (partyId, group, callback) {
		return partyGroupServiceReferenceInstance.insert(partyId, PartyGroupServiceStatic.fromJSON(group)).asCallback(callback);
		// .then(function (result) {
		// 	var k = PartyGroupServiceStatic.toJSON(result);
		// 	return Promise.resolve(PartyGroupServiceStatic.toJSON(result)).asCallback(callback);
		// });
	};

	PartyGroupService.prototype.update = function (group, callback) {
		return partyGroupServiceReferenceInstance.update(PartyGroupServiceStatic.fromJSON(group)).asCallback(callback);
		// 	.then(function (result) {
		// 		return Promise.resolve(PartyGroupServiceStatic.toJSON(result)).asCallback(callback);
		// 	});
	};

	PartyGroupService.prototype.remove = function (code, callback) {
		return partyGroupServiceReferenceInstance.remove(code).asCallback(callback);
	};

	PartyGroupService.prototype.addItem = function (code, item, callback) {
		return partyGroupServiceReferenceInstance.addItem(code, PartyGroupServiceStatic.fromJSONItem(item)).asCallback(callback);
	};

	PartyGroupService.prototype.addItemNewParty = function (code, party, attributes, callback) {
		var partyObject = PartyServiceImplClass.fromJSON(party);
		return partyGroupServiceReferenceInstance.addItemNewParty(code, partyObject, attributes)
			.then(function (result) {
				return Promise.resolve(result).asCallback(callback);
			});
	};

	PartyGroupService.prototype.removeItem = function (code, partyId, callback) {
		return partyGroupServiceReferenceInstance.removeItem(code, partyId).asCallback(callback);
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