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
	autocompleteVehicleCellEditor: require('./auto-complete-vehicle-cell-editor'),
	absenceCellEditor: require('./absence-cell-editor'),
	guardExtraCellEditor: require('./guard-extras-cell-editor'),
	clientCellUpdater: require('./client-cell-updater'),
	checkBoxCellEditor : require('./checkbox-cell-editor'),
	durationCellUpdater: require('./duration-cell-updater'),
	commentCellEditor: require('./comment-cell-editor'),

	// Custom Cell Renderer
	staffCellRenderer: require('./staff-cell-renderer'),
	operationCellRenderer: require('./operation-cell-renderer'),
	simpleCellRenderer: require('./simple-cell-renderer'),
	objectCellRenderer: require('./object-cell-renderer'),
	checkBoxRowSelection: require('./checkBoxRowSelection'),
	viewOperationCellRenderer: require('./view-operation-cell-renderer'),

	// Custom filters
	dateFilter: 		require('./date-filter'),
	dateFilterComparator: require('./date-filter-comparator'),

	// Header components
	headerComponent: 	require('./header-component'),
	deleteRowsHeaderComponent: 	require('./delete-rows-header-component'),

	// Util
	util: require('./util')
};