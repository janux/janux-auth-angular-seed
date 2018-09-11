/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 12/22/17.
 */

'use strict';
var
	log                                = require('log4js').getLogger('time-entry-report'),
	tokenHandler                       = require("../src/auth/token-handler"),
	invoiceSpecialServiceReportService = require("../src/api/index").InvoiceSpecialServiceReportService;

module.exports = function (app) {
	app.post('/report/specialOpsInvoiceReport', tokenHandler.authenticate, tokenHandler.handleInvalidTokenAuth, function (req, res) {
		// const tokenInfo = tokenHandler.retrieveTokenInfo(req);
		try {
			const invoiceNumber = req.body.invoiceNumber;
			const timeZone = req.body.timeZone;

			invoiceSpecialServiceReportService.generateReport(invoiceNumber, timeZone)
				.then(function (result) {
					log.debug("Report at %j ", result);
					res.download(result, function (err) {
						if (err) {
							log.error("Error downloading file " + err);
						}
					});
				});
		} catch (err) {
			log.error('Error generating time entry report file: ' + err);
		}
	});


};
