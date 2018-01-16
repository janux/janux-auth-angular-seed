'use strict';

// Convert object of authorization bits to array
var authCBitsToArray = function (authContextBits) {
	var authCBitsArray = Object.keys(authContextBits).map(function(key) {
		authContextBits[key].label = key;
		return authContextBits[key];
	});
	// console.log('authCBitsArray',authCBitsArray);
	return authCBitsArray;
};

module.exports = {
	authCBitsToArray: authCBitsToArray
};