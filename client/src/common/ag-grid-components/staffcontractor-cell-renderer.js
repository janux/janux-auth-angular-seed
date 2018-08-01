'use strict';

function ContractorStaff() {
}

ContractorStaff.prototype.init = function (params) {
	this.eGui = document.createElement('div');
	this.eGui.align='center';
	this.eGui.style.cssText='padding-top:0px;';
	var eye = document.createElement('ag-grid-staff-contractor');

	//console.log('valor',params);

	eye.setAttribute('is-external', params.value);

	this.eGui.appendChild(eye);
};

ContractorStaff.prototype.getGui = function () {
	return this.eGui;
};

module.exports = ContractorStaff;