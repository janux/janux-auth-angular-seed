'use strict';

// Cell Editor

// function to act as a class
function SimpleCellEditor () {}

// gets called once before the renderer is used
SimpleCellEditor.prototype.init = function(params) {
	// create the cell
	this.eInput = document.createElement('input');
	this.eInput.value = params.value;
};

// gets called once when grid ready to insert the element
SimpleCellEditor.prototype.getGui = function() {
	return this.eInput;
};

// focus and select can be done after the gui is attached
SimpleCellEditor.prototype.afterGuiAttached = function() {
	this.eInput.focus();
	this.eInput.select();
};

// returns the new value after editing
SimpleCellEditor.prototype.getValue = function() {
	return this.eInput.value;
};

// any cleanup we need to be done here
SimpleCellEditor.prototype.destroy = function() {
	// but this example is simple, no cleanup, we could
	// even leave this method out as it's optional
};

// if true, then this editor will appear in a popup
SimpleCellEditor.prototype.isPopup = function() {
	// and we could leave this method out also, false is the default
	return false;
};

module.exports = SimpleCellEditor;