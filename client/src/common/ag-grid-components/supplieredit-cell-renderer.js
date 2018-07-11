'use strict';

function EditSupplier() {
}

EditSupplier.prototype.init = function (params) {
	this.eGui = document.createElement('div');
	this.eGui.align='center';
	this.eGui.style.cssText='padding-top:0px;';
	var eye = document.createElement('ag-grid-supplier-edit');

	//console.log('valor',params);

	eye.setAttribute('supplier-id', params.value);

	this.eGui.appendChild(eye);
};

EditSupplier.prototype.getGui = function () {
	return this.eGui;
};

module.exports = EditSupplier;