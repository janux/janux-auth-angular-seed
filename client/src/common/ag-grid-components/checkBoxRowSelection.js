'use strict';

// Checkbox row selection
function CheckBoxRowSelection() {
}

CheckBoxRowSelection.prototype.init = function (params) {
	this.eGui = document.createElement('div');
	this.eGui.align='center';
	this.eGui.style.cssText='padding:0px 5px 5px 14px;';
	this.model = 'checkSel'+params.column.colId+params.rowIndex;
	this.rowScope = params.$scope;
	this.rowScope[this.model] = false;

	var checkbox = document.createElement('md-checkbox');
	checkbox.setAttribute('ng-model', this.model);
	checkbox.onclick = function() {
		console.log('row params', params);
		params.node.setSelected( !params.node.selected );
	};

	// Listen row selected event
	params.node.addEventListener('rowSelected', function (rowSelected) {
		this.rowScope[this.model] = rowSelected.node.selected;
		// console.log('Row selected', rowSelected, params.$scope[this.model], this.model);
	}.bind(this));

	this.eGui.appendChild(checkbox);
};

CheckBoxRowSelection.prototype.getGui = function () {
	return this.eGui;
};

module.exports = CheckBoxRowSelection;