'use strict';

module.exports = {
	'last7Days': {
		from: function () {
			return moment().subtract('7', 'days').toDate();
		},
		to: function () {
			return moment().add(1, 'day').startOf('day').toDate();
		}
	},
	'currentWeek': {
		from: function () {
			return moment().startOf('isoWeek').toDate();
		},
		to: function () {
			return moment().endOf('isoWeek').toDate();
		}
	},
	'lastWeek': {
		from: function () {
			return moment().subtract(1, 'weeks').startOf('isoWeek').toDate();
		},
		to: function () {
			return moment().subtract(1, 'weeks').endOf('isoWeek').toDate();
		}
	},
	'last30Days': {
		from: function () {
			return moment().subtract('30', 'days').toDate();
		},
		to: function () {
			return moment().add(1, 'day').startOf('day').toDate();
		}
	},
	'currentMonth': {
		from: function () {
			return moment().startOf('month').toDate();
		},
		to: function () {
			return moment().endOf('month').toDate();
		}
	},
	'lastMonth': {
		from: function () {
			return moment().subtract(1, 'months').startOf('month').toDate();
		},
		to: function () {
			return moment().subtract(1, 'months').endOf('month').toDate();
		}
	},
	'last90Days': {
		from: function () {
			return moment().subtract('90', 'days').toDate();
		},
		to: function () {
			return moment().add(1, 'day').startOf('day').toDate();
		}
	},
	'currentQuarter': {
		from: function () {
			return moment().startOf('quarter').toDate();
		},
		to: function () {
			return moment().endOf('quarter').toDate();
		}
	},
	'lastQuarter': {
		from: function () {
			return moment().subtract(1, 'quarter').startOf('quarter').toDate();
		},
		to: function () {
			return moment().subtract(1, 'quarter').endOf('quarter').toDate();
		}
	}
};