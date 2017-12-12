'use strict';

function MyHeaderComponent() {}

MyHeaderComponent.prototype.init = function (agParams){
	console.log('ag params', agParams);
	this.agParams = agParams;
	this.eGui = document.createElement('div');

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
};

MyHeaderComponent.prototype.getGui = function (){
	return this.eGui;
};

MyHeaderComponent.prototype.destroy = function () {

};

module.exports = MyHeaderComponent;