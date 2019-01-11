/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 11/21/17.
 */
var _                      = require('lodash'),
    TimeRecordServiceClass = require('glarus-services').TimeRecordService,
    log4js                 = require('log4js');
log = log4js.getLogger('time-entry-service');


var timeRecordServiceInstance = undefined;
var timeRecordServiceReferenceInstance = undefined;

var createInstance = function (timeRecordServiceReference) {
	timeRecordServiceReferenceInstance = timeRecordServiceReference;

	function TimeRecordService() {
	}

	TimeRecordService.prototype = Object.create(null);
	TimeRecordService.prototype.constructor = TimeRecordService;

	TimeRecordService.prototype.insert = function (timeRecord, idOperation, callback) {
		//We need to convert begin and end to proper dates.
		log.debug("Call to insert with timeRecord: %j , idOperation: %j", timeRecord, idOperation);

		// timeRecord.begin = fixDate(timeRecord.begin);
		// timeRecord.end = fixDate(timeRecord.end);
		// timeRecord.lastUpdate = fixDate(timeRecord.lastUpdate);
		// timeRecord.dateCreated = fixDate(timeRecord.dateCreated);

		var instance = TimeRecordServiceClass.fromJSON(timeRecord);

		return timeRecordServiceReferenceInstance.insert(instance, idOperation).asCallback(callback);
	};

	TimeRecordService.prototype.update = function (timeRecord, idOperation, callback) {
		log.debug("Call to update with timeRecord: %j, idOperation: %j", timeRecord, idOperation);

		// timeRecord.begin = fixDate(timeRecord.begin);
		// timeRecord.end = fixDate(timeRecord.end);
		// timeRecord.lastUpdate = fixDate(timeRecord.lastUpdate);
		// timeRecord.dateCreated = fixDate(timeRecord.dateCreated);

		var instance = TimeRecordServiceClass.fromJSON(timeRecord);

		return timeRecordServiceReferenceInstance.update(instance, idOperation).asCallback(callback);
	};

	TimeRecordService.prototype.removeByIds = function (ids, callback) {
		log.debug("Call to removeByIds with ids: %j", ids);
		return timeRecordServiceReferenceInstance.removeByIds(ids).asCallback(callback);
	};

	return new TimeRecordService();
};


module.exports.create = function (timeRecordServiceReference) {
	// if the instance does not exist, create it
	if (!_.isObject(timeRecordServiceInstance)) {
		// userServiceInstance = new UserService(aDAO);
		timeRecordServiceInstance = createInstance(timeRecordServiceReference);
	}
	return timeRecordServiceInstance;
};
