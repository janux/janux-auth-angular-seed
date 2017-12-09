'use strict';

function ClientUpdater () {}

// gets called once before the renderer is used
ClientUpdater.prototype.init = function(params) {

	params.$scope.agGridClientUpdater = params.value;

	var onClientChangeCb = (function (event, client) {
		params.$scope.agGridClientUpdater = client.name;
	}).bind(params);

	params.$scope.$on('agGridClientUpdate', onClientChangeCb);

	// Create client updater element
	this.clientCont = document.createElement('ag-grid-client-updater');

	this.rowScope = params.$scope;
};

// gets called once when grid ready to insert the element
ClientUpdater.prototype.getGui = function() {
	return this.clientCont;
};

// focus and select can be done after the gui is attached
ClientUpdater.prototype.afterGuiAttached = function() {

};

// returns the new value after editing
ClientUpdater.prototype.getValue = function() {
	return this.rowScope.agGridClientUpdater;
};

// any cleanup we need to be done here
ClientUpdater.prototype.destroy = function() {
	// but this example is simple, no cleanup, we could
	// even leave this method out as it's optional
};

// if true, then this editor will appear in a popup
ClientUpdater.prototype.isPopup = function() {
	// and we could leave this method out also, false is the default
	return false;
};

module.exports = ClientUpdater;