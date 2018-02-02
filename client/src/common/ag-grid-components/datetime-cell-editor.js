'use strict';

var moment = require('moment');

// function to act as a class
function DateTimepicker () {}

// Static date format string
DateTimepicker.formatString = 'YYYY-MM-DD HH:mm';

//Format string for only hours.
DateTimepicker.formatStringOnlyHour = 'HH:mm';

//Format string for only date.
DateTimepicker.formatStringOnlyDate = 'YYYY-MM-DD';

// gets called once before the renderer is used
DateTimepicker.prototype.init = function(params) {

	var date = (params.value)?new Date(params.value):moment().startOf('day').format(DateTimepicker.formatString);
	var onBlurMethodName = 'datetime'+params.column.colId+'CellEditorBlur';

	// Assign value to row scope
	this.model = 'agGridDate'+params.column.colId;
	params.$scope[this.model] = date;
	params.$scope[onBlurMethodName] = (function () {
		params.$scope.$broadcast('agGridDatetimeCellChange',
			{
				begin: params.$scope.agGridDatebegin,
				end: params.$scope.agGridDateend
			});
	}).bind(params);

	this.rowScope = params.$scope;

	// Create angular material datetime picker
	this.datetimePicker = document.createElement('input');
	this.datetimePicker.setAttribute('mdc-datetime-picker', '');
	this.datetimePicker.setAttribute('date', 'true');
	this.datetimePicker.setAttribute('time', 'true');
	this.datetimePicker.setAttribute('minutes', 'true');
	this.datetimePicker.setAttribute('format', DateTimepicker.formatString);
	this.datetimePicker.setAttribute('show-icon', 'true');
	this.datetimePicker.setAttribute('minute-steps', '1');
	this.datetimePicker.setAttribute('type', 'text');
	this.datetimePicker.setAttribute('class', 'jnx-datetime-picker');
	this.datetimePicker.setAttribute('edit-input', 'true');
	this.datetimePicker.setAttribute('ng-model', this.model);
	this.datetimePicker.setAttribute('ng-change', onBlurMethodName+'()');
	this.datetimePicker.setAttribute('ng-model-options', '{ debounce: 1000 }');
	this.datetimePicker.setAttribute('lang', '{{ lang }}');
	this.datetimePicker.setAttribute('today-text', '{{ "label.today" | translate }}');
	this.datetimePicker.setAttribute('ok-text', '{{ "label.ok" | translate }}');
	this.datetimePicker.setAttribute('cancel-text', '{{ "label.cancel" | translate }}');
};

// gets called once when grid ready to insert the element
DateTimepicker.prototype.getGui = function() {
	return this.datetimePicker;
};

// focus and select can be done after the gui is attached
DateTimepicker.prototype.afterGuiAttached = function() {

};

// returns the new value after editing
DateTimepicker.prototype.getValue = function() {
	var out = moment(this.rowScope[this.model]).format(DateTimepicker.formatString);
	return out;
};

// any cleanup we need to be done here
DateTimepicker.prototype.destroy = function() {
	// but this example is simple, no cleanup, we could
	// even leave this method out as it's optional
};

// if true, then this editor will appear in a popup
DateTimepicker.prototype.isPopup = function() {
	// and we could leave this method out also, false is the default
	return false;
};

module.exports = DateTimepicker;