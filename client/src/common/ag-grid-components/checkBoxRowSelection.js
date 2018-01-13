'use strict';

// Checkbox row selection
function CheckBoxRowSelection() {
}

CheckBoxRowSelection.prototype.init = function (params) {
	this.eGui = document.createElement('div');
	this.eGui.align='center';
	this.eGui.style='padding-top:5px;';

	var checkbox = document.createElement('md-checkbox');
	checkbox.onclick = function() {
		params.node.setSelected( !params.node.selected );
	};

	this.eGui.appendChild(checkbox);
};

CheckBoxRowSelection.prototype.getGui = function () {
	return this.eGui;
};

module.exports = CheckBoxRowSelection;