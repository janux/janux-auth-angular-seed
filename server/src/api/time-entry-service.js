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