'use strict';
var _ = require('lodash');

// Checkbox row selection
function DoNotInvoicePersonCellRenderer() {
}

DoNotInvoicePersonCellRenderer.prototype.init = function (params) {
	this.eGui = document.createElement('div');
	this.eGui.align = 'center';
	this.eGui.style.cssText = 'padding:0px 5px 5px 14px;';

	this.model = 'agGridDoNotInvoicePerson';
	this.modelDisabled = 'agGridDoNotInvoicePersonDisabled';


	params.$scope[this.model] = params.value;
	params.$scope[this.modelDisabled] = !params.$scope.editModeInvoiceDetail;

	var checkbox = document.createElement('md-checkbox');
	checkbox.setAttribute('ng-model', this.model);
	checkbox.setAttribute('ng-disabled', this.modelDisabled);


	checkbox.onclick = function () {

		if (params.$scope['agGridDoNotInvoicePersonDisabled'] !== true) {
			if (_.isNil(params.value)) {
				params.value = false;
			} else {
				params.value = !params.value;
			}
			params.$scope.$emit('agGridDoNotInvoicePersonChange', {
				timeEntry   : params.data.timeEntry,
				updatedValue: params.value
			});
		}

	};

	params.$scope.$on('invoiceEditModeEnabled', function () {
		params.$scope['agGridDoNotInvoicePersonDisabled'] = false;
	});

	params.$scope.$on('invoiceEditModeDisabled', function () {
		params.$scope['agGridDoNotInvoicePersonDisabled'] = true;
	});

	this.eGui.appendChild(checkbox);
};

DoNotInvoicePersonCellRenderer.prototype.getGui = function () {
	return this.eGui;
};

module.exports = DoNotInvoicePersonCellRenderer;
