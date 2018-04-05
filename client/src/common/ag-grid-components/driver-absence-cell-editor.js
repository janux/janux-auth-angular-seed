'use strict';

// function to act as a class
function AbsenceEditor () {}

// gets called once before the renderer is used
AbsenceEditor.prototype.init = function(params) {
	// Assign value to row scope
	this.model = 'agGridDriverAbsenceSelect';
	params.$scope[this.model] = params.value;
	this.rowScope = params.$scope;

	// Create angular material autocomplete
	this.autocomplete = document.createElement('ag-grid-driver-absence');
};

// gets called once when grid ready to insert the element
AbsenceEditor.prototype.getGui = function() {
	return this.autocomplete;
};

// focus and select can be done after the gui is attached
AbsenceEditor.prototype.afterGuiAttached = function() {

};

// returns the new value after editing
AbsenceEditor.prototype.getValue = function() {
	return this.rowScope[this.model];
};

// any cleanup we need to be done here
AbsenceEditor.prototype.destroy = function() {

};

// if true, then this editor will appear in a popup
AbsenceEditor.prototype.isPopup = function() {
	// and we could leave this method out also, false is the default
	return false;
};

module.exports = AbsenceEditor;