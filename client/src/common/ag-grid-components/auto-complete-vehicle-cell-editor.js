'use strict';

// function to act as a class
function AutoCompleteVehicle() {
}

// gets called once before the renderer is used
AutoCompleteVehicle.prototype.init = function (params) {
	// Assign value to row scope
	// this.model = 'autocomplete' + params.column.colId;
	// // Access to complete staff object
	// params.$scope[this.model] = params.$scope.data[params.column.colId];

//
	// // Create angular material autocomplete
	// this.autocomplete = document.createElement('ag-grid-vehicle-autocomplete');
	// this.autocomplete.setAttribute('selected-value-model', this.model);


	this.model = 'vehicleAutoComplete' + params.column.colId;
	// var model = this.model;
	params.$scope[this.model] = params.value;

	//Adding an event in order to help to update the info.
	var onVehicleUpdateData = (function (event, vehicle) {
		this.eInput.value = vehicle.resource.name + ' ' + vehicle.resource.plateNumber;
	}).bind(this);
	params.$scope.$on('agGridVehicleUpdateEvent', onVehicleUpdateData);

	this.eInput = document.createElement('input');
	this.eInput.value = params.value.resource.name + ' ' + params.value.resource.plateNumber;
	this.eInput.setAttribute('ag-grid-vehicle-autocomplete', '');
	this.eInput.setAttribute('ng-model-to-directive', this.model);

	this.rowScope = params.$scope;


};

// gets called once when grid ready to insert the element
AutoCompleteVehicle.prototype.getGui = function () {
	return this.eInput;
};

// focus and select can be done after the gui is attached
AutoCompleteVehicle.prototype.afterGuiAttached = function () {

};

// returns the new value after editing
AutoCompleteVehicle.prototype.getValue = function () {
	return this.rowScope[this.model];
};

// any cleanup we need to be done here
AutoCompleteVehicle.prototype.destroy = function () {

};

// if true, then this editor will appear in a popup
AutoCompleteVehicle.prototype.isPopup = function () {
	// and we could leave this method out also, false is the default
	return false;
};

module.exports = AutoCompleteVehicle;