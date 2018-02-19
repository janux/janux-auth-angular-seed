'use strict';

function ViewOperation() {
}

ViewOperation.prototype.init = function (params) {
	this.eGui = document.createElement('div');
	this.eGui.align='center';
	this.eGui.style='padding-top:5px;';
	var eye = document.createElement('ag-grid-view-operation');
	eye.setAttribute('op-id', params.value);

	this.eGui.appendChild(eye);
};

ViewOperation.prototype.getGui = function () {
	return this.eGui;
};

module.exports = ViewOperation;