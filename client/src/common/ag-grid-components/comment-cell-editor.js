'use strict';

//
// Based on: Large Text Cell Editor
// This component for ag-grid has the purpose of editing cells whose
// text content is broad. Fulfills the same functionality as the
// component 'Comment' that by default integrates ag-grid, with
// the advantage of being able to be used in conjunction with the
// 'fullRow' edit type.
//

// function to act as a class
function CommentCellEditor () {}

// gets called once before the renderer is used
CommentCellEditor.prototype.init = function(params) {
	// create the cell
	this.model = 'agGridLargeTextComment';
	params.$scope[this.model] = params.value;
	this.eInput = document.createElement('ag-grid-comment-editor');
	this.eInput.setAttribute('ag-grid-large-text', '');
	this.eInput.setAttribute('ng-model', this.model);
	this.rowScope = params.$scope;
};

// gets called once when grid ready to insert the element
CommentCellEditor.prototype.getGui = function() {
	return this.eInput;
};

// focus and select can be done after the gui is attached
CommentCellEditor.prototype.afterGuiAttached = function() {

};

// returns the new value after editing
CommentCellEditor.prototype.getValue = function() {
	return this.rowScope[this.model];
};

// any cleanup we need to be done here
CommentCellEditor.prototype.destroy = function() {
	// but this example is simple, no cleanup, we could
	// even leave this method out as it's optional
};

// if true, then this editor will appear in a popup
CommentCellEditor.prototype.isPopup = function() {
	// and we could leave this method out also, false is the default
	return false;
};

module.exports = CommentCellEditor;