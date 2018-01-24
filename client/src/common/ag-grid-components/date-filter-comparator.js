'use strict';

var moment = require('moment');

var comparator = function (filterDate, cellValue) {

	var filterDateMoment = moment(filterDate).startOf('day');
	var cellDateOnlyMoment = moment(cellValue).startOf('day'); //new Date(cellValue.getFullYear(), cellValue.getMonth(), cellValue.getDate());

	// Now that both parameters are Date objects, we can compare

	if (cellDateOnlyMoment.isBefore(filterDateMoment)) {
		return -1;
	} else if (cellDateOnlyMoment.isAfter(filterDateMoment)) {
		return 1;
	} else {
		return 0;
	}
};

module.exports = comparator;