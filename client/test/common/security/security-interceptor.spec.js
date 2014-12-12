describe('securityInterceptor', function() {
	var queue, interceptor, promise, wrappedPromise;

	beforeEach(module('security'));

	beforeEach(inject(function($injector) {
		queue			     = $injector.get('securityRetryQueue');
		interceptor		 = $injector.get('securityInterceptor');
		wrappedPromise = {};
		promise = {
			catch: jasmine.createSpy('catch').and.returnValue(wrappedPromise)
		};
	}));

	it('accepts and returns a promise', function() {
		var newPromise = interceptor(promise);
		expect(promise.catch).toHaveBeenCalled();
		expect(typeof(promise.catch.calls.mostRecent().args[0])).toBe('function');
		expect(newPromise).toBe(wrappedPromise);
	});

	it('does not intercept non-401 error responses', function() {
		var httpResponse = {
			status: 400
		};
		interceptor(promise);
		var errorHandler = promise.catch.calls.mostRecent().args[0];
		expect(errorHandler(httpResponse)).toBe(promise);
	});

	it('intercepts 401 error responses and adds it to the retry queue', function() {
		var notAuthResponse = {
			status: 401
		};
		interceptor(promise);
		var errorHandler = promise.catch.calls.mostRecent().args[0];
		var newPromise	 = errorHandler(notAuthResponse);
		expect(queue.hasMore()).toBe(true);
		expect(queue.retryReason()).toBe('unauthorized-server');
	});
});
