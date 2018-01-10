/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 12/22/17.
 */

'use strict';
var
	log                    = require('log4js').getLogger('time-entry-report'),
	tokenHandler           = require("../src/auth/token-handler"),
	timeEntryReportService = require("../src/api/index").TimeEntryReportService;

module.exports = function (app) {
	app.post('/time-entry-report', tokenHandler.authenticate, tokenHandler.handleInvalidTokenAuth, function (req, res) {

		try {
			
			const ids = req.body.ids;
			const timeZone = req.body.timeZone;
			timeEntryReportService.generateReport(ids, timeZone)
				.then(function (result) {
					log.debug("Report at %j ", result);
					res.download(result, function (err) {
						if(err) {
							log.error("Error downloading file " + err);
						}
					})
				});
		} catch (err) {
			log.error('Error generating time entry report file: ' + err);
		}
	});
};