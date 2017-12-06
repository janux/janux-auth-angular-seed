'use strict';

function DateFilter () {
}

// Static date format string
DateFilter.formatString = 'MM/DD/YY hh:mm a';

DateFilter.prototype.init = function(params) {
	// this.eGui = document.createElement('div');
	// this.eGui.innerHTML = '<input class="myDateWidget" type="text" />';
	// this.eInput = this.eGui.querySelectorAll('input')[0];
	//
	// this.listener = params.onDateChanged;
	// this.eInput.addEventListener('input', this.listener);
	//
	// var that = this;
	// $(this.eInput).datepicker({
	// 	dateFormat: 'dd-mm-yy',
	// 	altField: '#thealtdate',
	// 	altFormat: 'yy-mm-dd',
	// 	onSelect: function() {
	// 		that.listener();
	// 	}
	// });

	// Create angular material date picker
	// this.datePicker = document.createElement('md-datepicker');
	// this.datePicker.setAttribute('ng-model','dateFilter');
	this.datePicker = document.createElement('div');
	// this.datePicker.innerHTML = '<md-datepicker="" ng-model="xxx" />';

	var picker = document.createElement('md-datepicker');
	picker.setAttribute('ng-model','dateFilter');

	// var picker = document.createElement('input');
	// picker.setAttribute('mdc-datetime-picker', '');
	// picker.setAttribute('date', 'true');
	// picker.setAttribute('time', 'true');
	// picker.setAttribute('minutes', 'true');
	// // picker.setAttribute('format', DateTimepicker.formatString);
	// picker.setAttribute('type', 'text');
	// picker.setAttribute('ng-model', 'dateFilter');

	this.datePicker.appendChild(picker);

	console.log('params', params);
};

DateFilter.prototype.getGui = function (){
	return this.datePicker;
};

DateFilter.prototype.getDate = function (){
	return '';// $(this.eInput).datepicker( "getDate" );
};

DateFilter.prototype.setDate = function (date){
	// $(this.eInput).datepicker( "setDate", date );
};

DateFilter.prototype.destroy = function () {
	this.eInput.removeEventListener('input', this.listener)
};

DateFilter.prototype.afterGuiAttached = function () {
	// $('#ui-datepicker-div').click(function(e){
	// 	e.stopPropagation();
	// });
};

module.exports = DateFilter;