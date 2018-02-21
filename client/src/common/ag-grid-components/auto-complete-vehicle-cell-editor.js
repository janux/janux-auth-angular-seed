'use strict';

// function to act as a class
function AutoCompleteVehicle() {
}

// gets called once before the renderer is used
AutoCompleteVehicle.prototype.init = function (params) {
	// Assign value to row scope
	this.model = 'autocomplete' + params.column.colId;
	// Access to complete staff object
	params.$scope[this.model] = params.$scope.data[params.column.colId];
	this.rowScope = params.$scope;

	// Create angular material autocomplete
	this.autocomplete = document.createElement('ag-grid-vehicle-autocomplete');
	this.autocomplete.setAttribute('selected-value-model', this.model);
};

// gets called once when grid ready to insert the element
AutoCompleteVehicle.prototype.getGui = function () {
	return this.autocomplete;
};

// focus and select can be done after the gui is attached
AutoCompleteVehicle.prototype.afterGuiAttached = function () {

};

// returns the new value after editing
AutoCompleteVehicle.prototype.getValue = function () {
	return this.rowScope[this.model];
};

// any cleanup we need to be done here
AutoCompleteVehicle.prototype.destroy = function () {

};

// if true, then this editor will appear in a popup
AutoCompleteVehicle.prototype.isPopup = function () {
	// and we could leave this method out also, false is the default
	return false;
};

module.exports = AutoCompleteVehicle;