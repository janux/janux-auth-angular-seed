'use strict';

var moment = require('moment');

// function to act as a class
function Datepicker () {}

// Static date format string
Datepicker.formatString = 'MM/DD/YY';

// gets called once before the renderer is used
Datepicker.prototype.init = function(params) {

	// Assign value to row scope
	this.model = 'date'+params.column.colId;
	params.$scope[this.model] = new Date(params.value);
	this.rowScope = params.$scope;
	// Create angular material date picker
	this.datePicker = document.createElement('md-datepicker');
	this.datePicker.setAttribute('ng-model', this.model);
};

// gets called once when grid ready to insert the element
Datepicker.prototype.getGui = function() {
	return this.datePicker;
};

// focus and select can be done after the gui is attached
Datepicker.prototype.afterGuiAttached = function() {

};

// returns the new value after editing
Datepicker.prototype.getValue = function() {
	var out = moment(this.rowScope[this.model]).format(Datepicker.formatString);
	return out;
};

// any cleanup we need to be done here
Datepicker.prototype.destroy = function() {
	// but this example is simple, no cleanup, we could
	// even leave this method out as it's optional
};

// if true, then this editor will appear in a popup
Datepicker.prototype.isPopup = function() {
	// and we could leave this method out also, false is the default
	return false;
};

module.exports = Datepicker;