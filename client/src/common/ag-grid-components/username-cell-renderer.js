'use strict';

var _ = require('lodash');

function Username() {
}

Username.prototype.init = function (params) {
	// console.log('user render params', params);
	this.eGui = document.createElement('div');
	this.eGui.align = 'center';
	this.eGui.style.cssText = 'padding-top:0px;';

	var envelope = document.createElement('ag-grid-staff-invite');
	envelope.setAttribute('staff-id', params.data.id);
	envelope.setAttribute('staff-email-length',
		_.isArray(params.data.contactMethods.emails) ?
			_.filter(params.data.contactMethods.emails, function (o) {
				return !_.isNil(o.address) && o.address !== '';
			}).length.toString() : 0);

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
