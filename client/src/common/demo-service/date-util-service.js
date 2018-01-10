/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 11/23/17.
 */
'use strict';


var _ = require('lodash');
var moment = require('moment');
require('moment-timezone');


module.exports =
	['$q', '$http',
		function ($q, $http) {

			var service = {
				stringToDate: function (dateAsString) {
					if (_.isNil(dateAsString)) {
						return dateAsString;
					}
					var dateMoment = moment(dateAsString);
					if (dateMoment.isValid() === false) {
						console.error("Date " + dateAsString + " is not a valid date");
						return undefined;
					} else {
						return dateMoment.toDate();
					}
				},

				/**
				 * Return the time zone defined in the browser.
				 */
				getBrowserTimeZone: function () {
					console.log("moment timezone browser  " + moment.tz.guess());
					return moment.tz.guess();
				}
			};
			return service;
		}];
