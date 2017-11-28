/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 11/21/17.
 */
var _       = require('lodash'),
	fixDate = require('../util/fix-date'),
	log4js  = require('log4js');
log = log4js.getLogger('time-entry-service');


var timeEntryServiceInstance = undefined;
var timeEntryServiceReferenceInstance = undefined;

var createInstance = function (timeEntryServiceReference) {
	timeEntryServiceReferenceInstance = timeEntryServiceReference;

	function TimeEntryService() {
	}

	TimeEntryService.prototype = Object.create(null);
	TimeEntryService.prototype.constructor = TimeEntryService;

	TimeEntryService.prototype.insert = function (timeEntry, callback) {
		//We need to convert begin and end to proper dates.
		log.debug("Call to insert with timeEntry: %j", timeEntry);

		timeEntry.begin = fixDate(timeEntry.begin);
		timeEntry.end = fixDate(timeEntry.end);
		timeEntry.lastUpdate = fixDate(timeEntry.lastUpdate);
		timeEntry.dateCreated = fixDate(timeEntry.dateCreated);

		return timeEntryServiceReferenceInstance.insert(timeEntry).asCallback(callback);
	};

	TimeEntryService.prototype.update = function (timeEntry, callback) {
		log.debug("Call to update with timeEntry: %j", timeEntry);

		timeEntry.begin = fixDate(timeEntry.begin);
		timeEntry.end = fixDate(timeEntry.end);
		timeEntry.lastUpdate = fixDate(timeEntry.lastUpdate);
		timeEntry.dateCreated = fixDate(timeEntry.dateCreated);

		return timeEntryServiceReferenceInstance.update(timeEntry).asCallback(callback);
	};

	TimeEntryService.prototype.removeByIds = function (ids, callback) {
		log.debug("Call to removeByIds with ids: %j", ids);
		return timeEntryServiceReferenceInstance.removeByIds(ids).asCallback(callback);
	};

	return new TimeEntryService();
};


module.exports.create = function (timeEntryServiceReference) {
	// if the instance does not exist, create it
	if (!_.isObject(timeEntryServiceInstance)) {
		// userServiceInstance = new UserService(aDAO);
		timeEntryServiceInstance = createInstance(timeEntryServiceReference);
	}
	return timeEntryServiceInstance;
};