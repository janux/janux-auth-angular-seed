'use strict';

function DurationUpdater () {}

// gets called once before the renderer is used
DurationUpdater.prototype.init = function(params) {

	params.$scope.agGridDurationUpdater = params.value;

	var onDatetimeCellChangeCb = (function (event,timeFrame) {
		var out = '0:0';
		if(_.isNil(timeFrame.end) === false && timeFrame.end!=='') {
			var end = moment(timeFrame.end);
			var begin = moment(timeFrame.begin);
			var durationMoment = moment.duration(end.diff(begin));
			var daysToHours = (durationMoment.get("days")>0)?durationMoment.get("days")*24:0;
			out = (durationMoment.get('hours')+daysToHours) + ':' + ('00'+durationMoment.get("minutes")).slice(-2);
		}
		params.$scope.agGridDurationUpdater = out;
	}).bind(params);

	params.$scope.$on('agGridDatetimeCellChange', onDatetimeCellChangeCb);

	// Create duration updater element
	this.durationCont = document.createElement('ag-grid-duration-updater');
	this.rowScope = params.$scope;
};

// gets called once when grid ready to insert the element
DurationUpdater.prototype.getGui = function() {
	return this.durationCont;
};

// focus and select can be done after the gui is attached
DurationUpdater.prototype.afterGuiAttached = function() {

};

// returns the new value after editing
DurationUpdater.prototype.getValue = function() {
	return this.rowScope.agGridDurationUpdater;
};

// any cleanup we need to be done here
DurationUpdater.prototype.destroy = function() {
	// but this example is simple, no cleanup, we could
	// even leave this method out as it's optional
};

// if true, then this editor will appear in a popup
DurationUpdater.prototype.isPopup = function() {
	// and we could leave this method out also, false is the default
	return false;
};

module.exports = DurationUpdater;