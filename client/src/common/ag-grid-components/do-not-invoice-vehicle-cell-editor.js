'use strict';
var _ = require('lodash');

// Checkbox row selection
function DoNotInvoiceVehicleCellEditor() {
}

DoNotInvoiceVehicleCellEditor.prototype.init = function (params) {
	this.eGui = document.createElement('div');
	this.eGui.align = 'center';
	this.eGui.style.cssText = 'padding:0px 5px 5px 14px;';

	this.model = 'agGridDoNotInvoiceVehicle';
	params.$scope[this.model] = params.value;

	var checkbox = document.createElement('md-checkbox');
	checkbox.setAttribute('ng-model', this.model);

	checkbox.onclick = function () {
		if (_.isNil(params.value)) {
			params.value = false;
		} else {
			params.value = !params.value;
		}
		params.$scope.$emit('agGridDoNotInvoiceVehicleChange', {
			timeEntry   : params.data.timeEntry,
			updatedValue: params.value
		});
	};

	this.eGui.appendChild(checkbox);
};

DoNotInvoiceVehicleCellEditor.prototype.getGui = function () {
	return this.eGui;
};

module.exports = DoNotInvoiceVehicleCellEditor;