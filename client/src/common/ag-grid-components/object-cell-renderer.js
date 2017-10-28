'use strict';

// Object Cell renderer
function ObjectCellRender() {
}

ObjectCellRender.prototype.init = function (params) {
	if (params.value === '' || params.value === undefined || params.value === null) {
		this.eGui = '';
	} else {
		this.eGui = '<span class="badge">Object</span>';
	}
};

ObjectCellRender.prototype.getGui = function () {
	return this.eGui;
};

module.exports = ObjectCellRender;