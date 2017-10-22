'use strict';

// Simple Cell renderer
function SimpleCellRender() {
}

SimpleCellRender.prototype.init = function (params) {
	if (params.value === '' || params.value === undefined || params.value === null) {
		this.eGui = '';
	} else {
		this.eGui = '<span style="cursor: default;">' + params.value + '</span>';
	}
};

SimpleCellRender.prototype.getGui = function () {
	return this.eGui;
};

module.exports = SimpleCellRender;