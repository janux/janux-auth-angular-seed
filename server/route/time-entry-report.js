/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 12/22/17.
 */

'use strict';
var
	log                    = require('log4js').getLogger('time-entry-report'),
	appContext             = require('../app-context'),
	tokenHandler           = require("../src/auth/token-handler"),
	timeEntryReportService = require("../src/api/index").TimeEntryReportService;

const tempFile = require('tempfile');
var Excel = require('exceljs');


module.exports = function (app) {
	app.post('/time-entry-report', function (req, res) {

		try {

			const ids = req.body.ids;

			timeEntryReportService.generateReport(ids)
				.then(function (result) {
					console.log("Report at " + result);
					res.download(result, function (err) {

						log.error("Error downloading file " + err);
					})
				});


			/*var workbook = new Excel.Workbook();
			var worksheet = workbook.addWorksheet('My Sheet');

			worksheet.columns = [
				{header: 'Id', key: 'id', width: 10},
				{header: 'Name', key: 'name', width: 32},
				{header: 'D.O.B.', key: 'DOB', width: 10}
			];
			worksheet.addRow({id: 1, name: 'John Doe', dob: new Date(1970, 1, 1)});
			worksheet.addRow({id: 2, name: 'Jane Doe', dob: new Date(1965, 1, 7)});

			var tempFilePath = tempFile('.xlsx');
			workbook.xlsx.writeFile(tempFilePath).then(function () {
				console.log('file is written');
				// res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
				res.download(tempFilePath, function (err) {
					log.error('---------- error downloading file: ' + err);
				});
			});*/
		} catch (err) {
			log.error('Error generating time entry report file: ' + err);
		}
	});
};