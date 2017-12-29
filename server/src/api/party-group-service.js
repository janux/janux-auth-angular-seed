/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 12/28/17.
 */

var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');
var PartyGroupServiceStatic = require('janux-persist').PartyGroupServiceImpl;
var log4js = require('log4js');
var log = log4js.getLogger('party-group-service');

var partyGroupServiceInstance = undefined;
var partyGroupServiceReferenceInstance = undefined;

var createInstance = function (partyGroupServiceReference) {
	partyGroupServiceReferenceInstance = partyGroupServiceReference;

	function PartyGroupService() {

	}

	function toJsonMany(values) {
		return _.map(values,function (o) {
			return PartyGroupServiceStatic.toJSON(o);
		})
	}

	PartyGroupService.prototype = Object.create(null);
	PartyGroupService.prototype.constructor = PartyGroupService;

	PartyGroupService.prototype.findPropertiesByType = function (type, callback) {
		return partyGroupServiceReferenceInstance.findPropertiesByType(type).asCallback(callback);
	};

	PartyGroupService.prototype.findPropertiesOwnedByPartyAndTypes = function (partyId, types, callback) {
		return partyGroupServiceReferenceInstance.findPropertiesOwnedByPartyAndTypes(partyId, types).asCallback(callback);
	};

	PartyGroupService.prototype.findOne = function (code, callback) {
		return partyGroupServiceReferenceInstance.findOne(code)
			.then(function (result) {
				return Promise.resolve(PartyGroupServiceStatic.toJSON(result)).asCallback(callback);
			});
	};

	PartyGroupService.prototype.findOneOwnedByPartyAndType = function (partyId, type, callback) {
		return partyGroupServiceReferenceInstance.findOneOwnedByPartyAndType(partyId, type)
			.then(function (result) {
				return Promise.resolve(PartyGroupServiceStatic.toJSON(result)).asCallback(callback);
			});
	};

	PartyGroupService.prototype.findByTypes = function (types, callback) {
		return partyGroupServiceReferenceInstance.findByTypes(types)
			.then(function (result) {
				return Promise.resolve(toJsonMany(result)).asCallback(callback);
			});;
	};

	PartyGroupService.prototype.insert = function (partyId, group, callback) {
		return partyGroupServiceReferenceInstance.insert(partyId, PartyGroupServiceStatic.fromJSON(group))
			.then(function (result) {
				var k = PartyGroupServiceStatic.toJSON(result);
				return Promise.resolve(PartyGroupServiceStatic.toJSON(result)).asCallback(callback);
			});
	};

	PartyGroupService.prototype.update = function (group, callback) {
		return partyGroupServiceReferenceInstance.update(PartyGroupServiceStatic.fromJSON(group))
			.then(function (result) {
				return Promise.resolve(PartyGroupServiceStatic.toJSON(result)).asCallback(callback);
			});
	};

	PartyGroupService.prototype.remove = function (code, callback) {
		return partyGroupServiceReferenceInstance.remove(code).asCallback(callback);
	};

	PartyGroupService.prototype.addItem = function (code, item, callback) {
		return partyGroupServiceReferenceInstance.addItem(code, PartyGroupServiceStatic.fromJSONItem(item)).asCallback(callback);
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