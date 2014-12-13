'use strict';

//
// Intercepts authentication/authorization failures
// 
module.exports = 
       ['$injector','$q','retryQueue',
function($injector,  $q , retryQueue) {

	return function(promise) {
		// return promise;
		
		return promise.catch( function(origResponse) {
			//
			// console.log('origResponse', origResponse );
			// console.log('origResponse.status', origResponse.status );
			// console.log('origResponse.config', origResponse.config );
			//
			
			if (origResponse.status === 401) {
				//
				// The request bounced because it was not authorized - add a new request to the retryQueue
				//
				promise = retryQueue.pushRetryFn('unauthorized-server', function retryRequest() {

					// We must use $injector to get the $http service to prevent circular dependency
					// TODO-pp - woat??
					return $injector.get('$http')(originalResponse.config);
				});
			};

			// if the response is not handled above, return it unaffected
			return promise;
		});
	};
}]
