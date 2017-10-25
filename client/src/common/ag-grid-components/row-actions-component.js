'use strict';

// Cell Editor

// function to act as a class
function RowActions () {}

// gets called once before the renderer is used
RowActions.prototype.init = function(params) {

	var templateLocation = 'common/ag-grid-components/templates/row-actions.html';

	this.actions = document.createElement('div');
	this.actions.onclick = params.stopEditing;

	var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
	xhr.open('get', templateLocation , true);
	xhr.onreadystatechange = function(that) {
		if (xhr.readyState == 4 && xhr.status == 200) {
			that.actions.innerHTML = xhr.responseText;
		}
	}.bind(null,this);
	xhr.send();

	// this.actions.innerHTML = '<button class="btn btn-success">' +
	// 	'	<span class="glyphicon glyphicon-floppy-disk"></span>' +
	// 	'</button>' +
	// 	'<button class="btn btn-success">' +
	// 	'	<span class="glyphicon glyphicon-remove"></span>' +
	// 	'</button>';
};

// gets called once when grid ready to insert the element
RowActions.prototype.getGui = function() {
	return this.actions;
};

// focus and select can be done after the gui is attached
RowActions.prototype.afterGuiAttached = function() {

};

// returns the new value after editing
RowActions.prototype.getValue = function() {
	return '';
};

// any cleanup we need to be done here
RowActions.prototype.destroy = function() {
	// but this example is simple, no cleanup, we could
	// even leave this method out as it's optional
};

// if true, then this editor will appear in a popup
RowActions.prototype.isPopup = function() {
	// and we could leave this method out also, false is the default
	return false;
};

module.exports = RowActions;