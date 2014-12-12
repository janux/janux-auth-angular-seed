'use strict';

//
// In a client-side single-page operation, it is possible that the server
// session may expire while the user is in the midst of an editing session with
// uncommitted changes or operations; this will manifest itself by a 401 error
// being returned at the time that the app submits a request back to the server.
//
// In such a case, it is desirable to store the state of the operation(s) being
// performed, and resubmit it/them, after the user re-authenticates. 
//
// This is done by calling pushRetryFn(reason, retryFn) where retryFn is a
// function that represents the operation to be retried.
// 
module.exports = 
			 ['$q','$log', 
function($q , $log) {

	var retryQueue = [];

	var service = {

		//
		// Array of callback functions to be called sequentially when a new retry
		// function is added to the retryQueue.
		//
		// The security service puts its own handler in here!
		//
		onItemAddedCallbacks: [],
		
		//
		// Returns true if there are items in the queue
		//
		hasMore: function() {
			return retryQueue.length > 0;
		},

		//
		// Adds an item to the queue, and calls the onItemAddedCallbacks
		// TODO: This seems to be a private method, should it be exposed in the service
		// api?
		//
		push: function(retryItem) {
			retryQueue.push(retryItem);
			// Call all the onItemAdded callbacks
			angular.forEach(service.onItemAddedCallbacks, function(cb) {
				try {
					cb(retryItem);
				} catch(e) {
					$log.error('securityRetryQueue.push(retryItem): callback threw an error' + e);
				}
			});
		},

		//
		// Wraps the retryFn into a promise and pushes it to the retry queue.
		// The parameter 'reason' is an optional string describing why a specific
		// retryFn is added to the queue
		//
		pushRetryFn: function(reason, retryFn) {

			// The reason parameter is optional
			if ( arguments.length === 1) {
				retryFn = reason;
				reason = undefined;
			}

			// The deferred object that will be resolved or rejected by calling retry or cancel
			var deferred = $q.defer();

			//
			// This object represents the operation to be retried after the
			// user authenticates anew. It exposes retry() and cancel() that
			// can be called in due time to replay/cancel the operation. 
			//
			// This is private to the closure, so the presumption is that this is
			// 'internal' to this function; a test covers this structure.
			//
			var retryItem = {

				reason: reason,

				retry: function() {

					$q.when(retryFn()).then(
						function(value) {
							deferred.resolve(value); // If it was successful then resolve our deferred,
						}, 
						function(value) {
							deferred.reject(value);  // otherwise, reject it
						}
					);
				},

				cancel: function() {
					deferred.reject();  // Give up on retrying and reject our deferred
				}
			};

			service.push(retryItem);

			return deferred.promise;
		},

		//
		// Returns the reason why there are items to be retried in the queue, 
		// in the form of the reason for the first item in the queue.  
		//
		// Returns undefined if no reason was given for the first item in the queue,
		// or if the queue is empty
		//
		retryReason: function() {
			return service.hasMore() ? retryQueue[0].reason : undefined;
		},

		//
		// Clears the queue, and rejects every promise in the queue
		//
		cancelAll: function() {
			while(service.hasMore()) {
				retryQueue.shift().cancel();
			}
		},

		//
		// Removes and replays each item from the queue
		//
		retryAll: function() {
			while(service.hasMore()) {
				retryQueue.shift().retry();
			}
		}
	};

	return service;

}];
