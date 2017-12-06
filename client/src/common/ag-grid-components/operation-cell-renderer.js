'use strict';

// Operation Cell renderer
function OperationCellRenderer() {
}

OperationCellRenderer.prototype.init = function (params) {
	if (params.value === '' || params.value === undefined || params.value === null) {
		this.eGui = '';
	} else {
		var operation = params.value;
		this.eGui =  operation.name;
	}
};

OperationCellRenderer.prototype.getGui = function () {
	return this.eGui;
};

module.exports = OperationCellRenderer;