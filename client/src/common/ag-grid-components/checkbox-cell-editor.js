'use strict';

// Checkbox Cell Editor

// function to act as a class
function CheckBoxCellEditor () {}

// gets called once before the renderer is used
CheckBoxCellEditor.prototype.init = function(params) {

	// Assign value to row scope
	this.model = 'checkbox'+params.column.colId;
	params.$scope[this.model] = params.value;
	this.rowScope = params.$scope;

	this.eInput = document.createElement('div');
	this.eInput.align='center';
	this.eInput.style='padding:0px 5px 5px 14px;';

	var checkbox = document.createElement('md-checkbox');
	checkbox.setAttribute('ng-model', this.model);

	this.eInput.appendChild(checkbox);
};

// gets called once when grid ready to insert the element
CheckBoxCellEditor.prototype.getGui = function() {
	return this.eInput;
};

// focus and select can be done after the gui is attached
CheckBoxCellEditor.prototype.afterGuiAttached = function() {

};

// returns the new value after editing
CheckBoxCellEditor.prototype.getValue = function() {
	return this.rowScope[this.model];
};

// any cleanup we need to be done here
CheckBoxCellEditor.prototype.destroy = function() {
	// but this example is simple, no cleanup, we could
	// even leave this method out as it's optional
};

// if true, then this editor will appear in a popup
CheckBoxCellEditor.prototype.isPopup = function() {
	// and we could leave this method out also, false is the default
	return false;
};

module.exports = CheckBoxCellEditor;