'use strict';

module.exports = {
	// Custom Cell Editors
	simpleCellEditor: 	require('./simple-cell-editor'),
	objectCellEditor:	require('./object-cell-editor'),
	dateCellEditor: 	require('./date-cell-editor'),
	dateTimeCellEditor: require('./datetime-cell-editor'),
	rowActions: 		require('./row-actions-component'),
	largeTextCellEditor: require('./large-text-cell-editor'),
	autocompleteStaffCellEditor: require('./autocomplete-staff-cell-editor'),
	autocompleteOpCellEditor: require('./autocomplete-op-cell-editor'),
	absenceCellEditor: require('./absence-cell-editor'),

	// Custom Cell Renderer
	staffCellRenderer: require('./staff-cell-renderer'),
	operationCellRenderer: require('./operation-cell-renderer'),
	simpleCellRenderer: require('./simple-cell-renderer'),
	objectCellRenderer: require('./object-cell-renderer'),

	// Custom filters
	dateFilter: 		require('./date-filter')
};