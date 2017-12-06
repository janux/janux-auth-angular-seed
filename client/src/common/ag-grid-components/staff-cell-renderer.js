'use strict';

var Person = require('janux-people').Person;

// Staff Cell renderer
function StaffCellRenderer() {
}

StaffCellRenderer.prototype.init = function (params) {
	if (params.value === '' || params.value === undefined || params.value === null) {
		this.eGui = '';
	} else {
		var staff = Person.fromJSON(params.value.resource);
		this.eGui =  staff.name.last+' '+staff.name.first;
	}
};

StaffCellRenderer.prototype.getGui = function () {
	return this.eGui;
};

module.exports = StaffCellRenderer;