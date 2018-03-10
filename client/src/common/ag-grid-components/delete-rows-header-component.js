'use strict';

function DelRowsHeaderComp() {}

DelRowsHeaderComp.prototype.init = function (agParams){
	console.log('params', agParams);
	this.agParams = agParams;
	this.eGui = document.createElement('div');
	this.eGui.className = 'ag-del-rows-header-comp';

	// checkbox that mimics the functionality that is obtained
	// when the column configuration is set to:
	// headerCheckboxSelection: true
	// headerCheckboxSelectionFilteredOnly: true
	this.selectAll = document.createElement('input');
	this.selectAll.type = 'checkbox';
	this.selectAll.onclick = function () {
		if(this.selectAll.checked){
			this.agParams.api.selectAllFiltered();
		} else {
			this.agParams.api.deselectAllFiltered();
		}
	}.bind(this);
	this.eGui.appendChild(this.selectAll);

	// Delete button
	this.deleteBtn = document.createElement('a');
	this.deleteBtn.onclick = function () {
		// This function must be defined in the controller that
		// loads the ag-grid configuration
		this.agParams.api.deleteRows();
	}.bind(this);
	this.deleteBtn.innerHTML = '<span class="fa fa-trash fa-lg">';
	this.eGui.appendChild(this.deleteBtn);
};

DelRowsHeaderComp.prototype.getGui = function (){
	return this.eGui;
};

DelRowsHeaderComp.prototype.destroy = function () {
	// this.eGui.removeChild(this.selectAll);
	// this.eGui.removeChild(this.deleteBtn);
};

module.exports = DelRowsHeaderComp;