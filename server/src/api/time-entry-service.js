/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 11/21/17.
 */
var _ = require('lodash');
var moment = require('moment');


var log4js = require('log4js'),
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
		if (_.isNil(timeEntry.begin) === false) {
			var begin = moment(timeEntry.begin);
			timeEntry.begin = begin.isValid() ? begin.toDate() : "invalid";
		}

		if (_.isNil(timeEntry.end) === false) {
			var end = moment(timeEntry.end);
			timeEntry.end = end.isValid() ? end.toDate() : "invalid";
		}

		return timeEntryServiceReferenceInstance.insert(timeEntry).asCallback(callback);
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