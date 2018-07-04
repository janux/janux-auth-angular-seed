'use strict';

// Checkbox row selection
function CheckBoxStaffAvalability() {
}

CheckBoxStaffAvalability.prototype.init = function (params) {
	this.eGui = document.createElement('div');
	this.eGui.align='center';
	this.eGui.style.cssText='padding:0px 5px 5px 14px;';
	
	this.model = 'agGridAvalabilityCheckbox';
	params.$scope[this.model] = params.value.isAvailable;

	var checkbox = document.createElement('md-checkbox');
	checkbox.setAttribute('ng-model', this.model);

	checkbox.onclick = function() {
		params.value.isAvailable = !params.value.isAvailable;
		params.$scope.$emit('agGridAvalabilityCheckboxChange', params.value);
	};

	this.eGui.appendChild(checkbox);
};

CheckBoxStaffAvalability.prototype.getGui = function () {
	return this.eGui;
};

module.exports = CheckBoxStaffAvalability;