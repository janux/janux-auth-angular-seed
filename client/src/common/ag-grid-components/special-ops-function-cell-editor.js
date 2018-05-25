'use strict';

// function to act as a class
function SpecialOpsFunctionCellEditor () {}

// gets called once before the renderer is used
SpecialOpsFunctionCellEditor.prototype.init = function(params) {
	// Assign value to row scope
	this.model = 'agGridSpecialOpsFunction';
	params.$scope[this.model] = params.value;
	this.rowScope = params.$scope;

	// Create angular material autocomplete
	this.autocomplete = document.createElement('ag-grid-special-ops-function');
};

// gets called once when grid ready to insert the element
SpecialOpsFunctionCellEditor.prototype.getGui = function() {
	return this.autocomplete;
};

// focus and select can be done after the gui is attached
SpecialOpsFunctionCellEditor.prototype.afterGuiAttached = function() {

};

// returns the new value after editing
SpecialOpsFunctionCellEditor.prototype.getValue = function() {
	return this.rowScope[this.model];
};

// any cleanup we need to be done here
SpecialOpsFunctionCellEditor.prototype.destroy = function() {

};

// if true, then this editor will appear in a popup
SpecialOpsFunctionCellEditor.prototype.isPopup = function() {
	// and we could leave this method out also, false is the default
	return false;
};

module.exports = SpecialOpsFunctionCellEditor;