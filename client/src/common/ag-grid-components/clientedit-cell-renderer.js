'use strict';

function EditClient() {
}

EditClient.prototype.init = function (params) {
	this.eGui = document.createElement('div');
	this.eGui.align='center';
	this.eGui.style.cssText='padding-top:0px;';
	var eye = document.createElement('ag-grid-client-edit');

	//console.log('valor',params);

	eye.setAttribute('client-id', params.value);

	this.eGui.appendChild(eye);
};

EditClient.prototype.getGui = function () {
	return this.eGui;
};

module.exports = EditClient;