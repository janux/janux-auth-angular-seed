'use strict';

// function to act as a class
function GuardExtrasCellEditor () {}

// gets called once before the renderer is used
GuardExtrasCellEditor.prototype.init = function(params) {
	// Assign value to row scope
	this.model = 'agGridGuardExtras';
	params.$scope[this.model] = params.value;
	this.rowScope = params.$scope;

	// Create angular material autocomplete
	this.autocomplete = document.createElement('ag-grid-guards-extra');
};

// gets called once when grid ready to insert the element
GuardExtrasCellEditor.prototype.getGui = function() {
	return this.autocomplete;
};

// focus and select can be done after the gui is attached
GuardExtrasCellEditor.prototype.afterGuiAttached = function() {

};

// returns the new value after editing
GuardExtrasCellEditor.prototype.getValue = function() {
	return this.rowScope[this.model];
};

// any cleanup we need to be done here
GuardExtrasCellEditor.prototype.destroy = function() {

};

// if true, then this editor will appear in a popup
GuardExtrasCellEditor.prototype.isPopup = function() {
	// and we could leave this method out also, false is the default
	return false;
};

module.exports = GuardExtrasCellEditor;