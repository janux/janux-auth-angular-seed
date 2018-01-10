'use strict';

var moment = require('moment');

var comparator = function (filterDate, cellValue) {

	var filterDate = moment(filterDate);
	var cellDateOnly = moment(cellValue).startOf('day'); //new Date(cellValue.getFullYear(), cellValue.getMonth(), cellValue.getDate());

	// Now that both parameters are Date objects, we can compare
	// cellDateOnly < filterDate
	if (cellDateOnly.isBefore(filterDate)) {
		return -1;
	}
	// cellDateOnly > filterDate
	else if (cellDateOnly.isAfter(filterDate)) {
		return 1;
	} else {
		return 0;
	}
};

module.exports = comparator;