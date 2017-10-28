'use strict';

// Object Editor

// function to act as a class
function ObjectCellEditor () {}

// gets called once before the renderer is used
ObjectCellEditor.prototype.init = function(params) {
	// this.rowScope = params.$scope;
	// console.log('params.$scope.obj', params.$scope.obj);
	// params.$scope.obj = params.$scope.data['Array'];
	// this.editBox = document.createElement('input');
	// this.editBox.setAttribute('type', 'text');
	// this.editBox.setAttribute('ng-model', 'obj.a');
	// this.editBox.appendChild(field);
	// console.log('params', params);
	var obj = params.value;
	this.colId = params.column.colId;
	this.editBox = document.createElement('div');
	this.editBox.innerHTML = '<div class="panel panel-default">' +
		'<div class="panel-heading">Object editor</div>' +
		'<div class="panel-body">' +
			'<label for="a">A:</label><input id="'+this.colId+'a" type="text" value="'+obj.a+'" />' +
			'<br />' +
			'<label for="b">B:</label><input id="'+this.colId+'b" type="text" value="'+obj.b+'" />' +
		'</div>' +
	'</div>';
};

// gets called once when grid ready to insert the element
ObjectCellEditor.prototype.getGui = function() {
	return this.editBox;
};

// focus and select can be done after the gui is attached
ObjectCellEditor.prototype.afterGuiAttached = function() {

};

// returns the new value after editing
ObjectCellEditor.prototype.getValue = function() {
	var obj = {
		a: document.getElementById(this.colId+'a').value,
		b: document.getElementById(this.colId+'b').value
	};
	return obj;
};

// any cleanup we need to be done here
ObjectCellEditor.prototype.destroy = function() {
	delete this.colId, this.editBox;
};

// This editor will appear in a popup
ObjectCellEditor.prototype.isPopup = function() {
	return true;
};

module.exports = ObjectCellEditor;