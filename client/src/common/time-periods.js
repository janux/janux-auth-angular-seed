'use strict';


var last7Days = {
	from: function () {
		return moment().subtract('7', 'days').toDate();
	},
	to  : function () {
		return moment().add(1, 'day').startOf('day').toDate();
	}
};

var currentWeek = {
	from: function () {
		return moment().startOf('isoWeek').toDate();
	},
	to  : function () {
		return moment().endOf('isoWeek').toDate();
	}
};

var lastWeek = {
	from: function () {
		return moment().subtract(1, 'weeks').startOf('isoWeek').toDate();
	},
	to  : function () {
		return moment().subtract(1, 'weeks').endOf('isoWeek').toDate();
	}
};

var last30Days = {
	from: function () {
		return moment().subtract('30', 'days').toDate();
	},
	to  : function () {
		return moment().add(1, 'day').startOf('day').toDate();
	}
};

var firstBiWeekCurrentMonth = {
	from: function () {
		return moment().startOf('month').toDate();
	},
	to  : function () {
		return moment().date(16).hours(0).minutes(0).seconds(0).milliseconds(0).toDate();
	}
};

var secondBiWeekCurrentMonth = {
	from: function () {
		return moment().date(16).hours(0).minutes(0).seconds(0).milliseconds(0).toDate();
	},
	to  : function () {
		return moment().endOf('month').toDate();
	}
};

var firstBiWeekPreviousMonth = {
	from: function () {
		return moment().subtract(1, 'months').startOf('month').toDate();
	},
	to  : function () {
		return moment().subtract(1, 'months').date(16).hours(0).minutes(0).seconds(0).milliseconds(0).toDate();
	}
};

var secondBiWeekPreviousMonth = {
	from: function () {
		return moment().subtract(1, 'months').date(16).hours(0).minutes(0).seconds(0).milliseconds(0).toDate();
	},
	to  : function () {
		return moment().subtract(1, 'months').endOf('month').toDate();
	}
};


var currentMonth = {
	from: function () {
		return moment().startOf('month').toDate();
	},
	to  : function () {
		return moment().endOf('month').toDate();
	}
};

var lastMonth = {
	from: function () {
		return moment().subtract(1, 'months').startOf('month').toDate();
	},
	to  : function () {
		return moment().subtract(1, 'months').endOf('month').toDate();
	}
};

var last90Days = {
	from: function () {
		return moment().subtract('90', 'days').toDate();
	},
	to  : function () {
		return moment().add(1, 'day').startOf('day').toDate();
	}
};

var lastQuarter = {
	from: function () {
		return moment().subtract(1, 'quarter').startOf('quarter').toDate();
	},
	to  : function () {
		return moment().subtract(1, 'quarter').endOf('quarter').toDate();
	}
};

var currentQuarter = {
	from: function () {
		return moment().startOf('quarter').toDate();
	},
	to  : function () {
		return moment().endOf('quarter').toDate();
	}
};

var oneYear = {
	from: function () {
		return moment().subtract('1', 'years').toDate();
	},
	to  : function () {
		return moment().add(1, 'day').startOf('day').toDate();
	}
};

var yearToDate = {
	from: function () {
		return moment().startOf('year').toDate();
	},
	to  : function () {
		return moment().add(1, 'day').startOf('day').toDate();
	}
};

var lastYear = {
	from: function () {
		return moment().subtract('1', 'years').startOf('year').toDate();
	},
	to  : function () {
		return moment().subtract('1', 'years').endOf('year').toDate();
	}
};


module.exports = {
	specialOps   : {
		'last7Days'                : last7Days,
		'currentWeek'              : currentWeek,
		'lastWeek'                 : lastWeek,
		'last30Days'               : last30Days,
		'currentMonth'             : currentMonth,
		'lastMonth'                : lastMonth,
		'last90Days'               : last90Days,
		'currentQuarter'           : currentQuarter,
		'lastQuarter'              : lastQuarter,
		'oneYear'                  : oneYear,
		'yearToDate'               : yearToDate,
		'lastYear'                 : lastYear,
		'firstBiWeekCurrentMonth'  : firstBiWeekCurrentMonth,
		'secondBiWeekCurrentMonth' : secondBiWeekCurrentMonth,
		'firstBiWeekPreviousMonth' : firstBiWeekPreviousMonth,
		'secondBiWeekPreviousMonth': secondBiWeekPreviousMonth
	},
	nonSpecialOps: {
		'last7Days'                : last7Days,
		'currentWeek'              : currentWeek,
		'lastWeek'                 : lastWeek,
		'last30Days'               : last30Days,
		'currentMonth'             : currentMonth,
		'lastMonth'                : lastMonth,
		'last90Days'               : last90Days,
		'currentQuarter'           : currentQuarter,
		'lastQuarter'              : lastQuarter,
		'firstBiWeekCurrentMonth'  : firstBiWeekCurrentMonth,
		'secondBiWeekCurrentMonth' : secondBiWeekCurrentMonth,
		'firstBiWeekPreviousMonth' : firstBiWeekPreviousMonth,
		'secondBiWeekPreviousMonth': secondBiWeekPreviousMonth
	}
};
