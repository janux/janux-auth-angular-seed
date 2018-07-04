'use strict';

function EditStaff() {
}

EditStaff.prototype.init = function (params) {
	this.eGui = document.createElement('div');
	this.eGui.align='center';
	this.eGui.style.cssText='padding-top:0px;';
	var eye = document.createElement('ag-grid-staff-edit');

	//console.log('valor',params);

	eye.setAttribute('staff-id', params.value);

	this.eGui.appendChild(eye);
};

EditStaff.prototype.getGui = function () {
	return this.eGui;
};

module.exports = EditStaff;