'use strict';

var _ = require('lodash');

const _supportsLocalStorage = !!window.localStorage
	&& typeof localStorage.getItem === 'function'
	&& typeof localStorage.setItem === 'function'
	&& typeof localStorage.removeItem === 'function';

const unsupportedLSError = 'Local storage is not supported';

module.exports = ['security','config', function (security, config) {

	// Used to group data by user
	var _userName = (!_.isNil(security.currentUser)) ? security.currentUser.username : 'jnxStorageUser';
	var _storedObjectName = config.jnxStoreKeys.storeObjectSufix;

	// Storage in memory
	var _memoryStore = {};

	//
	// Given that different users may be using the same device, or a tester
	// may login under different users to the application, it is necessary to
	// qualify all keys with a user name so that different users get their own
	// local storage settings, rather than the ones from the prior logged-in user
	//
	var service = {

		_username: _userName,

		findItem: function (itemName, storeInLocal) {
			var searchObj = {};
			searchObj[_storedObjectName] = itemName;
			return service.findItemInStoreObject(searchObj, storeInLocal);
		},

		// Retrieve an item from memory or local storage
		// Allow search by itemKey or { key:subkey }
		findItemInStoreObject: function( itemKey, storedInLocal ) {
			var out = '';
			var iKey = false;
			var iField = false;

			// if itemKey is an object, first object key will be used as key to get
			// stored object and value will be used as key to get a value from that object
			if (_.isObject(itemKey)) {
				iKey = Object.keys( itemKey )[0];
				iField = itemKey[iKey];
			}

			if (storedInLocal) {
				if (_supportsLocalStorage) {
					// Try to parse stored item as object
					try {
						if (iKey) {
							out = JSON.parse(localStorage.getItem(service._username + '-' + iKey));
							try {
								out = JSON.parse(out[iField]);
							} catch(e) {
								out = out[iField];
							}
						} else {
							out = JSON.parse(localStorage.getItem(service._username + '-' + itemKey));
						}
					} catch(e) {
						if (iKey) {
							// Return null because stored value is not an object
							out = null;
						} else {
							out = localStorage.getItem(service._username + '-' + itemKey);
						}
					}
				} else {
					console.error(unsupportedLSError);
				}
			} else {
				if (iKey) {
					out = (_memoryStore[service._username + '-' + iKey][iField] !== 'undefined')?_memoryStore[service._username + '-' + itemKey][iKey]:null;
				}
				else {
					out = (_memoryStore[service._username + '-' + itemKey] !== 'undefined') ? _memoryStore[service._username + '-' + itemKey] : null;
				}
			}
			return out;
		},

		setItem: function (itemName, item, storeInLocal) {
			var addObj = {};
			addObj[_storedObjectName] = itemName;
			return service.setItemInStoreObject(addObj, item, storeInLocal);
		},

		setItemInStoreObject: function( itemKey, item, storeInLocal ) {
			var currentStored = '';
			var iKey = false;
			var iField = false;

			// if itemKey is an object, first object key will be used as key to get
			// stored object and value will be used as key to get a value from that object
			if (_.isObject(itemKey)) {
				iKey = Object.keys( itemKey )[0];
				iField = itemKey[iKey];
			}

			if (storeInLocal) {
				if (_supportsLocalStorage) {
					var itemToStore = (_.isObject(item)) ? JSON.stringify(item) : item;
					// Try to parse stored item as object
					try {
						if (iKey) {
							currentStored = JSON.parse(localStorage.getItem(service._username + '-' + iKey));
							currentStored[iField] = itemToStore;
							currentStored = JSON.stringify(currentStored);
							localStorage.setItem(service._username + '-' + iKey, currentStored);
						} else {
							localStorage.setItem(service._username + '-' + itemKey, itemToStore);
						}
					} catch(e) {
						if (iKey) {
							currentStored = {};
							currentStored[iField] = itemToStore;
							currentStored = JSON.stringify(currentStored);
							localStorage.setItem(service._username + '-' + iKey, currentStored);
						} else {
							localStorage.setItem(service._username + '-' + itemKey, itemToStore);
						}
					}
				} else {
					console.error(unsupportedLSError);
				}
			} else {
				if (iKey) {
					_memoryStore[service._username + '-' + iKey][iField] = item;
				}
				else {
					_memoryStore[service._username + '-' + itemKey] = item;
				}
			}
		},

		// Store an item in memory or local storage
		// setItem: function ( itemKey, item, storeInLocal ) {
		// 	if (storeInLocal) {
		// 		if (_supportsLocalStorage) {
		// 			var itemToStore = (_.isObject(item)) ? JSON.stringify(item) : item;
		// 			localStorage.setItem(service._username + '-' + itemKey, itemToStore);
		// 		} else {
		// 			console.error(unsupportedLSError);
		// 		}
		// 	} else {
		// 		_memoryStore[service._username + '-' + itemKey] = item;
		// 	}
		// },

		// Add content for existing item in memory or local storage
		// addItem: function ( itemKey, item, storeInLocal ) {
		// 	if (storeInLocal) {
		// 		if (_supportsLocalStorage) {
		// 			var storedItem = localStorage.getItem(service._username + '-' + itemKey);
		// 			var itemToStore = false;
		// 			if(storedItem){
		// 				try {
		// 					itemToStore = JSON.stringify(_.merge(JSON.parse(storedItem), item));
		// 				} catch(e) {
		// 					itemToStore = storedItem + item;
		// 				}
		// 			} else {
		// 				itemToStore = (_.isObject(item)) ? JSON.stringify(item) : item;
		// 			}
		// 			console.log('jnxStore-addItemToStoreObject', service._username + '-' + itemKey, itemToStore);
		// 			localStorage.setItem(service._username + '-' + itemKey, itemToStore);
		// 		} else {
		// 			console.error(unsupportedLSError);
		// 		}
		// 	} else {
		// 		if(typeof _memoryStore[service._username + '-' + itemKey] !== 'undefined'){
		// 			if (_.isObject(item)) {
		// 				_memoryStore[service._username + '-' + itemKey] = _.merge(_memoryStore[service._username + '-' + itemKey], item);
		// 			} else {
		// 				_memoryStore[service._username + '-' + itemKey] = _memoryStore[service._username + '-' + itemKey] + item;
		// 			}
		// 		}else{
		// 			_memoryStore[service._username + '-' + itemKey] = item;
		// 		}
		// 	}
		// },

		removeItem: function (itemName, storedInLocal) {
			var removeObj = {};
			removeObj[_storedObjectName] = itemName;
			service.removeItemFromStoreObject(removeObj, storedInLocal);
		},

		// Remove an item from memory or local storage
		removeItemFromStoreObject: function( itemKey, storedInLocal ) {
			var iKey = false;
			var iField = false;

			if (_.isObject(itemKey)) {
				iKey = Object.keys( itemKey )[0];
				iField = itemKey[iKey];
			}

			if (storedInLocal) {
				if (_supportsLocalStorage) {
					if (iKey) {
						var items = JSON.parse(localStorage.getItem(service._username + '-' + iKey));
						delete items[iField];
						localStorage.setItem(service._username + '-' + iKey, JSON.stringify(items));
					} else {
						localStorage.removeItem(service._username + '-' + itemKey);
					}
				} else {
					console.error(unsupportedLSError);
				}
			} else {
				if (iKey) {
					delete _memoryStore[service._username + '-' + iKey][iField];
				} else {
					delete _memoryStore[service._username + '-' + itemKey];
				}
			}
		},

		setUsername: function (username) {
			service._username = username;
			console.log('Setting jnxStorage username', username);
		}
	};

	return service;

}];
