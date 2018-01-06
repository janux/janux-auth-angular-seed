'use strict';

var _ = require('lodash');

module.exports = ['security', function(security){

	// Used to group data by user
	var _userName = security.currentUser.username;

	// Storage in memory
	var _memoryStore = {};

	//
	// Given that different users may be using the same device, or a tester
	// may login under different users to the application, it is necessary to
	// qualify all keys with a user name so that different users get their own
	// local storage settings, rather than the ones from the prior logged-in user
	//
	var service = {

		// Retrieve an item from memory or local storage
		// Allow search by itemKey or { key:subkey }
		findItem: function( itemKey, storedInLocal ) {
			var out = '';
			var iKey = false;
			var iField = false;

			if(_.isObject(itemKey)) {
				iKey = Object.keys( itemKey )[0];
				iField = itemKey[iKey];
			}

			if(storedInLocal) {
				try {
					if(iKey) {
						out = JSON.parse(localStorage.getItem(_userName+'-'+iKey))[iField];
					} else {
						out = JSON.parse(localStorage.getItem(_userName+'-'+itemKey));
					}
				} catch(e) {
					out = localStorage.getItem(_userName+'-'+itemKey);
				}
			} else {
				if(iKey) {
					out = (_memoryStore[_userName+'-'+iKey][iField] !== 'undefined')?_memoryStore[_userName+'-'+itemKey][iKey]:null;
				}
				else {
					out = (_memoryStore[_userName+'-'+itemKey] !== 'undefined')?_memoryStore[_userName+'-'+itemKey]:null;
				}
			}
			return out;
		},

		// Store an item from memory or local storage
		setItem: function ( itemKey, item, storeInLocal ) {
			if(storeInLocal){
				var itemToStore = (_.isObject(item))?JSON.stringify(item):item;
				localStorage.setItem(_userName+'-'+itemKey, itemToStore);
			}else{
				_memoryStore[_userName+'-'+itemKey] = item;
			}
		},

		// Add content for existing item in memory or local storage
		addItem: function ( itemKey, item, storeInLocal ) {
			if(storeInLocal){
				var storedItem = localStorage.getItem(_userName+'-'+itemKey);
				var itemToStore = false;
				if(storedItem){
					try {
						itemToStore = JSON.stringify(_.merge(JSON.parse(storedItem), item));
					} catch(e) {
						itemToStore = storedItem + item;
					}
				}else{
					itemToStore = (_.isObject(item))?JSON.stringify(item):item;
				}
				localStorage.setItem(_userName+'-'+itemKey, itemToStore);
			}else{
				if(typeof _memoryStore[_userName+'-'+itemKey] !== 'undefined'){
					if(_.isObject(item)){
						_memoryStore[_userName+'-'+itemKey] = _.merge(_memoryStore[_userName+'-'+itemKey], item);
					}else{
						_memoryStore[_userName+'-'+itemKey] = _memoryStore[_userName+'-'+itemKey]+item;
					}
				}else{
					_memoryStore[_userName+'-'+itemKey] = item;
				}
			}
		},

		// Remove an item from memory or local storage
		removeItem: function( itemKey, storedInLocal ) {
			var iKey = false;
			var iField = false;

			if(_.isObject(itemKey)) {
				iKey = Object.keys( itemKey )[0];
				iField = itemKey[iKey];
			}

			if(storedInLocal){
				if(iKey) {
					var items = JSON.parse(localStorage.getItem(_userName+'-'+iKey));
					delete items[iField];
					localStorage.setItem(_userName+'-'+iKey, JSON.stringify(items));
				}else{
					localStorage.removeItem(_userName + '-' + itemKey);
				}
			}else{
				if(iKey) {
					delete _memoryStore[_userName+'-'+iKey][iField];
				}else{
					delete _memoryStore[_userName+'-'+itemKey];
				}
			}
		}
	};

	return service;

}];
