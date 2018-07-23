'use strict';

function ViewInvoiceDetail() {
}

ViewInvoiceDetail.prototype.init = function (params) {
	this.eGui = document.createElement('div');
	this.eGui.align='center';
	this.eGui.style.cssText='padding-top:0px;';
	var eye = document.createElement('ag-grid-view-invoice-details');
	eye.setAttribute('invoicenumber', params.data.invoiceNumber);
	this.eGui.appendChild(eye);
};

ViewInvoiceDetail.prototype.getGui = function () {
	return this.eGui;
};

module.exports = ViewInvoiceDetail;