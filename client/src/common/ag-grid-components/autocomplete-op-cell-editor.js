'use strict';

// function to act as a class
function Autocomplete () {}

// gets called once before the renderer is used
Autocomplete.prototype.init = function(params) {
	// Assign value to row scope
	this.model = 'autocomplete'+params.column.colId;
	// Access to complete operation object
	params.$scope[this.model] = params.$scope.data[params.column.colId];
	this.rowScope = params.$scope;

	// Create angular material autocomplete
	this.autocomplete = document.createElement('ag-grid-op-autocomplete');
	this.autocomplete.setAttribute('selected-value-model', this.model);
};

// gets called once when grid ready to insert the element
Autocomplete.prototype.getGui = function() {
	return this.autocomplete;
};

// focus and select can be done after the gui is attached
Autocomplete.prototype.afterGuiAttached = function() {

};

// returns the new value after editing
Autocomplete.prototype.getValue = function() {
	return this.rowScope[this.model];
};

// any cleanup we need to be done here
Autocomplete.prototype.destroy = function() {

};

// if true, then this editor will appear in a popup
Autocomplete.prototype.isPopup = function() {
	// and we could leave this method out also, false is the default
	return false;
};

module.exports = Autocomplete;