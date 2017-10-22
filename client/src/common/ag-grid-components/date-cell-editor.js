'use strict';

// function to act as a class
function Datepicker () {}

// gets called once before the renderer is used
Datepicker.prototype.init = function(params) {
	// create the cell
	params.$scope.date = $scope.date;
	this.eInput = document.createElement('md-datepicker');
	// this.eInput.ngModel = 'date';
	this.eInput.setAttribute('ng-model', 'date');
	// this.eInput = '<md-datepicker ng-model="date" md-placeholder="Enter date" />';
	// this.eInput.value = params.value;

	// https://jqueryui.com/datepicker/
	// $(this.eInput).datepicker({
	// 	dateFormat: 'dd/mm/yy'
	// });
};

// gets called once when grid ready to insert the element
Datepicker.prototype.getGui = function() {
	return this.eInput;
};

// focus and select can be done after the gui is attached
Datepicker.prototype.afterGuiAttached = function() {
	this.eInput.focus();
	this.eInput.select();
};

// returns the new value after editing
Datepicker.prototype.getValue = function() {
	return this.eInput.value;
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