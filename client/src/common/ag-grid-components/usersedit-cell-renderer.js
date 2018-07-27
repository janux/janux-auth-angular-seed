'use strict';

function EditUsers() {
}

EditUsers.prototype.init = function (params) {
	this.eGui = document.createElement('div');
	this.eGui.align='center';
	this.eGui.style.cssText='padding-top:0px;';
	var eye = document.createElement('ag-grid-users-edit');

	//console.log('valor',params);

	eye.setAttribute('user-id', params.value);

	this.eGui.appendChild(eye);
};

EditUsers.prototype.getGui = function () {
	return this.eGui;
};

module.exports = EditUsers;