'use strict';

//
// Large Text Cell Editor
// This component for ag-grid has the purpose of editing cells whose
// text content is broad. Fulfills the same functionality as the
// component 'LargeText' that by default integrates ag-grid, with
// the advantage of being able to be used in conjunction with the
// 'fullRow' edit type.
//

// function to act as a class
function LargeTextCellEditor () {}

// gets called once before the renderer is used
LargeTextCellEditor.prototype.init = function(params) {
	// create the cell
	this.model = 'largeText'+params.column.colId;
	params.$scope[this.model] = params.value;
	this.eInput = document.createElement('input');
	this.eInput.value = params.value;
	this.eInput.setAttribute('ag-grid-large-text', '');
	this.eInput.setAttribute('ng-model', this.model);
};

// gets called once when grid ready to insert the element
LargeTextCellEditor.prototype.getGui = function() {
	return this.eInput;
};

// focus and select can be done after the gui is attached
LargeTextCellEditor.prototype.afterGuiAttached = function() {

};

// returns the new value after editing
LargeTextCellEditor.prototype.getValue = function() {
	return this.eInput.value;
};

// any cleanup we need to be done here
LargeTextCellEditor.prototype.destroy = function() {
	// but this example is simple, no cleanup, we could
	// even leave this method out as it's optional
};

// if true, then this editor will appear in a popup
LargeTextCellEditor.prototype.isPopup = function() {
	// and we could leave this method out also, false is the default
	return false;
};

module.exports = LargeTextCellEditor;