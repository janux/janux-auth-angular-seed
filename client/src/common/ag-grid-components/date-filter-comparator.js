'use strict';

var comparator = function (filterBeginDate, cellValue) {

	var beginDateOnly = new Date(cellValue.getFullYear(), cellValue.getMonth(), cellValue.getDate());

	// Now that both parameters are Date objects, we can compare
	if (beginDateOnly < filterBeginDate) {
		return -1;
	} else if (beginDateOnly > filterBeginDate) {
		return 1;
	} else {
		return 0;
	}
};

module.exports = comparator;