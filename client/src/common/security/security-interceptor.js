'use strict';

//
// Intercepts authentication/authorization failures
// TODO: add queue support
// 
module.exports = 
       ['$injector','$q',
function($injector, $q) {

	return function(promise) {
		// return promise;
		
		return promise.catch( function(origResponse) {
			// console.log('origResponse', origResponse );
			if (origResponse) {
				// console.log('origResponse.status', origResponse.status );
				// console.log('origResponse.config', origResponse.config );
			}
			return promise;
		});

		/*
		return promise.then(null, function(originalResponse) {
			if(originalResponse.status === 401) {
				// The request bounced because it was not authorized - add a new request to the retry queue
				promise = queue.pushRetryFn('unauthorized-server', function retryRequest() {
					// We must use $injector to get the $http service to prevent circular dependency
					return $injector.get('$http')(originalResponse.config);
				});
			}
			return promise;
		});
		*/
	};
}]
