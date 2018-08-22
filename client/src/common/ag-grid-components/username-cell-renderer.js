'use strict';

function Username() {}

Username.prototype.init = function (params) {
	// console.log('user render params', params);
	this.eGui = document.createElement('div');
	this.eGui.align='center';
	this.eGui.style.cssText='padding-top:0px;';

	var envelope = document.createElement('ag-grid-staff-invite');
	envelope.setAttribute('staff-id', params.data.id);

	if (params.value !== '') {
		this.eGui.innerText = params.value;
	} else {
		this.eGui.appendChild(envelope);
	}
};

Username.prototype.getGui = function () {
	return this.eGui;
};

module.exports = Username;